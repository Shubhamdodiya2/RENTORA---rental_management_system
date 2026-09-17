/**
 * Category Validation Rules
 */

function validateCategoryCreate(data) {
  const errors = {};

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.name = 'Category name is required';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Category name cannot exceed 100 characters';
  }

  if (data.iconName && (typeof data.iconName !== 'string' || data.iconName.length > 50)) {
    errors.iconName = 'Icon name cannot exceed 50 characters';
  }

  if (data.description && typeof data.description === 'string' && data.description.length > 255) {
    errors.description = 'Description cannot exceed 255 characters';
  }

  if (data.displayOrder !== undefined && (isNaN(Number(data.displayOrder)) || Number(data.displayOrder) < 0)) {
    errors.displayOrder = 'Display order must be a non-negative number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validateCategoryUpdate(data) {
  const errors = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      errors.name = 'Category name cannot be empty';
    } else if (data.name.trim().length > 100) {
      errors.name = 'Category name cannot exceed 100 characters';
    }
  }

  if (data.iconName !== undefined && (typeof data.iconName !== 'string' || data.iconName.length > 50)) {
    errors.iconName = 'Icon name cannot exceed 50 characters';
  }

  if (data.description !== undefined && typeof data.description === 'string' && data.description.length > 255) {
    errors.description = 'Description cannot exceed 255 characters';
  }

  if (data.displayOrder !== undefined && (isNaN(Number(data.displayOrder)) || Number(data.displayOrder) < 0)) {
    errors.displayOrder = 'Display order must be a non-negative number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateCategoryCreate,
  validateCategoryUpdate
};
