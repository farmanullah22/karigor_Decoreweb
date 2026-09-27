require('dotenv').config();

/**
 * Central environment configuration.
 * All secrets are read from environment variables - nothing sensitive is
 * hard-coded. Fails fast in production when required values are missing.
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  uploadMaxMb: parseInt(process.env.UPLOAD_MAX_MB, 10) || 5,
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
};

const missing = [];
if (!env.mongodbUri) missing.push('MONGODB_URI');
if (!env.jwtSecret) missing.push('JWT_SECRET');

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`[config] Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

if (env.isProduction && env.jwtSecret.length < 32) {
  // eslint-disable-next-line no-console
  console.error('[config] JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}

module.exports = env;
