/**
 * Rentora Master Invoice & Billing Service
 * Concurrency-safe sequential invoice numbering (INV-YYYY-XXXXXX),
 * Immutable customer/vendor/item snapshots, strict 18% GST (9% CGST + 9% SGST) breakdown,
 * Isolated refundable security deposit, and payment verification synchronization.
 */

const { Op } = require('sequelize');
const {
  sequelize,
  Invoice,
  Booking,
  BookingItem,
  Order,
  Product,
  User,
  CustomerProfile,
  VendorProfile
} = require('../models');
const { generateInvoiceNumber } = require('../utils/bookingNumber');
const { ROLES } = require('../config/constants');

class InvoiceService {
  /**
   * Generate Next Unique Invoice Number for the current year in format INV-YYYY-000001
   */
  static async getNextInvoiceNumber(t) {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;

    const latest = await Invoice.findOne({
      where: {
        invoiceNumber: { [Op.like]: `${prefix}%` }
      },
      order: [['invoiceNumber', 'DESC']],
      transaction: t,
      lock: t ? t.LOCK.UPDATE : undefined
    });

    let nextSeq = 1;
    if (latest && latest.invoiceNumber) {
      const parts = latest.invoiceNumber.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num)) {
          nextSeq = num + 1;
        }
      }
    }

    return generateInvoiceNumber(nextSeq, currentYear);
  }

  /**
   * Generate Official Tax Invoice for a confirmed Booking (Idempotent & Transaction-Safe)
   */
  static async generateInvoiceForBooking(bookingId, options = {}) {
    const t = options.transaction || await sequelize.transaction();

    try {
      // 1. Idempotency Check: Return existing invoice if already created
      const existing = await Invoice.findOne({
        where: { bookingId },
        transaction: t
      });

      if (existing) {
        if (!options.transaction) await t.commit();
        return existing;
      }

      // 2. Fetch Booking with full details and related records
      const booking = await Booking.findByPk(bookingId, {
        include: [
          {
            model: BookingItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }]
          },
          {
            model: User,
            as: 'customer',
            include: [{ model: CustomerProfile, as: 'customerProfile' }]
          },
          {
            model: VendorProfile,
            as: 'vendor',
            include: [{ model: User, as: 'user' }]
          },
          {
            model: Order,
            as: 'order'
          }
        ],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!booking) {
        const err = new Error(`Booking with ID ${bookingId} not found`);
        err.statusCode = 404;
        throw err;
      }

      const order = booking.order;
      const customer = booking.customer;
      const vendor = booking.vendor;

      // 3. Build Immutable Snapshots
      let parsedBookingNotes = {};
      try {
        if (booking.rentalNotes) parsedBookingNotes = typeof booking.rentalNotes === 'string' ? JSON.parse(booking.rentalNotes) : booking.rentalNotes;
      } catch (e) {}

      const customerRefundUpi = parsedBookingNotes.customerRefundUpi || (customer && customer.customerProfile ? customer.customerProfile.refundUpi : null) || (customer ? `${customer.email.split('@')[0]}@okaxis` : 'customer@okaxis');

      const vendorMasked = vendor ? vendor.bankAccountMasked : null;
      const vendorCleanName = vendor ? (vendor.businessName || 'vendor') : 'vendor';
      const defaultVendorUpi = `${vendorCleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;
      const vendorUpiId = vendorMasked?.upiId || defaultVendorUpi;
      const vendorQrUrl = vendorMasked?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${vendorUpiId}&pn=${encodeURIComponent(vendorCleanName)}&cu=INR`)}&margin=4`;

      const customerSnapshot = {
        id: customer ? customer.id : booking.customerId,
        fullName: customer ? customer.fullName : 'Customer',
        email: customer ? customer.email : null,
        phone: customer ? customer.phone : null,
        billingAddress: booking.deliveryAddress || (customer && customer.customerProfile ? customer.customerProfile.address : null) || 'Address on file',
        gstNumber: customer && customer.customerProfile ? customer.customerProfile.gstNumber : null,
        refundUpi: customerRefundUpi
      };

      const vendorSnapshot = {
        id: vendor ? vendor.id : booking.vendorId,
        storeName: vendor ? vendor.businessName : 'Rentora Partner Store',
        businessName: vendor ? vendor.businessName : 'Rentora Partner',
        email: vendor ? (vendor.businessEmail || (vendor.user ? vendor.user.email : null)) : null,
        phone: vendor ? (vendor.businessPhone || (vendor.user ? vendor.user.phone : null)) : null,
        address: vendor ? (vendor.businessAddress || 'Registered Vendor Hub') : 'Registered Vendor Store',
        city: vendor ? vendor.city : 'Ahmedabad',
        state: vendor ? vendor.state : 'Gujarat',
        pincode: '380001',
        gstNumber: vendor ? vendor.gstNumber : '24AAACR1234F1Z5',
        panNumber: null,
        upiId: vendorUpiId,
        qrCodeUrl: vendorQrUrl
      };

      const rentalDays = booking.durationCount || 1;

      const itemsSnapshot = (booking.items || []).map(item => {
        const ratePerDay = Number(item.unitRate || 0);
        const itemRentalSubtotal = Number(item.subtotal || (ratePerDay * item.quantity * rentalDays));
        const depositPerUnit = Number(item.depositPerUnit || 0);
        const itemDepositSubtotal = depositPerUnit * item.quantity;

        return {
          productId: item.productId,
          productName: item.product ? item.product.name : 'Rental Equipment',
          sku: item.product ? item.product.sku : null,
          quantity: item.quantity,
          rentalDays,
          ratePerDay,
          depositPerUnit,
          itemRentalSubtotal: Number(itemRentalSubtotal.toFixed(2)),
          itemDepositSubtotal: Number(itemDepositSubtotal.toFixed(2)),
          taxRate: 18.00
        };
      });

      // 4. Pure Backend Financial Calculations (Never trusting client totals)
      const rentalAmount = Number(booking.rentalAmount || 0);
      const deliveryFee = Number(booking.deliveryFee || 0);
      const insuranceAmount = Number(booking.insuranceAmount || 0);
      const additionalCharges = 0.00;
      const discountAmount = Number(booking.discountAmount || 0);

      // Taxable Subtotal = Pure Rental + Delivery + Insurance - Discount
      const taxableAmount = Number((rentalAmount + deliveryFee + insuranceAmount + additionalCharges - discountAmount).toFixed(2));

      // 18% GST Breakdown (Intra-state: 9% CGST + 9% SGST)
      const cgstAmount = Number((taxableAmount * 0.09).toFixed(2));
      const sgstAmount = Number((taxableAmount * 0.09).toFixed(2));
      const igstAmount = 0.00;
      const taxAmount = Number((cgstAmount + sgstAmount).toFixed(2));

      // Rental Total (Taxable Subtotal + 18% GST)
      const rentalTotal = Number((taxableAmount + taxAmount).toFixed(2));

      // Refundable Escrow Deposit (0% GST - strictly isolated)
      const depositAmount = Number(booking.depositAmount || 0);

      // Total Customer Payable
      const totalAmount = Number((rentalTotal + depositAmount).toFixed(2));

      // Payment Status sync
      const isOrderPaid = order && order.paymentStatus === 'Success';
      const paymentStatus = isOrderPaid ? 'Success' : (order ? order.paymentStatus : 'Pending');
      const invoiceStatus = isOrderPaid ? 'PAID' : 'ISSUED';
      const amountPaid = isOrderPaid ? totalAmount : 0.00;
      const remainingAmount = isOrderPaid ? 0.00 : totalAmount;

      // 5. Generate Concurrency-Safe Sequential Invoice Number
      const invoiceNumber = await this.getNextInvoiceNumber(t);
      const today = new Date().toISOString().split('T')[0];

      // 6. Create Invoice record
      const invoice = await Invoice.create({
        invoiceNumber,
        bookingId: booking.id,
        orderId: order ? order.id : null,
        quotationId: null,
        customerId: booking.customerId,
        vendorId: booking.vendorId,
        invoiceDate: today,
        issuedDate: today,
        startDate: booking.startDate,
        endDate: booking.endDate,
        rentalDays,
        rentalAmount,
        deliveryFee,
        insuranceAmount,
        additionalCharges,
        discountAmount,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        taxAmount,
        rentalTotal,
        depositAmount,
        totalAmount,
        amountPaid,
        remainingAmount,
        subtotal: taxableAmount,
        status: invoiceStatus,
        paymentStatus,
        paymentMethod: 'UPI_MANUAL',
        customerSnapshot,
        vendorSnapshot,
        itemsSnapshot,
        notes: 'Thank you for choosing Rentora. Please retain this invoice for your records.',
        terms: '1. Rented equipment is subject to inspection upon return.\n2. The refundable security deposit is held in escrow and will be returned post return verification.\n3. Tax is levied in accordance with applicable Indian GST guidelines (CGST 9% + SGST 9%).'
      }, { transaction: t });

      if (!options.transaction) {
        await t.commit();
      }

      return invoice;

    } catch (error) {
      if (!options.transaction && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Synchronize Invoice Status when Super Admin verifies or rejects a Payment Submission
   */
  static async syncInvoicePaymentStatus(bookingId, paymentStatus, utrNumber, adminUser, options = {}) {
    const t = options.transaction || await sequelize.transaction();

    try {
      let invoice = await Invoice.findOne({
        where: { bookingId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      // If invoice was not yet created for this booking, generate it now
      if (!invoice) {
        invoice = await this.generateInvoiceForBooking(bookingId, { transaction: t });
      }

      if (paymentStatus === 'Success') {
        invoice.status = 'PAID';
        invoice.paymentStatus = 'Success';
        invoice.amountPaid = invoice.totalAmount;
        invoice.remainingAmount = 0.00;
        if (utrNumber) invoice.paymentReference = utrNumber;
        invoice.paymentVerificationDate = new Date();
        if (adminUser) invoice.verifiedByAdminId = adminUser.id;
      } else if (paymentStatus === 'Failed' || paymentStatus === 'Rejected') {
        invoice.status = 'ISSUED';
        invoice.paymentStatus = 'Failed';
        invoice.amountPaid = 0.00;
        invoice.remainingAmount = invoice.totalAmount;
      }

      await invoice.save({ transaction: t });

      if (!options.transaction) {
        await t.commit();
      }

      return invoice;

    } catch (error) {
      if (!options.transaction && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Customer Retrieves Invoices for their own Bookings
   */
  static async getCustomerInvoices(customerId, query = {}) {
    const { page = 1, limit = 10, status, paymentStatus, search, startDate, endDate } = query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = { customerId };

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) {
      where.invoiceNumber = { [Op.like]: `%${search}%` };
    }
    if (startDate && endDate) {
      where.invoiceDate = { [Op.between]: [startDate, endDate] };
    }

    const { rows, count } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'bookingNumber', 'startDate', 'endDate', 'status']
        },
        {
          model: VendorProfile,
          as: 'vendor',
          attributes: ['id', 'businessName', 'city', 'state']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    return {
      invoices: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    };
  }

  /**
   * Vendor Retrieves Invoices for their Store Bookings
   */
  static async getVendorInvoices(vendorId, query = {}) {
    const { page = 1, limit = 10, status, paymentStatus, search, startDate, endDate } = query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = { vendorId };

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) {
      where.invoiceNumber = { [Op.like]: `%${search}%` };
    }
    if (startDate && endDate) {
      where.invoiceDate = { [Op.between]: [startDate, endDate] };
    }

    const { rows, count } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'bookingNumber', 'startDate', 'endDate', 'status']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    return {
      invoices: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    };
  }

  /**
   * Super Admin Retrieves All Invoices with Multi-Filter
   */
  static async getAllInvoices(query = {}) {
    const { page = 1, limit = 20, status, paymentStatus, vendorId, customerId, search, startDate, endDate } = query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (vendorId) where.vendorId = vendorId;
    if (customerId) where.customerId = customerId;
    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.like]: `%${search}%` } },
        { paymentReference: { [Op.like]: `%${search}%` } }
      ];
    }
    if (startDate && endDate) {
      where.invoiceDate = { [Op.between]: [startDate, endDate] };
    }

    const { rows, count } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'bookingNumber', 'startDate', 'endDate', 'status']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: VendorProfile,
          as: 'vendor',
          attributes: ['id', 'businessName', 'city', 'state']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    return {
      invoices: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    };
  }

  /**
   * Retrieve Single Invoice by ID (UUID) with Strict RBAC & Ownership Validation
   */
  static async getInvoiceById(invoiceId, user, roles = []) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(invoiceId);

    // If identifier is not a UUID, delegate to getInvoiceByNumber
    if (!isUUID) {
      return this.getInvoiceByNumber(invoiceId, user, roles);
    }

    const invoice = await Invoice.findByPk(invoiceId, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [{ model: BookingItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        },
        {
          model: Order,
          as: 'order'
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: VendorProfile,
          as: 'vendor',
          attributes: ['id', 'businessName', 'businessAddress', 'city', 'state', 'gstNumber']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    if (!invoice) {
      const err = new Error('Invoice not found');
      err.statusCode = 404;
      throw err;
    }

    // Role-based Ownership Checks
    const userRoleNames = (roles && roles.length > 0)
      ? roles
      : ((user && user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : []);

    const isAdmin = userRoleNames.includes(ROLES.SUPER_ADMIN);
    const isCustomer = user && invoice.customerId === user.id;

    let isVendor = false;
    if (user && user.vendorProfile && user.vendorProfile.id === invoice.vendorId) {
      isVendor = true;
    } else if (user) {
      const vendorProf = await VendorProfile.findOne({ where: { userId: user.id } });
      if (vendorProf && vendorProf.id === invoice.vendorId) {
        isVendor = true;
      }
    }

    if (!isAdmin && !isCustomer && !isVendor) {
      const err = new Error('Forbidden: You do not have permission to view this invoice');
      err.statusCode = 403;
      throw err;
    }

    return invoice;
  }

  /**
   * Retrieve Single Invoice by Invoice Number (e.g. INV-2026-000001 or REN-...)
   */
  static async getInvoiceByNumber(invoiceNumber, user, roles = []) {
    const trimmed = (invoiceNumber || '').trim();

    let invoice = await Invoice.findOne({
      where: {
        [Op.or]: [
          { invoiceNumber: trimmed },
          { orderId: trimmed }
        ]
      },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [{ model: BookingItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        },
        {
          model: Order,
          as: 'order'
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: VendorProfile,
          as: 'vendor',
          attributes: ['id', 'businessName', 'businessAddress', 'city', 'state', 'gstNumber']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    // If not found by invoiceNumber or orderId, check if it matches a booking's bookingNumber
    if (!invoice) {
      const booking = await Booking.findOne({ where: { bookingNumber: trimmed } });
      if (booking) {
        invoice = await Invoice.findOne({
          where: { bookingId: booking.id },
          include: [
            {
              model: Booking,
              as: 'booking',
              include: [{ model: BookingItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
            },
            {
              model: Order,
              as: 'order'
            },
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'fullName', 'email', 'phone']
            },
            {
              model: VendorProfile,
              as: 'vendor',
              attributes: ['id', 'businessName', 'businessAddress', 'city', 'state', 'gstNumber']
            },
            {
              model: User,
              as: 'verifier',
              attributes: ['id', 'fullName', 'email']
            }
          ]
        });
      }
    }

    if (!invoice) {
      const err = new Error(`Invoice not found for number: ${trimmed}`);
      err.statusCode = 404;
      throw err;
    }

    // Role-based Ownership Checks
    const userRoleNames = (roles && roles.length > 0)
      ? roles
      : ((user && user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : []);

    const isAdmin = userRoleNames.includes(ROLES.SUPER_ADMIN);
    const isCustomer = user && invoice.customerId === user.id;

    let isVendor = false;
    if (user && user.vendorProfile && user.vendorProfile.id === invoice.vendorId) {
      isVendor = true;
    } else if (user) {
      const vendorProf = await VendorProfile.findOne({ where: { userId: user.id } });
      if (vendorProf && vendorProf.id === invoice.vendorId) {
        isVendor = true;
      }
    }

    if (!isAdmin && !isCustomer && !isVendor) {
      const err = new Error('Forbidden: You do not have permission to view this invoice');
      err.statusCode = 403;
      throw err;
    }

    return invoice;
  }

  /**
   * Retrieve Invoice by Booking ID with Strict RBAC & Ownership Validation
   */
  static async getInvoiceByBookingId(bookingId, user, roles = []) {
    let invoice = await Invoice.findOne({
      where: { bookingId },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [{ model: BookingItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
        },
        {
          model: Order,
          as: 'order'
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: VendorProfile,
          as: 'vendor',
          attributes: ['id', 'businessName', 'businessAddress', 'city', 'state', 'gstNumber']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    if (!invoice) {
      // If invoice not yet generated, attempt to generate it
      invoice = await this.generateInvoiceForBooking(bookingId);
      return this.getInvoiceById(invoice.id, user, roles);
    }

    // Role-based Ownership Checks
    const userRoleNames = (roles && roles.length > 0)
      ? roles
      : ((user && user.roles) ? user.roles.map(r => typeof r === 'string' ? r : r.name) : []);

    const isAdmin = userRoleNames.includes(ROLES.SUPER_ADMIN);
    const isCustomer = user && invoice.customerId === user.id;

    let isVendor = false;
    if (user && user.vendorProfile && user.vendorProfile.id === invoice.vendorId) {
      isVendor = true;
    } else if (user) {
      const vendorProf = await VendorProfile.findOne({ where: { userId: user.id } });
      if (vendorProf && vendorProf.id === invoice.vendorId) {
        isVendor = true;
      }
    }

    if (!isAdmin && !isCustomer && !isVendor) {
      const err = new Error('Forbidden: You do not have permission to view this invoice');
      err.statusCode = 403;
      throw err;
    }

    return invoice;
  }

  /**
   * Generate A4 Standalone Printable HTML for Invoice
   */
  static async renderInvoiceHtml(invoiceId, user, roles = []) {
    const invoice = await this.getInvoiceById(invoiceId, user, roles);

    const vendor = invoice.vendorSnapshot || (invoice.vendor ? {
      storeName: invoice.vendor.storeName || invoice.vendor.businessName,
      address: invoice.vendor.address,
      city: invoice.vendor.city,
      state: invoice.vendor.state,
      pincode: invoice.vendor.pincode,
      gstNumber: invoice.vendor.gstNumber
    } : {});

    const customer = invoice.customerSnapshot || (invoice.customer ? {
      fullName: invoice.customer.fullName,
      email: invoice.customer.email,
      phone: invoice.customer.phone,
      billingAddress: 'Address on file'
    } : {});

    const items = invoice.itemsSnapshot || [];
    const isPaid = invoice.status === 'PAID' || invoice.paymentStatus === 'Success';

    const vendorUpi = vendor.upiId || (vendor.storeName ? `${vendor.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis` : 'vendor.escrow@okaxis');
    const vendorQr = vendor.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=${vendorUpi}&pn=${encodeURIComponent(vendor.storeName || 'Vendor')}&am=${invoice.totalAmount}&cu=INR`)}&margin=2`;
    const customerRefundUpi = customer.refundUpi || (customer.email ? `${customer.email.split('@')[0]}@okaxis` : 'customer@okaxis');

    const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const itemsRowsHtml = items.map((item, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #1E293B; font-weight: 500;">
          ${item.productName || 'Equipment'}
          ${item.sku ? `<div style="font-size: 11px; color: #64748B;">SKU: ${item.sku}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: center;">${item.rentalDays || invoice.rentalDays || 1} Days</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #475569; text-align: right;">${formatCurrency(item.ratePerDay)}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #1E293B; font-weight: 600; text-align: right;">${formatCurrency(item.itemRentalSubtotal)}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${invoice.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      background-color: #F8FAFC;
      padding: 24px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 36px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .badge-paid {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background-color: #DCFCE7;
      color: #15803D;
      border: 1px solid #86EFAC;
    }
    .badge-pending {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background-color: #FEF3C7;
      color: #B45309;
      border: 1px solid #FDE68A;
    }
    @media print {
      body {
        background-color: #FFFFFF;
        padding: 0;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px auto; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 14px; color: #64748B;">Rentora Tax Invoice Preview</span>
    <button onclick="window.print()" style="background: #2563EB; color: #FFFFFF; border: none; padding: 8px 18px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
      Print / Download PDF
    </button>
  </div>

  <div class="invoice-card">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F1F5F9; padding-bottom: 24px; margin-bottom: 24px;">
      <div>
        <div style="font-size: 26px; font-weight: 800; color: #2563EB; letter-spacing: -0.5px;">RENTORA</div>
        <div style="font-size: 12px; color: #64748B; margin-top: 2px;">Multi-Vendor Rental & Equipment Marketplace</div>
        <div style="font-size: 12px; color: #64748B;">GSTIN: 24AAACR1234F1Z5 | Ahmedabad, Gujarat</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 22px; font-weight: 800; color: #0F172A; text-transform: uppercase;">TAX INVOICE</div>
        <div style="font-size: 14px; font-weight: 700; color: #2563EB; margin-top: 2px;">${invoice.invoiceNumber}</div>
        <div style="margin-top: 6px;">
          ${isPaid ? '<span class="badge-paid">PAID & VERIFIED</span>' : '<span class="badge-pending">PAYMENT PENDING</span>'}
        </div>
      </div>
    </div>

    <!-- Details Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
      <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
        <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Vendor (Service Provider)</div>
        <div style="font-size: 14px; font-weight: 700; color: #1E293B;">${vendor.storeName || 'Vendor Store'}</div>
        <div style="font-size: 12px; color: #475569; margin-top: 3px;">${vendor.address || 'Vendor Registered Hub'}</div>
        <div style="font-size: 12px; color: #475569;">${vendor.city || 'Ahmedabad'}, ${vendor.state || 'Gujarat'} - ${vendor.pincode || '380001'}</div>
        ${vendor.gstNumber ? `<div style="font-size: 12px; color: #475569; margin-top: 4px;"><strong>GSTIN:</strong> ${vendor.gstNumber}</div>` : ''}
      </div>

      <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
        <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Billed To (Customer)</div>
        <div style="font-size: 14px; font-weight: 700; color: #1E293B;">${customer.fullName || 'Valued Customer'}</div>
        <div style="font-size: 12px; color: #475569; margin-top: 3px;">${customer.billingAddress || 'Address on file'}</div>
        <div style="font-size: 12px; color: #475569;">${customer.phone ? `Phone: ${customer.phone}` : ''} ${customer.email ? `| Email: ${customer.email}` : ''}</div>
        ${customer.gstNumber ? `<div style="font-size: 12px; color: #475569; margin-top: 4px;"><strong>GSTIN:</strong> ${customer.gstNumber}</div>` : ''}
      </div>
    </div>

    <!-- Booking Period & Metadata -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #EFF6FF; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #DBEAFE;">
      <div>
        <div style="font-size: 11px; color: #1E40AF; font-weight: 600;">INVOICE DATE</div>
        <div style="font-size: 13px; font-weight: 700; color: #1E3A8A;">${invoice.invoiceDate}</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #1E40AF; font-weight: 600;">RENTAL START</div>
        <div style="font-size: 13px; font-weight: 700; color: #1E3A8A;">${invoice.startDate || 'N/A'}</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #1E40AF; font-weight: 600;">RENTAL END</div>
        <div style="font-size: 13px; font-weight: 700; color: #1E3A8A;">${invoice.endDate || 'N/A'}</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #1E40AF; font-weight: 600;">DURATION</div>
        <div style="font-size: 13px; font-weight: 700; color: #1E3A8A;">${invoice.rentalDays || 1} Days</div>
      </div>
    </div>

    <!-- Itemized Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background: #F1F5F9; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #CBD5E1;">
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-align: center; width: 40px;">#</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-align: left;">Item Description</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-align: center; width: 60px;">Qty</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-align: center; width: 80px;">Period</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-align: right; width: 100px;">Rate/Day</th>
          <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-align: right; width: 110px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
      </tbody>
    </table>

    <!-- Financial Breakdown & Escrow -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <!-- Payment & Escrow Information -->
      <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; background: #FAF5FF;">
        <div style="font-size: 12px; font-weight: 700; color: #6B21A8; text-transform: uppercase; margin-bottom: 8px;">Refundable Security Deposit</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 13px; color: #581C87;">Escrow Deposit (0% GST):</span>
          <span style="font-size: 14px; font-weight: 700; color: #6B21A8;">${formatCurrency(invoice.depositAmount)}</span>
        </div>
        <div style="font-size: 11px; color: #7E22CE; line-height: 1.4;">
          * Held safely in Rentora Escrow. Refunded back to customer post-inspection upon equipment return without damage deductions.
        </div>
        <div style="margin-top: 10px; padding: 8px 10px; background: #FFFFFF; border-radius: 6px; border: 1px solid #E9D5FF; font-size: 11px; color: #581C87;">
          <strong>Customer Deposit Refund UPI:</strong> <span style="font-family: monospace; font-weight: 700; color: #6B21A8;">${customerRefundUpi}</span>
        </div>
        ${invoice.paymentReference ? `
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #D8B4FE; font-size: 11px; color: #581C87;">
          <strong>Bank Reference / UTR:</strong> ${invoice.paymentReference}<br>
          ${invoice.paymentVerificationDate ? `<strong>Verified On:</strong> ${new Date(invoice.paymentVerificationDate).toLocaleString('en-IN')}` : ''}
        </div>
        ` : ''}
      </div>

      <!-- Taxable Financials Summary -->
      <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; background: #FFFFFF;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #475569;">
          <span>Pure Rental Amount:</span>
          <span style="font-weight: 600; color: #1E293B;">${formatCurrency(invoice.rentalAmount)}</span>
        </div>
        ${Number(invoice.deliveryFee) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #475569;">
          <span>Doorstep Delivery Fee:</span>
          <span style="font-weight: 600; color: #1E293B;">${formatCurrency(invoice.deliveryFee)}</span>
        </div>` : ''}
        ${Number(invoice.insuranceAmount) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #475569;">
          <span>Rental Damage Protection (2%):</span>
          <span style="font-weight: 600; color: #1E293B;">${formatCurrency(invoice.insuranceAmount)}</span>
        </div>` : ''}
        ${Number(invoice.discountAmount) > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #15803D;">
          <span>Discount Applied:</span>
          <span style="font-weight: 600; color: #15803D;">-${formatCurrency(invoice.discountAmount)}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #1E293B; border-top: 1px solid #F1F5F9; padding-top: 6px;">
          <span>Taxable Value:</span>
          <span style="font-weight: 700;">${formatCurrency(invoice.taxableAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; color: #64748B;">
          <span>CGST (9%):</span>
          <span>${formatCurrency(invoice.cgstAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: #64748B;">
          <span>SGST (9%):</span>
          <span>${formatCurrency(invoice.sgstAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #1E293B; border-top: 1px solid #E2E8F0; padding-top: 6px;">
          <span>Rental Invoice Total:</span>
          <span style="font-weight: 700;">${formatCurrency(invoice.rentalTotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #6B21A8;">
          <span>+ Refundable Deposit:</span>
          <span style="font-weight: 700;">${formatCurrency(invoice.depositAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 15px; font-weight: 800; color: #1E3A8A; border-top: 2px solid #2563EB; padding-top: 8px;">
          <span>Total Payable:</span>
          <span>${formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>
    </div>

    <!-- Vendor Settlement & UPI Payment Verification Card -->
    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <img src="${vendorQr}" alt="Vendor UPI QR" style="width: 72px; height: 72px; border-radius: 6px; border: 1px solid #86EFAC; background: #FFFFFF; padding: 2px;" />
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">Official Vendor Payment & Settlement VPA</div>
          <div style="font-size: 13px; font-family: monospace; font-weight: 700; color: #14532D; margin-top: 2px;">${vendorUpi}</div>
          <div style="font-size: 11px; color: #15803D; margin-top: 2px;">Merchant: <strong>${vendor.storeName || 'Registered Store'}</strong> | Rentora Verified Escrow Payout</div>
        </div>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; padding: 4px 10px; background: #DCFCE7; border: 1px solid #86EFAC; border-radius: 20px; font-size: 11px; font-weight: 700; color: #15803D;">
          100% Escrow Verified
        </span>
      </div>
    </div>

    <!-- Terms & Footer -->
    <div style="border-top: 1px solid #E2E8F0; padding-top: 16px; margin-top: 16px; font-size: 11px; color: #64748B; line-height: 1.5;">
      <strong>Terms & Conditions:</strong><br>
      1. This is a computer-generated tax invoice issued by Rentora on behalf of the registered vendor.<br>
      2. Security deposit is refundable within 24–48 hours after product return and quality inspection.<br>
      3. For any billing support or queries, contact support@rentora.in.
    </div>
  </div>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('print') === 'true' || urlParams.get('download') === 'true') {
        setTimeout(() => {
          window.print();
        }, 400);
      }
    });
  </script>
</body>
</html>`;
  }
}

module.exports = InvoiceService;
