/**
 * Rentora Master Booking & Lifecycle Service
 */

const { Op } = require('sequelize');
const { 
  sequelize, 
  Booking, 
  BookingItem, 
  BookingStatusHistory, 
  Order, 
  Product, 
  Inventory, 
  InventoryTransaction, 
  VendorProfile, 
  User,
  RentalPayment,
  EscrowDeposit
} = require('../models');
const PricingService = require('./pricing.service');
const AvailabilityService = require('./availability.service');
const InvoiceService = require('./invoice.service');
const { generateBookingNumber } = require('../utils/bookingNumber');
const { generateSecureHandoverOtp, verifySecureHandoverOtp } = require('../utils/otpGenerator');
const { LIFECYCLE_STEPS, BOOKING_STATUSES } = require('../config/constants');

class BookingService {
  /**
   * Create new multi-product rental booking with atomic reservation & pricing calculation
   */
  static async createBooking(customerId, payload, options = {}) {
    const {
      items,
      startDate,
      endDate,
      durationMode = 'day',
      deliveryType = 'doorstep',
      deliveryAddress,
      paymentPlan = 'full',
      rentalNotes = ''
    } = payload;

    const t = options.transaction || await sequelize.transaction();

    try {
      // 1. Sort product IDs lexically to prevent database deadlocks during multi-row locking
      const sortedItems = [...items].sort((a, b) => a.productId.localeCompare(b.productId));

      // Calculate duration count (inclusive days)
      const startD = new Date(`${startDate}T00:00:00Z`);
      const endD = new Date(`${endDate}T00:00:00Z`);
      const durationDays = Math.max(1, Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1);

      let vendorId = null;
      const verifiedProducts = [];

      // 2. Lock & Verify date-wise availability for every item in sorted order
      for (const item of sortedItems) {
        const product = await Product.findByPk(item.productId, {
          include: [{ model: Inventory, as: 'inventory' }],
          transaction: t
        });

        if (!product) {
          const err = new Error(`Product ${item.productId} not found`);
          err.statusCode = 404;
          throw err;
        }

        if (product.status !== 'Active' || product.approvalStatus !== 'Approved') {
          const err = new Error(`Product '${product.name}' is not currently active for booking`);
          err.statusCode = 400;
          throw err;
        }

        // Verify single-vendor per booking consistency
        if (!vendorId) {
          vendorId = product.vendorId;
        } else if (vendorId !== product.vendorId) {
          const err = new Error('All products in a single booking must belong to the same vendor store');
          err.statusCode = 400;
          throw err;
        }

        // Self-Rent Prevention: Vendor cannot rent their own product listing
        const vendorProfile = await VendorProfile.findByPk(product.vendorId, { transaction: t });
        if (vendorProfile && vendorProfile.userId === customerId) {
          const err = new Error('You are the registered vendor for this product. Vendors cannot rent their own equipment. Only customer accounts can rent products.');
          err.statusCode = 403;
          throw err;
        }

        // Acquire row lock and verify date-range availability
        await AvailabilityService.acquireReservationLockAndVerify(
          product.id,
          startDate,
          endDate,
          item.quantity,
          t
        );

        verifiedProducts.push({
          product,
          quantity: item.quantity,
          customRate: item.customRate !== undefined ? Number(item.customRate) : undefined
        });
      }

      // 3. Calculate exact master financial breakdown (or apply custom negotiated quote financials)
      let pricing;
      if (payload.customFinancials) {
        const cf = payload.customFinancials;
        pricing = {
          itemSubtotal: Number(cf.subtotal),
          pureRentalAmount: Number(cf.subtotal),
          taxAmount: Number(cf.taxAmount || 0),
          escrowDepositAmount: Number(cf.depositAmount || 0),
          deliveryFee: Number(cf.deliveryFee || 0),
          insuranceAmount: 0,
          discountAmount: Number(cf.discountAmount || 0),
          totalCustomerPayable: Number(cf.totalAmount)
        };
      } else {
        const pricingItems = verifiedProducts.map(vp => ({
          product: vp.product,
          quantity: vp.quantity,
          durationMode,
          durationCount: durationDays
        }));

        pricing = PricingService.calculateBookingFinancials({
          items: pricingItems,
          deliveryType,
          deliveryFee: deliveryType === 'doorstep' ? 250.00 : 0.00,
          insuranceRate: 0.02
        });
      }

      // 4. Generate unique identifiers & secure salted handover OTP (zero-plaintext storage)
      const bookingNumber = generateBookingNumber();
      const { rawOtp, otpMetadata } = generateSecureHandoverOtp(72); // 72-hour validity window

      // Secure metadata: Database only stores salted hash, salt, expiry, and attempt counters
      const bookingMetadata = {
        otpMetadata,
        clientNotes: rentalNotes || '',
        pricingBreakdown: pricing,
        customerRefundUpi: payload.customerRefundUpi || null,
        quotationId: payload.quotationId || null,
        quotationNumber: payload.quotationNumber || null,
        isQuotationOrder: Boolean(payload.quotationId || payload.customFinancials)
      };

      // 5. Create Booking record (Step 1: BOOKING_CONFIRMED)
      const booking = await Booking.create({
        bookingNumber,
        customerId,
        vendorId,
        startDate,
        endDate,
        durationMode,
        durationCount: durationDays,
        pickupTime: '10:00 AM',
        returnTime: '06:00 PM',
        deliveryType,
        deliveryAddress: deliveryType === 'doorstep' ? deliveryAddress : null,
        rentalAmount: pricing.pureRentalAmount,
        depositAmount: pricing.escrowDepositAmount,
        deliveryFee: pricing.deliveryFee,
        insuranceAmount: pricing.insuranceAmount,
        discountAmount: pricing.discountAmount,
        taxAmount: pricing.taxAmount,
        totalAmount: pricing.totalCustomerPayable,
        paymentPlan,
        currentStep: 1,
        status: 'BOOKING_CONFIRMED',
        rentalNotes: JSON.stringify(bookingMetadata)
      }, { transaction: t });

      // 6. Create BookingItem rows (applying custom rate if provided)
      const bookingItemRows = verifiedProducts.map(vp => {
        const unitRate = vp.customRate !== undefined ? vp.customRate : (vp.product.discountPrice || vp.product.pricePerDay);
        const subtotal = Number(unitRate) * vp.quantity * durationDays;
        return {
          bookingId: booking.id,
          productId: vp.product.id,
          quantity: vp.quantity,
          unitRate,
          depositPerUnit: vp.product.securityDeposit || 0,
          subtotal
        };
      });
      await BookingItem.bulkCreate(bookingItemRows, { transaction: t });

      const isQuotation = Boolean(payload.quotationId || payload.quotationNumber || payload.customFinancials);

      // 7. Create initial Order linked to booking
      const createdOrder = await Order.create({
        orderNumber: `ORD-${bookingNumber.replace('BKG-', '')}`,
        customerId,
        vendorId,
        bookingId: booking.id,
        subtotal: pricing.itemSubtotal,
        taxAmount: pricing.taxAmount,
        deliveryFee: pricing.deliveryFee,
        depositAmount: pricing.escrowDepositAmount,
        totalAmount: pricing.totalCustomerPayable,
        orderStatus: isQuotation ? 'Pending' : 'Confirmed',
        paymentStatus: isQuotation ? 'Pending' : 'Success'
      }, { transaction: t });

      // If standard checkout (not quotation), record payment and escrow deposit upfront
      if (!isQuotation) {
        await RentalPayment.create({
          transactionId: payload.utrNumber || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          orderId: createdOrder.id,
          bookingId: booking.id,
          customerId,
          vendorId,
          amount: pricing.itemSubtotal + pricing.taxAmount + pricing.deliveryFee,
          paymentMethod: ['UPI', 'Card', 'NetBanking', 'Wallet'].includes(payload.paymentMethod) ? payload.paymentMethod : 'UPI',
          paymentStatus: 'Success',
          paidAt: new Date()
        }, { transaction: t });

        if (pricing.escrowDepositAmount > 0) {
          await EscrowDeposit.create({
            orderId: createdOrder.id,
            bookingId: booking.id,
            customerId,
            vendorId,
            depositAmount: pricing.escrowDepositAmount,
            status: 'HELD',
            heldAt: new Date()
          }, { transaction: t });
        }
      }

      // 8. Create Status History entry for Step 1
      await BookingStatusHistory.create({
        bookingId: booking.id,
        status: 'BOOKING_CONFIRMED',
        stepNumber: 1,
        title: LIFECYCLE_STEPS[1].label,
        notes: isQuotation
          ? `Booking generated from accepted Quotation #${payload.quotationNumber || ''} (Awaiting Vendor Acceptance & Customer Payment)`
          : 'Booking created and payment confirmed via customer checkout',
        performedBy: customerId
      }, { transaction: t });

      // 9. Record InventoryTransaction for each item
      for (const vp of verifiedProducts) {
        const inv = await Inventory.findOne({ where: { productId: vp.product.id }, transaction: t });
        await InventoryTransaction.create({
          productId: vp.product.id,
          deltaQuantity: vp.quantity,
          previousStock: inv.totalStock,
          newStock: inv.totalStock,
          transactionType: 'STOCK_RESERVED',
          reason: `Stock reserved for Booking ${bookingNumber}`,
          performedBy: customerId
        }, { transaction: t });
      }

      // 9.5 Generate Official Tax Invoice (status: ISSUED, paymentStatus: Pending)
      await InvoiceService.generateInvoiceForBooking(booking.id, { transaction: t });

      // 10. Fetch complete populated booking
      const fetchOpts = {
        include: [
          { model: BookingItem, as: 'items', include: [{ model: Product, as: 'product' }] },
          { model: BookingStatusHistory, as: 'statusHistory' },
          { model: VendorProfile, as: 'vendor' },
          { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] }
        ]
      };
      if (options.transaction) {
        fetchOpts.transaction = t;
      }

      const createdBooking = await Booking.findByPk(booking.id, fetchOpts);

      if (!options.transaction) {
        await t.commit();
      }

      // Attach raw OTP exclusively on the initial creation response for the customer
      const plainBooking = createdBooking ? createdBooking.toJSON() : booking.toJSON();
      plainBooking.initialCustomerOtp = rawOtp;

      return plainBooking;

    } catch (error) {
      if (!options.transaction && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Advance Booking Lifecycle Step (Strict 8-Step State Machine)
   */
  static async transitionStep(bookingId, targetStep, actor, data = {}, options = {}) {
    const t = options.transaction || await sequelize.transaction();

    try {
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: BookingItem, as: 'items' },
          { model: VendorProfile, as: 'vendor' }
        ],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!booking) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
      }

