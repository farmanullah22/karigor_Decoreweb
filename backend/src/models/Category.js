const mongoose = require('mongoose');
const { imageSchema, softDeleteFields } = require('./common');

/**
 * Category groups products and (optionally) projects.
 * scope: 'product' -> shown in the product catalog filters
 *        'project' -> shown in the portfolio filters
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required.'],
      trim: true,
      maxlength: [80, 'Category name is too long.'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    scope: {
      type: String,
      enum: ['product', 'project'],
      default: 'product',
      index: true,
    },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    image: { type: imageSchema, default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    ...softDeleteFields,
  },
  { timestamps: true }
);

// Slugs are unique per scope: product and project categories may share a
// name (e.g. "Windows" exists in both), so uniqueness is scope-scoped.
categorySchema.index({ slug: 1, scope: 1 }, { unique: true });
categorySchema.index({ scope: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
