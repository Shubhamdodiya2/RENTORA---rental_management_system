/**
 * Rentora B2B Custom Quotation & Negotiation Service
 */

const { sequelize, Quotation, QuotationItem, Product, VendorProfile, User } = require('../models');
const { generateQuotationNumber } = require('../utils/bookingNumber');
const BookingService = require('./booking.service');

class QuotationService {
  /**
   * Customer submits a custom quotation inquiry for bulk/event rental
   */
  static async createQuotation(customerId, payload, options = {}) {
    const { vendorId, items, eventDate, durationDays, customerNotes } = payload;
    const t = options.transaction || await sequelize.transaction();

    try {
      const quotationNumber = generateQuotationNumber();
      let subtotal = 0;
      const quoteItemsData = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (!product) {
          const err = new Error(`Product ${item.productId} not found`);
          err.statusCode = 404;
          throw err;
        }

        const unitRate = Number(product.discountPrice || product.pricePerDay);
        const lineTotal = unitRate * Number(item.quantity) * Number(durationDays);
        subtotal += lineTotal;

        quoteItemsData.push({
          productId: product.id,
          quantity: Number(item.quantity),
          durationDays: Number(durationDays),
          unitRate,
          subtotal: lineTotal
        });
      }

      const taxAmount = Number((subtotal * 0.18).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));
      const validUntil = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const quotation = await Quotation.create({
        quotationNumber,
        customerId,
        vendorId,
        eventDate,
        durationDays: Number(durationDays),
        validUntil,
        status: 'Submitted',
        subtotal,
        taxAmount,
        depositAmount: 0.00,
        discountAmount: 0.00,
        totalAmount,
        notes: customerNotes || null,
        vendorNotes: null
      }, { transaction: t });

      const itemRows = quoteItemsData.map(i => ({ ...i, quotationId: quotation.id }));
      await QuotationItem.bulkCreate(itemRows, { transaction: t });

      if (!options.transaction) {
        await t.commit();
      }

      return await Quotation.findByPk(quotation.id, {
        include: [
          { model: QuotationItem, as: 'items', include: [{ model: Product, as: 'product' }] },
          { model: VendorProfile, as: 'vendor' },
          { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] }
        ]
      });

    } catch (error) {
      if (!options.transaction && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Vendor responds to quotation with customized rates & notes
   */
  static async respondQuotation(quotationId, vendorProfileId, payload, options = {}) {
    const { items, vendorNotes } = payload;
    const t = options.transaction || await sequelize.transaction();

    try {
      const quotation = await Quotation.findByPk(quotationId, {
        include: [{ model: QuotationItem, as: 'items' }],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!quotation) {
        const err = new Error('Quotation not found');
        err.statusCode = 404;
        throw err;
      }

      if (quotation.vendorId !== vendorProfileId) {
        const err = new Error('Forbidden: You can only respond to quotes submitted to your vendor store');
        err.statusCode = 403;
        throw err;
      }

      if (!['Submitted', 'Reviewed'].includes(quotation.status)) {
        const err = new Error(`Cannot modify quotation in '${quotation.status}' status`);
        err.statusCode = 400;
        throw err;
      }

      let newSubtotal = 0;

      for (const itemPayload of items) {
        const existingItem = quotation.items.find(i => i.productId === itemPayload.productId);
        if (existingItem) {
          const customRate = Number(itemPayload.customRate !== undefined ? itemPayload.customRate : itemPayload.unitRate);
          const lineTotal = customRate * existingItem.quantity * quotation.durationDays;
          existingItem.customRate = customRate;
          existingItem.unitRate = customRate;
          existingItem.subtotal = lineTotal;
          await existingItem.save({ transaction: t });
          newSubtotal += lineTotal;
        }
      }

      const taxAmount = Number((newSubtotal * 0.18).toFixed(2));
      const totalAmount = Number((newSubtotal + taxAmount).toFixed(2));

      quotation.subtotal = newSubtotal;
      quotation.taxAmount = taxAmount;
      quotation.totalAmount = totalAmount;
      quotation.status = 'Quote_Sent';
      if (vendorNotes) quotation.vendorNotes = vendorNotes;
      await quotation.save({ transaction: t });

      if (!options.transaction) {
        await t.commit();
      }

      return await Quotation.findByPk(quotation.id, {
        include: [
          { model: QuotationItem, as: 'items', include: [{ model: Product, as: 'product' }] },
          { model: VendorProfile, as: 'vendor' }
        ]
      });

    } catch (error) {
      if (!options.transaction && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Customer accepts quote offer -> performs fresh availability check, locks rows & converts to official Booking
   */
  static async acceptQuotation(quotationId, customerId, options = {}) {
    const t = options.transaction || await sequelize.transaction();

    try {
      const quotation = await Quotation.findByPk(quotationId, {
        include: [
          { model: QuotationItem, as: 'items', include: [{ model: Product, as: 'product' }] }
        ],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!quotation) {
        const err = new Error('Quotation not found');
        err.statusCode = 404;
        throw err;
      }

      if (quotation.customerId !== customerId) {
        const err = new Error('Forbidden: You can only accept your own quotation requests');
        err.statusCode = 403;
        throw err;
      }

      // Check Expiry
      if (quotation.validUntil) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const validDate = new Date(`${quotation.validUntil}T23:59:59Z`);
        if (today > validDate) {
          quotation.status = 'Expired';
          await quotation.save({ transaction: t });
          const err = new Error('Quotation offer has expired and can no longer be accepted');
          err.statusCode = 400;
          throw err;
        }
      }

      // Check duplicate or invalid status
      if (quotation.status !== 'Quote_Sent') {
        const err = new Error(`Quotation must be in 'Quote_Sent' status to be accepted. Current status: '${quotation.status}'`);
        err.statusCode = 400;
        throw err;
      }

      // Compute dates from eventDate and durationDays
      const startDate = quotation.eventDate;
      const startD = new Date(`${startDate}T00:00:00Z`);
      const endD = new Date(startD.getTime() + (quotation.durationDays - 1) * 86400000);
      const endDate = endD.toISOString().split('T')[0];

      // Convert to official Booking via BookingService inside same atomic transaction
      const bookingPayload = {
        items: quotation.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity
        })),
        startDate,
        endDate,
        deliveryType: 'doorstep',
        deliveryAddress: 'Customer Address on File',
        rentalNotes: `Created from accepted Quotation #${quotation.quotationNumber}`
      };

      const booking = await BookingService.createBooking(customerId, bookingPayload, { transaction: t });

      quotation.status = 'Accepted';
      await quotation.save({ transaction: t });

      if (!options.transaction) {
        await t.commit();
      }

      return {
        quotation,
        booking
      };

    } catch (error) {
      if (!options.transaction && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Reject quotation proposal
   */
  static async rejectQuotation(quotationId, actorId) {
    const quotation = await Quotation.findByPk(quotationId);
    if (!quotation) {
      const err = new Error('Quotation not found');
      err.statusCode = 404;
      throw err;
    }

    if (['Accepted', 'Rejected', 'Expired'].includes(quotation.status)) {
      const err = new Error(`Cannot reject quotation in '${quotation.status}' status`);
      err.statusCode = 400;
      throw err;
    }

    quotation.status = 'Rejected';
    await quotation.save();
    return quotation;
  }
}

module.exports = QuotationService;
