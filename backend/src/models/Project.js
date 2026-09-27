const mongoose = require('mongoose');
const { imageSchema, softDeleteFields } = require('./common');

/**
 * Project - a completed (or ongoing) portfolio piece.
 */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required.'],
      trim: true,
      maxlength: [140, 'Project name is too long.'],
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
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    location: { type: String, default: '', trim: true, maxlength: 160 },
    completionDate: { type: Date, default: null },
    description: { type: String, default: '', trim: true },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Short description must be 300 characters or less.'],
    },
    materialsUsed: { type: [String], default: [] },
    servicesProvided: { type: [String], default: [] },
    coverImage: { type: imageSchema, default: null },
    gallery: { type: [imageSchema], default: [] },
    featured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    ...softDeleteFields,
  },
  { timestamps: true }
);

projectSchema.index({ isActive: 1, featured: 1, sortOrder: 1, createdAt: -1 });
projectSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
