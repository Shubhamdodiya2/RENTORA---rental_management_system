/**
 * Vendor Product Ownership & Moderation RBAC Middleware
 */

const ApiResponse = require('../utils/apiResponse');
const { Product, VendorProfile } = require('../models');
const { ROLES } = require('../config/constants');

/**
 * Ensures vendor store profile has been verified and approved by Super Admin
 */
function requireApprovedVendor(req, res, next) {
  // Super Admin can always perform vendor actions on behalf of system
  if (req.roles && req.roles.includes(ROLES.SUPER_ADMIN)) {
    return next();
  }

  if (!req.vendorProfile) {
    return ApiResponse.error(res, 'Vendor profile required to perform this action.', null, 403);
  }

  if (req.vendorProfile.verificationStatus !== 'Approved') {
    return ApiResponse.error(
      res,
      'Your vendor store verification is pending approval by Super Admin. Product creation and listing updates are locked until approved.',
      { verificationStatus: req.vendorProfile.verificationStatus },
      403
    );
  }

  next();
}

/**
 * Ensures the logged-in vendor owns the target product (or user is Super Admin)
 */
async function requireProductOwnership(req, res, next) {
  try {
    const productId = req.params.id || req.params.productId;

    if (!productId) {
      return ApiResponse.error(res, 'Product ID parameter is required', null, 400);
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return ApiResponse.error(res, 'Product listing not found', null, 404);
    }

    // Super Admin bypass
    if (req.roles && req.roles.includes(ROLES.SUPER_ADMIN)) {
      req.product = product;
      return next();
    }

    // Vendor Ownership Check
    if (!req.vendorProfile || product.vendorId !== req.vendorProfile.id) {
      return ApiResponse.error(
        res,
        'Forbidden: You do not have permission to modify or manage this product listing.',
        null,
        403
      );
    }

    req.product = product;
    next();

  } catch (error) {
    console.error('[Product Ownership Middleware Error]:', error);
    return ApiResponse.error(res, 'Failed to verify product ownership', error.message, 500);
  }
}

module.exports = {
  requireApprovedVendor,
  requireProductOwnership
};
