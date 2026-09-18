const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  sequelize, 
  User, 
  Role, 
  UserRole, 
  CustomerProfile, 
  VendorProfile, 
  AuditLog 
} = require('../models');
const TokenService = require('../services/token.service');
const ApiResponse = require('../utils/apiResponse');
const env = require('../config/env');
const { ROLES } = require('../config/constants');
const {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validatePasswordChange,
  validateBecomeVendor
} = require('../validations/auth.validation');

// Helper to set secure HttpOnly refresh token cookie
function setRefreshTokenCookie(res, refreshToken) {
  res.cookie('rentora_rt', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth'
  });
}

// Helper to clear refresh token cookie
function clearRefreshTokenCookie(res) {
  res.clearCookie('rentora_rt', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/api/v1/auth'
  });
}

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  static async register(req, res) {
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const { email, password, fullName, ownerName, shopName, category, city, phone } = req.body;
    const normalizedRole = validation.normalizedRole;

    const t = await sequelize.transaction();

    try {
      // Check existing email
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() }, transaction: t });
      if (existingUser) {
        await t.rollback();
        return ApiResponse.error(res, 'Email address is already registered', { email: 'Email already exists' }, 409);
      }

      // Hash password (12 rounds)
      const passwordHash = await bcrypt.hash(password, 12);

      // Create User
      const user = await User.create({
        fullName: normalizedRole === 'VENDOR' ? (ownerName || fullName) : fullName,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
        isActive: true,
        isVerified: false,
        mustChangePassword: false
      }, { transaction: t });

      // Find Role
      const roleRecord = await Role.findOne({ where: { name: normalizedRole }, transaction: t });
      if (!roleRecord) {
        await t.rollback();
        return ApiResponse.error(res, 'Role not initialized in database', null, 500);
      }

      await UserRole.create({ userId: user.id, roleId: roleRecord.id }, { transaction: t });

      let customerProfile = null;
      let vendorProfile = null;

      if (normalizedRole === 'CUSTOMER') {
        customerProfile = await CustomerProfile.create({
          userId: user.id,
          city: city || 'Ahmedabad',
          kycStatus: 'Pending',
          kycBadge: 'Standard Member',
          trustScore: 100
        }, { transaction: t });
      } else if (normalizedRole === 'VENDOR') {
        vendorProfile = await VendorProfile.create({
          userId: user.id,
          businessName: shopName,
          businessCategory: category || 'General',
          city: city || 'Ahmedabad',
          businessPhone: phone || null,
          businessEmail: email.toLowerCase(),
          verificationStatus: 'Approved',
          commissionRate: 10.00
        }, { transaction: t });
      }

      await t.commit();

      // Issue Access & Refresh Tokens
      const tokenResult = await TokenService.generateTokens(
        user,
        [normalizedRole],
        req.ip,
        req.headers['user-agent']
      );

      setRefreshTokenCookie(res, tokenResult.refreshToken);

      return ApiResponse.success(res, `${normalizedRole === 'VENDOR' ? 'Vendor store' : 'Customer account'} registered successfully`, {
        user: user.toJSON(),
        roles: [normalizedRole],
        customerProfile,
        vendorProfile,
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken
      }, 201);

    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error('[Register Error]:', error);
      return ApiResponse.error(res, 'Registration failed due to internal error', error.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  static async login(req, res) {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() },
        include: [
          { model: Role, as: 'roles' },
          { model: CustomerProfile, as: 'customerProfile' },
          { model: VendorProfile, as: 'vendorProfile' }
        ]
      });

      // User not found
      if (!user) {
        return ApiResponse.error(res, 'Invalid email or password', null, 401);
      }

      // Check Account Lockout
      if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
        return ApiResponse.error(res, `Account is temporarily locked due to excessive failed attempts. Try again in ${remainingMinutes} minute(s).`, {
          locked: true,
          remainingMinutes
        }, 423);
      }

      // Check if account is active
      if (!user.isActive) {
        return ApiResponse.error(res, 'This account has been deactivated. Please contact support.', null, 403);
      }

      // Verify Password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        // Increment failed attempts
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
        }
        await user.save();

        const attemptsLeft = Math.max(0, 5 - user.failedLoginAttempts);
        return ApiResponse.error(res, `Invalid email or password.${attemptsLeft > 0 ? ` ${attemptsLeft} attempt(s) remaining before lockout.` : ' Account locked for 15 minutes.'}`, null, 401);
      }

      // Password Valid: Reset failed attempts & update last login
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      user.lastLoginAt = new Date();
      await user.save();

      // Extract Active Roles
      const activeRoles = (user.roles || [])
        .filter((r) => (r.UserRole ? r.UserRole.isActive !== false : true))
        .map((r) => r.name);

      // Issue Token Pair
      const tokenResult = await TokenService.generateTokens(
        user,
        activeRoles,
        req.ip,
        req.headers['user-agent']
      );

      setRefreshTokenCookie(res, tokenResult.refreshToken);

      return ApiResponse.success(res, 'Logged in successfully', {
        user: user.toJSON(),
        roles: activeRoles,
        customerProfile: user.customerProfile,
        vendorProfile: user.vendorProfile,
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken,
        mustChangePassword: user.mustChangePassword
      });

    } catch (error) {
      console.error('[Login Error]:', error);
      return ApiResponse.error(res, 'Login failed', error.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/token/refresh
   */
  static async refreshToken(req, res) {
    try {
      const rawRefreshToken = req.cookies.rentora_rt || req.body.refreshToken;

      if (!rawRefreshToken) {
        return ApiResponse.error(res, 'Refresh token is required', null, 400);
      }

      // Atomically rotate token
      const rotationResult = await TokenService.rotateRefreshToken(
        rawRefreshToken,
        req.ip,
        req.headers['user-agent']
      );

      // Fetch User & active roles
      const user = await User.findByPk(rotationResult.userId, {
        include: [{ model: Role, as: 'roles' }]
      });

      if (!user || !user.isActive) {
        clearRefreshTokenCookie(res);
        return ApiResponse.error(res, 'User account is inactive', null, 401);
      }

      const activeRoles = (user.roles || []).map((r) => r.name);

      // Sign new 15-minute Access Token
      const accessToken = jwt.sign({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: activeRoles,
        mustChangePassword: user.mustChangePassword
      }, env.JWT.SECRET, { expiresIn: env.JWT.EXPIRES_IN });

      setRefreshTokenCookie(res, rotationResult.newRefreshToken);

      return ApiResponse.success(res, 'Token refreshed successfully', {
        accessToken,
        refreshToken: rotationResult.newRefreshToken
      });

    } catch (error) {
      clearRefreshTokenCookie(res);
      const statusCode = error.statusCode || 401;
      return ApiResponse.error(res, error.message || 'Token refresh failed', null, statusCode);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  static async logout(req, res) {
    try {
      const rawRefreshToken = req.cookies.rentora_rt || req.body.refreshToken;
      if (rawRefreshToken) {
        await TokenService.revokeRefreshToken(rawRefreshToken);
      }
      clearRefreshTokenCookie(res);
      return ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      clearRefreshTokenCookie(res);
      return ApiResponse.error(res, 'Logout failed', error.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/logout-all
   */
  static async logoutAll(req, res) {
    try {
      if (req.user) {
        await TokenService.revokeAllUserTokens(req.user.id);
      }
      clearRefreshTokenCookie(res);
      return ApiResponse.success(res, 'All active sessions have been revoked successfully');
    } catch (error) {
      clearRefreshTokenCookie(res);
      return ApiResponse.error(res, 'Logout all failed', error.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  static async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return ApiResponse.error(res, 'Email is required', { email: 'Email is required' }, 400);
    }

    try {
      const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

      if (user && user.isActive) {
        const rawResetToken = await TokenService.createPasswordResetToken(user.id);
        // Note: In production, dispatch email here. In development, return debug payload if needed.
        console.log(`[AUTH] Password reset requested for: ${user.email} -> Token: ${rawResetToken}`);
      } else {
        // Constant-time execution to prevent timing attacks
        await bcrypt.hash('dummy_side_channel_protection_password', 12);
      }

      // Generic response for privacy / anti-enumeration
      return ApiResponse.success(res, 'If that email address is registered with Rentora, a password reset link has been dispatched.', null);

    } catch (error) {
      console.error('[Forgot Password Error]:', error);
      return ApiResponse.error(res, 'Failed to process password reset request', error.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  static async resetPassword(req, res) {
    const validation = validatePasswordReset(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const { token, newPassword } = req.body;

    try {
      const tokenRecord = await TokenService.verifyPasswordResetToken(token);

      if (!tokenRecord) {
        return ApiResponse.error(res, 'Invalid or expired password reset token', null, 400);
      }

      const user = await User.findByPk(tokenRecord.userId);
      if (!user) {
        return ApiResponse.error(res, 'User account not found', null, 404);
      }

      // Hash new password
      user.passwordHash = await bcrypt.hash(newPassword, 12);
      user.mustChangePassword = false;
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      // Invalidate the reset token
      await TokenService.consumePasswordResetToken(tokenRecord.id);

      // Invalidate ALL existing refresh tokens for security
      await TokenService.revokeAllUserTokens(user.id);
      clearRefreshTokenCookie(res);

      return ApiResponse.success(res, 'Password has been reset successfully. Please log in with your new credentials.');

    } catch (error) {
      console.error('[Reset Password Error]:', error);
      return ApiResponse.error(res, 'Password reset failed', error.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/change-password
   */
  static async changePassword(req, res) {
    const validation = validatePasswordChange(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    try {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return ApiResponse.error(res, 'Current password does not match', { currentPassword: 'Incorrect password' }, 400);
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      user.mustChangePassword = false;
      await user.save();

      // Revoke all existing sessions
      await TokenService.revokeAllUserTokens(user.id);

      // Issue single fresh token pair for current session
      const tokenResult = await TokenService.generateTokens(
        user,
        req.roles,
        req.ip,
        req.headers['user-agent']
      );

      setRefreshTokenCookie(res, tokenResult.refreshToken);

      return ApiResponse.success(res, 'Password changed successfully', {
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken
      });

    } catch (error) {
      console.error('[Change Password Error]:', error);
      return ApiResponse.error(res, 'Failed to change password', error.message, 500);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  static async getMe(req, res) {
    try {
      return ApiResponse.success(res, 'User profile retrieved successfully', {
        user: req.user.toJSON(),
        roles: req.roles,
        customerProfile: req.customerProfile,
        vendorProfile: req.vendorProfile
      });
    } catch (error) {
      return ApiResponse.error(res, 'Failed to fetch user profile', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/auth/profile
   */
  static async updateProfile(req, res) {
    const {
      fullName,
      phone,
      avatarUrl,
      // Vendor fields
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      city,
      state,
      gstNumber,
      website,
      workingHours,
      description,
      upiId,
      qrCodeUrl,
      bankAccount,
      // Customer fields
      address,
      pincode,
      refundUpi
    } = req.body;

    const user = req.user;

    try {
      if (fullName && fullName.trim()) user.fullName = fullName.trim();
      if (phone !== undefined) user.phone = phone;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      await user.save();

      let updatedVendorProfile = null;
      let updatedCustomerProfile = null;

      // Handle Vendor Profile Update
      const vendorProfile = await VendorProfile.findOne({ where: { userId: user.id } });
      if (vendorProfile) {
        if (businessName) vendorProfile.businessName = businessName;
        if (businessAddress !== undefined) vendorProfile.businessAddress = businessAddress;
        if (businessPhone !== undefined) vendorProfile.businessPhone = businessPhone;
        if (businessEmail !== undefined) vendorProfile.businessEmail = businessEmail;
        if (city) vendorProfile.city = city;
        if (state) vendorProfile.state = state;
        if (gstNumber !== undefined) vendorProfile.gstNumber = gstNumber;
        if (website !== undefined) vendorProfile.website = website;
        if (workingHours !== undefined) vendorProfile.workingHours = workingHours;
        if (description !== undefined) vendorProfile.description = description;

        if (upiId || qrCodeUrl || bankAccount) {
          const currentBank = vendorProfile.bankAccountMasked || {};
          vendorProfile.bankAccountMasked = {
            ...currentBank,
            ...(upiId !== undefined ? { upiId } : {}),
            ...(qrCodeUrl !== undefined ? { qrCodeUrl } : {}),
            ...(bankAccount !== undefined ? { bankAccount } : {})
          };
        }
        await vendorProfile.save();
        updatedVendorProfile = vendorProfile;
      }

      // Handle Customer Profile Update
      const customerProfile = await CustomerProfile.findOne({ where: { userId: user.id } });
      if (customerProfile) {
        if (address !== undefined) customerProfile.address = address;
        if (city) customerProfile.city = city;
        if (state) customerProfile.state = state;
        if (pincode !== undefined) customerProfile.pincode = pincode;
        if (refundUpi !== undefined) customerProfile.refundUpi = refundUpi;
        await customerProfile.save();
        updatedCustomerProfile = customerProfile;
      }

      return ApiResponse.success(res, 'Profile updated successfully', {
        user: user.toJSON(),
        roles: req.roles,
        vendorProfile: updatedVendorProfile,
        customerProfile: updatedCustomerProfile
      });
    } catch (error) {
      console.error('[Update Profile Error]:', error);
      return ApiResponse.error(res, 'Failed to update profile', error.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/become-vendor
   * Dual-Role Upgrade: Customer activates Vendor store on existing account
   */
  static async becomeVendor(req, res) {
    const validation = validateBecomeVendor(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const { shopName, category, gstNumber, businessAddress, city, businessPhone } = req.body;
    const user = req.user;

    const t = await sequelize.transaction();

    try {
      // 1. Find or create Vendor role
      const [vendorRole] = await Role.findOrCreate({
        where: { name: ROLES.VENDOR },
        transaction: t
      });

      // 2. Link Vendor Role to User
      await UserRole.findOrCreate({
        where: { userId: user.id, roleId: vendorRole.id },
        defaults: { isActive: true },
        transaction: t
      });

      // 3. Create or update Vendor Profile with Pending verification
      let vendorProfile = await VendorProfile.findOne({ where: { userId: user.id }, transaction: t });

      if (!vendorProfile) {
        vendorProfile = await VendorProfile.create({
          userId: user.id,
          businessName: shopName,
          businessCategory: category,
          gstNumber: gstNumber || null,
          businessAddress: businessAddress || null,
          city: city || 'Ahmedabad',
          businessPhone: businessPhone || user.phone || null,
          businessEmail: user.email,
          verificationStatus: 'Approved',
          commissionRate: 10.00
        }, { transaction: t });
      }

      await t.commit();

      // Return updated token pair with dual roles
      const updatedRoles = Array.from(new Set([...req.roles, ROLES.VENDOR]));
      const tokenResult = await TokenService.generateTokens(
        user,
        updatedRoles,
        req.ip,
        req.headers['user-agent']
      );

      setRefreshTokenCookie(res, tokenResult.refreshToken);

      return ApiResponse.success(res, 'Vendor store profile created! Pending review by Super Admin.', {
        user: user.toJSON(),
        roles: updatedRoles,
        vendorProfile,
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken
      }, 201);

    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error('[Become Vendor Error]:', error);
      return ApiResponse.error(res, 'Failed to activate vendor store', error.message, 500);
    }
  }
}

module.exports = AuthController;
