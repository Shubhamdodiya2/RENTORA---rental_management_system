const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiResponse = require('../utils/apiResponse');
const { User, Role, CustomerProfile, VendorProfile } = require('../models');

/**
 * Live Database-Validated Authentication Middleware
 */
async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Extract Bearer Token from Authorization Header, Cookies, or Query Param
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.rentora_at) {
      token = req.cookies.rentora_at;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return ApiResponse.error(res, 'Authentication required. No access token provided.', null, 401);
    }

    // 2. Verify JWT signature & expiration
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT.SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.error(res, 'Access token has expired. Please refresh your session.', { code: 'TOKEN_EXPIRED' }, 401);
      }
      return ApiResponse.error(res, 'Invalid access token.', null, 401);
    }

    // 3. Query LIVE User from Database (never trust stale JWT payload)
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Role, as: 'roles' },
        { model: CustomerProfile, as: 'customerProfile' },
        { model: VendorProfile, as: 'vendorProfile' }
      ]
    });

    // 4. Verify Account Exists & is Active
    if (!user) {
      return ApiResponse.error(res, 'User account no longer exists.', null, 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Your account has been deactivated or suspended.', { code: 'ACCOUNT_DEACTIVATED' }, 403);
    }

    // 5. Enforce Mandatory First-Login Password Change
    // Allows only the change-password route if mustChangePassword is true
    const isChangePasswordRoute = req.originalUrl.includes('/auth/change-password') || req.originalUrl.includes('/auth/logout');
    if (user.mustChangePassword && !isChangePasswordRoute) {
      return ApiResponse.error(res, 'Mandatory password change required before accessing the platform.', {
        code: 'PASSWORD_CHANGE_REQUIRED',
        actionRequired: '/api/v1/auth/change-password'
      }, 403);
    }

    // 6. Extract Active Roles & Attach Clean Context
    const activeRoles = (user.roles || [])
      .filter((r) => (r.UserRole ? r.UserRole.isActive !== false : true))
      .map((r) => r.name);

    req.user = user;
    req.userId = user.id;
    req.roles = activeRoles;
    req.customerProfile = user.customerProfile;
    req.vendorProfile = user.vendorProfile;

    next();

  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return ApiResponse.error(res, 'Authentication verification failed', null, 500);
  }
}

module.exports = {
  authenticate
};
