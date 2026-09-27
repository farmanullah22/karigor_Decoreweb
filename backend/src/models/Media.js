const mongoose = require('mongoose');

/**
 * Media - an uploaded image tracked by the media library.
 * `path` is the storage-relative path used to delete the physical file.
 */
const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, trim: true },
    originalName: { type: String, default: '', trim: true },
    url: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true, unique: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    alt: { type: String, default: '', trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

mediaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);
