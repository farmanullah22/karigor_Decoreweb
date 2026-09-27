/**
 * Consistent API response helpers.
 * Every endpoint returns { success, message, data } on success and
 * { success: false, message } on failure.
 */

function sendSuccess(res, { statusCode = 200, message = 'OK', data = undefined, meta = undefined } = {}) {
  const payload = { success: true, message };
  if (data !== undefined) payload.data = data;
  if (meta !== undefined) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

function buildPaginationMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { sendSuccess, buildPaginationMeta };
