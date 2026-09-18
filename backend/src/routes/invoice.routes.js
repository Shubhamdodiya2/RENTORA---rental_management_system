const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Customer Invoices
router.get('/my', authenticate, invoiceController.getMyInvoices);

// Vendor Invoices
router.get('/vendor', authenticate, invoiceController.getVendorInvoices);

// Booking specific invoice
router.get('/booking/:bookingId', authenticate, invoiceController.getInvoiceByBookingId);
router.post('/booking/:bookingId/generate', authenticate, invoiceController.generateBookingInvoice);

// Invoice lookup by business invoice number (e.g. INV-2026-000001, REN-...)
router.get('/number/:invoiceNumber', authenticate, invoiceController.getInvoiceByNumber);
router.get('/number/:invoiceNumber/html', authenticate, invoiceController.renderInvoiceHtml);

// Single Invoice by ID (UUID) & Printable HTML
router.get('/:id', authenticate, invoiceController.getInvoiceById);
router.get('/:id/html', authenticate, invoiceController.renderInvoiceHtml);

module.exports = router;
