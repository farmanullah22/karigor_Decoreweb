const Inquiry = require('../models/Inquiry');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parseListQuery, escapeRegex } = require('../utils/query');
const { findOrCreateCustomerFromSubmission } = require('../services/customerService');

const STATUSES = ['new', 'contacted', 'in_progress', 'completed', 'closed'];

/**
 * POST /api/inquiries - public.
 * Creates the inquiry, links it to a customer/lead record and returns a
 * friendly confirmation message.
 */
const createInquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, subject, service, message, source } = req.body;

  const inquiry = await Inquiry.create({
    name,
    phone,
    email: email || '',
    subject: subject || '',
    service: service || '',
    message,
    source: ['contact_form', 'product', 'service', 'footer'].includes(source) ? source : 'contact_form',
  });

  const customer = await findOrCreateCustomerFromSubmission({
    name,
    phone,
    email,
    interestedService: service,
    type: 'inquiry',
  });

  inquiry.customer = customer._id;
  await inquiry.save();

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Thank you! Your message has been received. Our team will contact you soon.',
    data: { id: inquiry._id },
  });
});

/** GET /api/inquiries - admin list with filters + search + pagination. */
const listInquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search } = parseListQuery(req.query, {
    defaultLimit: 15,
    maxLimit: 100,
    defaultSort: '-createdAt',
  });

  const filter = {};
  if (req.query.status && STATUSES.includes(req.query.status)) filter.status = req.query.status;

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { subject: rx }, { message: rx }];
  }

  const [items, total] = await Promise.all([
    Inquiry.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Inquiry.countDocuments(filter),
  ]);

  const statusCounts = await Inquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  return sendSuccess(res, {
    message: 'OK',
    data: items,
    meta: {
      ...buildPaginationMeta({ page, limit, total }),
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    },
  });
});

/** GET /api/inquiries/:id - admin detail. */
const getInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id).populate('customer', 'name phone email status').lean();
  if (!inquiry) throw ApiError.notFound('Inquiry not found.');
  return sendSuccess(res, { message: 'OK', data: { inquiry } });
});

/** PATCH /api/inquiries/:id/status - admin. */
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Allowed: ${STATUSES.join(', ')}.`);
  }

  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found.');

  inquiry.status = status;
  await inquiry.save();

  return sendSuccess(res, { message: 'Inquiry status updated.', data: { inquiry } });
});

/** PUT /api/inquiries/:id/notes - admin internal notes. */
const updateInquiryNotes = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found.');

  inquiry.adminNotes = req.body.adminNotes || '';
  await inquiry.save();

  return sendSuccess(res, { message: 'Notes saved.', data: { inquiry } });
});

/** DELETE /api/inquiries/:id - admin. */
const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found.');
  return sendSuccess(res, { message: 'Inquiry deleted.' });
});

module.exports = {
  createInquiry,
  listInquiries,
  getInquiryById,
  updateInquiryStatus,
  updateInquiryNotes,
  deleteInquiry,
};
