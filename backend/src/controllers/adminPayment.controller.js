const PaymentService = require('../services/payment.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Super Admin Gets Current Platform UPI Configuration
 */
async function getUpiConfig(req, res, next) {
  try {
    const config = await PaymentService.getPlatformUpiConfig();
    return ApiResponse.success(res, 'Platform UPI configuration retrieved', config);
  } catch (error) {
    next(error);
  }
}

/**
 * Super Admin Updates Platform UPI ID and QR Code
 */
async function updateUpiConfig(req, res, next) {
  try {
    const payload = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    const updatedConfig = await PaymentService.updatePlatformUpiConfig(req.user, payload, req.file);
    return ApiResponse.success(res, 'Platform UPI and QR code configuration updated successfully', updatedConfig);
  } catch (error) {
    next(error);
  }
}

/**
 * Super Admin Lists All Payment Submissions with Filters
 */
async function listSubmissions(req, res, next) {
  try {
    const result = await PaymentService.listSubmissionsForAdmin(req.query);
    return ApiResponse.success(res, 'Payment submissions retrieved', result.submissions, 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

/**
 * Super Admin Views Single Submission Details
 */
async function getSubmission(req, res, next) {
  try {
    const submission = await PaymentService.getSubmissionById(req.params.id);
    return ApiResponse.success(res, 'Payment submission details retrieved', submission);
  } catch (error) {
    next(error);
  }
}

/**
 * Super Admin Approves Payment -> Creates Ledgers Atomically
 */
async function approvePayment(req, res, next) {
  try {
    const payload = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    const result = await PaymentService.approveManualPayment(req.params.id, req.user, payload);
    return ApiResponse.success(res, 'Payment approved and verified successfully. Multi-ledger records generated.', result);
  } catch (error) {
    next(error);
  }
}

/**
 * Super Admin Rejects Payment with Mandatory Reason
 */
async function rejectPayment(req, res, next) {
  try {
    const payload = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    const result = await PaymentService.rejectManualPayment(req.params.id, req.user, payload);
    return ApiResponse.success(res, 'Payment submission rejected. Customer has been notified.', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUpiConfig,
  updateUpiConfig,
  listSubmissions,
  getSubmission,
  approvePayment,
  rejectPayment
};
