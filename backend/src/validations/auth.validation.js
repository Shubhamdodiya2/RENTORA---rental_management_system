/**
 * Authentication Input Validation Helper
 */

function validateRegister(body) {
  const errors = {};
  const { email, password, role, fullName, ownerName, shopName } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'A valid email address is required';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  const normalizedRole = (role || 'customer').toUpperCase();
  if (normalizedRole !== 'CUSTOMER' && normalizedRole !== 'VENDOR') {
    errors.role = 'Role must be either "customer" or "vendor". Public registration cannot assign administrative roles.';
  }

  if (normalizedRole === 'CUSTOMER') {
    if (!fullName || !fullName.trim()) {
      errors.fullName = 'Full name is required for customer registration';
    }
  } else if (normalizedRole === 'VENDOR') {
    if (!ownerName && !fullName) {
      errors.ownerName = 'Owner name is required for vendor registration';
    }
    if (!shopName || !shopName.trim()) {
      errors.shopName = 'Shop/Business name is required for vendor registration';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedRole
  };
}

function validateLogin(body) {
  const errors = {};
  const { email, password } = body;

  if (!email || !email.trim()) {
    errors.email = 'Email address is required';
  }
  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validatePasswordReset(body) {
  const errors = {};
  const { token, newPassword } = body;

  if (!token || !token.trim()) {
    errors.token = 'Reset token is required';
  }
  if (!newPassword || newPassword.length < 8) {
    errors.newPassword = 'New password must be at least 8 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validatePasswordChange(body) {
  const errors = {};
  const { currentPassword, newPassword } = body;

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  if (!newPassword || newPassword.length < 8) {
    errors.newPassword = 'New password must be at least 8 characters long';
  }
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

function validateBecomeVendor(body) {
  const errors = {};
  const { shopName, category } = body;

  if (!shopName || !shopName.trim()) {
    errors.shopName = 'Business or Shop name is required';
  }
  if (!category || !category.trim()) {
    errors.category = 'Business category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validatePasswordChange,
  validateBecomeVendor
};
