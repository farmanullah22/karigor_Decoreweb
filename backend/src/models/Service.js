const mongoose = require('mongoose');
const { imageSchema, textItemSchema, softDeleteFields } = require('./common');

/**
 * Service - custom fabrication / installation work offered by the company
 * (aluminum fabrication, glass installation, interior decoration, ...).
 */
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required.'],
      trim: true,
      maxlength: [120, 'Service name is too long.'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Short description must be 300 characters or less.'],
    },
    description: { type: String, default: '', trim: true },
    icon: { type: String, default: '', trim: true }, // icon key rendered by the frontend
    image: { type: imageSchema, default: null },
    features: { type: [String], default: [] },
    process: { type: [textItemSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    ...softDeleteFields,
  },
  { timestamps: true }
);

serviceSchema.index({ isActive: 1, featured: 1, sortOrder: 1 });

module.exports = mongoose.model('Service', serviceSchema);
