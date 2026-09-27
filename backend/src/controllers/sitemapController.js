const Product = require('../models/Product');
const Project = require('../models/Project');
const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /sitemap.xml
 * Generates a sitemap from live data (static pages + every published
 * product, service and project). The frontend origin is taken from
 * FRONTEND_URL so URLs point at the public website, not the API.
 */
const getSitemap = asyncHandler(async (req, res) => {
  const origin = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

  const [products, services, projects] = await Promise.all([
    Product.find({ deletedAt: null, isActive: true }).select('slug updatedAt').lean(),
    Service.find({ deletedAt: null, isActive: true }).select('slug updatedAt').lean(),
    Project.find({ deletedAt: null, isActive: true }).select('slug updatedAt').lean(),
  ]);

  const staticPages = ['/', '/about', '/products', '/services', '/projects', '/contact', '/quote'];

  const urls = [
    ...staticPages.map((path) => ({ loc: `${origin}${path}`, priority: path === '/' ? '1.0' : '0.8' })),
    ...products.map((p) => ({ loc: `${origin}/products/${p.slug}`, lastmod: p.updatedAt, priority: '0.7' })),
    ...services.map((s) => ({ loc: `${origin}/services/${s.slug}`, lastmod: s.updatedAt, priority: '0.7' })),
    ...projects.map((p) => ({ loc: `${origin}/projects/${p.slug}`, lastmod: p.updatedAt, priority: '0.7' })),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) =>
        `  <url><loc>${url.loc}</loc>${url.lastmod ? `<lastmod>${new Date(url.lastmod).toISOString()}</lastmod>` : ''}<priority>${url.priority}</priority></url>`
    ),
    '</urlset>',
  ].join('\n');

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

module.exports = { getSitemap };
