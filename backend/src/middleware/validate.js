const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after express-validator chains; converts failures into a single
 * 400 response containing structured field-level details.
 */
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return next(ApiError.badRequest('Please check the highlighted fields and try again.', details));
}

module.exports = validate;
