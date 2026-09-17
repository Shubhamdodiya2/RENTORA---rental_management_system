const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Derive 32-byte key from APP_ENCRYPTION_KEY
function getKey() {
  return crypto.createHash('sha256').update(String(env.ENCRYPTION_KEY)).digest();
}

/**
 * Encrypt plain text using AES-256-GCM
 * @param {string|object} data 
 * @returns {string} iv:authTag:encryptedHex
 */
function encrypt(data) {
  if (!data) return null;
  const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt ciphertext
 * @param {string} cipherText 
 * @returns {string|object}
 */
function decrypt(cipherText) {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.includes(':')) {
    return null;
  }

  const parts = cipherText.split(':');
  if (parts.length !== 3) return null;

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

/**
 * Mask an account or card number
 * @param {string} accountNumber 
 * @returns {string} e.g. **** **** 4892
 */
function maskAccountNumber(accountNumber) {
  if (!accountNumber) return '';
  const clean = String(accountNumber).trim();
  if (clean.length <= 4) return clean;
  const last4 = clean.slice(-4);
  return `**** **** ${last4}`;
}

module.exports = {
  encrypt,
  decrypt,
  maskAccountNumber
};
