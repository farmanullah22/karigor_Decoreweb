const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * 404 handler for unknown routes.
 */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Global error handler.
 * - Translates known Mongoose/JWT/Multer errors into clean messages.
 * - Never leaks stack traces or internal details to clients.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';
  let details = err.details;

  // Mongoose: invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier format.';
  }

  // Mongoose: validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose: duplicate key (unique index)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  // Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File is too large. Maximum allowed size is ${env.uploadMaxMb}MB.`;
    } else {
      message = `File upload error: ${err.code}`;
    }
  }

  // JWT errors (safety net - normally handled in auth middleware)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired session.';
  }

  // Unknown/unexpected errors are logged server-side but never exposed.
  if (!err.isOperational) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
    if (env.isProduction) {
      message = 'Internal server error.';
      details = undefined;
    }
  }
  if (statusCode >= 500 && env.isProduction) message = 'Internal server error.';

  const payload = { success: false, message };
  if (details) payload.details = details;
  if (!env.isProduction && statusCode >= 500) payload.stack = err.stack;

  res.status(statusCode).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
