const Product = require('../models/Product');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');
const Customer = require('../models/Customer');
const Media = require('../models/Media');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/dashboard/stats
 * All numbers are computed from live database data - no fake analytics.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    totalProjects,
    totalServices,
    totalCategories,
    totalMedia,
    totalCustomers,
    newInquiries,
    pendingQuotes,
    totalQuoteRequests,
    totalInquiries,
    recentInquiries,
    recentQuotes,
    productsByCategory,
    monthlyInquiries,
    monthlyQuotes,
  ] = await Promise.all([
    Product.countDocuments({ deletedAt: null }),
    Project.countDocuments({ deletedAt: null }),
    Service.countDocuments({ deletedAt: null }),
    Category.countDocuments({ deletedAt: null }),
    Media.countDocuments({}),
    Customer.countDocuments({}),
    Inquiry.countDocuments({ status: 'new' }),
    QuoteRequest.countDocuments({ status: 'new' }),
    QuoteRequest.countDocuments({}),
    Inquiry.countDocuments({}),
    Inquiry.find({}).sort('-createdAt').limit(6).lean(),
    QuoteRequest.find({}).sort('-createdAt').limit(6).lean(),
    Product.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$category.name', 'Uncategorized'] }, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    // Inquiries per month for the last 6 months.
    Inquiry.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo() } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    QuoteRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo() } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  return sendSuccess(res, {
    message: 'OK',
    data: {
      totals: {
        products: totalProducts,
        projects: totalProjects,
        services: totalServices,
        categories: totalCategories,
        media: totalMedia,
        customers: totalCustomers,
        inquiries: totalInquiries,
        newInquiries,
        quoteRequests: totalQuoteRequests,
        pendingQuotes,
      },
      recentInquiries,
      recentQuotes,
      productsByCategory: productsByCategory.map((item) => ({ name: item.name, count: item.count })),
      monthly: buildMonthlySeries(monthlyInquiries, monthlyQuotes),
    },
  });
});

function sixMonthsAgo() {
  const date = new Date();
  date.setMonth(date.getMonth() - 5);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Merge inquiries/quotes aggregates into a fixed last-6-months series. */
function buildMonthlySeries(inquiryAgg, quoteAgg) {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      monthIndex: date.getMonth() + 1,
      inquiries: 0,
      quotes: 0,
    });
  }

  months.forEach((month) => {
    const inq = inquiryAgg.find((a) => a._id.year === month.year && a._id.month === month.monthIndex);
    const quo = quoteAgg.find((a) => a._id.year === month.year && a._id.month === month.monthIndex);
    month.inquiries = inq ? inq.count : 0;
    month.quotes = quo ? quo.count : 0;
  });

  return months;
}

module.exports = { getDashboardStats };
