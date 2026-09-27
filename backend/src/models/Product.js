const mongoose = require('mongoose');
const { imageSchema, specificationSchema, softDeleteFields } = require('./common');

/**
 * Product - a physical product offered by Karigor Decore
 * (windows, doors, glass, aluminum, partitions, decoration items...).
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required.'],
      trim: true,
      maxlength: [120, 'Product name is too long.'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required.'],
      index: true,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Short description must be 300 characters or less.'],
    },
    description: { type: String, default: '', trim: true },
    features: { type: [String], default: [] },
    specifications: { type: [specificationSchema], default: [] },
    materials: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    image: { type: imageSchema, default: null },
    gallery: { type: [imageSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    ...softDeleteFields,
  },
  { timestamps: true }
);

productSchema.index({ isActive: 1, featured: 1, sortOrder: 1, createdAt: -1 });
productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
