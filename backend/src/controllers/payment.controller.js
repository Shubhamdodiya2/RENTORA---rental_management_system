const PaymentService = require('../services/payment.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Get Platform UPI Details & QR Code for Checkout
 */
async function getUpiDetails(req, res, next) {
  try {
    const config = await PaymentService.getPlatformUpiConfig();
    return ApiResponse.success(res, 'Platform UPI configuration retrieved successfully', config);
  } catch (error) {
    next(error);
  }
}

/**
 * Customer Submits Manual UPI Payment Proof + UTR
 */
async function submitManualPayment(req, res, next) {
  try {
    const submission = await PaymentService.submitManualPaymentProof(req.user.id, req.body, req.file);
    return ApiResponse.success(
      res,
      'Payment proof submitted successfully. Super Admin will verify and confirm your order.',
      submission,
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Customer Lists Their Own Payment Submissions
 */
async function getMySubmissions(req, res, next) {
  try {
    const result = await PaymentService.getMySubmissions(req.user.id, req.query);
    return ApiResponse.success(res, 'My payment submissions retrieved', result.submissions, 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Payment Details for Specific Booking
 */
async function getBookingPaymentDetails(req, res, next) {
  try {
    const details = await PaymentService.getPaymentDetailsForBooking(req.params.bookingId, req.user);
    return ApiResponse.success(res, 'Booking payment details retrieved', details);
  } catch (error) {
    next(error);
  }
}

/**
 * Stream Payment Proof File with RBAC Protection
 */
async function streamPaymentProof(req, res, next) {
  try {
    const fileInfo = await PaymentService.getProofFilePath(req.params.submissionId, req.user);
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.originalName}"`);
    return res.sendFile(fileInfo.absolutePath);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUpiDetails,
  submitManualPayment,
  getMySubmissions,
  getBookingPaymentDetails,
  streamPaymentProof
};
