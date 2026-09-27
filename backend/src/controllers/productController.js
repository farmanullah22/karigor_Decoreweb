const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parseListQuery, escapeRegex } = require('../utils/query');
const { toSlug, generateUniqueSlug } = require('../utils/slug');

/** Normalizes image payloads coming from the dashboard. */
function normalizeImage(value) {
  if (!value || !value.url) return null;
  return { url: String(value.url).trim(), alt: String(value.alt || '').trim() };
}

function normalizeImageList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeImage).filter(Boolean);
}

/** Builds the document payload from a validated request body. */
async function buildPayload(body, existingId = null) {
  const payload = {};

  if (body.name !== undefined) payload.name = body.name;
  if (body.category !== undefined) payload.category = body.category;
  if (body.shortDescription !== undefined) payload.shortDescription = body.shortDescription;
  if (body.description !== undefined) payload.description = body.description;
  if (body.features !== undefined) payload.features = body.features.filter(Boolean).map(String);
  if (body.specifications !== undefined) {
    payload.specifications = (body.specifications || []).filter((s) => s && s.label && s.value);
  }
  if (body.materials !== undefined) payload.materials = body.materials.filter(Boolean).map(String);
  if (body.colors !== undefined) payload.colors = body.colors.filter(Boolean).map(String);
  if (body.image !== undefined) payload.image = normalizeImage(body.image);
  if (body.gallery !== undefined) payload.gallery = normalizeImageList(body.gallery);
  if (body.featured !== undefined) payload.featured = Boolean(body.featured);
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);
  if (body.sortOrder !== undefined) payload.sortOrder = Number(body.sortOrder) || 0;

  // Slug: use the provided slug when present, otherwise derive from the name.
  const slugSource = body.slug ? toSlug(body.slug) : body.name ? toSlug(body.name) : null;
  if (slugSource) {
    payload.slug = await generateUniqueSlug(Product, slugSource, existingId);
  }

  return payload;
}

/** Ensures the referenced category exists (and is not soft-deleted). */
async function assertCategoryExists(categoryId) {
  const category = await Category.findOne({ _id: categoryId, deletedAt: null });
  if (!category) throw ApiError.badRequest('Selected category does not exist.');
  return category;
}

/**
 * GET /api/products
 * Public: active products only. Admin (?includeInactive=true): everything.
 */
const listProducts = asyncHandler(async (req, res) => {
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

  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category, scope: 'product', deletedAt: null }).select('_id');
    if (!category) {
      return sendSuccess(res, {
        message: 'OK',
        data: [],
        meta: buildPaginationMeta({ page, limit, total: 0 }),
      });
    }
    filter.category = category._id;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { shortDescription: rx }, { description: rx }];
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: false }),
    Product.countDocuments(filter),
  ]);

  return sendSuccess(res, {
    message: 'OK',
    data: items,
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

/**
 * GET /api/products/:slug
 * Public product detail by slug (includes related products).
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, deletedAt: null, isActive: true })
    .populate('category', 'name slug')
    .lean();

  if (!product) throw ApiError.notFound('Product not found.');

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category ? product.category._id : undefined,
    deletedAt: null,
    isActive: true,
  })
    .select('name slug shortDescription image category')
    .populate('category', 'name slug')
    .sort('sortOrder -createdAt')
    .limit(4)
    .lean();

  return sendSuccess(res, { message: 'OK', data: { product, related } });
});

/** GET /api/products/id/:id - admin fetch (includes inactive). */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, deletedAt: null })
    .populate('category', 'name slug')
    .lean();
  if (!product) throw ApiError.notFound('Product not found.');
  return sendSuccess(res, { message: 'OK', data: { product } });
});

/** POST /api/products - admin. */
const createProduct = asyncHandler(async (req, res) => {
  await assertCategoryExists(req.body.category);
  const payload = await buildPayload(req.body);
  const product = await Product.create(payload);
  await product.populate('category', 'name slug');
  return sendSuccess(res, { statusCode: 201, message: 'Product created successfully.', data: { product } });
});

/** PUT /api/products/:id - admin. */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, deletedAt: null });
  if (!product) throw ApiError.notFound('Product not found.');

  if (req.body.category !== undefined) await assertCategoryExists(req.body.category);

  const payload = await buildPayload(req.body, product._id);
  Object.assign(product, payload);
  await product.save();
  await product.populate('category', 'name slug');

  return sendSuccess(res, { message: 'Product updated successfully.', data: { product } });
});

/**
 * DELETE /api/products/:id - admin.
 * Soft delete: the record is hidden everywhere but recoverable in the DB.
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, deletedAt: null });
  if (!product) throw ApiError.notFound('Product not found.');

  product.deletedAt = new Date();
  product.isActive = false;
  await product.save();

  return sendSuccess(res, { message: 'Product deleted successfully.' });
});

/** PATCH /api/products/:id/toggle - enable/disable. */
const toggleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, deletedAt: null });
  if (!product) throw ApiError.notFound('Product not found.');

  product.isActive = !product.isActive;
  await product.save();

  return sendSuccess(res, {
    message: product.isActive ? 'Product enabled.' : 'Product disabled.',
    data: { product },
  });
});

/** PATCH /api/products/:id/featured - feature/unfeature. */
const toggleProductFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, deletedAt: null });
  if (!product) throw ApiError.notFound('Product not found.');

  product.featured = !product.featured;
  await product.save();

  return sendSuccess(res, {
    message: product.featured ? 'Product marked as featured.' : 'Product removed from featured.',
    data: { product },
  });
});

module.exports = {
  listProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
  toggleProductFeatured,
};
