const mongoose = require('mongoose');

/**
 * Customer / lead generated from contact forms, quote requests and
 * product inquiries. Created and updated automatically by the
 * `customerService` so the owner always has one unified contact list.
 */
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required.'],
      trim: true,
      maxlength: [100, 'Name is too long.'],
    },
    phone: { type: String, default: '', trim: true, index: true },
    email: { type: String, default: '', lowercase: true, trim: true, index: true },
    interestedServices: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['lead', 'contacted', 'customer', 'inactive'],
      default: 'lead',
      index: true,
    },
    notes: { type: String, default: '', trim: true, maxlength: 4000 },
    lastContactAt: { type: Date, default: Date.now },
    inquiryCount: { type: Number, default: 0 },
    quoteCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);
