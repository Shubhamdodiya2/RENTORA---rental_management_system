/**
 * Master Payment Service for Rentora
 * Manual UPI Verification Workflow, Platform QR Management, Multi-Ledger Accounting & Razorpay-Ready Abstraction.
 */

const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const {
  sequelize,
  PaymentSubmission,
  Order,
  Booking,
  RentalPayment,
  EscrowDeposit,
  Commission,
  PlatformSetting,
  AuditLog,
  Notification,
  User,
  VendorProfile
} = require('../models');
const InvoiceService = require('./invoice.service');
const { ROLES } = require('../config/constants');
const { uploadToCloudinary } = require('../config/cloudinary');

class PaymentService {
  /**
   * Get Platform UPI & QR Configuration for Checkout
   */
  static async getPlatformUpiConfig() {
    const setting = await PlatformSetting.findOne({
      where: { settingKey: 'platform_upi_config' }
    });

    if (setting && setting.settingValue) {
      return setting.settingValue;
    }

    // Default configuration fallback
    return {
      upiId: 'rentora.platform@icici',
      payeeName: 'Rentora Marketplace Private Limited',
      qrCodeUrl: '/uploads/qr/rentora_default_qr.png',
      bankName: 'ICICI Bank',
      accountNumberMasked: '******9012',
      ifscCode: 'ICIC0001234',
      instructions: 'Please pay the exact total payable amount. After paying, submit the 12-digit bank UTR / Reference number and upload a payment screenshot.',
      isActive: true
    };
  }

  /**
   * Super Admin Updates Platform UPI & QR Configuration
   */
  static async updatePlatformUpiConfig(adminUser, payload, file, options = {}) {
    const { upiId, payeeName, bankName, accountNumberMasked, ifscCode, instructions, isActive } = payload;

    if (!upiId || !payeeName) {
      const err = new Error('UPI ID and Payee Name are required');
      err.statusCode = 400;
      throw err;
    }

    let currentConfig = await this.getPlatformUpiConfig();

    let qrCodeUrl = currentConfig.qrCodeUrl;
    if (file) {
      qrCodeUrl = `/uploads/qr/${file.filename}`;
      const cloudUpload = await uploadToCloudinary(file.path, 'rentora/qr');
      if (cloudUpload?.secure_url) {
        qrCodeUrl = cloudUpload.secure_url;
      }
    }

    const newConfig = {
      upiId: String(upiId).trim(),
      payeeName: String(payeeName).trim(),
      bankName: bankName ? String(bankName).trim() : currentConfig.bankName,
      accountNumberMasked: accountNumberMasked ? String(accountNumberMasked).trim() : currentConfig.accountNumberMasked,
      ifscCode: ifscCode ? String(ifscCode).trim() : currentConfig.ifscCode,
      instructions: instructions ? String(instructions).trim() : currentConfig.instructions,
      qrCodeUrl,
      isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true
    };

    const [setting] = await PlatformSetting.findOrCreate({
      where: { settingKey: 'platform_upi_config' },
      defaults: {
        settingGroup: 'general',
        settingKey: 'platform_upi_config',
        settingValue: newConfig,
        description: 'Platform UPI ID and QR Code payment configuration',
        updatedBy: adminUser.id
      }
    });

    setting.settingValue = newConfig;
    setting.updatedBy = adminUser.id;
    await setting.save();

    await AuditLog.create({
      adminId: adminUser.id,
      adminName: adminUser.fullName || 'Super Admin',
      action: 'PLATFORM_UPI_CONFIG_UPDATED',
      module: 'PAYMENTS',
      description: `Super Admin updated platform UPI configuration (UPI ID: ${newConfig.upiId})`,
      targetId: 'platform_upi_config',
      ipAddress: payload.ipAddress || '127.0.0.1',
      userAgent: payload.userAgent || 'Rentora Admin API'
    });

    return newConfig;
  }

