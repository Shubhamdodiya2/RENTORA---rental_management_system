const express = require('express');
const router = express.Router();
const adminInvoiceController = require('../controllers/adminInvoice.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSuperAdmin } = require('../middlewares/rbac.middleware');

// All routes here require Super Admin authentication
router.use(authenticate, isSuperAdmin);

// Super Admin Invoices & Financial Statements
router.get('/', adminInvoiceController.listAllInvoices);
router.get('/:id', adminInvoiceController.getAdminInvoiceById);
router.get('/:id/html', adminInvoiceController.renderAdminInvoiceHtml);

module.exports = router;
