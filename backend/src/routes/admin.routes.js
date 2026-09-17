/**
 * Super Admin Management Routes (Categories, Product Moderation, Users, Vendors, Audit Logs)
 */

const express = require('express');
const CategoryController = require('../controllers/category.controller');
const AdminProductController = require('../controllers/adminProduct.controller');
const AdminUserController = require('../controllers/adminUser.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSuperAdmin } = require('../middlewares/rbac.middleware');

const router = express.Router();

// All admin routes require authentication & SUPER_ADMIN role
router.use(authenticate, isSuperAdmin);

// Dashboard KPI Stats
router.get('/stats', AdminUserController.getAdminStats);

// Category Management
router.post('/categories', CategoryController.createCategory);
router.put('/categories/:id', CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

// Product Moderation Queue
router.get('/products', AdminProductController.getAllProducts);
router.patch('/products/:id/approval', AdminProductController.updateApprovalStatus);
router.patch('/products/:id/featured', AdminProductController.toggleFeatured);

// User Management
router.get('/users', AdminUserController.getUsers);
router.patch('/users/:id/status', AdminUserController.updateUserStatus);

// Vendor Management
router.get('/vendors', AdminUserController.getVendors);
router.patch('/vendors/:id/verification', AdminUserController.updateVendorVerification);

// Audit Logs
router.get('/audit-logs', AdminUserController.getAuditLogs);

module.exports = router;
