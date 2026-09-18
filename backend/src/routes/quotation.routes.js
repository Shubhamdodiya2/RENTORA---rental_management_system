/**
 * B2B Quotation Routes
 */

const express = require('express');
const QuotationController = require('../controllers/quotation.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize, isVendor } = require('../middlewares/rbac.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// All quotation routes require authentication
router.use(authenticate);

const canRent = authorize(ROLES.CUSTOMER, ROLES.VENDOR, ROLES.SUPER_ADMIN);

// POST /api/v1/quotations - User submits quote request
router.post('/', canRent, QuotationController.createQuotation);

// GET /api/v1/quotations - List user's quotes
router.get('/', QuotationController.getQuotations);

// GET /api/v1/quotations/:id - Get quotation detail
router.get('/:id', QuotationController.getQuotationById);

// PATCH /api/v1/quotations/:id/respond - Vendor submits custom rates
router.patch('/:id/respond', isVendor, QuotationController.respondQuotation);

// PATCH /api/v1/quotations/:id/accept - User accepts quote -> creates booking
router.patch('/:id/accept', canRent, QuotationController.acceptQuotation);

// PATCH /api/v1/quotations/:id/reject - Reject quotation
router.patch('/:id/reject', QuotationController.rejectQuotation);

module.exports = router;
