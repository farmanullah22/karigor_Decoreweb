const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parseListQuery, escapeRegex } = require('../utils/query');

const STATUSES = ['lead', 'contacted', 'customer', 'inactive'];

/** GET /api/customers - admin list with search/filter/pagination. */
const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search } = parseListQuery(req.query, {
    defaultLimit: 15,
    maxLimit: 100,
    defaultSort: '-lastContactAt',
  });

  const filter = {};
  if (req.query.status && STATUSES.includes(req.query.status)) filter.status = req.query.status;

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { interestedServices: rx }];
  }

  const [items, total] = await Promise.all([
    Customer.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);

  const statusCounts = await Customer.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  return sendSuccess(res, {
    message: 'OK',
    data: items,
    meta: {
      ...buildPaginationMeta({ page, limit, total }),
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    },
  });
});

/** GET /api/customers/:id - admin detail. */
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).lean();
  if (!customer) throw ApiError.notFound('Customer not found.');

  const [Inquiry, QuoteRequest] = [require('../models/Inquiry'), require('../models/QuoteRequest')];
  const [inquiries, quotes] = await Promise.all([
    Inquiry.find({ customer: customer._id }).sort('-createdAt').limit(20).lean(),
    QuoteRequest.find({ customer: customer._id }).sort('-createdAt').limit(20).lean(),
  ]);

  return sendSuccess(res, { message: 'OK', data: { customer, inquiries, quotes } });
});

/**
 * PUT /api/customers/:id - admin.
 * Allows updating contact info, status and internal notes.
 */
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found.');

  const { name, phone, email, status, notes, interestedServices } = req.body;

  if (name !== undefined) customer.name = name;
  if (phone !== undefined) customer.phone = phone;
  if (email !== undefined) customer.email = String(email).toLowerCase();
  if (status !== undefined) {
    if (!STATUSES.includes(status)) throw ApiError.badRequest('Invalid customer status.');
    customer.status = status;
  }
  if (notes !== undefined) customer.notes = notes;
  if (interestedServices !== undefined) {
    customer.interestedServices = interestedServices.filter(Boolean).map(String);
  }

  await customer.save();
  return sendSuccess(res, { message: 'Customer updated successfully.', data: { customer } });
});

/** DELETE /api/customers/:id - admin. */
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) throw ApiError.notFound('Customer not found.');
  return sendSuccess(res, { message: 'Customer deleted.' });
});

module.exports = { listCustomers, getCustomerById, updateCustomer, deleteCustomer };
