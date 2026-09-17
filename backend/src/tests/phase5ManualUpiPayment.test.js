/**
 * Phase 5 Comprehensive Test Suite: Manual UPI Payment Workflow, QR Code Management,
 * Super Admin Verification Engine, Multi-Ledger Allocation & Idempotency
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const fs = require('fs');
const path = require('path');
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
  Booking,
  Order,
  PaymentSubmission,
  RentalPayment,
  EscrowDeposit,
  Commission,
  PlatformSetting,
  AuditLog,
  Notification
} = require('../models');
const TokenService = require('../services/token.service');
const { ROLES } = require('../config/constants');

// Helper to create valid PNG test image buffer
function createValidPngBuffer() {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const dummyData = Buffer.alloc(100, 0);
  return Buffer.concat([pngHeader, dummyData]);
}

// Helper to create invalid/corrupted spoofed buffer
function createSpoofedBuffer() {
  return Buffer.from('THIS IS NOT A VALID IMAGE OR PDF FILE HEADER');
}

async function runPhase5Tests() {
  console.log('========================================================================');
  console.log('💳 Rentora Phase 5: Manual UPI Workflow & Admin Verification Engine Suite');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS ${totalTests}] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL ${totalTests}] ${testName} -> FAILED: condition evaluated to ${condition}`);
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

    // 1. Seed Super Admin User
    const adminUser = await User.create({
      fullName: 'Super Admin',
      email: 'superadmin@rentora.in',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: adminUser.id, roleId: adminRole.id });
    const { accessToken: adminToken } = await TokenService.generateTokens(adminUser, [ROLES.SUPER_ADMIN]);

    // 2. Seed Vendor Store
    const vendorUser = await User.create({
      fullName: 'Cinema Pro Rentals',
      email: 'cinemapro@rentals.com',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: vendorUser.id, roleId: vendRole.id });
    const vendorProfile = await VendorProfile.create({
      userId: vendorUser.id,
      businessName: 'Cinema Pro Store',
      businessCategory: 'Cameras & Optics',
      businessEmail: 'contact@cinemapro.com',
      businessPhone: '+919876543200',
      businessAddress: '101 Studio Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      verificationStatus: 'Approved'
    });
    const { accessToken: vendorToken } = await TokenService.generateTokens(vendorUser, [ROLES.VENDOR]);

    // 3. Seed Customers 1 and 2 (for multi-tenant isolation tests)
    const customer1 = await User.create({
      fullName: 'Aarav Patel',
      email: 'aarav@gmail.com',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: customer1.id, roleId: custRole.id });
    await CustomerProfile.create({
      userId: customer1.id,
      addressLine1: '402 Highstreet',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380015'
    });
    const { accessToken: customerToken1 } = await TokenService.generateTokens(customer1, [ROLES.CUSTOMER]);

    const customer2 = await User.create({
      fullName: 'Pooja Mehta',
      email: 'pooja@gmail.com',
      passwordHash: '$2b$12$dummyhashedpasswordfortestingpurposesonly',
      status: 'Active'
    });
    await UserRole.create({ userId: customer2.id, roleId: custRole.id });
    await CustomerProfile.create({
      userId: customer2.id,
      addressLine1: '501 Green Valley',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001'
    });
    const { accessToken: customerToken2 } = await TokenService.generateTokens(customer2, [ROLES.CUSTOMER]);

    // 4. Seed Category & Products
    const category = await Category.create({
      id: 'cameras',
      name: 'Cameras & Optics',
      slug: 'cameras',
      isActive: true
    });

    const productSony = await Product.create({
      name: 'Sony FX3 Cinema Camera',
      slug: 'sony-fx3-cinema-camera',
      sku: 'CAM-SONY-001',
      categoryId: category.id,
      vendorId: vendorProfile.id,
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

    const productLens = await Product.create({
      name: 'Sony FE 24-70mm GM II',
      slug: 'sony-fe-24-70mm-gm-ii',
      sku: 'LENS-SONY-001',
      categoryId: category.id,
      vendorId: vendorProfile.id,
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

    console.log('Seeding completed successfully.\n');

    // =========================================================================
    // SECTION 1: Super Admin Platform UPI & QR Code Configuration
    // =========================================================================
    console.log('--- SECTION 1: Platform UPI & QR Configuration ---');

    // Test 1: Get default UPI configuration
    const defaultUpiRes = await request(app)
      .get('/api/v1/payments/upi-details');

    assert(defaultUpiRes.status === 200, '1. Public/Customer can fetch platform UPI details (HTTP 200)');
    assert(defaultUpiRes.body.data && defaultUpiRes.body.data.upiId, '2. Default platform UPI ID is present');

    // Test 2: Admin updates platform UPI config and uploads new QR code image
    const validQrBuffer = createValidPngBuffer();
    const updateUpiRes = await request(app)
      .put('/api/v1/admin/payments/upi-config')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('upiId', 'rentora.official@icici')
      .field('payeeName', 'Rentora Marketplace Private Limited')
      .field('instructions', 'Scan QR code and enter 12-digit UTR')
      .attach('qrCodeImage', validQrBuffer, 'official_qr.png');

    assert(updateUpiRes.status === 200, '3. Super Admin updates platform UPI ID and uploads QR code (HTTP 200)');
    assert(updateUpiRes.body.data.upiId === 'rentora.official@icici', '4. Updated UPI ID is persisted');

    // Test 3: Verify updated UPI details reflect in public endpoint
    const updatedUpiRes = await request(app)
      .get('/api/v1/payments/upi-details');
    assert(
      updatedUpiRes.body.data.upiId === 'rentora.official@icici' &&
      updatedUpiRes.body.data.qrCodeUrl.startsWith('/uploads/qr/') &&
      updatedUpiRes.body.data.qrCodeUrl.endsWith('.png'),
      '5. Public checkout view reflects updated UPI ID and QR code URL'
    );

    // =========================================================================
    // SECTION 2: Customer Checkout & Manual UPI Submission
    // =========================================================================
    console.log('\n--- SECTION 2: Customer Checkout & Manual Payment Submission ---');

    // Create Booking 1 (Duration = 3 days, Sony FX3 x2 + Lens x1)
    // Pure Rental = 2200*2*3 + 1000*1*3 = 16,200
    // Delivery = 250
    // Insurance = 324 (2% on 16200)
    // Taxable Subtotal = 16,774
    // GST (18%) = 3,019.32
    // Deposit = 38,000
    // Total = 57,793.32
    const checkoutRes1 = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken1}`)
      .send({
        items: [
          { productId: productSony.id, quantity: 2 },
          { productId: productLens.id, quantity: 1 }
        ],
        startDate: '2026-10-15',
        endDate: '2026-10-17',
        deliveryType: 'doorstep',
        deliveryAddress: '402 Highstreet, Ahmedabad'
      });

    assert(checkoutRes1.status === 201, '6. Customer completes rental checkout (HTTP 201)');
    const booking1 = checkoutRes1.body.data;

    const order1 = await Order.findOne({ where: { bookingId: booking1.id } });
    assert(
      order1 && order1.paymentStatus === 'Pending' && order1.orderStatus === 'Pending',
      '7. Associated Order starts with paymentStatus = Pending and orderStatus = Pending'
    );

    // Test 4: UTR Whitespace Trimming & Valid Submission
    const validProofBuffer = createValidPngBuffer();
    const submitRes1 = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerToken1}`)
      .field('bookingId', booking1.id)
      .field('utrNumber', '  123456789012  ') // Leading/trailing whitespace
      .field('payerUpiId', 'aarav@okhdfcbank')
      .field('payerName', 'Aarav Patel')
      .field('customerNotes', 'Paid via Google Pay')
      .attach('proofFile', validProofBuffer, 'payment_receipt.png');

    assert(submitRes1.status === 201, '8. Customer submits valid manual UPI payment proof + UTR (HTTP 201)');
    const submission1 = submitRes1.body.data;
    assert(
      submission1.utrNumber === '123456789012',
      '9. UTR number is trimmed of whitespace before persistence (123456789012)'
    );
    assert(
      submission1.verificationStatus === 'Pending',
      '10. Submission verificationStatus is set to Pending'
    );

    // =========================================================================
    // SECTION 3: UTR Validation, Duplication & Security Guards
    // =========================================================================
    console.log('\n--- SECTION 3: UTR Validation, Duplicate Prevention & File Security ---');

    // Create Booking 2 for Customer 2
    const checkoutRes2 = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken2}`)
      .send({
        items: [{ productId: productSony.id, quantity: 1 }],
        startDate: '2026-10-20',
        endDate: '2026-10-21',
        deliveryType: 'store_pickup'
      });
    const booking2 = checkoutRes2.body.data;

    // Test 5: Invalid UTR format (< 8 chars) is rejected
    const invalidUtrRes = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerToken2}`)
      .field('bookingId', booking2.id)
      .field('utrNumber', '1234') // Too short
      .attach('proofFile', validProofBuffer, 'receipt.png');

    assert(invalidUtrRes.status === 400, '11. Invalid UTR format (< 8 characters) is rejected (HTTP 400)');

    // Test 6: Duplicate UTR submission across different orders is rejected (HTTP 409 Conflict)
    const duplicateUtrRes = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerToken2}`)
      .field('bookingId', booking2.id)
      .field('utrNumber', '123456789012') // Same as booking 1
      .attach('proofFile', validProofBuffer, 'receipt.png');

    assert(duplicateUtrRes.status === 409, '12. Duplicate UTR submission is rejected with HTTP 409 Conflict');

    // Test 7: Duplicate active submission on the same booking while Pending is rejected
    const duplicateSubmissionRes = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerToken1}`)
      .field('bookingId', booking1.id)
      .field('utrNumber', '987654321099')
      .attach('proofFile', validProofBuffer, 'receipt.png');

    assert(duplicateSubmissionRes.status === 400, '13. Attempting duplicate submission while one is Pending is rejected (HTTP 400)');

    // Test 8: Magic Byte Validation blocks spoofed/corrupted file
    const spoofedBuffer = createSpoofedBuffer();
    const spoofedFileRes = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerToken2}`)
      .field('bookingId', booking2.id)
      .field('utrNumber', '555566667777')
      .attach('proofFile', spoofedBuffer, 'fake_receipt.jpg');

    assert(spoofedFileRes.status === 400, '14. Spoofed file extension is rejected by Magic Byte validation (HTTP 400)');

    // Test 9: RBAC Access Control for Payment Proof File
    const proofAccessForbidden = await request(app)
      .get(`/api/v1/payments/proof/${submission1.id}`)
      .set('Authorization', `Bearer ${customerToken2}`); // Customer 2 trying to access Customer 1 proof

    assert(proofAccessForbidden.status === 403, '15. Non-owner customer is forbidden from viewing payment proof (HTTP 403)');

    const proofAccessCustomer1 = await request(app)
      .get(`/api/v1/payments/proof/${submission1.id}`)
      .set('Authorization', `Bearer ${customerToken1}`);

    assert(proofAccessCustomer1.status === 200, '16. Owner customer can securely stream payment proof file (HTTP 200)');

    // =========================================================================
    // SECTION 4: Super Admin Rejection & Customer Re-submission
    // =========================================================================
    console.log('\n--- SECTION 4: Super Admin Rejection & Re-submission ---');

    // Submit valid proof for Booking 2
    const submitRes2 = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerToken2}`)
      .field('bookingId', booking2.id)
      .field('utrNumber', '998877665501')
      .attach('proofFile', validProofBuffer, 'proof2.png');

    assert(submitRes2.status === 201, '17. Customer 2 submits payment proof for Booking 2 (HTTP 201)');
    const submission2 = submitRes2.body.data;

    // Test 10: Super Admin rejection without a reason is rejected
    const rejectNoReason = await request(app)
      .patch(`/api/v1/admin/payments/submissions/${submission2.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rejectionReason: '' });

    assert(rejectNoReason.status === 400, '18. Admin rejection without reason is rejected (HTTP 400)');

    // Test 11: Super Admin rejection with short reason (< 10 chars) is rejected
    const rejectShortReason = await request(app)
      .patch(`/api/v1/admin/payments/submissions/${submission2.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rejectionReason: 'Bad' });

    assert(rejectShortReason.status === 400, '19. Admin rejection with reason < 10 chars is rejected (HTTP 400)');

    // Test 12: Super Admin rejects with valid explanation
    const rejectSuccess = await request(app)
      .patch(`/api/v1/admin/payments/submissions/${submission2.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rejectionReason: 'UTR number not found in ICICI bank current account statement' });

    assert(rejectSuccess.status === 200, '20. Admin rejects payment with valid reason (HTTP 200)');
    assert(rejectSuccess.body.data.verificationStatus === 'Rejected', '21. Submission status is updated to Rejected');

    const order2 = await Order.findOne({ where: { bookingId: booking2.id } });
    assert(order2.paymentStatus === 'Failed', '22. Order paymentStatus is updated to Failed upon rejection');

    // Test 13: Customer 2 is now allowed to re-submit with corrected UTR after rejection
    const reSubmitRes2 = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerToken2}`)
      .field('bookingId', booking2.id)
      .field('utrNumber', '998877665599') // Corrected UTR
      .attach('proofFile', validProofBuffer, 'corrected_proof2.png');

    assert(reSubmitRes2.status === 201, '23. Customer successfully re-submits corrected UTR after rejection (HTTP 201)');

    // =========================================================================
    // SECTION 5: Super Admin Approval & Multi-Ledger Accounting
    // =========================================================================
    console.log('\n--- SECTION 5: Super Admin Approval & Multi-Ledger Accounting ---');

    // Test 14: Super Admin Approves Payment for Booking 1
    const approveRes1 = await request(app)
      .patch(`/api/v1/admin/payments/submissions/${submission1.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminNotes: 'Verified against bank statement deposit at 10:45 AM' });

    assert(approveRes1.status === 200, '24. Super Admin approves payment submission (HTTP 200)');
    const approvedData = approveRes1.body.data;

    assert(
      approvedData.submission.verificationStatus === 'Verified',
      '25. PaymentSubmission verificationStatus is updated to Verified'
    );

    const updatedOrder1 = await Order.findByPk(order1.id);
    assert(
      updatedOrder1.paymentStatus === 'Success' && updatedOrder1.orderStatus === 'Confirmed',
      '26. Order paymentStatus = Success and orderStatus = Confirmed'
    );

    // Test 15: Booking.status strictly remains at Step 1 (BOOKING_CONFIRMED)
    const updatedBooking1 = await Booking.findByPk(booking1.id);
    assert(
      updatedBooking1.currentStep === 1 && updatedBooking1.status === 'BOOKING_CONFIRMED',
      '27. Booking.status strictly remains at Step 1: BOOKING_CONFIRMED (does not auto-skip to Step 2)'
    );

    // Test 16: RentalPayment Ledger Record Verification
    // Pure Rental (16,200) + Delivery (250) + Insurance (324) + GST (3019.32) = 19,793.32
    const rentalPayment1 = await RentalPayment.findOne({ where: { orderId: order1.id } });
    assert(
      rentalPayment1 &&
      Number(rentalPayment1.amount) === 19793.32 &&
      rentalPayment1.paymentStatus === 'Success' &&
      rentalPayment1.paymentMethod === 'UPI',
      '28. RentalPayment ledger created with exact amount ₹19,793.32 (Pure Rental + Delivery + Insurance + GST)'
    );

    // Test 17: EscrowDeposit Ledger Record Verification (0% GST, Held)
    const escrowDeposit1 = await EscrowDeposit.findOne({ where: { orderId: order1.id } });
    assert(
      escrowDeposit1 &&
      Number(escrowDeposit1.depositAmount) === 38000.00 &&
      escrowDeposit1.status === 'Held',
      '29. EscrowDeposit ledger created with exact amount ₹38,000.00 (0% GST, status: Held)'
    );

    // Test 18: Strict Additive Identity: RentalPayment + EscrowDeposit == TotalAmount
    const ledgerSum = Number(rentalPayment1.amount) + Number(escrowDeposit1.depositAmount);
    assert(
      Math.abs(ledgerSum - Number(updatedOrder1.totalAmount)) < 0.01 &&
      ledgerSum === 57793.32,
      '30. Additive Ledger Identity verified: RentalPayment (19,793.32) + EscrowDeposit (38,000.00) = Total (57,793.32)'
    );

    // Test 19: Commission Ledger Record Verification (Pure Rental Only)
    // Pure Rental = 16,200
    // Commission (10%) = 1,620.00 (0% on GST, 0% on deposit)
    // Vendor Earnings = 14,580.00
    const commission1 = await Commission.findOne({ where: { orderId: order1.id } });
    assert(
      commission1 &&
      Number(commission1.grossAmount) === 16200.00 &&
      Number(commission1.commissionAmount) === 1620.00 &&
      Number(commission1.vendorEarnings) === 14580.00 &&
      commission1.payoutStatus === 'Pending',
      '31. Platform Commission calculated strictly on Pure Rental (Gross: 16200, 10% Comm: 1620, Vendor: 14580, 0% on GST/Deposit)'
    );

    // Test 20: AuditLog Permanent Immutability Verification
    const auditLogEntry = await AuditLog.findOne({
      where: {
        action: 'PAYMENT_APPROVED',
        targetId: submission1.id
      }
    });
    assert(
      auditLogEntry &&
      auditLogEntry.adminId === adminUser.id &&
      auditLogEntry.module === 'PAYMENTS',
      '32. Permanent immutable AuditLog record verified for PAYMENT_APPROVED'
    );

    // =========================================================================
    // SECTION 6: Approval Idempotency & Duplicate Prevention
    // =========================================================================
    console.log('\n--- SECTION 6: Approval Idempotency & Duplicate Approval Prevention ---');

    // Test 21: Attempting to approve an already verified submission is rejected
    const duplicateApproveRes = await request(app)
      .patch(`/api/v1/admin/payments/submissions/${submission1.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminNotes: 'Duplicate attempt' });

    assert(
      duplicateApproveRes.status === 400,
      '33. Duplicate approval attempt on already Verified submission is rejected (HTTP 400)'
    );

    // Test 22: Customer cannot submit payment for an already completed order
    const submitOnPaidOrderRes = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerToken1}`)
      .field('bookingId', booking1.id)
      .field('utrNumber', '778899001122')
      .attach('proofFile', validProofBuffer, 'extra_receipt.png');

    assert(
      submitOnPaidOrderRes.status === 400,
      '34. Submitting payment for an already completed/verified order is rejected (HTTP 400)'
    );

    // =========================================================================
    // SECTION 7: Visibility Endpoints & Listing
    // =========================================================================
    console.log('\n--- SECTION 7: Customer, Vendor & Admin Visibility ---');

    // Test 23: Customer booking payment view reflects verified status
    const customerPaymentView = await request(app)
      .get(`/api/v1/payments/booking/${booking1.id}`)
      .set('Authorization', `Bearer ${customerToken1}`);

    assert(customerPaymentView.status === 200, '35. Customer can view booking payment status (HTTP 200)');
    assert(
      customerPaymentView.body.data.order.paymentStatus === 'Success' &&
      customerPaymentView.body.data.latestSubmission.verificationStatus === 'Verified',
      '36. Customer view shows order.paymentStatus = Success and submission = Verified'
    );

    // Test 24: Vendor booking payment view
    const vendorPaymentView = await request(app)
      .get(`/api/v1/payments/booking/${booking1.id}`)
      .set('Authorization', `Bearer ${vendorToken}`);

    assert(vendorPaymentView.status === 200, '37. Store Vendor can view booking payment status (HTTP 200)');
    assert(
      vendorPaymentView.body.data.order.paymentStatus === 'Success',
      '38. Vendor view shows verified payment status'
    );

    // Test 25: Super Admin lists submissions with filters
    const adminListRes = await request(app)
      .get('/api/v1/admin/payments/submissions?status=Verified')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(adminListRes.status === 200, '39. Super Admin lists submissions filtered by status=Verified (HTTP 200)');
    assert(adminListRes.body.data.length >= 1, '40. Verified submission appears in Admin list');

    // Test 26: Customer retrieves their submission list
    const customerSubmissionsRes = await request(app)
      .get('/api/v1/payments/my-submissions')
      .set('Authorization', `Bearer ${customerToken1}`);

    assert(customerSubmissionsRes.status === 200, '41. Customer retrieves their own submission history (HTTP 200)');
    assert(customerSubmissionsRes.body.data.length >= 1, '42. Customer submission history contains expected record');

    console.log('\n========================================================================');
    console.log(`🎉 Phase 5 Test Suite Completed: ${passedTests}/${totalTests} tests passed!`);
    console.log('========================================================================\n');

  } catch (error) {
    console.error('❌ Test suite fatal error:', error);
    process.exitCode = 1;
  }
}

runPhase5Tests();
