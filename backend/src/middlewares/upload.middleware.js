const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ApiResponse = require('../utils/apiResponse');

// Target secure directory for product images
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/products');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types and corresponding magic byte signatures
const ALLOWED_SIGNATURES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF]
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46] // 'RIFF'
  ]
};

// Multer Disk Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Validate destination path to prevent path traversal
    const safePath = path.resolve(UPLOAD_DIR);
    if (!safePath.startsWith(path.resolve(__dirname, '../../uploads'))) {
      return cb(new Error('Invalid upload destination path'));
    }
    cb(null, safePath);
  },
  filename: (req, file, cb) => {
    // Determine extension safely
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    const uniqueName = `${crypto.randomUUID()}${safeExt}`;
    cb(null, uniqueName);
  }
});

// File filter based on client MIME type
const fileFilter = (req, file, cb) => {
  if (ALLOWED_SIGNATURES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are permitted'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files per request
  }
});

/**
 * Middleware: Verify File Magic Bytes / Signature Post-Upload
 */
function verifyMagicBytes(req, res, next) {
  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    return next();
  }

  for (const file of files) {
    try {
      const buffer = Buffer.alloc(12);
      const fd = fs.openSync(file.path, 'r');
      fs.readSync(fd, buffer, 0, 12, 0);
      fs.closeSync(fd);

      let isValid = false;
      const signatures = ALLOWED_SIGNATURES[file.mimetype] || [];

      for (const sig of signatures) {
        let match = true;
        for (let i = 0; i < sig.length; i++) {
          if (buffer[i] !== sig[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          // Special check for WebP: must have 'WEBP' at bytes 8-11
          if (file.mimetype === 'image/webp') {
            const webpTag = buffer.toString('ascii', 8, 12);
            if (webpTag === 'WEBP') {
              isValid = true;
            }
          } else {
            isValid = true;
          }
          break;
        }
      }

      if (!isValid) {
        // Delete rejected invalid file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return ApiResponse.error(
          res,
          `File ${file.originalname} has an invalid or spoofed image signature.`,
          { file: 'Invalid magic bytes' },
          400
        );
      }
    } catch (err) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return ApiResponse.error(res, 'Failed to verify uploaded file contents', err.message, 500);
    }
  }

  next();
}

module.exports = {
  uploadProductImage: upload.array('images', 5),
  verifyMagicBytes
};
