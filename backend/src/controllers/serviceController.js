const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parseListQuery, escapeRegex } = require('../utils/query');
const { toSlug, generateUniqueSlug } = require('../utils/slug');

function normalizeImage(value) {
  if (!value || !value.url) return null;
  return { url: String(value.url).trim(), alt: String(value.alt || '').trim() };
}

function buildPayload(body) {
  const payload = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.shortDescription !== undefined) payload.shortDescription = body.shortDescription;
  if (body.description !== undefined) payload.description = body.description;
  if (body.icon !== undefined) payload.icon = body.icon;
  if (body.image !== undefined) payload.image = normalizeImage(body.image);
  if (body.features !== undefined) payload.features = (body.features || []).filter(Boolean).map(String);
  if (body.process !== undefined) {
    payload.process = (body.process || []).filter((step) => step && step.title);
  }
  if (body.featured !== undefined) payload.featured = Boolean(body.featured);
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);
  if (body.sortOrder !== undefined) payload.sortOrder = Number(body.sortOrder) || 0;
  return payload;
}

/** GET /api/services - public (active) or admin (?includeInactive=true). */
const listServices = asyncHandler(async (req, res) => {
  const isAdmin = req.query.includeInactive === 'true' && req.admin;
  const { page, limit, skip, sort, search } = parseListQuery(req.query, {
    defaultLimit: 12,
    maxLimit: 96,
    defaultSort: 'sortOrder -createdAt',
  });

  const filter = { deletedAt: null };
  if (!isAdmin) filter.isActive = true;
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { shortDescription: rx }, { description: rx }];
  }

  const [items, total] = await Promise.all([
    Service.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Service.countDocuments(filter),
  ]);

  return sendSuccess(res, { message: 'OK', data: items, meta: buildPaginationMeta({ page, limit, total }) });
});

/** GET /api/services/:slug - public detail. */
const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, deletedAt: null, isActive: true }).lean();
  if (!service) throw ApiError.notFound('Service not found.');

  const related = await Service.find({
    _id: { $ne: service._id },
    deletedAt: null,
    isActive: true,
  })
    .select('name slug shortDescription icon image')
    .sort('sortOrder -createdAt')
    .limit(3)
    .lean();

  return sendSuccess(res, { message: 'OK', data: { service, related } });
});

/** GET /api/services/id/:id - admin fetch by id. */
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, deletedAt: null }).lean();
  if (!service) throw ApiError.notFound('Service not found.');
  return sendSuccess(res, { message: 'OK', data: { service } });
});

/** POST /api/services - admin. */
const createService = asyncHandler(async (req, res) => {
  const payload = buildPayload(req.body);
  const slugSource = req.body.slug ? toSlug(req.body.slug) : toSlug(req.body.name);
  payload.slug = await generateUniqueSlug(Service, slugSource);

  const service = await Service.create(payload);
  return sendSuccess(res, { statusCode: 201, message: 'Service created successfully.', data: { service } });
});

/** PUT /api/services/:id - admin. */
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, deletedAt: null });
  if (!service) throw ApiError.notFound('Service not found.');

  const payload = buildPayload(req.body);

  const slugSource = req.body.slug ? toSlug(req.body.slug) : req.body.name ? toSlug(req.body.name) : null;
  if (slugSource) payload.slug = await generateUniqueSlug(Service, slugSource, service._id);

  Object.assign(service, payload);
  await service.save();

  return sendSuccess(res, { message: 'Service updated successfully.', data: { service } });
});

/** DELETE /api/services/:id - admin (soft delete). */
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, deletedAt: null });
  if (!service) throw ApiError.notFound('Service not found.');

  service.deletedAt = new Date();
  service.isActive = false;
  await service.save();

  return sendSuccess(res, { message: 'Service deleted successfully.' });
});

/** PATCH /api/services/:id/toggle - enable/disable. */
const toggleService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, deletedAt: null });
  if (!service) throw ApiError.notFound('Service not found.');

  service.isActive = !service.isActive;
  await service.save();

  return sendSuccess(res, {
    message: service.isActive ? 'Service enabled.' : 'Service disabled.',
    data: { service },
  });
});

/** PATCH /api/services/:id/featured - feature/unfeature. */
const toggleServiceFeatured = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, deletedAt: null });
  if (!service) throw ApiError.notFound('Service not found.');

  service.featured = !service.featured;
  await service.save();

  return sendSuccess(res, {
    message: service.featured ? 'Service marked as featured.' : 'Service removed from featured.',
    data: { service },
  });
});

module.exports = {
  listServices,
  getServiceBySlug,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleService,
  toggleServiceFeatured,
};
