/**
 * Customer Booking Routes
 */

const express = require('express');
const BookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isCustomer } = require('../middlewares/rbac.middleware');

const router = express.Router();

// All customer booking routes require authentication
router.use(authenticate);

// POST /api/v1/bookings - Customer initiates rental checkout
router.post('/', isCustomer, BookingController.createBooking);

// GET /api/v1/bookings - List customer's own bookings
router.get('/', BookingController.getCustomerBookings);

// GET /api/v1/bookings/:id - Single booking details with timeline & items
router.get('/:id', BookingController.getBookingById);

// PATCH /api/v1/bookings/:id/cancel - Cancel booking in early stages
router.patch('/:id/cancel', BookingController.cancelBooking);

module.exports = router;
