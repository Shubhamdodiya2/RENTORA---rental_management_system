/**
 * Handover & Delivery Secure OTP Verification Utility
 * Zero-plaintext storage, salted SHA-256 hash, expiry, attempt counter & timing-safe comparison
 */

const crypto = require('crypto');

/**
 * Generate a cryptographically secure 6-digit OTP with salted hash and expiry
 * @param {number} expiresInHours - Validity window in hours (default 72h / 3 days)
 * @returns {{ rawOtp: string, otpMetadata: object }}
 */
function generateSecureHandoverOtp(expiresInHours = 72) {
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(rawOtp + salt).digest('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

  const otpMetadata = {
    hash,
    salt,
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
    isUsed: false
  };

  return {
    rawOtp,
    otpMetadata
  };
}

/**
 * Verify customer-provided OTP against stored secure metadata
 * @param {string} inputOtp - 6-digit OTP entered by vendor/driver
 * @param {object} otpMetadata - Stored metadata object { hash, salt, expiresAt, attempts, maxAttempts, isUsed }
 * @returns {{ valid: boolean, error?: string, updatedMetadata: object }}
 */
function verifySecureHandoverOtp(inputOtp, otpMetadata) {
  if (!otpMetadata || !otpMetadata.hash || !otpMetadata.salt) {
    return { valid: false, error: 'No handover OTP metadata found on booking', updatedMetadata: otpMetadata };
  }

  const updated = { ...otpMetadata };

  if (updated.isUsed) {
    return { valid: false, error: 'Handover OTP has already been consumed', updatedMetadata: updated };
  }

  if (updated.attempts >= (updated.maxAttempts || 5)) {
    return { 
      valid: false, 
      error: 'Maximum OTP verification attempts exceeded. Please regenerate OTP from customer portal.', 
      updatedMetadata: updated 
    };
  }

  if (new Date() > new Date(updated.expiresAt)) {
    return { valid: false, error: 'Handover OTP has expired', updatedMetadata: updated };
  }

  const cleanInput = String(inputOtp || '').trim();
  if (cleanInput.length !== 6 || !/^\d{6}$/.test(cleanInput)) {
    updated.attempts += 1;
    return { 
      valid: false, 
      error: `Invalid OTP format. Must be 6 digits. (${(updated.maxAttempts || 5) - updated.attempts} attempts remaining)`, 
      updatedMetadata: updated 
    };
  }

  const computedHash = crypto.createHash('sha256').update(cleanInput + updated.salt).digest('hex');

  // Timing-safe buffer comparison to prevent timing attacks
  const bufComputed = Buffer.from(computedHash, 'utf8');
  const bufExpected = Buffer.from(updated.hash, 'utf8');

  const matches = bufComputed.length === bufExpected.length && crypto.timingSafeEqual(bufComputed, bufExpected);

  if (!matches) {
    updated.attempts += 1;
    const remaining = (updated.maxAttempts || 5) - updated.attempts;
    return {
      valid: false,
      error: remaining > 0 
        ? `Incorrect handover verification OTP. (${remaining} attempts remaining)` 
        : 'Maximum OTP verification attempts exceeded.',
      updatedMetadata: updated
    };
  }

  // Verification succeeded: mark as used
  updated.isUsed = true;
  updated.usedAt = new Date().toISOString();

  return {
    valid: true,
    updatedMetadata: updated
  };
}

module.exports = {
  generateSecureHandoverOtp,
  verifySecureHandoverOtp
};
