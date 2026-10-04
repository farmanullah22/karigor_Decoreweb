const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/seed-images')));

const data = require('./src/seed/data');
const { toSlug } = require('./src/utils/slug');
const ok = (payload, meta) => ({ success: true, message: 'OK', data: payload, meta });

const productCategories = data.productCategories.map((c, i) => ({
  _id: `cat-p-${i + 1}`,
  name: c.name,
  slug: toSlug(c.name),
  scope: 'product',
  isActive: true,
}));

const products = data.products.map((p, i) => ({
  _id: `prod-${i + 1}`,
  name: p.name,
  slug: toSlug(p.name),
  category: productCategories.find((c) => c.name === p.category)?._id || null,
  shortDescription: p.shortDescription || '',
  description: p.description || '',
  features: p.features || [],
  specifications: p.specifications || [],
  price: p.price || 0,
  image: { url: p.image, alt: p.name },
  gallery: (p.gallery || []).map((g, gi) => ({ url: g, alt: `${p.name} - view ${gi + 2}` })),
  isActive: true,
  featured: !!p.featured,
  tags: p.tags || [],
  sortOrder: i,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const services = data.services.map((s, i) => ({
  _id: `serv-${i + 1}`,
  name: s.name,
  slug: toSlug(s.name),
  icon: s.icon || '',
  shortDescription: s.shortDescription || '',
  description: s.description || '',
  image: { url: s.image || `/seed-images/service-${s.icon || 'ruler'}.svg`, alt: s.name },
  gallery: (s.gallery || []).map((g, gi) => ({ url: g, alt: `${s.name} - view ${gi + 2}` })),
  steps: s.steps || [],
  featured: !!s.featured,
  isActive: true,
  sortOrder: i,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const projects = data.projects.map((p, i) => ({
  _id: `proj-${i + 1}`,
  name: p.name,
  slug: toSlug(p.name),
  category: p.category || '',
  shortDescription: p.shortDescription || '',
  description: p.description || '',
  location: p.location || '',
  client: p.client || '',
  completionDate: p.completionDate || null,
  area: p.area || '',
  coverImage: { url: p.coverImage, alt: p.name },
  gallery: (p.gallery || []).map((g, gi) => ({ url: g, alt: `${p.name} - view ${gi + 2}` })),
  featured: !!p.featured,
  isActive: true,
  sortOrder: i,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const settings = JSON.parse(JSON.stringify(data.settings || {}));
const homepage = JSON.parse(JSON.stringify(data.homepage || {}));

const inquiries = [];
const quotes = [];
const customers = [];

app.get('/api/health', (req, res) => res.json({ success: true, message: 'OK' }));
app.get('/api/categories', (req, res) => res.json(ok(productCategories)));
app.get('/api/products', (req, res) => res.json(ok(products, { total: products.length, page: 1, limit: products.length, totalPages: 1 })));
app.get('/api/products/:slug', (req, res) => {
  const p = products.find((x) => x.slug === req.params.slug);
  if (!p) return res.status(404).json({ success: false, message: 'Not found' });
  const related = products.filter((x) => x._id !== p._id).slice(0, 3);
  res.json(ok({ product: p, related }));
});
app.get('/api/services', (req, res) => res.json(ok(services, { total: services.length, page: 1, limit: services.length, totalPages: 1 })));
app.get('/api/services/:slug', (req, res) => {
  const s = services.find((x) => x.slug === req.params.slug);
  if (!s) return res.status(404).json({ success: false, message: 'Not found' });
  const related = services.filter((x) => x._id !== s._id).slice(0, 3);
  res.json(ok({ service: s, related }));
});
app.get('/api/projects/categories', (req, res) => res.json(ok([...new Set(projects.map((p) => p.category).filter(Boolean))])));
app.get('/api/projects', (req, res) => res.json(ok(projects, { total: projects.length, page: 1, limit: projects.length, totalPages: 1 })));
app.get('/api/projects/:slug', (req, res) => {
  const p = projects.find((x) => x.slug === req.params.slug);
  if (!p) return res.status(404).json({ success: false, message: 'Not found' });
  const related = projects.filter((x) => x._id !== p._id).slice(0, 3);
  res.json(ok({ project: p, related }));
});
app.get('/api/settings', (req, res) => res.json(ok({ settings })));
app.get('/api/settings/admin', (req, res) => res.json(ok({ settings })));
app.put('/api/settings', (req, res) => { if (req.body) Object.assign(settings, req.body); res.json(ok({ settings })); });
app.get('/api/homepage', (req, res) => res.json(ok({ homepage, featuredProducts: products.filter((p) => p.featured).slice(0,6), featuredServices: services.filter((s) => s.featured).slice(0,6), featuredProjects: projects.filter((p) => p.featured).slice(0,6) })));
app.get('/api/homepage/admin', (req, res) => res.json(ok({ homepage })));
app.put('/api/homepage', (req, res) => { const b = req.body || {}; if (b.hero) homepage.hero = { ...homepage.hero, ...b.hero }; if (b.about) homepage.about = { ...homepage.about, ...b.about }; if (b.sections) homepage.sections = { ...homepage.sections, ...b.sections }; if (b.cta) homepage.cta = { ...homepage.cta, ...b.cta }; if (b.seo) homepage.seo = { ...homepage.seo, ...b.seo }; res.json(ok({ homepage })); });
app.post('/api/inquiries', (req, res) => res.status(201).json({ success: true, message: 'Thank you. Your message has been received.' }));
app.post('/api/quotes', (req, res) => res.status(201).json({ success: true, message: 'Quote request submitted. We will get back to you within 24 hours.' }));
app.post('/api/quotes/attachments', (req, res) => res.json(ok({ files: [] })));
app.get('/api/dashboard/stats', (req, res) => res.json(ok({ totalProducts: products.length, totalServices: services.length, totalProjects: projects.length, totalInquiries: inquiries.length, totalQuotes: quotes.length, totalCustomers: customers.length })));
app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[api-shim] listening on http://localhost:${PORT}`);
  console.log(`[api-shim] ${products.length} products, ${services.length} services, ${projects.length} projects`);
});
