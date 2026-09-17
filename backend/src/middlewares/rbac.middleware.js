const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * Role-Based Access Control Middleware Factory
 * @param  {...string} allowedRoles 
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.roles) {
      return ApiResponse.error(res, 'Authentication required before permission check', null, 401);
    }

    const hasPermission = allowedRoles.some((role) => req.roles.includes(role));

    if (!hasPermission) {
      return ApiResponse.error(res, `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`, {
        userRoles: req.roles,
        requiredRoles: allowedRoles
      }, 403);
    }

    next();
  };
}

// Single-Role Shortcut Middlewares
const isCustomer = authorize(ROLES.CUSTOMER);
const isVendor = authorize(ROLES.VENDOR);
const isSuperAdmin = authorize(ROLES.SUPER_ADMIN);

/**
 * Ensures a Vendor has been approved by Super Admin before performing store operations
 */
function requireApprovedVendor(req, res, next) {
  if (!req.vendorProfile) {
    return ApiResponse.error(res, 'Vendor profile not found for this account', null, 403);
  }

  if (req.vendorProfile.verificationStatus !== 'Approved') {
    return ApiResponse.error(res, 'Your vendor store is pending approval by Super Admin.', {
      verificationStatus: req.vendorProfile.verificationStatus,
      rejectionReason: req.vendorProfile.rejectionReason || null
    }, 403);
  }

  next();
}

module.exports = {
  authorize,
  isCustomer,
  isVendor,
  isSuperAdmin,
  requireApprovedVendor
};
