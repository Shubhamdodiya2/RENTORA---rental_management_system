/**
 * Super Admin Management Routes (Categories, Product Moderation)
 */

const express = require('express');
const CategoryController = require('../controllers/category.controller');
const AdminProductController = require('../controllers/adminProduct.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSuperAdmin } = require('../middlewares/rbac.middleware');

const router = express.Router();

// All admin routes require authentication & SUPER_ADMIN role
router.use(authenticate, isSuperAdmin);

// Category Management
router.post('/categories', CategoryController.createCategory);
router.put('/categories/:id', CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

// Product Moderation Queue
router.get('/products', AdminProductController.getAllProducts);
router.patch('/products/:id/approval', AdminProductController.updateApprovalStatus);
router.patch('/products/:id/featured', AdminProductController.toggleFeatured);

module.exports = router;
