/**
 * Super Admin Booking Management Routes
 */

const express = require('express');
const AdminBookingController = require('../controllers/adminBooking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSuperAdmin } = require('../middlewares/rbac.middleware');

const router = express.Router();

// All admin booking routes require authentication & SUPER_ADMIN role
router.use(authenticate, isSuperAdmin);

// GET /api/v1/admin/bookings - List all platform bookings
router.get('/', AdminBookingController.getAllBookings);

// PATCH /api/v1/admin/bookings/:id/status - Status override / dispute resolution
router.patch('/:id/status', AdminBookingController.overrideBookingStatus);

module.exports = router;
