const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const env = require('./env');

const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY.CLOUD_NAME &&
  env.CLOUDINARY.API_KEY &&
  env.CLOUDINARY.API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUD_NAME,
    api_key: env.CLOUDINARY.API_KEY,
    api_secret: env.CLOUDINARY.API_SECRET,
    secure: true
  });
}

/**
 * Upload a local file to Cloudinary under the rentora folder
 * @param {string} filePath - Absolute path to the locally saved temp file
 * @param {string} folder - Subfolder name (e.g. 'rentora/products', 'rentora/qr', 'rentora/payments')
 * @returns {Promise<{ secure_url: string, public_id: string } | null>}
 */
async function uploadToCloudinary(filePath, folder = 'rentora/products') {
  if (!isCloudinaryConfigured) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true
    });

    // Optionally remove local file after successful Cloudinary upload
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.warn('[Cloudinary Cleanup Warning]:', cleanupErr.message);
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error.message);
    throw error;
  }
}

/**
 * Delete an asset from Cloudinary by public ID
 * @param {string} publicId
 */
async function deleteFromCloudinary(publicId) {
  if (!isCloudinaryConfigured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[Cloudinary Destroy Error]:', error.message);
  }
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
};