      // Check Terminal & Disputed States
      if (['CANCELLED', 'DEPOSIT_RELEASED'].includes(booking.status)) {
        const err = new Error(`Cannot transition booking from terminal state '${booking.status}'`);
        err.statusCode = 400;
        throw err;
      }

      if (booking.status === 'DISPUTED') {
        const err = new Error('Booking is currently under dispute. Only Super Admin can override or resolve disputed bookings.');
        err.statusCode = 403;
        throw err;
      }

      // Strict sequential step enforcement
      const expectedStep = booking.currentStep + 1;
      if (targetStep !== expectedStep) {
        const err = new Error(
          `Invalid step transition: Cannot jump from Step ${booking.currentStep} to Step ${targetStep}. Expected Step ${expectedStep}.`
        );
        err.statusCode = 400;
        throw err;
      }

      // Step 4 Verification: Zero-Plaintext Salted Handover OTP Check
      if (targetStep === 4) {
        let meta = {};
        try { meta = JSON.parse(booking.rentalNotes || '{}'); } catch (e) {}

        const verification = verifySecureHandoverOtp(data.handoverOtp, meta.otpMetadata);
        meta.otpMetadata = verification.updatedMetadata;
        booking.rentalNotes = JSON.stringify(meta);

        if (!verification.valid) {
          await booking.save({ transaction: t });
          if (!options.transaction) await t.commit(); // commit attempt count update
          const err = new Error(verification.error || 'Invalid handover verification OTP provided by customer');
          err.statusCode = 400;
          throw err;
        }
      }

