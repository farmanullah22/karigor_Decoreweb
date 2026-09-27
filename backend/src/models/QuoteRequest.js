const mongoose = require('mongoose');

const PHONE_REGEX = /^[+\d][\d\s\-()]{5,24}$/;

/**
 * QuoteRequest - detailed quotation request submitted from the quote form
 * or from a product/service page ("Request a Quote").
 */
const quoteRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [100, 'Name is too long.'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required.'],
      trim: true,
      match: [PHONE_REGEX, 'Please provide a valid phone number.'],
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      maxlength: [160, 'Email is too long.'],
    },
    productService: { type: String, default: '', trim: true, maxlength: 200 },
    quantity: { type: String, default: '', trim: true, maxlength: 120 },
    projectType: {
      type: String,
      enum: ['', 'residential', 'commercial', 'office', 'industrial', 'other'],
      default: '',
    },
    budget: { type: String, default: '', trim: true, maxlength: 120 },
    message: {
      type: String,
      required: [true, 'Message is required.'],
      trim: true,
      maxlength: [4000, 'Message is too long.'],
    },
    attachments: {
      type: [{ url: String, name: String }],
      default: [],
    },
    source: {
      type: String,
      enum: ['quote_page', 'product', 'service', 'homepage'],
      default: 'quote_page',
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'contacted', 'quoted', 'approved', 'rejected', 'completed'],
      default: 'new',
      index: true,
    },
    adminNotes: { type: String, default: '', trim: true, maxlength: 4000 },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  },
  { timestamps: true }
);

quoteRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);
