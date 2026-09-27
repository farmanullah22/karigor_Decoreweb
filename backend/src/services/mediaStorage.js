const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Modular media storage driver - local disk implementation.
 *
 * The rest of the application only depends on the functions below, so a
 * cloud driver (S3, Cloudinary, ...) can be added later without touching
 * controllers: implement the same interface in a new driver file.
 *
 * Uploaded files live in `backend/uploads/<yyyy>/<mm>/` and are served
 * publicly from `/uploads/...`.
 */

const UPLOAD_ROOT = path.resolve(__dirname, '..', '..', 'uploads');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXTENSION_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function isAllowedMime(mimeType) {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

/**
 * Persist a buffer to local disk.
 * @returns {{ filename, relativePath, url, size, mimeType }}
 */
function saveBuffer(buffer, originalName, mimeType) {
  if (!isAllowedMime(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const dir = path.join(UPLOAD_ROOT, year, month);
  ensureDir(dir);

  const ext = path.extname(originalName || '').toLowerCase() || EXTENSION_BY_MIME[mimeType] || '.bin';
  const safeExt = Object.values(EXTENSION_BY_MIME).includes(ext) ? ext : EXTENSION_BY_MIME[mimeType];
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`;

  const relativePath = path.posix.join(year, month, filename);
  fs.writeFileSync(path.join(dir, filename), buffer);

  return {
    filename,
    relativePath,
    url: `/uploads/${relativePath}`,
    size: buffer.length,
    mimeType,
  };
}

/**
 * Delete a stored file by its relative path (e.g. "2026/09/abc.jpg").
 * Safe: refuses paths that escape the upload root.
 */
function deleteFile(relativePath) {
  if (!relativePath) return false;
  const absolute = path.resolve(UPLOAD_ROOT, relativePath);
  if (!absolute.startsWith(UPLOAD_ROOT)) return false;
  try {
    if (fs.existsSync(absolute)) {
      fs.unlinkSync(absolute);
      return true;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] Failed to delete file:', relativePath, error.message);
  }
  return false;
}

module.exports = {
  UPLOAD_ROOT,
  ALLOWED_MIME_TYPES,
  isAllowedMime,
  saveBuffer,
  deleteFile,
};
