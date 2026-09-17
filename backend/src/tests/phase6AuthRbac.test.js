/**
 * Phase 6 Complete Authentication, Registration & Authorization Test Suite
 * Validates RBAC boundaries, ownership protection, token lifecycle, security controls,
 * and privilege escalation prevention.
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../app');
const { sequelize, User, Role, UserRole, CustomerProfile, VendorProfile, RefreshToken, PasswordResetToken, Product, Booking, Order, AuditLog } = require('../models');
const env = require('../config/env');
const { ROLES } = require('../config/constants');
const TokenService = require('../services/token.service');

async function runPhase6Tests() {
  console.log('========================================================================');
  console.log('🛡️  Rentora Phase 6: Complete Authentication & Global RBAC Suite');
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
  const customerAEmail = `cust.alpha.${timestamp}@testrentora.in`;
  const customerBEmail = `cust.beta.${timestamp}@testrentora.in`;
  const vendorAEmail = `vendor.alpha.${timestamp}@testrentora.in`;
  const vendorBEmail = `vendor.beta.${timestamp}@testrentora.in`;
  const adminEmail = env.SEED_CONFIG.ADMIN_EMAIL;
  const adminPassword = env.SEED_CONFIG.ADMIN_PASSWORD;
  const standardPassword = 'TestPassword2026!';

  let customerAToken = '';
  let customerAId = '';
  let customerBToken = '';
  let customerBId = '';
  let vendorAToken = '';
  let vendorAId = '';
  let vendorAProfileId = '';
  let vendorBToken = '';
  let vendorBId = '';
  let vendorBProfileId = '';
  let adminToken = '';
  let adminId = '';

  let bookingAId = '';
  let productAId = '';

  try {
    // -------------------------------------------------------------
    // SECTION 1: Customer Registration & Login
    // -------------------------------------------------------------
    console.log('--- SECTION 1: Customer Registration & Login ---');

    // 1. Customer registration success
    const custARegRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Alpha Customer',
        email: customerAEmail,
        phone: '+91 98251 00001',
        password: standardPassword,
        role: 'customer',
        city: 'Ahmedabad'
      });

    assert(custARegRes.status === 201 && custARegRes.body.success, '1. Customer registration succeeds with HTTP 201');
    customerAId = custARegRes.body.data.user.id;
    customerAToken = custARegRes.body.data.accessToken;

    // 2. Customer login success
    const custALoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: customerAEmail,
        password: standardPassword
      });

    assert(custALoginRes.status === 200 && custALoginRes.body.data.roles.includes('CUSTOMER'), '2. Customer login succeeds and returns CUSTOMER role');
    customerAToken = custALoginRes.body.data.accessToken;

    // Register Customer B for ownership tests
    const custBRegRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Beta Customer',
        email: customerBEmail,
        phone: '+91 98251 00002',
        password: standardPassword,
        role: 'customer',
        city: 'Surat'
      });
    customerBId = custBRegRes.body.data.user.id;
    customerBToken = custBRegRes.body.data.accessToken;

    // -------------------------------------------------------------
    // SECTION 2: Vendor Registration & Login
    // -------------------------------------------------------------
    console.log('\n--- SECTION 2: Vendor Registration & Login ---');

    // 3. Vendor registration success
    const vendARegRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ownerName: 'Alpha Vendor Owner',
        shopName: 'Alpha Camera Rentals',
        email: vendorAEmail,
        phone: '+91 98252 00001',
        password: standardPassword,
        category: 'Cameras & Photography',
        city: 'Ahmedabad',
        role: 'vendor'
      });

    assert(vendARegRes.status === 201 && vendARegRes.body.data.roles.includes('VENDOR'), '3. Vendor registration succeeds with HTTP 201 and VENDOR role');
    vendorAId = vendARegRes.body.data.user.id;
    vendorAProfileId = vendARegRes.body.data.vendorProfile.id;
    vendorAToken = vendARegRes.body.data.accessToken;

    // 4. Vendor login success
    const vendALoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: vendorAEmail,
        password: standardPassword
      });

    assert(vendALoginRes.status === 200 && vendALoginRes.body.data.roles.includes('VENDOR'), '4. Vendor login succeeds with HTTP 200');
    vendorAToken = vendALoginRes.body.data.accessToken;

    // Register Vendor B for store ownership tests
    const vendBRegRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ownerName: 'Beta Vendor Owner',
        shopName: 'Beta Equipment Rentals',
        email: vendorBEmail,
        phone: '+91 98252 00002',
        password: standardPassword,
        category: 'Electronics & Gaming',
        city: 'Vadodara',
        role: 'vendor'
      });
    vendorBId = vendBRegRes.body.data.user.id;
    vendorBProfileId = vendBRegRes.body.data.vendorProfile.id;
    vendorBToken = vendBRegRes.body.data.accessToken;

    // -------------------------------------------------------------
    // SECTION 3: Super Admin Direct Login (Environment-Based)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 3: Super Admin Direct Login ---');

    // 5. Super Admin direct login success
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword
      });

    assert(adminLoginRes.status === 200 && adminLoginRes.body.data.roles.includes('SUPER_ADMIN'), '5. Super Admin direct login succeeds using environment credentials');
    adminId = adminLoginRes.body.data.user.id;
    adminToken = adminLoginRes.body.data.accessToken;

    // Approve Vendor A & B so they can create products
    await VendorProfile.update({ verificationStatus: 'Approved' }, { where: { id: [vendorAProfileId, vendorBProfileId] } });

    // -------------------------------------------------------------
    // SECTION 4: Duplicate Email & Credential Validation
    // -------------------------------------------------------------
    console.log('\n--- SECTION 4: Duplicate Email & Credential Validation ---');

    // 6. Customer duplicate email rejection
    const dupCustRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Duplicate User',
        email: customerAEmail,
        password: standardPassword,
        role: 'customer'
      });

    assert(dupCustRes.status === 409, '6. Customer duplicate email is rejected with HTTP 409 Conflict');

    // 7. Vendor duplicate email rejection
    const dupVendRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ownerName: 'Duplicate Vendor',
        shopName: 'Duplicate Store',
        email: vendorAEmail,
        password: standardPassword,
        role: 'vendor'
      });

    assert(dupVendRes.status === 409, '7. Vendor duplicate email is rejected with HTTP 409 Conflict');

    // 8. Invalid password rejection
    const invalidPwRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: customerAEmail,
        password: 'IncorrectPassword999!'
      });

    assert(invalidPwRes.status === 401 && invalidPwRes.body.message.includes('Invalid email or password'), '8. Invalid password is rejected with HTTP 401');

    // -------------------------------------------------------------
    // SECTION 5: Token Validation (Missing & Expired)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 5: Token Validation ---');

    // 9. Missing authentication token rejection
    const missingTokenRes = await request(app)
      .get('/api/v1/auth/me');

    assert(missingTokenRes.status === 401, '9. Missing token returns HTTP 401');

    // 10. Expired token rejection
    const expiredToken = jwt.sign(
      { id: customerAId, email: customerAEmail, roles: ['CUSTOMER'] },
      env.JWT.SECRET,
      { expiresIn: '-1s' }
    );

    const expiredTokenRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    assert(expiredTokenRes.status === 401, '10. Expired JWT access token returns HTTP 401');

    // -------------------------------------------------------------
    // SECTION 6: Cross-Role RBAC Boundary Enforcement
    // -------------------------------------------------------------
    console.log('\n--- SECTION 6: Cross-Role RBAC Boundary Enforcement ---');

    // 11. Customer blocked from Vendor routes
    const custToVendorRes = await request(app)
      .post('/api/v1/vendor/products')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({ name: 'Hacked Product', categoryId: 'cameras' });

    assert(custToVendorRes.status === 403, '11. Customer is strictly blocked from Vendor product creation (HTTP 403)');

    // 12. Customer blocked from Super Admin routes
    const custToAdminRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${customerAToken}`);

    assert(custToAdminRes.status === 403, '12. Customer is strictly blocked from Super Admin user management (HTTP 403)');

    // 13. Vendor blocked from Customer-private routes
    const vendToCustRes = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${vendorAToken}`);

    assert(vendToCustRes.status === 403, '13. Vendor is strictly blocked from Customer bookings endpoint (HTTP 403)');

    // 14. Vendor blocked from Super Admin routes
    const vendToAdminRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${vendorAToken}`);

    assert(vendToAdminRes.status === 403, '14. Vendor is strictly blocked from Super Admin audit logs (HTTP 403)');

    // 15. Super Admin access to admin routes
    const adminAccessRes = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(adminAccessRes.status === 200 && adminAccessRes.body.success, '15. Super Admin successfully accesses administrative management APIs (HTTP 200)');

    // -------------------------------------------------------------
    // SECTION 7: Ownership Protection (Customer & Vendor)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 7: Ownership Protection ---');

    // Vendor A creates a product
    const prodRes = await request(app)
      .post('/api/v1/vendor/products')
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({
        name: `Sony FX3 Cinema Rig ${timestamp}`,
        categoryId: 'cameras',
        pricePerHour: 100,
        pricePerDay: 2000,
        pricePerWeek: 10000,
        pricePerMonth: 35000,
        securityDeposit: 5000,
        stock: 3
      });
    productAId = prodRes.body.data?.id || prodRes.body.data?.product?.id;

    // Super Admin approves product
    await request(app)
      .patch(`/api/v1/admin/products/${productAId}/approval`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ approvalStatus: 'Approved' });

    // Customer A books Product A
    const bookingRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        items: [{ productId: productAId, quantity: 1 }],
        startDate: '2026-12-01',
        endDate: '2026-12-05',
        deliveryType: 'store_pickup',
        durationMode: 'day'
      });
    bookingAId = bookingRes.body.data?.id || bookingRes.body.data?.booking?.id;

    // 16. Customer ownership protection: Customer B cannot view Customer A's booking
    const custBOwnershipRes = await request(app)
      .get(`/api/v1/bookings/${bookingAId}`)
      .set('Authorization', `Bearer ${customerBToken}`);

    assert(custBOwnershipRes.status === 403, '16. Customer B is blocked from viewing Customer A booking (HTTP 403)');

    // 17. Vendor ownership protection: Vendor B cannot modify Vendor A's product
    const vendBOwnershipRes = await request(app)
      .put(`/api/v1/vendor/products/${productAId}`)
      .set('Authorization', `Bearer ${vendorBToken}`)
      .send({ name: 'Tampered Name', pricePerDay: 50 });

    assert(vendBOwnershipRes.status === 403, '17. Vendor B is blocked from modifying Vendor A product (HTTP 403)');

    // -------------------------------------------------------------
    // SECTION 8: Security & Sanitization
    // -------------------------------------------------------------
    console.log('\n--- SECTION 8: Security, Sanitization & Privilege Escalation ---');

    // 18. Role escalation prevention: Register with SUPER_ADMIN is rejected
    const escalateRegRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Hacker Admin',
        email: `hacker.${timestamp}@testrentora.in`,
        password: standardPassword,
        role: 'SUPER_ADMIN'
      });

    assert(escalateRegRes.status === 400 && escalateRegRes.body.errors.role, '18. Public registration with role SUPER_ADMIN is rejected with HTTP 400');

    // 19. Password hash not returned in API responses
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerAToken}`);

    const hasNoHash = meRes.body.data.user.passwordHash === undefined && meRes.body.data.user.password === undefined;
    assert(hasNoHash, '19. Password hash is strictly sanitized and never exposed in API responses');

    // 20. Logout/session invalidation behavior
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${customerAToken}`);

    assert(logoutRes.status === 200 && logoutRes.body.success, '20. Logout revokes active session and returns HTTP 200');

    // 21. Account lockout after 5 failed login attempts
    const lockEmail = `lockout.${timestamp}@testrentora.in`;
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Lockout Target',
      email: lockEmail,
      password: standardPassword,
      role: 'customer'
    });

    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/v1/auth/login').send({ email: lockEmail, password: 'WrongPassword!' });
    }

    const lockedRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: lockEmail, password: standardPassword });

    assert(lockedRes.status === 423 && (lockedRes.body.errors?.locked === true || lockedRes.body.data?.locked === true), '21. 5 consecutive failed attempts locks account with HTTP 423 Locked');

    // 22. Password reset token single-use verification
    const userToReset = await User.findOne({ where: { email: customerAEmail } });
    const rawResetToken = await TokenService.createPasswordResetToken(userToReset.id);

    const firstResetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: rawResetToken, newPassword: 'BrandNewPassword2026!' });

    const secondResetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: rawResetToken, newPassword: 'BrandNewPassword2026!' });

    assert(firstResetRes.status === 200 && secondResetRes.status === 400, '22. Password reset token is strictly single-use; second attempt returns HTTP 400');

    // 23. Refresh token reuse detection & session revocation
    const tokensUser = await User.findOne({ where: { email: customerBEmail } });
    const pair1 = await TokenService.generateTokens(tokensUser, ['CUSTOMER'], '127.0.0.1', 'Jest');
    
    // Normal rotation
    const pair2 = await TokenService.rotateRefreshToken(pair1.refreshToken, '127.0.0.1', 'Jest');
    
    // Replay attack with pair1.refreshToken
    let replayErrorTriggered = false;
    try {
      await TokenService.rotateRefreshToken(pair1.refreshToken, '127.0.0.1', 'Jest');
    } catch (err) {
      replayErrorTriggered = err.statusCode === 401;
    }

    const activeTokens = await RefreshToken.count({ where: { userId: tokensUser.id, isRevoked: false } });
    assert(replayErrorTriggered && activeTokens === 0, '23. Replay attack with consumed refresh token triggers theft detection and revokes 100% of user sessions');

  } catch (error) {
    console.error('❌ Test suite execution error:', error);
    process.exitCode = 1;
  }

  console.log('\n========================================================================');
  console.log(`📊 Phase 6 Test Summary: ${passedTests} / 23 tests PASSED (${Math.round((passedTests / 23) * 100)}%)`);
  console.log('========================================================================\n');

  if (passedTests === 23) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase6Tests();
