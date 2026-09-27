const slugify = require('slugify');

/**
 * Generate a URL-safe slug from any text.
 * Example: "Aluminum Sliding Windows — 2 Track!" -> "aluminum-sliding-windows-2-track"
 */
function toSlug(text) {
  return slugify(String(text || ''), {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Generate a slug that is guaranteed unique for the given model.
 * If the base slug is taken, appends -2, -3, ... until available.
 * @param {import('mongoose').Model} Model
 * @param {string} text
 * @param {string} [excludeId] - document id to exclude (when updating)
 * @param {object} [extraFilter] - extra query conditions, e.g. { scope: 'product' }
 *   for models where uniqueness is scoped to a parent/group field.
 */
async function generateUniqueSlug(Model, text, excludeId = null, extraFilter = null) {
  const base = toSlug(text) || 'item';
  let candidate = base;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    if (extraFilter) Object.assign(query, extraFilter);
    const exists = await Model.exists(query);
    if (!exists) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

module.exports = { toSlug, generateUniqueSlug };
