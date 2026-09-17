/**
 * Quotation Validation Rules
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateQuotationCreate(data) {
  const errors = {};

  if (!data.vendorId || typeof data.vendorId !== 'string') {
    errors.vendorId = 'Vendor ID is required';
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.items = 'At least one product item is required for quotation request';
  } else {
    data.items.forEach((item, idx) => {
      if (!item.productId) errors[`items[${idx}].productId`] = 'Product ID is required';
      const q = parseInt(item.quantity, 10);
      if (isNaN(q) || q < 1) errors[`items[${idx}].quantity`] = 'Quantity must be at least 1';
    });
  }

  if (!data.eventDate || !DATE_REGEX.test(data.eventDate)) {
    errors.eventDate = 'Event date is required in YYYY-MM-DD format';
  } else {
    const d = new Date(`${data.eventDate}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (d < today) errors.eventDate = 'Event date cannot be in the past';
  }

  const duration = parseInt(data.durationDays, 10);
  if (isNaN(duration) || duration < 1) {
    errors.durationDays = 'Duration must be an integer of at least 1 day';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validateQuotationRespond(data) {
  const errors = {};

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.items = 'Pricing breakdown for each line item is required in response';
  } else {
    data.items.forEach((item, idx) => {
      if (!item.productId) errors[`items[${idx}].productId`] = 'Product ID is required';
      const rate = Number(item.customRate);
      if (isNaN(rate) || rate < 0) errors[`items[${idx}].customRate`] = 'Custom rate must be a non-negative number';
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateQuotationCreate,
  validateQuotationRespond
};
