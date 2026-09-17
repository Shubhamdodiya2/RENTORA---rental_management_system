const express = require('express');
const router = express.Router();
const adminPaymentController = require('../controllers/adminPayment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSuperAdmin } = require('../middlewares/rbac.middleware');
const { uploadQrCode, verifyMagicBytes } = require('../middlewares/upload.middleware');

// All routes here require Super Admin authentication
router.use(authenticate, isSuperAdmin);

// Platform UPI & QR Configuration
router.get('/upi-config', adminPaymentController.getUpiConfig);
router.put('/upi-config', uploadQrCode, verifyMagicBytes, adminPaymentController.updateUpiConfig);

// Payment Submissions Review & Verification
router.get('/submissions', adminPaymentController.listSubmissions);
router.get('/submissions/:id', adminPaymentController.getSubmission);
router.patch('/submissions/:id/approve', adminPaymentController.approvePayment);
router.patch('/submissions/:id/reject', adminPaymentController.rejectPayment);

module.exports = router;
