/**
 * Parses pagination/sort/search query parameters used by all list endpoints.
 * Keeps query parsing consistent and protects against huge page sizes.
 */
function parseListQuery(query = {}, options = {}) {
  const { defaultLimit = 12, maxLimit = 100, defaultSort = '-createdAt' } = options;

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const sort = typeof query.sort === 'string' && query.sort.trim() ? query.sort.trim() : defaultSort;
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  return { page, limit, skip: (page - 1) * limit, sort, search };
}

/**
 * Escapes user input before using it inside a RegExp for text search.
 */
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { parseListQuery, escapeRegex };
