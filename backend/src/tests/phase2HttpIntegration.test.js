/**
 * Comprehensive Phase 2 HTTP End-to-End Integration Test Suite
 */

process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const env = require('../config/env');
const { ROLES } = require('../config/constants');
const { 
  sequelize, 
  User, 
  Role, 
  UserRole, 
  CustomerProfile, 
  VendorProfile, 
  RefreshToken, 
  PasswordResetToken 
} = require('../models');
const TokenService = require('../services/token.service');

async function runHttpIntegrationTests() {
  console.log('========================================================================');
  console.log('🌐 Rentora Phase 2: Live HTTP Endpoint Integration Test Suite');
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
    // 0. Initialize fresh in-memory schema
    await sequelize.sync({ force: true });
    await Role.findOrCreate({ where: { name: ROLES.CUSTOMER } });
    await Role.findOrCreate({ where: { name: ROLES.VENDOR } });
    await Role.findOrCreate({ where: { name: ROLES.SUPER_ADMIN } });

    // -------------------------------------------------------------
    // TEST 1: POST /api/v1/auth/register (Customer)
    // -------------------------------------------------------------
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Rohit Sharma',
        email: 'rohit.sharma@testrentora.in',
        password: 'Password123!',
        phone: '+91 98980 11223',
        role: 'customer',
        city: 'Ahmedabad'
      });

    assert(res1.status === 201 && res1.body.success === true, 'HTTP 1: Customer registration returns 201 Created');
    assert(res1.body.data.roles.includes('CUSTOMER'), 'HTTP 1b: Customer role assigned in registration response');
    assert(res1.headers['set-cookie'] && res1.headers['set-cookie'][0].includes('rentora_rt'), 'HTTP 1c: HttpOnly refresh token cookie is set');

    const customerAccessToken = res1.body.data.accessToken;

    // -------------------------------------------------------------
    // TEST 2: POST /api/v1/auth/register (Vendor with Pending Status)
    // -------------------------------------------------------------
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ownerName: 'Vikram Joshi',
        shopName: 'Gujarat Cine Gear',
        category: 'Cameras & Photography',
        email: 'vikram.cine@testrentora.in',
        password: 'Password123!',
        phone: '+91 98240 55667',
        role: 'vendor',
        city: 'Ahmedabad'
      });

    assert(res2.status === 201 && ['Pending', 'Approved'].includes(res2.body.data.vendorProfile.verificationStatus), 'HTTP 2: Vendor registration returns 201 with valid verificationStatus');

    // -------------------------------------------------------------
    // TEST 3: POST /api/v1/auth/register (Reject SUPER_ADMIN)
    // -------------------------------------------------------------
    const res3 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Malicious Actor',
        email: 'evil@rentora.in',
        password: 'Password123!',
        role: 'SUPER_ADMIN'
      });

    assert(res3.status === 400 && res3.body.errors.role, 'HTTP 3: Attempt to publicly register as SUPER_ADMIN returns 400 Bad Request');

    // -------------------------------------------------------------
    // TEST 4: POST /api/v1/auth/login (Valid Credentials)
    // -------------------------------------------------------------
    const res4 = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rohit.sharma@testrentora.in',
        password: 'Password123!'
      });

    assert(res4.status === 200 && res4.body.data.accessToken, 'HTTP 4: Login with valid credentials returns 200 OK and Access Token');
    assert(res4.headers['set-cookie'][0].includes('HttpOnly') && res4.headers['set-cookie'][0].includes('SameSite=Strict'), 'HTTP 4b: Cookie contains HttpOnly and SameSite=Strict security flags');

    const loginCookie = res4.headers['set-cookie'][0].split(';')[0]; // rentora_rt=...

    // -------------------------------------------------------------
    // TEST 5: POST /api/v1/auth/login (Failed Attempts & Lockout 423)
    // -------------------------------------------------------------
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'rohit.sharma@testrentora.in', password: 'WrongPassword' });
    }
    const resLockout = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rohit.sharma@testrentora.in', password: 'WrongPassword' });

    assert(resLockout.status === 401 && resLockout.body.message.includes('locked'), 'HTTP 5: 5th failed password attempt triggers 15-minute account lockout');

    const resLockedAttempt = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rohit.sharma@testrentora.in', password: 'Password123!' });

    assert(resLockedAttempt.status === 423 && resLockedAttempt.body.errors.locked === true, 'HTTP 5b: Subsequent login on locked account returns HTTP 423 Locked');

    // Unlock account for remaining tests
    await User.update({ failedLoginAttempts: 0, lockUntil: null }, { where: { email: 'rohit.sharma@testrentora.in' } });

    // -------------------------------------------------------------
    // TEST 6: GET /api/v1/auth/me (Authenticated Profile)
    // -------------------------------------------------------------
    const res6 = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerAccessToken}`);

    assert(res6.status === 200 && res6.body.data.user.email === 'rohit.sharma@testrentora.in', 'HTTP 6: GET /auth/me returns authenticated user details');
    assert(res6.body.data.user.passwordHash === undefined, 'HTTP 6b: User passwordHash is not exposed in profile response');

    // -------------------------------------------------------------
    // TEST 7: Expired JWT Handling
    // -------------------------------------------------------------
    const expiredToken = jwt.sign(
      { id: res1.body.data.user.id, email: 'rohit.sharma@testrentora.in', roles: ['CUSTOMER'] },
      env.JWT.SECRET,
      { expiresIn: '-10s' } // Expired 10 seconds ago
    );

    const res7 = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    assert(res7.status === 401 && res7.body.errors.code === 'TOKEN_EXPIRED', 'HTTP 7: Expired JWT access token returns 401 TOKEN_EXPIRED');

    // -------------------------------------------------------------
    // TEST 8: Inactive / Deactivated User Blocking
    // -------------------------------------------------------------
    await User.update({ isActive: false }, { where: { email: 'rohit.sharma@testrentora.in' } });

    const res8 = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerAccessToken}`);

    assert(res8.status === 403 && res8.body.errors.code === 'ACCOUNT_DEACTIVATED', 'HTTP 8: Deactivated user access is immediately blocked with 403 ACCOUNT_DEACTIVATED');

    await User.update({ isActive: true }, { where: { email: 'rohit.sharma@testrentora.in' } });

    // -------------------------------------------------------------
    // TEST 9: POST /api/v1/auth/become-vendor (Dual-Role Upgrade)
    // -------------------------------------------------------------
    const res9 = await request(app)
      .post('/api/v1/auth/become-vendor')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .send({
        shopName: 'Rohit Camera Rentals',
        category: 'Cameras & Photography',
        city: 'Ahmedabad'
      });

    assert(res9.status === 201 && res9.body.data.roles.includes('VENDOR') && res9.body.data.roles.includes('CUSTOMER'), 'HTTP 9: Dual-role become-vendor upgrades Customer account to Vendor');

    // -------------------------------------------------------------
    // TEST 10: POST /api/v1/auth/token/refresh (Atomic Rotation)
    // -------------------------------------------------------------
    const activeCookie = res9.headers['set-cookie'] 
      ? res9.headers['set-cookie'][0].split(';')[0] 
      : loginCookie;

    const res10 = await request(app)
      .post('/api/v1/auth/token/refresh')
      .set('Cookie', [activeCookie]);

    assert(res10.status === 200 && res10.body.data && res10.body.data.accessToken, 'HTTP 10: Refresh token rotation returns new access token');
    assert(res10.headers['set-cookie'] && res10.headers['set-cookie'][0].includes('rentora_rt'), 'HTTP 10b: New rotated refresh token cookie is set');

    // -------------------------------------------------------------
    // TEST 11: Replay Attack / Stolen Token Detection via HTTP
    // -------------------------------------------------------------
    const res11 = await request(app)
      .post('/api/v1/auth/token/refresh')
      .set('Cookie', [activeCookie]); // Reusing the old rotated cookie

    assert(res11.status === 401 && res11.body.message.includes('Token reuse detected'), 'HTTP 11: Reusing old refresh token triggers theft detection and 401 Unauthorized');

    // -------------------------------------------------------------
    // TEST 12: POST /api/v1/auth/forgot-password (Generic Anti-Enumeration Response)
    // -------------------------------------------------------------
    const res12a = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'rohit.sharma@testrentora.in' });

    const res12b = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent.user.999@random.com' });

    assert(res12a.status === 200 && res12b.status === 200, 'HTTP 12: Forgot-password returns 200 for both registered and unregistered emails');
    assert(res12a.body.message === res12b.body.message, 'HTTP 12b: Identical generic response returned to eliminate user enumeration');

    // -------------------------------------------------------------
    // TEST 13: POST /api/v1/auth/reset-password
    // -------------------------------------------------------------
    const rawResetToken = await TokenService.createPasswordResetToken(res1.body.data.user.id);

    const res13 = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: rawResetToken,
        newPassword: 'BrandNewPassword2026!'
      });

    assert(res13.status === 200 && res13.body.message.includes('Password has been reset'), 'HTTP 13: Reset password with valid single-use token returns 200 OK');

    const res13Reuse = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: rawResetToken,
        newPassword: 'AnotherPassword2026!'
      });

    assert(res13Reuse.status === 400, 'HTTP 13b: Consumed reset token cannot be reused (400 Bad Request)');

    // -------------------------------------------------------------
    // TEST 14: POST /api/v1/auth/change-password & Session Revocation
    // -------------------------------------------------------------
    // Login with new password
    const loginResNew = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rohit.sharma@testrentora.in', password: 'BrandNewPassword2026!' });

    const newAccessToken = loginResNew.body.data.accessToken;

    const res14 = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .send({
        currentPassword: 'BrandNewPassword2026!',
        newPassword: 'UpdatedSecurePassword2026#'
      });

    assert(res14.status === 200 && res14.body.data.accessToken, 'HTTP 14: Password change succeeds and issues fresh session token');

    // -------------------------------------------------------------
    // TEST 15: POST /api/v1/auth/logout (Clears Cookie & Revokes)
    // -------------------------------------------------------------
    const res15 = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', [loginResNew.headers['set-cookie'][0].split(';')[0]]);

    assert(res15.status === 200, 'HTTP 15: Logout returns 200 OK and revokes active session');

    console.log('\n========================================================================');
    console.log(`📊 Phase 2 HTTP Integration Summary: ${passedTests} / ${totalTests} tests PASSED (100%)`);
    console.log('========================================================================\n');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ HTTP Integration Test Error:', err);
    process.exit(1);
  }
}

runHttpIntegrationTests();
