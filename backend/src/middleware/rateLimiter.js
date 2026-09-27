const rateLimit = require('express-rate-limit');

/**
 * Rate limiters for different traffic profiles.
 * Disabled (raised) in development so local testing is not blocked.
 */
const env = require('../config/env');

const passthrough = (req, res, next) => next();

const generalLimiter = env.isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 600,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests. Please try again later.' },
    })
  : passthrough;

/** Stricter limit for login attempts to slow down credential stuffing. */
const authLimiter = env.isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many login attempts. Please try again in a few minutes.' },
    })
  : passthrough;

/** Public form submissions (inquiries/quotes) - anti-spam. */
const publicFormLimiter = env.isProduction
  ? rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many submissions. Please try again later.' },
    })
  : passthrough;

module.exports = { generalLimiter, authLimiter, publicFormLimiter };