      const targetStatusKey = LIFECYCLE_STEPS[targetStep].key;

      // Update Booking state
      booking.currentStep = targetStep;
      booking.status = targetStatusKey;
      await booking.save({ transaction: t });

      // If Step 7 (PRODUCT_RETURNED): adjust warehouse inventory snapshot
      if (targetStep === 7) {
        for (const item of booking.items) {
          const inv = await Inventory.findOne({ where: { productId: item.productId }, transaction: t });
          if (inv) {
            await InventoryTransaction.create({
              productId: item.productId,
              deltaQuantity: item.quantity,
              previousStock: inv.totalStock,
              newStock: inv.totalStock,
              transactionType: 'RETURNED',
              reason: `Equipment returned for Booking ${booking.bookingNumber}`,
              performedBy: actor.id
            }, { transaction: t });
          }
        }
      }

      // Record Chronological Status History Entry
      await BookingStatusHistory.create({
        bookingId: booking.id,
        status: targetStatusKey,
        stepNumber: targetStep,
        title: LIFECYCLE_STEPS[targetStep].label,
        notes: data.notes || `Advanced to Step ${targetStep}: ${LIFECYCLE_STEPS[targetStep].label}`,
        performedBy: actor.id
      }, { transaction: t });

      if (!options.transaction) {
        await t.commit();
      }

