/**
 * Rentora Unique Booking Number Generator
 * Format: BKG-YYYYMMDD-XXXX (e.g. BKG-20260918-A8F2)
 */

const crypto = require('crypto');

function generateBookingNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `BKG-${year}${month}${day}-${randomSuffix}`;
}

function generateQuotationNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `QTN-${year}${month}${day}-${randomSuffix}`;
}

function generateInvoiceNumber(seq = 1, year = new Date().getFullYear()) {
  return `INV-${year}-${String(seq).padStart(6, '0')}`;
}

module.exports = {
  generateBookingNumber,
  generateQuotationNumber,
  generateInvoiceNumber
};
