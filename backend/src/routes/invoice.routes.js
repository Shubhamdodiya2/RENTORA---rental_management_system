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

// Single Invoice by ID & Printable HTML
router.get('/:id', authenticate, invoiceController.getInvoiceById);
router.get('/:id/html', authenticate, invoiceController.renderInvoiceHtml);

module.exports = router;
