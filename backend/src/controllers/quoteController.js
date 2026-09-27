const QuoteRequest = require('../models/QuoteRequest');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parseListQuery, escapeRegex } = require('../utils/query');
const { findOrCreateCustomerFromSubmission } = require('../services/customerService');

const STATUSES = ['new', 'reviewed', 'contacted', 'quoted', 'approved', 'rejected', 'completed'];
const SOURCES = ['quote_page', 'product', 'service', 'homepage'];
const PROJECT_TYPES = ['', 'residential', 'commercial', 'office', 'industrial', 'other'];

/**
 * POST /api/quotes - public.
 * Accepts optional attachments (already uploaded via POST /api/quotes/attachments)
 * as [{ url, name }] pairs.
 */
const createQuoteRequest = asyncHandler(async (req, res) => {
  const { name, phone, email, productService, quantity, projectType, budget, message, source, attachments } = req.body;

  const quote = await QuoteRequest.create({
    name,
    phone,
    email: email || '',
    productService: productService || '',
    quantity: quantity || '',
    projectType: PROJECT_TYPES.includes(projectType) ? projectType : '',
    budget: budget || '',
    message,
    attachments: Array.isArray(attachments)
      ? attachments.filter((a) => a && a.url).map((a) => ({ url: String(a.url), name: String(a.name || '') }))
      : [],
    source: SOURCES.includes(source) ? source : 'quote_page',
  });

  const customer = await findOrCreateCustomerFromSubmission({
    name,
    phone,
    email,
    interestedService: productService,
    type: 'quote',
  });

  quote.customer = customer._id;
  await quote.save();

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Thank you! Your quote request has been received. We will get back to you shortly.',
    data: { id: quote._id },
  });
});

/** GET /api/quotes - admin list. */
const listQuoteRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search } = parseListQuery(req.query, {
    defaultLimit: 15,
    maxLimit: 100,
    defaultSort: '-createdAt',
  });

  const filter = {};
  if (req.query.status && STATUSES.includes(req.query.status)) filter.status = req.query.status;

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { name: rx },
      { phone: rx },
      { email: rx },
      { productService: rx },
      { message: rx },
    ];
  }

  const [items, total] = await Promise.all([
    QuoteRequest.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    QuoteRequest.countDocuments(filter),
  ]);

  const statusCounts = await QuoteRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  return sendSuccess(res, {
    message: 'OK',
    data: items,
    meta: {
      ...buildPaginationMeta({ page, limit, total }),
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    },
  });
});

/** GET /api/quotes/:id - admin detail. */
const getQuoteRequestById = asyncHandler(async (req, res) => {
  const quote = await QuoteRequest.findById(req.params.id)
    .populate('customer', 'name phone email status')
    .lean();
  if (!quote) throw ApiError.notFound('Quote request not found.');
  return sendSuccess(res, { message: 'OK', data: { quote } });
});

/** PATCH /api/quotes/:id/status - admin. */
const updateQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Allowed: ${STATUSES.join(', ')}.`);
  }

  const quote = await QuoteRequest.findById(req.params.id);
  if (!quote) throw ApiError.notFound('Quote request not found.');

  quote.status = status;
  await quote.save();

  return sendSuccess(res, { message: 'Quote status updated.', data: { quote } });
});

/** PUT /api/quotes/:id/notes - admin internal notes. */
const updateQuoteNotes = asyncHandler(async (req, res) => {
  const quote = await QuoteRequest.findById(req.params.id);
  if (!quote) throw ApiError.notFound('Quote request not found.');

  quote.adminNotes = req.body.adminNotes || '';
  await quote.save();

  return sendSuccess(res, { message: 'Notes saved.', data: { quote } });
});

/** DELETE /api/quotes/:id - admin. */
const deleteQuoteRequest = asyncHandler(async (req, res) => {
  const quote = await QuoteRequest.findByIdAndDelete(req.params.id);
  if (!quote) throw ApiError.notFound('Quote request not found.');
  return sendSuccess(res, { message: 'Quote request deleted.' });
});

module.exports = {
  createQuoteRequest,
  listQuoteRequests,
  getQuoteRequestById,
  updateQuoteStatus,
  updateQuoteNotes,
  deleteQuoteRequest,
};
