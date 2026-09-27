const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parseListQuery, escapeRegex } = require('../utils/query');
const { toSlug, generateUniqueSlug } = require('../utils/slug');

function normalizeImage(value) {
  if (!value || !value.url) return null;
  return { url: String(value.url).trim(), alt: String(value.alt || '').trim() };
}

function normalizeImageList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeImage).filter(Boolean);
}

function buildPayload(body) {
  const payload = {};
  if (body.name !== undefined) payload.name = body.name;
  if (body.category !== undefined) payload.category = body.category;
  if (body.location !== undefined) payload.location = body.location;
  if (body.completionDate !== undefined) {
    payload.completionDate = body.completionDate ? new Date(body.completionDate) : null;
  }
  if (body.description !== undefined) payload.description = body.description;
  if (body.shortDescription !== undefined) payload.shortDescription = body.shortDescription;
  if (body.materialsUsed !== undefined) payload.materialsUsed = body.materialsUsed.filter(Boolean).map(String);
  if (body.servicesProvided !== undefined) {
    payload.servicesProvided = body.servicesProvided.filter(Boolean).map(String);
  }
  if (body.coverImage !== undefined) payload.coverImage = normalizeImage(body.coverImage);
  if (body.gallery !== undefined) payload.gallery = normalizeImageList(body.gallery);
  if (body.featured !== undefined) payload.featured = Boolean(body.featured);
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);
  if (body.sortOrder !== undefined) payload.sortOrder = Number(body.sortOrder) || 0;
  return payload;
}

/** GET /api/projects - public (published) or admin (?includeInactive=true). */
const listProjects = asyncHandler(async (req, res) => {
  const isAdmin = req.query.includeInactive === 'true' && req.admin;
  const { page, limit, skip, sort, search } = parseListQuery(req.query, {
    defaultLimit: 12,
    maxLimit: 96,
    defaultSort: 'sortOrder -completionDate -createdAt',
  });

  const filter = { deletedAt: null };
  if (!isAdmin) filter.isActive = true;
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;
  if (req.query.category) filter.category = req.query.category;

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { location: rx }, { shortDescription: rx }, { description: rx }];
  }

  const [items, total] = await Promise.all([
    Project.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Project.countDocuments(filter),
  ]);

  return sendSuccess(res, { message: 'OK', data: items, meta: buildPaginationMeta({ page, limit, total }) });
});

/** GET /api/projects/categories - distinct categories for public filters. */
const listProjectCategories = asyncHandler(async (req, res) => {
  const categories = await Project.distinct('category', {
    deletedAt: null,
    isActive: true,
    category: { $nin: [null, ''] },
  });
  return sendSuccess(res, { message: 'OK', data: categories.sort() });
});

/** GET /api/projects/:slug - public detail. */
const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, deletedAt: null, isActive: true }).lean();
  if (!project) throw ApiError.notFound('Project not found.');

  const related = await Project.find({
    _id: { $ne: project._id },
    deletedAt: null,
    isActive: true,
    ...(project.category ? { category: project.category } : {}),
  })
    .select('name slug shortDescription coverImage category location')
    .sort('sortOrder -completionDate')
    .limit(3)
    .lean();

  return sendSuccess(res, { message: 'OK', data: { project, related } });
});

/** GET /api/projects/id/:id - admin fetch by id. */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null }).lean();
  if (!project) throw ApiError.notFound('Project not found.');
  return sendSuccess(res, { message: 'OK', data: { project } });
});

/** POST /api/projects - admin. */
const createProject = asyncHandler(async (req, res) => {
  const payload = buildPayload(req.body);
  const slugSource = req.body.slug ? toSlug(req.body.slug) : toSlug(req.body.name);
  payload.slug = await generateUniqueSlug(Project, slugSource);

  const project = await Project.create(payload);
  return sendSuccess(res, { statusCode: 201, message: 'Project created successfully.', data: { project } });
});

/** PUT /api/projects/:id - admin. */
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null });
  if (!project) throw ApiError.notFound('Project not found.');

  const payload = buildPayload(req.body);
  const slugSource = req.body.slug ? toSlug(req.body.slug) : req.body.name ? toSlug(req.body.name) : null;
  if (slugSource) payload.slug = await generateUniqueSlug(Project, slugSource, project._id);

  Object.assign(project, payload);
  await project.save();

  return sendSuccess(res, { message: 'Project updated successfully.', data: { project } });
});

/** DELETE /api/projects/:id - admin (soft delete). */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null });
  if (!project) throw ApiError.notFound('Project not found.');

  project.deletedAt = new Date();
  project.isActive = false;
  await project.save();

  return sendSuccess(res, { message: 'Project deleted successfully.' });
});

/** PATCH /api/projects/:id/toggle - publish/unpublish. */
const toggleProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null });
  if (!project) throw ApiError.notFound('Project not found.');

  project.isActive = !project.isActive;
  await project.save();

  return sendSuccess(res, {
    message: project.isActive ? 'Project published.' : 'Project unpublished.',
    data: { project },
  });
});

/** PATCH /api/projects/:id/featured - feature/unfeature. */
const toggleProjectFeatured = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null });
  if (!project) throw ApiError.notFound('Project not found.');

  project.featured = !project.featured;
  await project.save();

  return sendSuccess(res, {
    message: project.featured ? 'Project marked as featured.' : 'Project removed from featured.',
    data: { project },
  });
});

module.exports = {
  listProjects,
  listProjectCategories,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleProject,
  toggleProjectFeatured,
};
