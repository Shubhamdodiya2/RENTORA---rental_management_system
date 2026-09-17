/**
 * Public Product Catalog & Availability Routes
 */

const express = require('express');
const ProductController = require('../controllers/product.controller');

const router = express.Router();

// GET /api/v1/products - Filtered & paginated explore catalog
router.get('/', ProductController.getProducts);

// GET /api/v1/products/featured - Curated homepage listings
router.get('/featured', ProductController.getFeaturedProducts);

// GET /api/v1/products/:id/availability - Date availability check & monthly matrix
router.get('/:id/availability', ProductController.checkAvailability);

// GET /api/v1/products/:slugOrId - Complete product details
router.get('/:slugOrId', ProductController.getProductDetail);

module.exports = router;
