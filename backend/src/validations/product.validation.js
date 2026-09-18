/**
 * Product Validation Rules
 */

const { PRODUCT_STATUSES, APPROVAL_STATUSES } = require('../config/constants');

function validateProductCreate(data) {
  const errors = {};

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.name = 'Product name is required';
  } else if (data.name.trim().length > 255) {
    errors.name = 'Product name cannot exceed 255 characters';
  }

  if (!data.categoryId || typeof data.categoryId !== 'string' || !data.categoryId.trim()) {
    errors.categoryId = 'Category ID is required';
  }

  // Pricing Validations
  if (data.pricePerDay === undefined || data.pricePerDay === null || isNaN(Number(data.pricePerDay)) || Number(data.pricePerDay) <= 0) {
    errors.pricePerDay = 'Daily rental price (pricePerDay) is required and must be greater than 0';
  }

  if (data.pricePerHour !== undefined && data.pricePerHour !== null && (isNaN(Number(data.pricePerHour)) || Number(data.pricePerHour) < 0)) {
    errors.pricePerHour = 'Hourly price must be a non-negative number';
  }

  if (data.pricePerWeek !== undefined && data.pricePerWeek !== null && (isNaN(Number(data.pricePerWeek)) || Number(data.pricePerWeek) < 0)) {
    errors.pricePerWeek = 'Weekly price must be a non-negative number';
  }

  if (data.pricePerMonth !== undefined && data.pricePerMonth !== null && (isNaN(Number(data.pricePerMonth)) || Number(data.pricePerMonth) < 0)) {
    errors.pricePerMonth = 'Monthly price must be a non-negative number';
  }

  if (data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice !== '') {
    if (isNaN(Number(data.discountPrice)) || Number(data.discountPrice) < 0) {
      errors.discountPrice = 'Discount price must be a non-negative number';
    } else if (data.pricePerDay && Number(data.discountPrice) >= Number(data.pricePerDay)) {
      errors.discountPrice = 'Discount price must be less than regular daily price';
    }
  }

  if (data.securityDeposit !== undefined && data.securityDeposit !== null && (isNaN(Number(data.securityDeposit)) || Number(data.securityDeposit) < 0)) {
    errors.securityDeposit = 'Security deposit must be a non-negative number';
  }

  // Stock Validations
  if (data.stock !== undefined && data.stock !== null) {
    if (isNaN(Number(data.stock)) || !Number.isInteger(Number(data.stock)) || Number(data.stock) < 1) {
      errors.stock = 'Initial total stock must be an integer of at least 1';
    }
  }

  if (data.minStockAlert !== undefined && data.minStockAlert !== null) {
    if (isNaN(Number(data.minStockAlert)) || !Number.isInteger(Number(data.minStockAlert)) || Number(data.minStockAlert) < 0) {
      errors.minStockAlert = 'Minimum stock alert must be a non-negative integer';
    }
  }

  // Status Validation
  if (data.status && !['Draft', 'Active', 'Inactive', 'Archived'].includes(data.status)) {
    errors.status = `Invalid status. Allowed values: Draft, Active, Inactive, Archived`;
  }

  // Specifications format validation
  if (data.specifications !== undefined) {
    if (!Array.isArray(data.specifications) && typeof data.specifications !== 'object') {
      errors.specifications = 'Specifications must be an array of key-value pairs or a key-value object';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validateProductUpdate(data) {
  const errors = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      errors.name = 'Product name cannot be empty';
    } else if (data.name.trim().length > 255) {
      errors.name = 'Product name cannot exceed 255 characters';
    }
  }

  if (data.categoryId !== undefined) {
    if (typeof data.categoryId !== 'string' || !data.categoryId.trim()) {
      errors.categoryId = 'Category ID cannot be empty';
    }
  }

  if (data.pricePerDay !== undefined) {
    if (isNaN(Number(data.pricePerDay)) || Number(data.pricePerDay) <= 0) {
      errors.pricePerDay = 'Daily rental price must be greater than 0';
    }
  }

  if (data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice !== '') {
    if (isNaN(Number(data.discountPrice)) || Number(data.discountPrice) < 0) {
      errors.discountPrice = 'Discount price must be a non-negative number';
    }
  }

  if (data.securityDeposit !== undefined && data.securityDeposit !== null) {
    if (isNaN(Number(data.securityDeposit)) || Number(data.securityDeposit) < 0) {
      errors.securityDeposit = 'Security deposit must be a non-negative number';
    }
  }

  if (data.status && !['Draft', 'Active', 'Inactive', 'Archived'].includes(data.status)) {
    errors.status = `Invalid status. Allowed values: Draft, Active, Inactive, Archived`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validateCatalogExploreQuery(query) {
  const errors = {};
  const sanitized = {};

  // Search string
  if (query.search) {
    sanitized.search = String(query.search).trim().substring(0, 100);
  }

  // Category
  if (query.category && query.category !== 'all') {
    sanitized.category = String(query.category).trim();
  }

  // City
  if (query.city && query.city !== 'all') {
    sanitized.city = String(query.city).trim();
  }

  // Brand
  if (query.brand && query.brand !== 'all') {
    sanitized.brand = String(query.brand).trim();
  }

  // Price Bounds
  if (query.minPrice !== undefined) {
    const minP = Number(query.minPrice);
    if (isNaN(minP) || minP < 0) {
      errors.minPrice = 'minPrice must be a non-negative number';
    } else {
      sanitized.minPrice = minP;
    }
  }

  if (query.maxPrice !== undefined) {
    const maxP = Number(query.maxPrice);
    if (isNaN(maxP) || maxP < 0) {
      errors.maxPrice = 'maxPrice must be a non-negative number';
    } else {
      sanitized.maxPrice = maxP;
    }
  }

  if (sanitized.minPrice !== undefined && sanitized.maxPrice !== undefined && sanitized.minPrice > sanitized.maxPrice) {
    errors.priceRange = 'minPrice cannot exceed maxPrice';
  }

  // Rating
  if (query.minRating !== undefined) {
    const r = Number(query.minRating);
    if (isNaN(r) || r < 0 || r > 5) {
      errors.minRating = 'minRating must be between 0 and 5';
    } else {
      sanitized.minRating = r;
    }
  }

  // Sort
  const ALLOWED_SORTS = ['popular', 'price_asc', 'price_desc', 'newest', 'rating'];
  sanitized.sort = ALLOWED_SORTS.includes(query.sort) ? query.sort : 'popular';

  // Pagination
  const page = parseInt(query.page, 10);
  sanitized.page = !isNaN(page) && page >= 1 ? page : 1;

  const limit = parseInt(query.limit, 10);
  sanitized.limit = !isNaN(limit) && limit >= 1 && limit <= 100 ? limit : 12;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
}

module.exports = {
  validateProductCreate,
  validateProductUpdate,
  validateCatalogExploreQuery
};
