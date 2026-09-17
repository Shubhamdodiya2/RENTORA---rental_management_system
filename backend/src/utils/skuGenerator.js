/**
 * Rentora Standardized SKU Generator
 * Format: [CATEGORY_PREFIX]-[BRAND]-[MODEL]-[RANDOM_SUFFIX]
 * Example: CAM-SONY-A7IV-8492
 */

const crypto = require('crypto');

function generateSku(categoryName = 'GEN', brand = 'RENTORA', modelName = 'EQUIP') {
  const catCode = (categoryName.substring(0, 3) || 'GEN').toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const brandCode = (brand.substring(0, 4) || 'RENT').toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const modelCode = (modelName.substring(0, 4) || 'PROD').toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 chars e.g. 'A9F2'

  return `${catCode}-${brandCode}-${modelCode}-${randomSuffix}`;
}

module.exports = { generateSku };
