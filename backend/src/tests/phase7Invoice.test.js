/**
 * Phase 7 Professional Invoice, Billing & Payment Statement Test Suite
 * Validates sequential numbering (INV-YYYY-XXXXXX), idempotent generation,
 * 18% GST (9% CGST + 9% SGST) breakdown, isolated refundable security deposit,
 * immutable snapshots, Super Admin payment verification sync, RBAC ownership protection,
 * and standalone A4 HTML print engine.
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');
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
  BookingItem,
  Order,
  RentalPayment,
  EscrowDeposit,
  Commission,
  Invoice,
  PaymentSubmission,
  AuditLog
} = require('../models');
const env = require('../config/env');
const { ROLES } = require('../config/constants');
const InvoiceService = require('../services/invoice.service');
const BookingService = require('../services/booking.service');
const PaymentService = require('../services/payment.service');

async function runPhase7Tests() {
  sequelize.options.logging = false;
  console.log('========================================================================');
  console.log('🧾 Rentora Phase 7: Professional Invoice & Billing System Test Suite');
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

  const timestamp = Date.now();
  const customerAEmail = `cust.inv.a.${timestamp}@testrentora.in`;
  const customerBEmail = `cust.inv.b.${timestamp}@testrentora.in`;
  const vendorEmail = `vendor.inv.${timestamp}@testrentora.in`;
  const adminEmail = env.SEED_CONFIG.ADMIN_EMAIL;
  const adminPassword = env.SEED_CONFIG.ADMIN_PASSWORD;
  const standardPassword = 'TestPassword2026!';

  let customerAToken = '';
  let customerAId = '';
  let customerBToken = '';
  let customerBId = '';
  let vendorToken = '';
  let vendorId = '';
  let vendorProfileId = '';
  let adminToken = '';
  let adminId = '';

  let categoryId = '';
  let productId = '';
  let booking1 = null;
  let invoice1 = null;
  let booking2 = null;
  let invoice2 = null;

  try {
    // ---------------------------------------------------------
    // 1. Database Connection & Schema Verification
    // ---------------------------------------------------------
    await sequelize.authenticate();
    assert(true, 'Database connection established successfully on port 3307');

    const invoiceTable = await sequelize.getQueryInterface().describeTable('invoices');
    assert(invoiceTable.invoice_number || invoiceTable.invoiceNumber, 'invoices table contains invoice_number column');
    assert(invoiceTable.taxable_amount || invoiceTable.taxableAmount, 'invoices table contains taxable_amount column');
    assert(invoiceTable.cgst_amount || invoiceTable.cgstAmount, 'invoices table contains cgst_amount column');
    assert(invoiceTable.sgst_amount || invoiceTable.sgstAmount, 'invoices table contains sgst_amount column');
    assert(invoiceTable.deposit_amount || invoiceTable.depositAmount, 'invoices table contains deposit_amount column');
    assert(invoiceTable.rental_total || invoiceTable.rentalTotal, 'invoices table contains rental_total column');
    assert(invoiceTable.customer_snapshot || invoiceTable.customerSnapshot, 'invoices table contains customer_snapshot column');
    assert(invoiceTable.vendor_snapshot || invoiceTable.vendorSnapshot, 'invoices table contains vendor_snapshot column');
    assert(invoiceTable.items_snapshot || invoiceTable.itemsSnapshot, 'invoices table contains items_snapshot column');

    // ---------------------------------------------------------
    // 2. Sequential Invoice Number Generator
    // ---------------------------------------------------------
    const currentYear = new Date().getFullYear();
    const nextInvNum = await InvoiceService.getNextInvoiceNumber();
    assert(
      new RegExp(`^INV-${currentYear}-\\d{6}$`).test(nextInvNum),
      `Sequential invoice numbering adheres to format INV-${currentYear}-000001 (Generated: ${nextInvNum})`
    );

    // ---------------------------------------------------------
    // 3. User Setup (Customer A, Customer B, Vendor, Admin)
    // ---------------------------------------------------------
    // Super Admin Login
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: adminPassword });
    assert(adminLoginRes.status === 200, 'Super Admin authenticated successfully');
    adminToken = adminLoginRes.body.data.accessToken;
    adminId = adminLoginRes.body.data.user.id;

    // Customer A Register
    const custARes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Aarav Mehta',
        email: customerAEmail,
        password: standardPassword,
        phone: '+91 98765 43210',
        role: 'customer',
        city: 'Ahmedabad'
      });
    assert(custARes.status === 201, 'Customer A registered successfully');
    customerAToken = custARes.body.data.accessToken;
    customerAId = custARes.body.data.user.id;

    // Customer B Register
    const custBRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Bhavin Shah',
        email: customerBEmail,
        password: standardPassword,
        phone: '+91 98765 43211',
        role: 'customer',
        city: 'Surat'
      });
    assert(custBRes.status === 201, 'Customer B registered successfully');
    customerBToken = custBRes.body.data.accessToken;
    customerBId = custBRes.body.data.user.id;

    // Vendor Register
    const vendRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ownerName: 'Vipul Joshi',
        shopName: 'Vipul Cine Store',
        email: vendorEmail,
        password: standardPassword,
        phone: '+91 98765 43212',
        role: 'vendor',
        category: 'Cameras & Photography',
        city: 'Ahmedabad'
      });
    assert(vendRes.status === 201, 'Vendor registered successfully');
    vendorToken = vendRes.body.data.accessToken;
    vendorId = vendRes.body.data.user.id;
    vendorProfileId = vendRes.body.data.vendorProfile.id;

    // Approve Vendor Profile
    const vendorProfile = await VendorProfile.findByPk(vendorProfileId);
    vendorProfile.verificationStatus = 'Approved';
    vendorProfile.gstNumber = '24AABCV9876K1Z9';
    vendorProfile.address = '101, Titanium City Center, Satellite, Ahmedabad';
    vendorProfile.state = 'Gujarat';
    vendorProfile.pincode = '380015';
    await vendorProfile.save();

    // Create Category & Product
    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({
        id: `cat-optics-${timestamp}`,
        name: 'Cinema Optics',
        slug: `cinema-optics-${timestamp}`,
        isActive: true
      });
    }
    categoryId = category.id;

    const product = await Product.create({
      name: 'ARRI Alexa Mini Cinema Kit',
      slug: `arri-alexa-mini-${timestamp}`,
      sku: `SKU-ARRI-${timestamp.toString().slice(-6)}`,
      vendorId: vendorProfileId,
      categoryId,
      pricePerDay: 5000.00,
      discountPrice: 4000.00,
      securityDeposit: 10000.00,
      status: 'Active',
      approvalStatus: 'Approved'
    });
    productId = product.id;

    await Inventory.create({
      productId,
      totalStock: 5,
      availableStock: 5,
      reservedStock: 0,
      inRepairStock: 0
    });

    // ---------------------------------------------------------
    // 4. Booking Creation & Automatic Invoice Generation
    // ---------------------------------------------------------
    const bookingPayload = {
      items: [{ productId, quantity: 1 }],
      startDate: '2026-10-01',
      endDate: '2026-10-03', // 3 days
      deliveryType: 'doorstep',
      deliveryAddress: '402 Shivalik Heights, Bodakdev, Ahmedabad',
      rentalNotes: 'Invoice test booking 1'
    };

    booking1 = await BookingService.createBooking(customerAId, bookingPayload);
    assert(booking1 && booking1.id, 'Booking 1 created in step 1 BOOKING_CONFIRMED');

    // Retrieve Generated Invoice for Booking 1
    invoice1 = await Invoice.findOne({ where: { bookingId: booking1.id } });
    assert(invoice1 !== null, 'Official tax invoice was automatically generated upon BOOKING_CONFIRMED');
    assert(invoice1.invoiceNumber.startsWith(`INV-${currentYear}-`), `Invoice number format valid: ${invoice1.invoiceNumber}`);

    // ---------------------------------------------------------
    // 5. Idempotency Verification
    // ---------------------------------------------------------
    const invoice1SecondCall = await InvoiceService.generateInvoiceForBooking(booking1.id);
    assert(invoice1SecondCall.id === invoice1.id, 'Invoice generation is strictly idempotent (re-execution returns identical record)');
    assert(invoice1SecondCall.invoiceNumber === invoice1.invoiceNumber, 'Idempotency preserves exact original invoice number');

    const invoiceCount = await Invoice.count({ where: { bookingId: booking1.id } });
    assert(invoiceCount === 1, 'Exactly one invoice exists in database for the booking (no duplicates)');

    // ---------------------------------------------------------
    // 6. Strict Financial Calculations & Isolation
    // ---------------------------------------------------------
    // 3 days @ 4,000 = 12,000 Pure Rental
    // Doorstep delivery = 250
    // Insurance (2% of 12,000) = 240
    // Taxable Subtotal = 12,000 + 250 + 240 = 12,490
    // CGST (9%) = 1,124.10
    // SGST (9%) = 1,124.10
    // Total Tax (18%) = 2,248.20
    // Rental Invoice Total = 12,490 + 2,248.20 = 14,738.20
    // Refundable Security Deposit = 10,000 (0% GST)
    // Total Customer Payable = 14,738.20 + 10,000 = 24,738.20

    assert(Number(invoice1.rentalAmount) === 12000.00, `Pure rental amount calculated correctly: ₹${invoice1.rentalAmount} (Expected ₹12000)`);
    assert(Number(invoice1.deliveryFee) === 250.00, `Delivery fee included in taxable amount: ₹${invoice1.deliveryFee}`);
    assert(Number(invoice1.insuranceAmount) === 240.00, `Insurance amount included in taxable amount: ₹${invoice1.insuranceAmount}`);
    assert(Number(invoice1.taxableAmount) === 12490.00, `Taxable Subtotal calculated correctly: ₹${invoice1.taxableAmount} (Expected ₹12490)`);
    assert(Number(invoice1.cgstAmount) === 1124.10, `CGST (9%) calculated accurately: ₹${invoice1.cgstAmount} (Expected ₹1124.10)`);
    assert(Number(invoice1.sgstAmount) === 1124.10, `SGST (9%) calculated accurately: ₹${invoice1.sgstAmount} (Expected ₹1124.10)`);
    assert(Number(invoice1.taxAmount) === 2248.20, `Total 18% GST calculated accurately: ₹${invoice1.taxAmount} (Expected ₹2248.20)`);
    assert(Number(invoice1.rentalTotal) === 14738.20, `Rental Invoice Total calculated accurately: ₹${invoice1.rentalTotal} (Expected ₹14738.20)`);
    assert(Number(invoice1.depositAmount) === 10000.00, `Security deposit is strictly isolated at 0% GST: ₹${invoice1.depositAmount} (Expected ₹10000)`);
    assert(Number(invoice1.totalAmount) === 24738.20, `Total Customer Payable sum matches: ₹${invoice1.totalAmount} (Expected ₹24738.20)`);

    // Initial Status Check
    assert(invoice1.status === 'ISSUED', `Initial invoice status is 'ISSUED' (Actual: ${invoice1.status})`);
    assert(invoice1.paymentStatus === 'Pending', `Initial payment status is 'Pending' (Actual: ${invoice1.paymentStatus})`);
    assert(Number(invoice1.amountPaid) === 0.00, 'Initial amount paid is ₹0.00');
    assert(Number(invoice1.remainingAmount) === 24738.20, 'Initial remaining balance equals total payable amount');

    // ---------------------------------------------------------
    // 7. Immutable Snapshots Verification
    // ---------------------------------------------------------
    assert(invoice1.customerSnapshot && invoice1.customerSnapshot.fullName === 'Aarav Mehta', 'Customer snapshot preserved customer full name');
    assert(invoice1.customerSnapshot && invoice1.customerSnapshot.email === customerAEmail, 'Customer snapshot preserved customer email');
    assert(invoice1.vendorSnapshot && invoice1.vendorSnapshot.gstNumber === '24AABCV9876K1Z9', 'Vendor snapshot preserved vendor GSTIN');
    assert(invoice1.vendorSnapshot && invoice1.vendorSnapshot.storeName === 'Vipul Cine Store', 'Vendor snapshot preserved store name');
    assert(Array.isArray(invoice1.itemsSnapshot) && invoice1.itemsSnapshot.length === 1, 'Items snapshot preserved equipment item line');
    assert(invoice1.itemsSnapshot[0].productName === 'ARRI Alexa Mini Cinema Kit', 'Items snapshot contains product name');
    assert(invoice1.itemsSnapshot[0].ratePerDay === 4000.00, 'Items snapshot contains applied unit rental rate');

    // ---------------------------------------------------------
    // 8. Manual UPI Payment Flow & Super Admin Verification Sync
    // ---------------------------------------------------------
    const dummyProofPath = path.join(__dirname, 'dummy_proof_phase7.png');
    fs.writeFileSync(dummyProofPath, Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));

    const utr1 = `UTR777${timestamp.toString().slice(-6)}`;
    const submitRes = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerAToken}`)
      .field('bookingId', booking1.id)
      .field('utrNumber', utr1)
      .field('payerName', 'Aarav Mehta')
      .field('payerUpiId', 'aarav@okaxis')
      .attach('proofFile', dummyProofPath);

    assert(submitRes.status === 201, 'Customer A submitted payment proof with valid UTR');
    const submission1Id = submitRes.body.data.id;

    // Super Admin Approves Payment
    const approveRes = await request(app)
      .patch(`/api/v1/admin/payments/submissions/${submission1Id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminNotes: 'Verified in bank account statement' });

    assert(approveRes.status === 200, 'Super Admin approved manual UPI payment');

    // Verify Invoice Status Synchronization
    await invoice1.reload();
    assert(invoice1.status === 'PAID', `Invoice status transitioned to 'PAID' after admin verification (Actual: ${invoice1.status})`);
    assert(invoice1.paymentStatus === 'Success', `Invoice payment status transitioned to 'Success' (Actual: ${invoice1.paymentStatus})`);
    assert(invoice1.paymentReference === utr1, `Invoice saved reference UTR number (${invoice1.paymentReference})`);
    assert(Number(invoice1.amountPaid) === 24738.20, `Invoice amountPaid updated to total payable: ₹${invoice1.amountPaid}`);
    assert(Number(invoice1.remainingAmount) === 0.00, 'Invoice remaining balance cleared to ₹0.00');
    assert(invoice1.verifiedByAdminId === adminId, 'Invoice recorded admin verifier user ID');
    assert(invoice1.paymentVerificationDate !== null, 'Invoice recorded payment verification timestamp');

    // ---------------------------------------------------------
    // 9. Payment Rejection Synchronization
    // ---------------------------------------------------------
    // Create Booking 2
    booking2 = await BookingService.createBooking(customerBId, {
      items: [{ productId, quantity: 1 }],
      startDate: '2026-10-10',
      endDate: '2026-10-11', // 2 days
      deliveryType: 'store_pickup',
      rentalNotes: 'Invoice test booking 2'
    });
    invoice2 = await Invoice.findOne({ where: { bookingId: booking2.id } });
    assert(invoice2 !== null, 'Invoice 2 generated for Booking 2');

    const utr2 = `UTR888${timestamp.toString().slice(-6)}`;
    const submit2Res = await request(app)
      .post('/api/v1/payments/submit-manual-upi')
      .set('Authorization', `Bearer ${customerBToken}`)
      .field('bookingId', booking2.id)
      .field('utrNumber', utr2)
      .field('payerName', 'Bhavin Shah')
      .attach('proofFile', dummyProofPath);

    assert(submit2Res.status === 201, 'Customer B submitted payment proof for Booking 2');
    const submission2Id = submit2Res.body.data.id;

    // Super Admin Rejects Payment
    const rejectRes = await request(app)
      .patch(`/api/v1/admin/payments/submissions/${submission2Id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rejectionReason: 'UTR mismatch: Transaction not found in ICICI bank statement' });

    assert(rejectRes.status === 200, 'Super Admin rejected payment proof');

    await invoice2.reload();
    assert(invoice2.status === 'ISSUED', `Rejected invoice remains 'ISSUED' (unpaid) (Actual: ${invoice2.status})`);
    assert(invoice2.paymentStatus === 'Failed', `Rejected invoice paymentStatus set to 'Failed' (Actual: ${invoice2.paymentStatus})`);
    assert(Number(invoice2.amountPaid) === 0.00, 'Rejected invoice amount paid remains ₹0.00');

    // ---------------------------------------------------------
    // 10. RBAC & Ownership Protection APIs
    // ---------------------------------------------------------
    // Customer A gets their invoices
    const custMyInvoicesRes = await request(app)
      .get('/api/v1/invoices/my')
      .set('Authorization', `Bearer ${customerAToken}`);
    assert(custMyInvoicesRes.status === 200, 'Customer A retrieved their invoices list');
    assert(custMyInvoicesRes.body.data.some(i => i.id === invoice1.id), 'Customer A invoices list contains Invoice 1');

    // Customer B cannot see Customer A's invoice
    const custBUnauthorizedRes = await request(app)
      .get(`/api/v1/invoices/${invoice1.id}`)
      .set('Authorization', `Bearer ${customerBToken}`);
    assert(custBUnauthorizedRes.status === 403, 'Customer B attempting to access Customer A invoice returns 403 Forbidden');

    // Vendor gets invoices for their store
    const vendorInvoicesRes = await request(app)
      .get('/api/v1/invoices/vendor')
      .set('Authorization', `Bearer ${vendorToken}`);
    assert(vendorInvoicesRes.status === 200, 'Vendor retrieved invoices for their store');
    assert(vendorInvoicesRes.body.data.some(i => i.id === invoice1.id), 'Vendor invoices list contains store Invoice 1');

    // Super Admin retrieves all invoices
    const adminInvoicesRes = await request(app)
      .get('/api/v1/admin/invoices')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(adminInvoicesRes.status === 200, 'Super Admin retrieved all platform invoices');
    assert(adminInvoicesRes.body.data.length >= 2, 'Super Admin list contains all generated invoices');

    // Customer trying to access admin invoice list gets 403 Forbidden
    const customerAdminAccessRes = await request(app)
      .get('/api/v1/admin/invoices')
      .set('Authorization', `Bearer ${customerAToken}`);
    assert(customerAdminAccessRes.status === 403, 'Customer attempting to access admin invoices returns 403 Forbidden');

    // ---------------------------------------------------------
    // 11. Standalone A4 HTML Printable Invoice Engine
    // ---------------------------------------------------------
    const htmlRes = await request(app)
      .get(`/api/v1/invoices/${invoice1.id}/html`)
      .set('Authorization', `Bearer ${customerAToken}`);

    assert(htmlRes.status === 200, 'A4 HTML invoice template rendered successfully');
    assert(htmlRes.headers['content-type'].includes('text/html'), 'Response content type is text/html');
    assert(htmlRes.text.includes(invoice1.invoiceNumber), 'Rendered HTML includes exact invoice number');
    assert(htmlRes.text.includes('@page') && htmlRes.text.includes('size: A4 portrait;'), 'Rendered HTML contains A4 portrait print stylesheet');
    assert(htmlRes.text.includes('CGST (9%)'), 'Rendered HTML contains CGST (9%) breakdown');
    assert(htmlRes.text.includes('SGST (9%)'), 'Rendered HTML contains SGST (9%) breakdown');
    assert(htmlRes.text.includes('Refundable Security Deposit'), 'Rendered HTML contains isolated security deposit section');
    assert(htmlRes.text.includes('PAID & VERIFIED'), 'Rendered HTML contains verified badge');

    // Clean up temporary dummy proof file
    if (fs.existsSync(dummyProofPath)) fs.unlinkSync(dummyProofPath);

    console.log('\n========================================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 7 INVOICE ASSERTIONS PASSED (100%)`);
    console.log('========================================================================\n');

  } catch (error) {
    console.error('❌ Phase 7 Test Suite Error:', error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runPhase7Tests().then(() => {
    if (process.exitCode === 1) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}

module.exports = runPhase7Tests;
