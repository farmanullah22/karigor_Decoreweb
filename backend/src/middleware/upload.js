const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { ALLOWED_MIME_TYPES } = require('../services/mediaStorage');

/**
 * Multer configuration for in-memory uploads.
 * Files are validated (MIME type + size) and then persisted by the media
 * controller through the storage service.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploadMaxMb * 1024 * 1024,
    files: 12,
  },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        ApiError.badRequest(
          `Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WebP, GIF.`
        )
      );
    }
    return cb(null, true);
  },
});

module.exports = { upload };
