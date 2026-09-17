/**
 * Vendor Booking Fulfillment Routes
 */

const express = require('express');
const VendorBookingController = require('../controllers/vendorBooking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isVendor } = require('../middlewares/rbac.middleware');

const router = express.Router();

// All vendor booking routes require authentication & Vendor role
router.use(authenticate, isVendor);

// GET /api/v1/vendor/bookings - List all bookings for vendor's store
router.get('/', VendorBookingController.getVendorBookings);

// GET /api/v1/vendor/bookings/:id - Single booking details
router.get('/:id', VendorBookingController.getVendorBookingById);

// PATCH /api/v1/vendor/bookings/:id/transition - Advance lifecycle step
router.patch('/:id/transition', VendorBookingController.transitionBookingStep);

// POST /api/v1/vendor/bookings/:id/verify-otp - Verify handover OTP (Step 4)
router.post('/:id/verify-otp', VendorBookingController.verifyHandoverOtp);

module.exports = router;