      return await Booking.findByPk(booking.id, {
        include: [
          { model: BookingItem, as: 'items', include: [{ model: Product, as: 'product' }] },
          { model: BookingStatusHistory, as: 'statusHistory' }
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
   * Cancel Booking (Allowed during Steps 1..3 prior to handover)
   */
  static async cancelBooking(bookingId, actorId, reason, options = {}) {
    const t = options.transaction || await sequelize.transaction();

    try {
      const booking = await Booking.findByPk(bookingId, {
        include: [{ model: BookingItem, as: 'items' }],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!booking) {
        const err = new Error('Booking not found');
        err.statusCode = 404;
        throw err;
      }

      if (booking.currentStep > 3) {
        const err = new Error('Cannot cancel booking after equipment handover has occurred');
        err.statusCode = 400;
        throw err;
      }

      if (booking.status === 'CANCELLED') {
        const err = new Error('Booking is already cancelled');
        err.statusCode = 400;
        throw err;
      }

      booking.status = 'CANCELLED';
      await booking.save({ transaction: t });

      // Record Cancellation in History
      await BookingStatusHistory.create({
        bookingId: booking.id,
        status: 'CANCELLED',
        stepNumber: booking.currentStep,
        title: 'Booking Cancelled',
        notes: `Booking cancelled. Reason: ${reason}`,
        performedBy: actorId
      }, { transaction: t });

      // Record Inventory release transaction
      for (const item of booking.items) {
        const inv = await Inventory.findOne({ where: { productId: item.productId }, transaction: t });
        if (inv) {
          await InventoryTransaction.create({
            productId: item.productId,
            deltaQuantity: item.quantity,
            previousStock: inv.totalStock,
            newStock: inv.totalStock,
            transactionType: 'STOCK_RELEASED',
            reason: `Stock released upon cancellation of Booking ${booking.bookingNumber}`,
            performedBy: actorId
          }, { transaction: t });
        }
      }

      if (!options.transaction) {
        await t.commit();
      }

      return booking;

    } catch (error) {
      if (!options.transaction && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
  }
}

module.exports = BookingService;
