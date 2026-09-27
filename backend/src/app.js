const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const apiRoutes = require('./routes');
const { getSitemap } = require('./controllers/sitemapController');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { UPLOAD_ROOT } = require('./services/mediaStorage');

const app = express();

// Behind a reverse proxy (Nginx, Vercel, etc.) trust the forwarded headers.
app.set('trust proxy', 1);

// ---------- Security ----------
app.use(
  helmet({
    // Allow images from this API to be displayed on the frontend origin.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin/server-to-server requests (no Origin header) and
      // any origin configured through FRONTEND_URL.
      if (!origin || env.frontendUrls.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: false,
  })
);

// Block MongoDB operator injection ($ne, $gt, ...) in request inputs.
app.use(mongoSanitize());

// ---------- Parsers & basics ----------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

if (!env.isProduction) app.use(morgan('dev'));

// ---------- Static files ----------
// Uploaded images - long cache, immutable filenames.
app.use(
  '/uploads',
  express.static(UPLOAD_ROOT, {
    maxAge: '30d',
    immutable: true,
    index: false,
  })
);

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Karigor Decore API is running.' });
});

app.use('/api', generalLimiter, apiRoutes);

// SEO: sitemap generated from live content.
app.get('/sitemap.xml', getSitemap);

// ---------- Errors ----------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
