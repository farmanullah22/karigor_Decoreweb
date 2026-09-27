const mongoose = require('mongoose');

const PHONE_REGEX = /^[+\d][\d\s\-()]{5,24}$/;

/**
 * Inquiry - submission from the public contact form (or a product/service
 * inquiry). Appears in the dashboard under Customers > Inquiries.
 */
const inquirySchema = new mongoose.Schema(
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
    subject: { type: String, default: '', trim: true, maxlength: 200 },
    service: { type: String, default: '', trim: true, maxlength: 160 },
    message: {
      type: String,
      required: [true, 'Message is required.'],
      trim: true,
      maxlength: [4000, 'Message is too long.'],
    },
    source: {
      type: String,
      enum: ['contact_form', 'product', 'service', 'footer'],
      default: 'contact_form',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'completed', 'closed'],
      default: 'new',
      index: true,
    },
    adminNotes: { type: String, default: '', trim: true, maxlength: 4000 },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
