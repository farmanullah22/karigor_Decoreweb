const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const Admin = require('../models/Admin');

/**
 * Sign a JWT for an admin user. Only the minimal payload is embedded.
 */
function signToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

/**
 * Authentication middleware. Expects `Authorization: Bearer <token>`.
 * Loads the admin from the database so disabled/deleted accounts lose
 * access immediately - even if their token is still valid.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Authentication required.');
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired session. Please log in again.');
    }

    const admin = await Admin.findById(payload.sub);
    if (!admin || !admin.isActive) {
      throw ApiError.unauthorized('Account is not available.');
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication. Attaches req.admin when a valid token is sent,
 * but never fails the request. Used on public list endpoints so the
 * dashboard can request inactive records with the same URL.
 */
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const admin = await Admin.findById(payload.sub);
    if (admin && admin.isActive) req.admin = admin;
  } catch (err) {
    // Ignore invalid tokens on public endpoints.
  }
  return next();
}

/**
 * Authorization middleware - restricts a route to specific roles.
 * Usage: authorize('superadmin')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.admin) return next(ApiError.unauthorized());
    if (roles.length && !roles.includes(req.admin.role)) {
      return next(ApiError.forbidden('Insufficient permissions for this action.'));
    }
    return next();
  };
}

module.exports = { signToken, authenticate, optionalAuth, authorize };
