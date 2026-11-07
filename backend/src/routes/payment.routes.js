const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadPaymentProof, verifyMagicBytes } = require('../middlewares/upload.middleware');

// Public/Customer: Get platform UPI ID & QR Code
router.get('/upi-details', paymentController.getUpiDetails);

// Protected Customer endpoints
router.post(
  '/submit-manual-upi',
  authenticate,
  uploadPaymentProof,
  verifyMagicBytes,
  paymentController.submitManualPayment
);

router.get('/my-submissions', authenticate, paymentController.getMySubmissions);
router.get('/booking/:bookingId', authenticate, paymentController.getBookingPaymentDetails);
router.get('/proof/:submissionId', authenticate, paymentController.streamPaymentProof);

// Customer Direct / UPI Payment for Booking
router.post('/pay-booking', authenticate, paymentController.payBooking);

module.exports = router;
