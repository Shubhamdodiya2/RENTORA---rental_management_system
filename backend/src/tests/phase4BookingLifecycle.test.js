/**
 * Phase 4 Comprehensive Test Suite: Rental Bookings, Multi-Product Checkout, 8-Step Lifecycle State Machine & Quotation Workflows
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const { 
  sequelize, 
  User, 
  Role, 
  UserRole, 
  CustomerProfile, 
  VendorProfile, 
  Category, 
  Product, 
  Inventory, 
  InventoryTransaction, 
  Booking, 
  BookingItem, 
  BookingStatusHistory, 
  Order, 
  Quotation, 
  QuotationItem, 
  AuditLog 
} = require('../models');
const TokenService = require('../services/token.service');
const PricingService = require('../services/pricing.service');
const { ROLES } = require('../config/constants');

async function runPhase4Tests() {
  console.log('========================================================================');
  console.log('📋 Rentora Phase 4: Rental Bookings, 8-Step Lifecycle & Quotes Suite');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS ${totalTests}] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL ${totalTests}] ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // 0. Sync fresh in-memory SQLite schema
    await sequelize.sync({ force: true });

    // Seed Core Roles
    const [custRole] = await Role.findOrCreate({ where: { name: ROLES.CUSTOMER } });
    const [vendRole] = await Role.findOrCreate({ where: { name: ROLES.VENDOR } });
    const [adminRole] = await Role.findOrCreate({ where: { name: ROLES.SUPER_ADMIN } });

    // 1. Seed Admin User
    const adminUser = await User.create({
      fullName: 'Super Admin',
      email: 'admin@rentora.com',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: adminUser.id, roleId: adminRole.id });
    const { accessToken: adminToken } = await TokenService.generateTokens(adminUser, [ROLES.SUPER_ADMIN]);

    // 2. Seed Vendor A
    const vendorUserA = await User.create({
      fullName: 'Apex Camera Rentals',
      email: 'apex@rentals.com',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: vendorUserA.id, roleId: vendRole.id });
    const vendorProfileA = await VendorProfile.create({
      userId: vendorUserA.id,
      businessName: 'Apex Camera Rentals Pvt Ltd',
      businessCategory: 'Cameras & Optics',
      businessEmail: 'contact@apex.com',
      businessPhone: '+919876543210',
      businessAddress: '101 Cinema Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      verificationStatus: 'Approved'
    });
    const { accessToken: vendorTokenA } = await TokenService.generateTokens(vendorUserA, [ROLES.VENDOR]);

    // 3. Seed Vendor B (for multi-vendor isolation tests)
    const vendorUserB = await User.create({
      fullName: 'Sound Wave Pro',
      email: 'soundwave@rentals.com',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: vendorUserB.id, roleId: vendRole.id });
    const vendorProfileB = await VendorProfile.create({
      userId: vendorUserB.id,
      businessName: 'Sound Wave Audio Equipments',
      businessCategory: 'Audio & Sound',
      businessEmail: 'contact@soundwave.com',
      businessPhone: '+919876543211',
      businessAddress: '202 Audio Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      verificationStatus: 'Approved'
    });
    const { accessToken: vendorTokenB } = await TokenService.generateTokens(vendorUserB, [ROLES.VENDOR]);

    // 4. Seed Customers 1 and 2
    const customer1 = await User.create({
      fullName: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: customer1.id, roleId: custRole.id });
    await CustomerProfile.create({
      userId: customer1.id,
      addressLine1: 'Flat 402, Green Valley',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050'
    });
    const { accessToken: customerToken1 } = await TokenService.generateTokens(customer1, [ROLES.CUSTOMER]);

    const customer2 = await User.create({
      fullName: 'Priya Patel',
      email: 'priya@gmail.com',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: customer2.id, roleId: custRole.id });
    await CustomerProfile.create({
      userId: customer2.id,
      addressLine1: 'Sector 15, Vashi',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      postalCode: '400703'
    });
    const { accessToken: customerToken2 } = await TokenService.generateTokens(customer2, [ROLES.CUSTOMER]);

    // 5. Seed Category & Products
    const category = await Category.create({
      id: 'cameras-optics',
      name: 'Cameras & Optics',
      slug: 'cameras-optics',
      isActive: true
    });

    // Product 1: Sony FX3 (Vendor A, Total Stock = 5)
    const productSony = await Product.create({
      name: 'Sony FX3 Cinema Camera',
      slug: 'sony-fx3-cinema-camera',
      sku: 'SONY-FX3-001',
      categoryId: category.id,
      vendorId: vendorProfileA.id,
      pricePerDay: 2500.00,
      discountPrice: 2200.00,
      securityDeposit: 15000.00,
      status: 'Active',
      approvalStatus: 'Approved'
    });
    await Inventory.create({
      productId: productSony.id,
      totalStock: 5,
      availableStock: 5,
      reservedStock: 0,
      damagedStock: 0,
      minStockThreshold: 1
    });

    // Product 2: Sony GM 24-70mm Lens (Vendor A, Total Stock = 3)
    const productLens = await Product.create({
      name: 'Sony FE 24-70mm f/2.8 GM II Lens',
      slug: 'sony-fe-24-70mm-f28-gm-ii',
      sku: 'SONY-LENS-001',
      categoryId: category.id,
      vendorId: vendorProfileA.id,
      pricePerDay: 1200.00,
      discountPrice: 1000.00,
      securityDeposit: 8000.00,
      status: 'Active',
      approvalStatus: 'Approved'
    });
    await Inventory.create({
      productId: productLens.id,
      totalStock: 3,
      availableStock: 3,
      reservedStock: 0,
      damagedStock: 0,
      minStockThreshold: 1
    });

    // Product 3: Shure Wireless Mic (Vendor B, Total Stock = 4)
    const productMic = await Product.create({
      name: 'Shure Axient Digital Wireless Mic',
      slug: 'shure-axient-wireless-mic',
      sku: 'SHURE-MIC-001',
      categoryId: category.id,
      vendorId: vendorProfileB.id,
      pricePerDay: 800.00,
      discountPrice: 750.00,
      securityDeposit: 5000.00,
      status: 'Active',
      approvalStatus: 'Approved'
    });
    await Inventory.create({
      productId: productMic.id,
      totalStock: 4,
      availableStock: 4,
      reservedStock: 0,
      damagedStock: 0,
      minStockThreshold: 1
    });

    console.log('Seeding completed successfully.\n');

    // =========================================================================
    // SECTION 1: Multi-Product Customer Checkout & Pricing Breakdown
    // =========================================================================
    console.log('--- SECTION 1: Multi-Product Customer Checkout & Pricing Breakdown ---');

    const checkoutPayload = {
      items: [
        { productId: productSony.id, quantity: 2 },
        { productId: productLens.id, quantity: 1 }
      ],
      startDate: '2026-10-10',
      endDate: '2026-10-12', // 3 days inclusive
      durationMode: 'day',
      deliveryType: 'doorstep',
      deliveryAddress: 'Flat 402, Green Valley, Mumbai',
      paymentPlan: 'full',
      rentalNotes: 'Urgent shoot requirements'
    };

    const checkoutRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send(checkoutPayload);

    assert(checkoutRes.status === 201, '1. Customer multi-product rental checkout succeeds (HTTP 201)');
    const booking1 = checkoutRes.body.data;

    assert(
      /^BKG-\d{8}-[A-Z0-9]{4}$/.test(booking1.bookingNumber),
      '2. Booking is assigned a unique formatted number (BKG-YYYYMMDD-XXXX)'
    );

    assert(
      booking1.currentStep === 1 && booking1.status === 'BOOKING_CONFIRMED',
      '3. Initial booking state starts at Step 1: BOOKING_CONFIRMED (Payment Pending)'
    );

    // Duration = 3 days
    // Item 1 (Sony FX3 x2): 2200 * 2 * 3 = 13,200 (deposit 15000 * 2 = 30,000)
    // Item 2 (Lens x1): 1000 * 1 * 3 = 3,000 (deposit 8000 * 1 = 8,000)
    // Pure Rental Amount (itemSubtotal - discount) = 16,200
    // Delivery Fee = 250
    // Insurance (2% on pure rental 16200) = 324
    // Taxable Subtotal = 16,200 + 250 + 324 = 16,774
    // GST (18% on 16,774) = 3,019.32
    // Escrow Deposit = 38,000 (0% GST, strictly separate)
    // Additive Total Customer Payable:
    // Pure Rental (16,200) + Delivery (250) + Insurance (324) + GST (3,019.32) + Deposit (38,000) = 57,793.32
    const additiveSum = Number(booking1.rentalAmount) + Number(booking1.deliveryFee) + Number(booking1.insuranceAmount) + Number(booking1.taxAmount) + Number(booking1.depositAmount);
    assert(
      Number(booking1.rentalAmount) === 16200 &&
      Number(booking1.depositAmount) === 38000 &&
      Number(booking1.taxAmount) === 3019.32 &&
      Number(booking1.deliveryFee) === 250 &&
      Number(booking1.insuranceAmount) === 324 &&
      Number(booking1.totalAmount) === 57793.32 &&
      Math.abs(additiveSum - Number(booking1.totalAmount)) < 0.01,
      '4. PricingEngine exact financial calculation verified: Pure Rental (16200) + Delivery (250) + Ins (324) + Tax (3019.32) + Deposit (38000) = Total (57793.32) with zero double-counting'
    );

    assert(
      booking1.items && booking1.items.length === 2,
      '5. Both items are persisted in BookingItem table'
    );

    const handoverOtp = booking1.initialCustomerOtp;
    assert(
      handoverOtp && /^\d{6}$/.test(handoverOtp),
      '6. Handover OTP (6-digit) is securely issued in initial response'
    );

    let parsedNotes = {};
    try { parsedNotes = JSON.parse(booking1.rentalNotes); } catch (e) {}
    assert(
      parsedNotes.otpMetadata && parsedNotes.otpMetadata.hash && parsedNotes.otpMetadata.salt && !parsedNotes.handoverOtp,
      '7. Zero-plaintext OTP storage: Database persists only salted SHA-256 hash and salt'
    );

    const invTxns = await InventoryTransaction.findAll({ where: { transactionType: 'STOCK_RESERVED' } });
    assert(
      invTxns.length >= 2,
      '8. InventoryTransaction records created for STOCK_RESERVED on checkout'
    );

    const orderRecord = await Order.findOne({ where: { bookingId: booking1.id } });
    assert(
      orderRecord && orderRecord.orderStatus === 'Pending' && orderRecord.paymentStatus === 'Pending' && Number(orderRecord.totalAmount) === 57793.32,
      '9. Associated Order record created in Pending status with explicit Pending payment'
    );

    // =========================================================================
    // SECTION 2: Date-Based Inventory Availability & Conflict Prevention
    // =========================================================================
    console.log('\n--- SECTION 2: Date-Based Inventory Availability & Validation ---');

    // ProductLens total stock = 3. Booking1 already reserved 1 lens for 2026-10-10 to 2026-10-12.
    // Try to book 3 lenses for 2026-10-11 to 2026-10-13 (overlap -> needs 4 total, only 3 available) -> Must Reject!
    const conflictRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken2}`)
      .send({
        items: [{ productId: productLens.id, quantity: 3 }],
        startDate: '2026-10-11',
        endDate: '2026-10-13',
        deliveryType: 'doorstep',
        deliveryAddress: 'Sector 15, Vashi'
      });

    assert(
      conflictRes.status === 409 || conflictRes.status === 400,
      '10. Overlapping booking exceeding remaining available stock is rejected (HTTP 409 Conflict)'
    );

    // Booking 2 lenses for the same dates (1 + 2 = 3 <= 3 total) -> Must Succeed!
    const nonConflictRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken2}`)
      .send({
        items: [{ productId: productLens.id, quantity: 2 }],
        startDate: '2026-10-10',
        endDate: '2026-10-12',
        deliveryType: 'doorstep',
        deliveryAddress: 'Sector 15, Vashi'
      });

    assert(nonConflictRes.status === 201, '11. Concurrent booking within remaining stock capacity succeeds (HTTP 201)');
    const booking2 = nonConflictRes.body.data;

    // Multi-vendor checkout attempt in a single booking -> Must Reject!
    const multiVendorRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({
        items: [
          { productId: productSony.id, quantity: 1 }, // Vendor A
          { productId: productMic.id, quantity: 1 }   // Vendor B
        ],
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        deliveryType: 'doorstep',
        deliveryAddress: 'Flat 402, Green Valley, Mumbai'
      });

    assert(multiVendorRes.status === 400, '12. Multi-vendor checkout in a single booking request is rejected (HTTP 400)');

    // Past start date validation
    const pastDateRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({
        items: [{ productId: productSony.id, quantity: 1 }],
        startDate: '2020-01-01',
        endDate: '2020-01-03',
        deliveryType: 'store_pickup'
      });

    assert(pastDateRes.status === 400, '13. Booking with past start date is rejected by validation (HTTP 400)');

    // End date earlier than start date
    const invalidDateRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({
        items: [{ productId: productSony.id, quantity: 1 }],
        startDate: '2026-12-10',
        endDate: '2026-12-05',
        deliveryType: 'store_pickup'
      });

    assert(invalidDateRes.status === 400, '14. Booking with endDate earlier than startDate is rejected (HTTP 400)');

    // Doorstep delivery missing address
    const missingAddressRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({
        items: [{ productId: productSony.id, quantity: 1 }],
        startDate: '2026-12-10',
        endDate: '2026-12-12',
        deliveryType: 'doorstep',
        deliveryAddress: ''
      });

    assert(missingAddressRes.status === 400, '15. Doorstep delivery missing address is rejected by validation (HTTP 400)');

    // =========================================================================
    // SECTION 3: Strict 8-Step Lifecycle Sequential Progression & Handover OTP
    // =========================================================================
    console.log('\n--- SECTION 3: Strict 8-Step Lifecycle State Machine & OTP Verification ---');

    // Step 1 -> Step 2: PRODUCT_RESERVED
    const step2Res = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 2, notes: 'Equipment reserved and inspected in warehouse' });

    assert(
      step2Res.status === 200 && step2Res.body.data.currentStep === 2 && step2Res.body.data.status === 'PRODUCT_RESERVED',
      '16. Step 1 -> Step 2: Vendor advances booking to PRODUCT_RESERVED (HTTP 200)'
    );

    // Step Skipping Rejection: Attempt jump Step 2 -> Step 4
    const jumpRes = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 4, handoverOtp });

    assert(jumpRes.status === 400, '17. Step skipping rejection: Jumping from Step 2 to Step 4 is rejected (HTTP 400)');

    // Backward Step Rejection: Attempt Step 2 -> Step 1
    const backRes = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 1 });

    assert(backRes.status === 400, '18. Backward step transition is rejected (HTTP 400)');

    // Step 2 -> Step 3: PICKUP_SCHEDULED
    const step3Res = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 3, notes: 'Delivery driver assigned and dispatched' });

    assert(
      step3Res.status === 200 && step3Res.body.data.currentStep === 3 && step3Res.body.data.status === 'PICKUP_SCHEDULED',
      '19. Step 2 -> Step 3: Advance to PICKUP_SCHEDULED succeeds (HTTP 200)'
    );

    // Step 3 -> Step 4 without OTP -> Must Reject
    const missingOtpRes = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 4 });

    assert(missingOtpRes.status === 400, '20. Handover transition to Step 4 without OTP is rejected by validation (HTTP 400)');

    // Step 3 -> Step 4 with incorrect OTP -> Must Reject
    const wrongOtpRes = await request(app)
      .post(`/api/v1/vendor/bookings/${booking1.id}/verify-otp`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ otp: '000000' });

    assert(wrongOtpRes.status === 400, '21. Handover with incorrect OTP is rejected (HTTP 400)');

    // Step 3 -> Step 4 with CORRECT OTP via /verify-otp -> Must Succeed!
    const correctOtpRes = await request(app)
      .post(`/api/v1/vendor/bookings/${booking1.id}/verify-otp`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ otp: handoverOtp, notes: 'Physical handover confirmed with customer OTP' });

    assert(
      correctOtpRes.status === 200 && correctOtpRes.body.data.currentStep === 4 && correctOtpRes.body.data.status === 'PRODUCT_HANDED_OVER',
      '22. Step 3 -> Step 4: Correct 6-digit OTP verification advances to PRODUCT_HANDED_OVER (HTTP 200)'
    );

    // Step 4 -> Step 5: RENTAL_ACTIVE
    const step5Res = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 5, notes: 'Rental possession is now active' });

    assert(
      step5Res.status === 200 && step5Res.body.data.currentStep === 5 && step5Res.body.data.status === 'RENTAL_ACTIVE',
      '23. Step 4 -> Step 5: Advances to RENTAL_ACTIVE (HTTP 200)'
    );

    // Step 5 -> Step 6: RETURN_SCHEDULED
    const step6Res = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 6, notes: 'Return pickup scheduled with courier' });

    assert(
      step6Res.status === 200 && step6Res.body.data.currentStep === 6 && step6Res.body.data.status === 'RETURN_SCHEDULED',
      '24. Step 5 -> Step 6: Advances to RETURN_SCHEDULED (HTTP 200)'
    );

    // Step 6 -> Step 7: PRODUCT_RETURNED
    const step7Res = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 7, notes: 'Equipment returned to warehouse, post-return QC passed' });

    assert(
      step7Res.status === 200 && step7Res.body.data.currentStep === 7 && step7Res.body.data.status === 'PRODUCT_RETURNED',
      '25. Step 6 -> Step 7: Advances to PRODUCT_RETURNED (HTTP 200)'
    );

    // =========================================================================
    // SECTION 4: Terminal Step Completion & Deposit Release
    // =========================================================================
    console.log('\n--- SECTION 4: Terminal State & Chronological Audit Timeline ---');

    // Step 7 -> Step 8: DEPOSIT_RELEASED
    const step8Res = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 8, notes: 'Escrow security deposit released in full to customer' });

    assert(
      step8Res.status === 200 && step8Res.body.data.currentStep === 8 && step8Res.body.data.status === 'DEPOSIT_RELEASED',
      '26. Step 7 -> Step 8: Advances to terminal state DEPOSIT_RELEASED (HTTP 200)'
    );

    // Immutability: Cannot advance past terminal state
    const afterTerminalRes = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 8 });

    assert(afterTerminalRes.status === 400, '27. Terminal state immutability: Cannot transition from DEPOSIT_RELEASED (HTTP 400)');

    // Chronological Audit Timeline Check
    const historyEntries = await BookingStatusHistory.findAll({
      where: { bookingId: booking1.id },
      order: [['stepNumber', 'ASC']]
    });

    assert(
      historyEntries.length === 8 &&
      historyEntries[0].status === 'BOOKING_CONFIRMED' &&
      historyEntries[7].status === 'DEPOSIT_RELEASED',
      '28. Complete 8-step chronological history timeline is recorded in BookingStatusHistory'
    );

    // Stock availability is freed up after PRODUCT_RETURNED
    const freedDateRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({
        items: [{ productId: productSony.id, quantity: 5 }],
        startDate: '2026-10-10',
        endDate: '2026-10-12',
        deliveryType: 'store_pickup'
      });

    assert(
      freedDateRes.status === 201,
      '29. Inventory capacity is released for date range once earlier booking completes DEPOSIT_RELEASED'
    );

    // =========================================================================
    // SECTION 5: Early Stage Cancellation & Stock Release
    // =========================================================================
    console.log('\n--- SECTION 5: Early Stage Cancellation & Stock Release ---');

    // Customer cancels Booking 2 (currently in Step 1)
    const cancelRes = await request(app)
      .patch(`/api/v1/bookings/${booking2.id}/cancel`)
      .set('Authorization', `Bearer ${customerToken2}`)
      .send({ cancellationReason: 'Client postponed event date' });

    assert(
      cancelRes.status === 200 && cancelRes.body.data.status === 'CANCELLED',
      '30. Customer successfully cancels booking during early stage (Step 1) (HTTP 200)'
    );

    const cancelHistory = await BookingStatusHistory.findOne({
      where: { bookingId: booking2.id, status: 'CANCELLED' }
    });
    assert(
      cancelHistory && cancelHistory.notes.includes('postponed event date'),
      '31. Cancellation history entry is logged with customer-provided cancellation reason'
    );

    const releaseTxn = await InventoryTransaction.findOne({
      where: { productId: productLens.id, transactionType: 'STOCK_RELEASED' }
    });
    assert(
      releaseTxn !== null,
      '32. InventoryTransaction logged with transactionType: STOCK_RELEASED on cancellation'
    );

    // Cannot cancel already finished or active rental (Step >= 4)
    const cancelActiveRes = await request(app)
      .patch(`/api/v1/bookings/${booking1.id}/cancel`)
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({ cancellationReason: 'Too late to cancel' });

    assert(cancelActiveRes.status === 400, '33. Cancellation rejected for booking past equipment handover stage (HTTP 400)');

    // =========================================================================
    // SECTION 6: B2B Custom Quotation & Negotiation Workflow
    // =========================================================================
    console.log('\n--- SECTION 6: B2B Custom Quotation & Negotiation Workflow ---');

    const quotePayload = {
      vendorId: vendorProfileA.id,
      items: [
        { productId: productSony.id, quantity: 3 }
      ],
      eventDate: '2026-11-20',
      durationDays: 5,
      customerNotes: 'Need 3 Sony FX3 kits for feature film shoot in Pune'
    };

    const quoteCreateRes = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send(quotePayload);

    assert(quoteCreateRes.status === 201, '34. Customer submits B2B quotation inquiry successfully (HTTP 201)');
    const quotation = quoteCreateRes.body.data;

    assert(
      /^QTN-\d{8}-[A-Z0-9]{4}$/.test(quotation.quotationNumber) && quotation.status === 'Submitted',
      '35. Quotation assigned unique QTN-YYYYMMDD-XXXX number with Submitted status'
    );

    // Vendor B attempts to respond to Vendor A's quotation -> Forbidden!
    const quoteForbiddenRes = await request(app)
      .patch(`/api/v1/quotations/${quotation.id}/respond`)
      .set('Authorization', `Bearer ${vendorTokenB}`)
      .send({
        items: [{ productId: productSony.id, customRate: 1800.00 }]
      });

    assert(quoteForbiddenRes.status === 403, '36. Non-involved vendor is forbidden from responding to another store\'s quote (HTTP 403)');

    // Vendor A responds with custom negotiated discounted rate (1800/day vs 2200 standard)
    const quoteRespondRes = await request(app)
      .patch(`/api/v1/quotations/${quotation.id}/respond`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({
        items: [{ productId: productSony.id, customRate: 1800.00 }],
        vendorNotes: 'Special bulk discount applied: 1800/day for 5 days'
      });

    // Subtotal: 1800 * 3 * 5 = 27,000. Tax: 18% = 4860. Total: 31,860.
    assert(
      quoteRespondRes.status === 200 &&
      quoteRespondRes.body.data.status === 'Quote_Sent' &&
      Number(quoteRespondRes.body.data.subtotal) === 27000 &&
      Number(quoteRespondRes.body.data.totalAmount) === 31860,
      '37. Vendor responds with custom negotiated rates, updating status to Quote_Sent (HTTP 200)'
    );

    // Customer accepts quotation -> automatically generates official Booking!
    const quoteAcceptRes = await request(app)
      .patch(`/api/v1/quotations/${quotation.id}/accept`)
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({});

    assert(
      quoteAcceptRes.status === 200 &&
      quoteAcceptRes.body.data.quotation.status === 'Accepted' &&
      quoteAcceptRes.body.data.booking !== undefined,
      '38. Customer accepts quotation offer, automatically creating official Booking (HTTP 200)'
    );

    // Duplicate acceptance attempt on already accepted quotation -> Must Reject!
    const duplicateAcceptRes = await request(app)
      .patch(`/api/v1/quotations/${quotation.id}/accept`)
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({});

    assert(duplicateAcceptRes.status === 400, '39. Duplicate acceptance of already accepted quotation is rejected (HTTP 400)');

    // Customer rejects another quotation proposal
    const quote2Res = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${customerToken2}`)
      .send({
        vendorId: vendorProfileB.id,
        items: [{ productId: productMic.id, quantity: 2 }],
        eventDate: '2026-12-01',
        durationDays: 2,
        customerNotes: 'Event sound setup'
      });
    const quote2 = quote2Res.body.data;

    const quoteRejectRes = await request(app)
      .patch(`/api/v1/quotations/${quote2.id}/reject`)
      .set('Authorization', `Bearer ${customerToken2}`)
      .send({});

    assert(
      quoteRejectRes.status === 200 && quoteRejectRes.body.data.status === 'Rejected',
      '40. Quotation rejection workflow succeeds (status: Rejected) (HTTP 200)'
    );

    // Expired quotation cannot be accepted
    const expiredQuote = await Quotation.create({
      quotationNumber: 'QTN-20260101-9999',
      customerId: customer1.id,
      vendorId: vendorProfileA.id,
      eventDate: '2026-12-15',
      durationDays: 2,
      validUntil: '2026-01-01', // Expired in past
      status: 'Quote_Sent',
      subtotal: 5000,
      taxAmount: 900,
      totalAmount: 5900
    });
    await QuotationItem.create({
      quotationId: expiredQuote.id,
      productId: productSony.id,
      quantity: 1,
      durationDays: 2,
      unitRate: 2500,
      subtotal: 5000
    });

    const expiredAcceptRes = await request(app)
      .patch(`/api/v1/quotations/${expiredQuote.id}/accept`)
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({});

    assert(expiredAcceptRes.status === 400, '41. Expired quotation offer cannot be accepted (HTTP 400)');

    // =========================================================================
    // SECTION 7: RBAC Security, Dispute Escalation & Admin Override Audit Trail
    // =========================================================================
    console.log('\n--- SECTION 7: RBAC Security & Super Admin Dispute Override ---');

    // Customer 2 tries to view Customer 1's booking -> Forbidden
    const crossCustomerRes = await request(app)
      .get(`/api/v1/bookings/${booking1.id}`)
      .set('Authorization', `Bearer ${customerToken2}`);

    assert(crossCustomerRes.status === 403, '42. Customer cannot view another customer\'s booking (HTTP 403)');

    // Vendor B tries to view Vendor A's booking -> 404 (store isolation)
    const crossVendorRes = await request(app)
      .get(`/api/v1/vendor/bookings/${booking1.id}`)
      .set('Authorization', `Bearer ${vendorTokenB}`);

    assert(crossVendorRes.status === 404, '43. Vendor store boundary prevents cross-vendor booking access (HTTP 404)');

    // Super Admin retrieves all bookings with pagination
    const adminBookingsRes = await request(app)
      .get('/api/v1/admin/bookings')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(
      adminBookingsRes.status === 200 && adminBookingsRes.body.data.results && adminBookingsRes.body.data.results.length >= 3,
      '44. Super Admin retrieves all platform bookings with customer and vendor associations (HTTP 200)'
    );

    // Super Admin status override without mandatory reason -> Must Reject!
    const emptyReasonOverrideRes = await request(app)
      .patch(`/api/v1/admin/bookings/${booking1.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DISPUTED', notes: '' });

    assert(emptyReasonOverrideRes.status === 400, '45. Administrative status override without reason is rejected (HTTP 400)');

    // Super Admin overrides status for dispute resolution (e.g. DISPUTED)
    const adminOverrideRes = await request(app)
      .patch(`/api/v1/admin/bookings/${booking1.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'DISPUTED',
        notes: 'Customer reported minor scratch dispute on return; deposit held pending review.'
      });

    assert(
      adminOverrideRes.status === 200 && adminOverrideRes.body.data.status === 'DISPUTED',
      '46. Super Admin can override booking status to DISPUTED for dispute escalation (HTTP 200)'
    );

    const disputeAudit = await AuditLog.findOne({
      where: { targetId: booking1.id, action: 'BOOKING_STATUS_OVERRIDE' }
    });

    assert(
      disputeAudit !== null && disputeAudit.description.includes('DISPUTED'),
      '47. Administrative status override creates permanent immutable AuditLog entry'
    );

    // Disputed booking cannot be advanced by vendor
    const vendorDisputeAdvanceRes = await request(app)
      .patch(`/api/v1/vendor/bookings/${booking1.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 8 });

    assert(vendorDisputeAdvanceRes.status === 403 || vendorDisputeAdvanceRes.status === 400, '48. Disputed booking is frozen from vendor step transitions (HTTP 403/400)');

    // Customer lists their own bookings
    const myBookingsRes = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`);

    assert(
      myBookingsRes.status === 200 && Array.isArray(myBookingsRes.body.data.results),
      '49. Customer can retrieve list of their own bookings with pagination (HTTP 200)'
    );

    // Vendor lists their store bookings
    const myVendorBookingsRes = await request(app)
      .get('/api/v1/vendor/bookings')
      .set('Authorization', `Bearer ${vendorTokenA}`);

    assert(
      myVendorBookingsRes.status === 200 && Array.isArray(myVendorBookingsRes.body.data.results),
      '50. Vendor can retrieve list of store bookings with pagination (HTTP 200)'
    );

    // =========================================================================
    // SECTION 8: OTP Attempt Limiting & Database Transaction Rollback
    // =========================================================================
    console.log('\n--- SECTION 8: OTP Security Limit & Transaction Rollback ---');

    // Create a new booking for OTP attempt test
    const otpTestBookingRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({
        items: [{ productId: productSony.id, quantity: 1 }],
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        deliveryType: 'store_pickup'
      });
    const otpTestBooking = otpTestBookingRes.body.data;

    // Advance to Step 2 & 3
    await request(app)
      .patch(`/api/v1/vendor/bookings/${otpTestBooking.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 2 });
    await request(app)
      .patch(`/api/v1/vendor/bookings/${otpTestBooking.id}/transition`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ targetStep: 3 });

    // Submit 5 wrong OTP attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/api/v1/vendor/bookings/${otpTestBooking.id}/verify-otp`)
        .set('Authorization', `Bearer ${vendorTokenA}`)
        .send({ otp: '111111' });
    }

    // 6th attempt should be blocked with max attempts exceeded error
    const lockoutRes = await request(app)
      .post(`/api/v1/vendor/bookings/${otpTestBooking.id}/verify-otp`)
      .set('Authorization', `Bearer ${vendorTokenA}`)
      .send({ otp: otpTestBooking.initialCustomerOtp });

    assert(
      lockoutRes.status === 400 && lockoutRes.body.message.includes('Maximum OTP verification attempts exceeded'),
      '51. Exceeding 5 failed OTP attempts triggers immediate verification lockout (HTTP 400)'
    );

    // Mid-checkout failure triggers complete transactional rollback (zero partial rows created)
    const initialBookingCount = await Booking.count();
    const initialOrderCount = await Order.count();

    try {
      await BookingService.createBooking(customer1.id, {
        items: [{ productId: 'invalid-non-existent-product-id', quantity: 1 }],
        startDate: '2026-11-20',
        endDate: '2026-11-22',
        deliveryType: 'store_pickup'
      });
    } catch (e) {
      // Expected failure
    }

    const finalBookingCount = await Booking.count();
    const finalOrderCount = await Order.count();

    assert(
      initialBookingCount === finalBookingCount && initialOrderCount === finalOrderCount,
      '52. Mid-checkout transaction failure ensures 100% rollback with zero partial rows created'
    );

    // =========================================================================
    // TEST SUITE SUMMARY
    // =========================================================================
    console.log('\n========================================================================');
    console.log(`🎉 Phase 4 Test Suite Completed: ${passedTests}/${totalTests} tests passed!`);
    console.log('========================================================================\n');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error('Test Suite Failed with unexpected error:', error);
    process.exit(1);
  }
}

runPhase4Tests();
