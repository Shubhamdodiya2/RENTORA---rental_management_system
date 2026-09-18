/**
 * Customer Booking Routes
 */

const express = require('express');
const BookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Any authenticated role (Customer, Vendor, Admin) can book equipment from other vendors
const canRent = authorize(ROLES.CUSTOMER, ROLES.VENDOR, ROLES.SUPER_ADMIN);

// POST /api/v1/bookings - Initiate rental checkout
router.post('/', canRent, BookingController.createBooking);

// GET /api/v1/bookings & /api/v1/bookings/my - List user's own bookings
router.get('/', canRent, BookingController.getCustomerBookings);
router.get('/my', canRent, BookingController.getCustomerBookings);

// GET /api/v1/bookings/:id - Single booking details with timeline & items
router.get('/:id', BookingController.getBookingById);

// PATCH /api/v1/bookings/:id/cancel - Cancel booking in early stages
router.patch('/:id/cancel', canRent, BookingController.cancelBooking);

module.exports = router;
