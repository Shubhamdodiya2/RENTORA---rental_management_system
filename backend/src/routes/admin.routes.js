/**
 * Super Admin Management Routes (Categories, Product Moderation, Users, Vendors, Audit Logs)
 */

const express = require('express');
const CategoryController = require('../controllers/category.controller');
const AdminProductController = require('../controllers/adminProduct.controller');
const AdminUserController = require('../controllers/adminUser.controller');
const AdminComplaintController = require('../controllers/adminComplaint.controller');
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
router.delete('/products/:id', AdminProductController.deleteProduct);

// User & Admin Staff Management
router.get('/users', AdminUserController.getUsers);
router.post('/admin-users', AdminUserController.createAdminUser);
router.patch('/users/:id/status', AdminUserController.updateUserStatus);
router.delete('/admin-users/:id', AdminUserController.deleteAdminUser);

// Vendor Management
router.get('/vendors', AdminUserController.getVendors);
router.patch('/vendors/:id/verification', AdminUserController.updateVendorVerification);

// Complaint & Support Tickets Management
router.get('/complaints', AdminComplaintController.getComplaints);
router.post('/complaints', AdminComplaintController.createComplaint);
router.patch('/complaints/:id/status', AdminComplaintController.updateStatus);
router.post('/complaints/:id/messages', AdminComplaintController.addMessage);

// Audit Logs
router.get('/audit-logs', AdminUserController.getAuditLogs);

module.exports = router;
