const Media = require('../models/Media');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parseListQuery } = require('../utils/query');
const storage = require('../services/mediaStorage');
const { findImageUsage } = require('../services/mediaUsageService');

/**
 * POST /api/media/upload - admin.
 * Accepts one or many files (field name "files"). Each file is stored via
 * the storage driver and tracked in the media library.
 */
const uploadMedia = asyncHandler(async (req, res) => {
  const files = req.files && req.files.length ? req.files : req.file ? [req.file] : [];
  if (!files.length) throw ApiError.badRequest('No files were uploaded.');

  const created = [];
  for (const file of files) {
    const stored = storage.saveBuffer(file.buffer, file.originalname, file.mimetype);
    const media = await Media.create({
      filename: stored.filename,
      originalName: file.originalname,
      url: stored.url,
      path: stored.relativePath,
      mimeType: stored.mimeType,
      size: stored.size,
      alt: req.body.alt || '',
      uploadedBy: req.admin ? req.admin._id : null,
    });
    created.push(media);
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: created.length === 1 ? 'File uploaded successfully.' : `${created.length} files uploaded successfully.`,
    data: { media: created },
  });
});

/**
 * POST /api/quotes/attachments - public.
 * Lightweight upload for quote-request attachments. Stored in the media
 * library but not linked to any catalog record.
 */
const uploadPublicAttachment = asyncHandler(async (req, res) => {
  const files = req.files && req.files.length ? req.files : req.file ? [req.file] : [];
  if (!files.length) throw ApiError.badRequest('No files were uploaded.');

  const created = [];
  for (const file of files) {
    const stored = storage.saveBuffer(file.buffer, file.originalname, file.mimetype);
    const media = await Media.create({
      filename: stored.filename,
      originalName: file.originalname,
      url: stored.url,
      path: stored.relativePath,
      mimeType: stored.mimeType,
      size: stored.size,
      alt: 'Quote request attachment',
      uploadedBy: null,
    });
    created.push({ url: media.url, name: file.originalname });
  }

  return sendSuccess(res, { statusCode: 201, message: 'Files uploaded successfully.', data: { files: created } });
});

/** GET /api/media - admin list with pagination + search. */
const listMedia = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search } = parseListQuery(req.query, {
    defaultLimit: 24,
    maxLimit: 100,
    defaultSort: '-createdAt',
  });

  const filter = {};
  if (search) filter.originalName = { $regex: search, $options: 'i' };

  const [items, total] = await Promise.all([
    Media.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);

  return sendSuccess(res, { message: 'OK', data: items, meta: buildPaginationMeta({ page, limit, total }) });
});

/**
 * DELETE /api/media/:id - admin.
 * Refuses to delete (unless ?force=true) when the image is referenced by
 * products, projects, services, categories, settings or homepage content.
 */
const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw ApiError.notFound('Image not found.');

  const usages = await findImageUsage(media.url);
  if (usages.length > 0 && req.query.force !== 'true') {
    throw ApiError.conflict('This image is still in use and cannot be deleted.');
  }

  storage.deleteFile(media.path);
  await media.deleteOne();

  return sendSuccess(res, { message: 'Image deleted.' });
});

/** GET /api/media/:id/usage - admin. Shows where an image is used. */
const getMediaUsage = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id).lean();
  if (!media) throw ApiError.notFound('Image not found.');

  const usages = await findImageUsage(media.url);
  return sendSuccess(res, { message: 'OK', data: { usages } });
});

module.exports = { uploadMedia, uploadPublicAttachment, listMedia, deleteMedia, getMediaUsage };
