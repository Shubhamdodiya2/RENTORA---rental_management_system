const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ApiResponse = require('../utils/apiResponse');

// Directories
const PRODUCT_UPLOAD_DIR = path.resolve(__dirname, '../../uploads/products');
const PAYMENT_PROOF_DIR = path.resolve(__dirname, '../../uploads/payment_proofs');
const QR_UPLOAD_DIR = path.resolve(__dirname, '../../uploads/qr');

[PRODUCT_UPLOAD_DIR, PAYMENT_PROOF_DIR, QR_UPLOAD_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
  ],
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46] // '%PDF'
  ]
};

// Storage factory
function createStorage(targetDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const safePath = path.resolve(targetDir);
      if (!safePath.startsWith(path.resolve(__dirname, '../../uploads'))) {
        return cb(new Error('Invalid upload destination path'));
      }
      cb(null, safePath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
      const safeExt = allowedExts.includes(ext) ? ext : '.jpg';
      const uniqueName = `${crypto.randomUUID()}${safeExt}`;
      cb(null, uniqueName);
    }
  });
}

// Product images upload (Max 5, 5MB each, Images only)
const uploadProducts = multer({
  storage: createStorage(PRODUCT_UPLOAD_DIR),
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP image files are permitted for products'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5
  }
});

// Payment Proof upload (Single file, 5MB, PDF or Images)
const uploadPaymentProof = multer({
  storage: createStorage(PAYMENT_PROOF_DIR),
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP image or PDF files are permitted for payment proof'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

// QR Code upload (Single file, 2MB, Images only)
const uploadQrCode = multer({
  storage: createStorage(QR_UPLOAD_DIR),
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP image files are permitted for QR Code'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1
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
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return ApiResponse.error(
          res,
          `File ${file.originalname} has an invalid or spoofed file signature.`,
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
  uploadProductImage: uploadProducts.array('images', 5),
  uploadPaymentProof: uploadPaymentProof.single('proofFile'),
  uploadQrCode: uploadQrCode.single('qrCodeImage'),
  verifyMagicBytes
};
