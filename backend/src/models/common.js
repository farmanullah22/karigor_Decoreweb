const { Schema } = require('mongoose');

/**
 * Reusable image sub-schema: every image in the system carries a URL and
 * descriptive alt text (important for SEO and accessibility).
 */
const imageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: '', trim: true },
  },
  { _id: false }
);

/** Reusable label/value pair for product specifications. */
const specificationSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

/** Reusable feature/step item used by products, services and projects. */
const textItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
);

/** Fields every soft-deletable catalog document shares. */
const softDeleteFields = {
  deletedAt: { type: Date, default: null, index: true },
};

/** Default query helper - excludes soft-deleted documents. */
function notDeletedFilter(extra = {}) {
  return { deletedAt: null, ...extra };
}

module.exports = { imageSchema, specificationSchema, textItemSchema, softDeleteFields, notDeletedFilter };
