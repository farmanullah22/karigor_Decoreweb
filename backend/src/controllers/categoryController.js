const Category = require('../models/Category');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parseListQuery, escapeRegex } = require('../utils/query');
const { toSlug, generateUniqueSlug } = require('../utils/slug');

function normalizeImage(value) {
  if (!value || !value.url) return null;
  return { url: String(value.url).trim(), alt: String(value.alt || '').trim() };
}

/**
 * GET /api/categories
 * Public list (active only) or admin list (?includeInactive=true).
 * Supports ?scope=product|project and search.
 */
const listCategories = asyncHandler(async (req, res) => {
  const isAdmin = req.query.includeInactive === 'true' && req.admin;
  const { page, limit, skip, sort, search } = parseListQuery(req.query, {
    defaultLimit: 100,
    maxLimit: 200,
    defaultSort: 'sortOrder name',
  });

  const filter = { deletedAt: null };
  if (!isAdmin) filter.isActive = true;
  if (req.query.scope) filter.scope = req.query.scope;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }

  const [items, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);

  // Attach product counts for admin tables.
  if (isAdmin) {
    const counts = await Product.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    items.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.productCount = countMap[String(item._id)] || 0;
    });
  }

  return sendSuccess(res, {
    message: 'OK',
    data: items,
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

/** GET /api/categories/:id - admin fetch by id. */
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, deletedAt: null }).lean();
  if (!category) throw ApiError.notFound('Category not found.');
  return sendSuccess(res, { message: 'OK', data: { category } });
});

/** POST /api/categories - admin. */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive, sortOrder, scope, slug } = req.body;

  const finalScope = scope === 'project' ? 'project' : 'product';
  const finalSlug = await generateUniqueSlug(
    Category,
    slug ? toSlug(slug) : toSlug(name),
    null,
    { scope: finalScope }
  );

  const category = await Category.create({
    name,
    slug: finalSlug,
    description: description || '',
    image: normalizeImage(image),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    sortOrder: Number(sortOrder) || 0,
    scope: finalScope,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Category created successfully.', data: { category } });
});

/** PUT /api/categories/:id - admin. */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, deletedAt: null });
  if (!category) throw ApiError.notFound('Category not found.');

  const { name, description, image, isActive, sortOrder, scope, slug } = req.body;

  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = normalizeImage(image);
  if (isActive !== undefined) category.isActive = Boolean(isActive);
  if (sortOrder !== undefined) category.sortOrder = Number(sortOrder) || 0;
  if (scope !== undefined) category.scope = scope === 'project' ? 'project' : 'product';

  const slugSource = slug ? toSlug(slug) : name ? toSlug(name) : null;
  if (slugSource) {
    category.slug = await generateUniqueSlug(Category, slugSource, category._id, {
      scope: category.scope,
    });
  }

  await category.save();
  return sendSuccess(res, { message: 'Category updated successfully.', data: { category } });
});

/**
 * DELETE /api/categories/:id - admin.
 * Refuses when the category still has products assigned.
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, deletedAt: null });
  if (!category) throw ApiError.notFound('Category not found.');

  const productCount = await Product.countDocuments({ category: category._id, deletedAt: null });
  if (productCount > 0) {
    throw ApiError.conflict(
      `This category still has ${productCount} product(s). Move or delete them first.`
    );
  }

  category.deletedAt = new Date();
  category.isActive = false;
  await category.save();

  return sendSuccess(res, { message: 'Category deleted successfully.' });
});

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
