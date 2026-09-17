/**
 * Vendor Product Management Routes
 */

const express = require('express');
const VendorProductController = require('../controllers/vendorProduct.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isVendor } = require('../middlewares/rbac.middleware');
const { 
  requireApprovedVendor, 
  requireProductOwnership 
} = require('../middlewares/productOwnership.middleware');
const { 
  uploadProductImage, 
  verifyMagicBytes 
} = require('../middlewares/upload.middleware');

const router = express.Router();

// All vendor product routes require authentication & vendor role
router.use(authenticate, isVendor);

// POST /api/v1/vendor/products - Create product (requires approved vendor profile)
router.post('/', requireApprovedVendor, VendorProductController.createProduct);

// GET /api/v1/vendor/products - List vendor's own listings
router.get('/', VendorProductController.getVendorProducts);

// GET /api/v1/vendor/products/:id - Single product edit view
router.get('/:id', requireProductOwnership, VendorProductController.getVendorProductById);

// PUT /api/v1/vendor/products/:id - Update product details & specs
router.put('/:id', requireApprovedVendor, requireProductOwnership, VendorProductController.updateProduct);

// DELETE /api/v1/vendor/products/:id - Archive product
router.delete('/:id', requireProductOwnership, VendorProductController.deleteProduct);

// POST /api/v1/vendor/products/:id/images - Upload images
router.post(
  '/:id/images',
  requireApprovedVendor,
  requireProductOwnership,
  uploadProductImage,
  verifyMagicBytes,
  VendorProductController.uploadImages
);

// DELETE /api/v1/vendor/products/:id/images/:imageId - Delete image
router.delete(
  '/:id/images/:imageId',
  requireProductOwnership,
  VendorProductController.deleteImage
);

// PATCH /api/v1/vendor/products/:id/images/:imageId/primary - Set primary image
router.patch(
  '/:id/images/:imageId/primary',
  requireProductOwnership,
  VendorProductController.setPrimaryImage
);

// PATCH /api/v1/vendor/products/:id/inventory - Adjust stock count
router.patch(
  '/:id/inventory',
  requireProductOwnership,
  VendorProductController.updateInventory
);

module.exports = router;