  /**
   * Customer Submits Manual UPI Payment Proof and UTR
   */
  static async submitManualPaymentProof(customerId, payload, file) {
    const { bookingId, orderId, utrNumber, payerUpiId, payerName, customerNotes } = payload;

    if (!file) {
      const err = new Error('Payment proof file (screenshot or receipt PDF) is required');
      err.statusCode = 400;
      throw err;
    }

    // 1. Strict UTR Sanitization & Validation
    const cleanUtr = String(utrNumber || '').trim();
    if (!cleanUtr || !/^[A-Za-z0-9]{8,30}$/.test(cleanUtr)) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const err = new Error('Invalid UTR format. UTR / Transaction ID must be 8 to 30 alphanumeric characters with no spaces or special symbols.');
      err.statusCode = 400;
      throw err;
    }

    // 2. Locate linked Order & Booking
    const whereClause = {};
    if (orderId) whereClause.id = orderId;
    if (bookingId) whereClause.bookingId = bookingId;

    const order = await Order.findOne({
      where: whereClause,
      include: [{ model: Booking, as: 'booking' }]
    });

    if (!order) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const err = new Error('Order or Booking record not found for payment submission');
      err.statusCode = 404;
      throw err;
    }

    if (order.customerId !== customerId) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const err = new Error('Forbidden: You can only submit payments for your own orders');
      err.statusCode = 403;
      throw err;
    }

    if (order.paymentStatus === 'Success') {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const err = new Error('Payment for this order has already been verified and completed');
      err.statusCode = 400;
      throw err;
    }

    // 3. Duplicate UTR Prevention (Global uniqueness across all submissions)
    const existingUtr = await PaymentSubmission.findOne({
      where: { utrNumber: cleanUtr }
    });

    if (existingUtr) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const err = new Error('This UTR / Transaction ID has already been submitted on the platform. Please verify your reference number.');
      err.statusCode = 409;
      throw err;
    }

    // 4. Check for existing active submission for this order
    const activeSubmission = await PaymentSubmission.findOne({
      where: {
        orderId: order.id,
        verificationStatus: { [Op.in]: ['Pending', 'Under_Review', 'Verified'] }
      }
    });

    if (activeSubmission) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      const err = new Error(`Payment verification is already '${activeSubmission.verificationStatus}' for this order. Please wait for Super Admin review before submitting again.`);
      err.statusCode = 400;
      throw err;
    }

    // 5. Create PaymentSubmission Record
    let proofFileUrl = `/uploads/payment_proofs/${file.filename}`;
    const cloudUpload = await uploadToCloudinary(file.path, 'rentora/payment_proofs');
    if (cloudUpload?.secure_url) {
      proofFileUrl = cloudUpload.secure_url;
    }

    const submission = await PaymentSubmission.create({
      orderId: order.id,
      bookingId: order.bookingId,
      customerId,
      vendorId: order.vendorId,
      amount: order.totalAmount,
      paymentMethod: 'UPI_MANUAL',
      utrNumber: cleanUtr,
      payerUpiId: payerUpiId ? String(payerUpiId).trim() : null,
      payerName: payerName ? String(payerName).trim() : null,
      proofFileUrl,
      proofFileOriginalName: file.originalname,
      proofFileMimeType: file.mimetype,
      proofFileSize: file.size,
      verificationStatus: 'Pending',
      customerNotes: customerNotes ? String(customerNotes).trim() : null
    });

    // Notify Super Admins
    await Notification.create({
      recipientId: customerId,
      title: 'Payment Proof Submitted',
      message: `Your payment proof for Booking #${order.booking ? order.booking.bookingNumber : order.id} (UTR: ${cleanUtr}) has been submitted and is pending Super Admin verification.`,
      type: 'PAYMENT',
      metadata: { submissionId: submission.id, orderId: order.id, utrNumber: cleanUtr }
    });

    return submission;
  }

  /**
   * Super Admin Approves Payment -> Creates Ledgers Atomically
   */
  static async approveManualPayment(submissionId, adminUser, payload = {}) {
    const t = await sequelize.transaction();

    try {
      const submission = await PaymentSubmission.findByPk(submissionId, {
        include: [
          { model: Order, as: 'order' },
          { model: Booking, as: 'booking' }
        ],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!submission) {
        const err = new Error('Payment submission not found');
        err.statusCode = 404;
        throw err;
      }

      if (submission.verificationStatus === 'Verified') {
        const err = new Error('Payment submission is already verified');
        err.statusCode = 400;
        throw err;
      }

      const order = submission.order;
      const booking = submission.booking;

      if (!order || !booking) {
        const err = new Error('Associated Order or Booking record missing');
        err.statusCode = 400;
        throw err;
      }

      // 1. Calculate Multi-Ledger Amounts with Strict Pure Rental Commission
      const pureRentalAmount = Number(booking.rentalAmount); // Pure rental subtotal
      const deliveryFee = Number(booking.deliveryFee);
      const insuranceAmount = Number(booking.insuranceAmount);
      const taxAmount = Number(booking.taxAmount);
      const depositAmount = Number(booking.depositAmount);

      // Rental Payment Ledger = Pure Rental + Delivery + Insurance + 18% GST
      const rentalPaymentAmount = Number((pureRentalAmount + deliveryFee + insuranceAmount + taxAmount).toFixed(2));

      // Commission calculated strictly on Pure Rental (0% on GST, 0% on deposit)
      const commissionRate = 10.00;
      const commissionAmount = Number(((pureRentalAmount * commissionRate) / 100).toFixed(2));
      const vendorEarnings = Number((pureRentalAmount - commissionAmount).toFixed(2));

      // 2. Update PaymentSubmission
      submission.verificationStatus = 'Verified';
      submission.verifiedByAdminId = adminUser.id;
      submission.verifiedAt = new Date();
      if (payload.adminNotes) submission.adminNotes = String(payload.adminNotes).trim();
      await submission.save({ transaction: t });

      // 3. Update Order status
      order.paymentStatus = 'Success';
      order.orderStatus = 'Confirmed';
      await order.save({ transaction: t });

      // 4. Booking.status strictly remains at Step 1 (BOOKING_CONFIRMED)
      // We append admin verification info to booking rentalNotes
      let notesObj = {};
      try { notesObj = JSON.parse(booking.rentalNotes || '{}'); } catch (e) {}
      notesObj.paymentVerification = {
        verifiedAt: new Date().toISOString(),
        verifiedByAdminId: adminUser.id,
        utrNumber: submission.utrNumber,
        totalPaid: submission.amount
      };
      booking.rentalNotes = JSON.stringify(notesObj);
      await booking.save({ transaction: t });

      // 5. Create RentalPayment Ledger Record
      const rentalPayment = await RentalPayment.create({
        transactionId: `UTR-${submission.utrNumber}`,
        orderId: order.id,
        bookingId: booking.id,
        customerId: submission.customerId,
        vendorId: submission.vendorId,
        amount: rentalPaymentAmount,
        currency: 'INR',
        paymentMethod: 'UPI',
        paymentStatus: 'Success',
        gatewayResponse: {
          utrNumber: submission.utrNumber,
          verifiedByAdmin: adminUser.fullName || adminUser.email,
          payerUpiId: submission.payerUpiId,
          payerName: submission.payerName
        },
        paidAt: new Date()
      }, { transaction: t });

      // 6. Create EscrowDeposit Ledger Record (0% GST, status: Held)
      const escrowDeposit = await EscrowDeposit.create({
        orderId: order.id,
        bookingId: booking.id,
        customerId: submission.customerId,
        vendorId: submission.vendorId,
        depositAmount: depositAmount,
        penaltyDeductions: 0.00,
        refundedAmount: 0.00,
        status: 'Held'
      }, { transaction: t });

      // 7. Create Commission Ledger Record
      const commission = await Commission.create({
        orderId: order.id,
        vendorId: submission.vendorId,
        grossAmount: pureRentalAmount,
        commissionRate,
        commissionAmount,
        vendorEarnings,
        payoutStatus: 'Pending'
      }, { transaction: t });

      // 8. Create Permanent AuditLog
      await AuditLog.create({
        adminId: adminUser.id,
        adminName: adminUser.fullName || 'Super Admin',
        action: 'PAYMENT_APPROVED',
        module: 'PAYMENTS',
        description: `Approved manual UPI payment for Order ${order.orderNumber} (UTR: ${submission.utrNumber}, Total: ₹${submission.amount}, RentalPayment: ₹${rentalPaymentAmount}, Escrow: ₹${depositAmount}, Commission: ₹${commissionAmount})`,
        targetId: submission.id,
        ipAddress: payload.ipAddress || '127.0.0.1',
        userAgent: payload.userAgent || 'Rentora Admin Portal'
      }, { transaction: t });

      // 9. Send Notifications
      await Notification.create({
        recipientId: submission.customerId,
        title: 'Payment Verified & Confirmed',
        message: `Your payment of ₹${submission.amount} for Booking #${booking.bookingNumber} has been verified by Rentora Admin. The vendor will prepare your equipment.`,
        type: 'PAYMENT',
        metadata: { bookingId: booking.id, orderId: order.id, utrNumber: submission.utrNumber }
      }, { transaction: t });

      const vendorProf = await VendorProfile.findByPk(submission.vendorId, { transaction: t });
      if (vendorProf && vendorProf.userId) {
        await Notification.create({
          recipientId: vendorProf.userId,
          title: 'New Paid Rental Order',
          message: `Payment of ₹${submission.amount} verified for Booking #${booking.bookingNumber}. Please review and prepare the equipment.`,
          type: 'BOOKING',
          metadata: { bookingId: booking.id, orderId: order.id }
        }, { transaction: t });
      }

      // 8.5 Synchronize Invoice to PAID & Verified status
      await InvoiceService.syncInvoicePaymentStatus(
        booking.id,
        'Success',
        submission.utrNumber,
        adminUser,
        { transaction: t }
      );

      await t.commit();

      return {
        submission,
        order,
        rentalPayment,
        escrowDeposit,
        commission
      };

    } catch (error) {
      if (!t.finished) await t.rollback();
      throw error;
    }
  }

  /**
   * Super Admin Rejects Payment with Mandatory Reason
   */
  static async rejectManualPayment(submissionId, adminUser, payload = {}) {
    const { rejectionReason, adminNotes } = payload;

    const reason = String(rejectionReason || '').trim();
    if (!reason || reason.length < 10) {
      const err = new Error('Rejection reason is mandatory and must be at least 10 characters long explaining the reason (e.g. UTR mismatch, payment not received in bank statement)');
      err.statusCode = 400;
      throw err;
    }

    const t = await sequelize.transaction();

    try {
      const submission = await PaymentSubmission.findByPk(submissionId, {
        include: [
          { model: Order, as: 'order' },
          { model: Booking, as: 'booking' }
        ],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!submission) {
        const err = new Error('Payment submission not found');
        err.statusCode = 404;
        throw err;
      }

      if (submission.verificationStatus === 'Verified') {
        const err = new Error('Cannot reject an already verified payment');
        err.statusCode = 400;
        throw err;
      }

      const order = submission.order;
      const booking = submission.booking;

      // 1. Update submission
      submission.verificationStatus = 'Rejected';
      submission.verifiedByAdminId = adminUser.id;
      submission.verifiedAt = new Date();
      submission.rejectionReason = reason;
      if (adminNotes) submission.adminNotes = String(adminNotes).trim();
      await submission.save({ transaction: t });

      // 2. Update order payment status
      if (order) {
        order.paymentStatus = 'Failed';
        await order.save({ transaction: t });
      }

      // 3. Create AuditLog
      await AuditLog.create({
        adminId: adminUser.id,
        adminName: adminUser.fullName || 'Super Admin',
        action: 'PAYMENT_REJECTED',
        module: 'PAYMENTS',
        description: `Rejected manual UPI payment for Order ${order ? order.orderNumber : submission.orderId} (UTR: ${submission.utrNumber}). Reason: ${reason}`,
        targetId: submission.id,
        ipAddress: payload.ipAddress || '127.0.0.1',
        userAgent: payload.userAgent || 'Rentora Admin Portal'
      }, { transaction: t });

      // 4. Notify Customer with Rejection Reason
      await Notification.create({
        recipientId: submission.customerId,
        title: 'Payment Verification Rejected',
        message: `Your payment proof for Booking #${booking ? booking.bookingNumber : submission.bookingId} was rejected by Admin. Reason: "${reason}". Please submit a valid payment proof and UTR.`,
        type: 'PAYMENT',
        metadata: { submissionId: submission.id, bookingId: submission.bookingId, rejectionReason: reason }
      }, { transaction: t });

      // 5. Synchronize Invoice status to Failed
      if (submission.bookingId) {
        await InvoiceService.syncInvoicePaymentStatus(
          submission.bookingId,
          'Failed',
          submission.utrNumber,
          adminUser,
          { transaction: t }
        );
      }

      await t.commit();
      return submission;

    } catch (error) {
      if (!t.finished) await t.rollback();
      throw error;
    }
  }

  /**
   * Customer Retrieves Their Payment Submissions
   */
  static async getMySubmissions(customerId, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = { customerId };
    if (status) where.verificationStatus = status;

    const { rows, count } = await PaymentSubmission.findAndCountAll({
      where,
      include: [
        { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'totalAmount', 'paymentStatus'] },
        { model: Booking, as: 'booking', attributes: ['id', 'bookingNumber', 'startDate', 'endDate', 'status'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    return {
      submissions: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    };
  }

  /**
   * Get Payment Verification Details for a Specific Booking
   */
  static async getPaymentDetailsForBooking(bookingId, userOrActorId, actorRoles = []) {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Order, as: 'order' },
        { model: PaymentSubmission, as: 'paymentSubmissions' }
      ]
    });

    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    let isAdmin = false;
    let isCustomer = false;
    let isVendor = false;

    if (typeof userOrActorId === 'object' && userOrActorId !== null) {
      const user = userOrActorId;
      const roles = (user.roles || []).map(r => typeof r === 'string' ? r : r.name);
      isAdmin = roles.includes(ROLES.SUPER_ADMIN);
      isCustomer = booking.customerId === user.id;
      isVendor = (user.vendorProfile && user.vendorProfile.id === booking.vendorId) ||
                 (user.vendorProfile && user.vendorProfile.userId === user.id);
    } else {
      const actorId = userOrActorId;
      isAdmin = actorRoles.includes(ROLES.SUPER_ADMIN);
      isCustomer = booking.customerId === actorId;
      const vendorProf = await VendorProfile.findOne({ where: { userId: actorId } });
      isVendor = booking.vendorId === actorId || (vendorProf && vendorProf.id === booking.vendorId);
    }

    if (!isAdmin && !isCustomer && !isVendor) {
      const err = new Error('Forbidden: Access to payment details denied');
      err.statusCode = 403;
      throw err;
    }

    const order = await Order.findOne({ where: { bookingId } });
    const submissions = await PaymentSubmission.findAll({
      where: { bookingId },
      order: [['createdAt', 'DESC']]
    });

    const rentalPayment = order ? await RentalPayment.findOne({ where: { orderId: order.id } }) : null;
    const escrowDeposit = order ? await EscrowDeposit.findOne({ where: { orderId: order.id } }) : null;

    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      order: order ? {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      } : null,
      submissions,
      latestSubmission: submissions.length > 0 ? submissions[0] : null,
      rentalPayment,
      escrowDeposit
    };
  }

  /**
   * Super Admin Lists All Submissions with Filters
   */
  static async listSubmissionsForAdmin(query = {}) {
    const { page = 1, limit = 20, status, search, startDate, endDate } = query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status) where.verificationStatus = status;

    if (search) {
      where[Op.or] = [
        { utrNumber: { [Op.like]: `%${search}%` } },
        { payerName: { [Op.like]: `%${search}%` } },
        { payerUpiId: { [Op.like]: `%${search}%` } }
      ];
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(`${startDate}T00:00:00Z`), new Date(`${endDate}T23:59:59Z`)]
      };
    }

    const { rows, count } = await PaymentSubmission.findAndCountAll({
      where,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] },
        { model: VendorProfile, as: 'vendor', attributes: ['id', 'businessName', 'businessEmail'] },
        { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'totalAmount', 'paymentStatus'] },
        { model: Booking, as: 'booking', attributes: ['id', 'bookingNumber', 'startDate', 'endDate', 'status', 'rentalAmount', 'depositAmount', 'taxAmount'] },
        { model: User, as: 'verifier', attributes: ['id', 'fullName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    return {
      submissions: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    };
  }

  /**
   * Get Submission by ID for Admin Review
   */
  static async getSubmissionById(submissionId) {
    const submission = await PaymentSubmission.findByPk(submissionId, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] },
        { model: VendorProfile, as: 'vendor', attributes: ['id', 'businessName', 'businessEmail', 'businessPhone'] },
        { model: Order, as: 'order' },
        { model: Booking, as: 'booking' },
        { model: User, as: 'verifier', attributes: ['id', 'fullName', 'email'] }
      ]
    });

    if (!submission) {
      const err = new Error('Payment submission not found');
      err.statusCode = 404;
      throw err;
    }

    return submission;
  }

  /**
   * Secure Proof File Streaming with RBAC Access Control
   */
  static async getProofFilePath(submissionId, user) {
    const submission = await PaymentSubmission.findByPk(submissionId, {
      include: [{ model: VendorProfile, as: 'vendor' }]
    });

    if (!submission) {
      const err = new Error('Payment submission not found');
      err.statusCode = 404;
      throw err;
    }

    const userRoles = (user.roles || []).map(r => typeof r === 'string' ? r : r.name);
    const isAdmin = userRoles.includes(ROLES.SUPER_ADMIN);
    const isOwnerCustomer = submission.customerId === user.id;
    const isStoreVendor = submission.vendor && submission.vendor.userId === user.id;

    if (!isAdmin && !isOwnerCustomer && !isStoreVendor) {
      const err = new Error('Forbidden: You do not have permission to view this payment proof');
      err.statusCode = 403;
      throw err;
    }

    if (submission.proofFileUrl && submission.proofFileUrl.startsWith('http')) {
      return {
        isRemote: true,
        url: submission.proofFileUrl,
        mimeType: submission.proofFileMimeType,
        originalName: submission.proofFileOriginalName
      };
    }

    const relativePath = submission.proofFileUrl.replace(/^\//, '');
    const absolutePath = path.resolve(__dirname, '../../', relativePath);

    if (!fs.existsSync(absolutePath)) {
      const err = new Error('Proof file not found on server storage');
      err.statusCode = 404;
      throw err;
    }

    return {
      absolutePath,
      mimeType: submission.proofFileMimeType,
      originalName: submission.proofFileOriginalName
    };
  }

  /**
   * Customer Completes Direct/UPI Payment for a Booking/Order
   */
  static async payBooking(customerId, payload) {
    const { bookingId, paymentMethod = 'UPI', utrNumber, amountPaid, payerUpiId } = payload;

    if (!bookingId) {
      const err = new Error('Booking ID is required');
      err.statusCode = 400;
      throw err;
    }

    const t = await sequelize.transaction();

    try {
      const booking = await Booking.findOne({
        where: { id: bookingId, customerId },
        include: [
          { model: Order, as: 'order' },
          { model: VendorProfile, as: 'vendor' }
        ],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!booking) {
        const err = new Error('Rental booking not found or does not belong to your account');
        err.statusCode = 404;
        throw err;
      }

      let order = booking.order;
      if (!order) {
        order = await Order.findOne({ where: { bookingId: booking.id }, transaction: t, lock: t.LOCK.UPDATE });
      }

      if (!order) {
        order = await Order.create({
          orderNumber: `ORD-${booking.bookingNumber.replace('BKG-', '')}`,
          customerId,
          vendorId: booking.vendorId,
          bookingId: booking.id,
          subtotal: Number(booking.rentalAmount),
          taxAmount: Number(booking.taxAmount),
          deliveryFee: Number(booking.deliveryFee || 0),
          depositAmount: Number(booking.depositAmount || 0),
          totalAmount: Number(booking.totalAmount),
          orderStatus: 'Confirmed',
          paymentStatus: 'Success'
        }, { transaction: t });
      } else {
        order.paymentStatus = 'Success';
        order.orderStatus = 'Confirmed';
        await order.save({ transaction: t });
      }

      // Update Booking metadata
      let notesObj = {};
      try { notesObj = JSON.parse(booking.rentalNotes || '{}'); } catch (e) {}
      notesObj.payment = {
        paidAt: new Date().toISOString(),
        method: paymentMethod,
        utrNumber: utrNumber || `UTR${Date.now()}`,
        amount: amountPaid || order.totalAmount
      };
      booking.rentalNotes = JSON.stringify(notesObj);
      await booking.save({ transaction: t });

      // Create RentalPayment ledger
      const safeTxnId = utrNumber ? `UTR-${utrNumber}` : `TXN-${booking.bookingNumber}-${Date.now()}`;
      const rentalPaymentAmount = Number((Number(booking.rentalAmount) + Number(booking.taxAmount || 0) + Number(booking.deliveryFee || 0)).toFixed(2));

      await RentalPayment.create({
        transactionId: safeTxnId,
        orderId: order.id,
        bookingId: booking.id,
        customerId,
        vendorId: booking.vendorId,
        amount: rentalPaymentAmount,
        currency: 'INR',
        paymentMethod: ['UPI', 'Card', 'NetBanking', 'Wallet'].includes(paymentMethod) ? paymentMethod : 'UPI',
        paymentStatus: 'Success',
        gatewayResponse: {
          utrNumber: utrNumber || null,
          payerUpiId: payerUpiId || null
        },
        paidAt: new Date()
      }, { transaction: t });

      // Create EscrowDeposit if applicable
      if (Number(booking.depositAmount) > 0) {
        const existingEscrow = await EscrowDeposit.findOne({ where: { orderId: order.id }, transaction: t });
        if (!existingEscrow) {
          await EscrowDeposit.create({
            orderId: order.id,
            bookingId: booking.id,
            customerId,
            vendorId: booking.vendorId,
            depositAmount: Number(booking.depositAmount),
            penaltyDeductions: 0.00,
            refundedAmount: 0.00,
            status: 'Held'
          }, { transaction: t });
        }
      }

      // Sync Invoice to PAID
      await InvoiceService.syncInvoicePaymentStatus(
        booking.id,
        'Success',
        utrNumber || 'UPI_DIRECT',
        { id: customerId, fullName: 'Customer Online Payment' },
        { transaction: t }
      ).catch((e) => console.warn('Invoice sync notice:', e.message));

      // Notifications
      await Notification.create({
        recipientId: customerId,
        title: 'Payment Successful!',
        message: `Your payment of ₹${order.totalAmount} for Booking #${booking.bookingNumber} was confirmed. Your rental reservation is officially confirmed.`,
        type: 'PAYMENT',
        metadata: { bookingId: booking.id, orderId: order.id }
      }, { transaction: t }).catch(() => {});

      if (booking.vendor && booking.vendor.userId) {
        await Notification.create({
          recipientId: booking.vendor.userId,
          title: 'Customer Payment Received!',
          message: `Payment of ₹${order.totalAmount} received for Booking #${booking.bookingNumber}. Please prepare the equipment for dispatch.`,
          type: 'BOOKING',
          metadata: { bookingId: booking.id, orderId: order.id }
        }, { transaction: t }).catch(() => {});
      }

      await t.commit();

      return {
        booking,
        order
      };

    } catch (error) {
      if (!t.finished) await t.rollback();
      throw error;
    }
  }
}

module.exports = PaymentService;
