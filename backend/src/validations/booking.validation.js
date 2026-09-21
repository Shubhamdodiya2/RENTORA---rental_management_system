/**
 * Booking Validation Rules
 */

const { DURATION_MODES, DELIVERY_TYPES, PAYMENT_PLANS, BOOKING_STATUSES } = require('../config/constants');
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateBookingCreate(data) {
  const errors = {};

  // Items validation
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.items = 'At least one product item is required for booking';
  } else {
    data.items.forEach((item, index) => {
      if (!item.productId || typeof item.productId !== 'string') {
        errors[`items[${index}].productId`] = 'Product ID is required';
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1) {
        errors[`items[${index}].quantity`] = 'Quantity must be an integer of at least 1';
      }
    });
  }

  // Date validations
  if (!data.startDate || !DATE_REGEX.test(data.startDate)) {
    errors.startDate = 'Start date is required in YYYY-MM-DD format';
  }
  if (!data.endDate || !DATE_REGEX.test(data.endDate)) {
    errors.endDate = 'End date is required in YYYY-MM-DD format';
  }

  if (!errors.startDate && !errors.endDate) {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const utcToday = now.toISOString().slice(0, 10);
    const minAllowedDate = localToday < utcToday ? localToday : utcToday;

    if (data.startDate < minAllowedDate) {
      errors.startDate = 'Start date cannot be in the past';
    }
    if (data.endDate < data.startDate) {
      errors.endDate = 'End date cannot be earlier than start date';
    }
  }

  // Duration Mode
  if (data.durationMode && !DURATION_MODES.includes(data.durationMode)) {
    errors.durationMode = `Invalid duration mode. Allowed values: ${DURATION_MODES.join(', ')}`;
  }

  // Delivery Type
  if (data.deliveryType && !DELIVERY_TYPES.includes(data.deliveryType)) {
    errors.deliveryType = `Invalid delivery type. Allowed values: ${DELIVERY_TYPES.join(', ')}`;
  }

  if (data.deliveryType === 'doorstep' && (!data.deliveryAddress || !data.deliveryAddress.trim())) {
    errors.deliveryAddress = 'Delivery address is required for doorstep delivery';
  }

  // Payment Plan
  if (data.paymentPlan && !PAYMENT_PLANS.includes(data.paymentPlan)) {
    errors.paymentPlan = `Invalid payment plan. Allowed values: ${PAYMENT_PLANS.join(', ')}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validateBookingTransition(data) {
  const errors = {};

  const targetStep = parseInt(data.targetStep, 10);
  if (isNaN(targetStep) || targetStep < 1 || targetStep > 8) {
    errors.targetStep = 'Target step must be an integer between 1 and 8';
  }

  if (targetStep === 4 && (!data.handoverOtp || String(data.handoverOtp).trim().length !== 6)) {
    errors.handoverOtp = '6-digit handover OTP is required to confirm equipment handover';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validateBookingCancel(data) {
  const errors = {};

  if (!data.cancellationReason || typeof data.cancellationReason !== 'string' || !data.cancellationReason.trim()) {
    errors.cancellationReason = 'Cancellation reason is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateBookingCreate,
  validateBookingTransition,
  validateBookingCancel
};
