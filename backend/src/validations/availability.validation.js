/**
 * Date-Based Availability Engine Validation Rules
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateDateRangeQuery(query) {
  const errors = {};

  const { startDate, endDate, quantity } = query;

  if (!startDate || typeof startDate !== 'string' || !DATE_REGEX.test(startDate)) {
    errors.startDate = 'Start date is required in YYYY-MM-DD format';
  }

  if (!endDate || typeof endDate !== 'string' || !DATE_REGEX.test(endDate)) {
    errors.endDate = 'End date is required in YYYY-MM-DD format';
  }

  if (!errors.startDate && !errors.endDate) {
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);

    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date format';
    }

    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date format';
    }

    if (!errors.startDate && !errors.endDate) {
      // Past Date Check (Against today UTC midnight)
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      if (start < today) {
        errors.startDate = 'Start date cannot be in the past';
      }

      if (end < start) {
        errors.endDate = 'End date cannot be earlier than start date';
      }

      // Maximum rental duration limit: 365 days
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
      if (diffDays > 365) {
        errors.range = 'Rental date duration cannot exceed 365 days';
      }
    }
  }

  let sanitizedQuantity = 1;
  if (quantity !== undefined) {
    const q = parseInt(quantity, 10);
    if (isNaN(q) || q < 1) {
      errors.quantity = 'Quantity must be an integer of at least 1';
    } else {
      sanitizedQuantity = q;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      startDate,
      endDate,
      quantity: sanitizedQuantity
    }
  };
}

function validateMonthlyMatrixQuery(query) {
  const errors = {};
  const currentYear = new Date().getUTCFullYear();

  let year = parseInt(query.year, 10);
  if (isNaN(year) || year < currentYear || year > currentYear + 2) {
    errors.year = `Year must be an integer between ${currentYear} and ${currentYear + 2}`;
  }

  let month = parseInt(query.month, 10);
  if (isNaN(month) || month < 1 || month > 12) {
    errors.month = 'Month must be an integer between 1 and 12';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      year,
      month
    }
  };
}

module.exports = {
  validateDateRangeQuery,
  validateMonthlyMatrixQuery
};
