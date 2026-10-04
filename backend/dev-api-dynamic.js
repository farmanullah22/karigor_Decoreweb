/**
 * Temporary local API shim for the Karigor Decore backend.
 *
 * WHY THIS EXISTS: the real server (src/server.js) requires MongoDB, and
 * `mongod.exe` cannot start on this machine (the Windows install is missing
 * several UCRT API-set DLLs). This shim serves the same REST contract the
 * frontend expects, backed by the project's own seed data, so the site can be
 * developed and reviewed in the browser.
 *
 * Response shapes mirror frontend/src/services/endpoints.js exactly:
 *   GET /api/products        -> { success, data: [...], meta }
 *   GET /api/products/:slug  -> { success, data: { product, related } }
 *   GET /api/settings        -> { success, data: { settings } }
 *   GET /api/homepage        -> { success, data: { homepage, featured* } }
 *
 * DELETE this file and run `npm run seed && npm run dev` once MongoDB works.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// Dev shim: reflect any origin so the Vite proxy / local tools can call it.
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// Uploaded media falls back to the bundled placeholder art in development.
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/seed-images')));

const data = require('./src/seed/data');
const { toSlug } = require('./src/utils/slug');

const ok = (payload, meta) => ({ success: true, message: 'OK', data: payload, meta });

const productCategories = data.productCategories.map((c) => ({
  ...c,
  _id: toSlug(c.name),
  slug: toSlug(c.name),
  scope: 'product',
  isActive: true,
}));

const products = data.products.map((p, i) => ({
  ...p,
  _id: `prod-${i + 1}`,
  slug: toSlug(p.name),
  category: productCategories.find((c) => c.name === p.category) || null,
  image: { url: p.image, alt: p.name },
  gallery: (p.gallery || []).map((g, gi) => ({ url: g, alt: `${p.name} - view ${gi + 2}` })),
  isActive: true,
  createdAt: new Date().toISOString(),
}));

const services = data.services.map((s, i) => ({
  ...s,
  _id: `serv-${i + 1}`,
  slug: toSlug(s.name),
  image: { url: s.image || `/seed-images/service-${s.icon || 'ruler'}.svg`, alt: s.name },
  isActive: true,
  createdAt: new Date().toISOString(),
}));

const projects = data.projects.map((p, i) => ({
  ...p,
  _id: `proj-${i + 1}`,
  slug: toSlug(p.name),
  // Seed data stores a plain path in `coverImage`; the UI expects { url, alt }.
  coverImage: { url: p.coverImage, alt: p.name },
  gallery: (p.gallery || []).map((g, gi) => ({ url: g, alt: `${p.name} - view ${gi + 2}` })),
  isActive: true,
  createdAt: new Date().toISOString(),
}));

const settings = {
  companyName: 'Karigor Decore',
  tagline: 'Modern Windows, Glass, Aluminum & Interior Solutions',
  email: 'info@karigordecore.com',
  phone: '+880 1712345678',
  address: 'House 42, Road 11, Banani, Dhaka 1213, Bangladesh',
  website: 'https://karigordecore.com',
  businessHours: [
    { days: 'Saturday - Thursday', hours: '9:00 AM - 7:00 PM' },
    { days: 'Friday', hours: 'Closed' },
  ],
  mapEmbedUrl: '',
  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com/karigordecore' },
    { platform: 'instagram', url: 'https://instagram.com/karigordecore' },
    { platform: 'youtube', url: 'https://youtube.com/@karigordecore' },
  ],
  defaultMeta: {
    title: 'Karigor Decore | Modern Windows, Glass & Aluminum Solutions',
    description:
      'Karigor Decore manufactures and installs aluminum windows, doors, glass partitions and interior decoration for residential, office and commercial projects across Bangladesh.',
  },
  footerText: 'Custom-fabricated windows, doors, glass and aluminum works for homes, offices and commercial buildings.',
};

const homepage = {
  seo: { title: settings.defaultMeta.title, description: settings.defaultMeta.description },
  hero: {
    subheading: 'Crafted with Precision. Built to Last.',
    heading: 'Modern Windows, Doors, Glass & Aluminum Solutions',
    description:
      'Karigor Decore fabricates and installs aluminum windows, doors, toughened glass and partitions that combine strength, weather sealing and contemporary design.',
    buttons: [
      { label: 'Explore Products', link: '/products', variant: 'primary' },
      { label: 'View Our Projects', link: '/projects', variant: 'secondary' },
      { label: 'Contact Us', link: '/contact', variant: 'ghost' },
    ],
    // Carousel entries; 2+ of these turn the hero into a slider.
    slides: data.homepage.hero.slides,
  },
  about: {
    heading: 'We Turn Ideas Into Durable, Beautiful Spaces',
    description:
      'From the first site measurement to the final fit-check, our own team handles the whole job. We work with aluminum, UPVC, toughened and laminated glass, and interior finishing systems for homes, offices and commercial buildings.',
    image: { url: '/seed-images/about-workshop.svg', alt: 'Karigor Decore fabrication workshop' },
    ctaLabel: 'Learn More About Us',
    ctaLink: '/about',
  },
  sections: {
    products: {
      enabled: true,
      heading: 'Featured Products',
      subheading: 'Browse our most in-demand windows, doors, glass and partitions.',
    },
    services: {
      enabled: true,
      heading: 'Our Services',
      subheading: 'End-to-end fabrication, installation and after-sales support for your project.',
    },
    projects: {
      enabled: true,
      heading: 'Recent Projects',
      subheading: 'A glimpse of completed residential, office and commercial work.',
    },
    whyUs: {
      enabled: true,
      heading: 'Why Choose Karigor Decore',
      subheading: 'We focus on quality materials, precise fit and dependable support after handover.',
      items: [
        { title: 'Precision Craftsmanship', description: 'Every opening is measured on site and fabricated to exact dimensions.' },
        { title: 'Quality Materials', description: 'Trusted profiles, hardware and safety glass from verified suppliers.' },
        { title: 'On-Time Delivery', description: 'Clear production schedules so your project stays on track.' },
        { title: 'Skilled Installation', description: 'An in-house team that seals and aligns every unit properly.' },
        { title: 'Custom Solutions', description: 'Made-to-order sizes, finishes and glass for unusual spaces.' },
        { title: 'After-Sales Support', description: 'We stay reachable for adjustments and servicing after install.' },
      ],
    },
    stats: {
      enabled: true,
      heading: 'By the Numbers',
      items: [
        { label: 'Projects Completed', value: '520' },
        { label: 'Satisfied Clients', value: '380' },
        { label: 'Years of Experience', value: '15' },
        { label: 'Cities Served', value: '12' },
      ],
    },
    testimonials: {
      enabled: true,
      heading: 'What Our Clients Say',
      subheading: 'Feedback from recent residential and commercial projects.',
      items: [
        { author: 'Farhana Islam', role: 'Homeowner, Dhanmondi', quote: 'The sliding windows in our living room changed the whole feel of the house. Fit and sealing are excellent.' },
        { author: 'Tanvir Ahmed', role: 'Project Manager, Gulshan office fit-out', quote: 'They measured accurately, delivered on schedule and cleaned up properly. Easy to work with throughout.' },
      ],
    },
    cta: {
      heading: 'Ready to Start Your Project?',
      subheading: 'Share your measurements or drawings and we will send a detailed quotation within 24 hours.',
      primaryLabel: 'Request a Quote',
      primaryLink: '/quote',
      secondaryLabel: 'Browse Products',
      secondaryLink: '/products',
    },
  },
};

// ---------------- Health ----------------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Karigor Decore API is running.' });
});

// ---------------- Categories ----------------
app.get('/api/categories', (req, res) => {
  const scope = req.query.scope;
  const list = scope === 'project'
    ? data.projectCategories.map((c, i) => ({ _id: `pcat-${i + 1}`, ...c, slug: toSlug(c.name), scope: 'project', isActive: true }))
    : productCategories;
  res.json(ok(list, { total: list.length, page: 1, limit: list.length, totalPages: 1 }));
});

// ---------------- Products ----------------
app.get('/api/products', (req, res) => {
  const { search, category, sort } = req.query;
  let list = [...products];
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((p) =>
      [p.name, p.shortDescription, p.description].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }
  if (category) {
    const match = productCategories.find((c) => c.slug === category);
    list = match ? list.filter((p) => p.category && p.category.slug === match.slug) : list;
  }
  if (sort === 'price_asc') list.sort((a, b) => (a.priceRange?.min || 0) - (b.priceRange?.min || 0));
  if (sort === 'price_desc') list.sort((a, b) => (b.priceRange?.min || 0) - (a.priceRange?.min || 0));
  if (sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));

  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const total = list.length;
  const paged = list.slice((page - 1) * limit, page * limit);
  res.json(ok(paged, { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }));
});

app.get('/api/products/:slug', (req, res) => {
  const product = products.find((p) => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const related = products
    .filter((p) => p.category && product.category && p.category.slug === product.category.slug && p._id !== product._id)
    .slice(0, 4);
  res.json(ok({ product, related }));
});

// ---------------- Services ----------------
app.get('/api/services', (req, res) => {
  res.json(ok(services, { total: services.length, page: 1, limit: services.length, totalPages: 1 }));
});

app.get('/api/services/:slug', (req, res) => {
  const service = services.find((s) => s.slug === req.params.slug);
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  const related = services.filter((s) => s._id !== service._id).slice(0, 4);
  res.json(ok({ service, related }));
});

// ---------------- Projects ----------------
app.get('/api/projects/categories', (req, res) => {
  res.json(ok([...new Set(projects.map((p) => p.category).filter(Boolean))]));
});

app.get('/api/projects', (req, res) => {
  const { category, search } = req.query;
  let list = [...projects];
  if (category) list = list.filter((p) => p.category === category);
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((p) =>
      [p.name, p.shortDescription, p.description, p.location].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const total = list.length;
  res.json(ok(list.slice((page - 1) * limit, page * limit), {
    total, page, limit, totalPages: Math.ceil(total / limit) || 1,
  }));
});

app.get('/api/projects/:slug', (req, res) => {
  const project = projects.find((p) => p.slug === req.params.slug);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  const related = projects.filter((p) => p._id !== project._id).slice(0, 3);
  res.json(ok({ project, related }));
});

// ---------------- Settings ----------------
app.get('/api/settings', (req, res) => {
  res.json(ok({ settings }));
});

// ---------------- Homepage ----------------
app.get('/api/homepage', (req, res) => {
  res.json(ok({
    homepage,
    featuredProducts: products.filter((p) => p.featured).slice(0, 6),
    featuredServices: services.filter((s) => s.featured).slice(0, 6),
    featuredProjects: projects.filter((p) => p.featured).slice(0, 6),
  }));
});

app.get('/api/homepage/admin', (req, res) => {
  res.json(ok({ homepage }));
});

app.put('/api/homepage', (req, res) => {
  const body = req.body || {};
  if (body.hero) homepage.hero = { ...homepage.hero, ...body.hero };
  if (body.about) homepage.about = { ...homepage.about, ...body.about };
  if (body.sections) {
    homepage.sections = {
      ...homepage.sections,
      ...Object.fromEntries(
        Object.entries(body.sections).map(([k, v]) => [k, { ...homepage.sections[k], ...v }])
      ),
    };
  }
  if (body.cta) homepage.sections.cta = { ...(homepage.sections.cta), ...(body.cta) };
  if (body.seo) homepage.seo = { ...homepage.seo, ...body.seo };
  res.json(ok({ homepage }, null));
});

// ---------------- Public form submissions ----------------
app.post('/api/inquiries', (req, res) => {
  res.status(201).json({ success: true, message: 'Thank you. Your message has been received and we will reply shortly.' });
});

app.post('/api/quotes', (req, res) => {
  res.status(201).json({ success: true, message: 'Quote request submitted. We will get back to you within 24 hours.' });
});

app.post('/api/quotes/attachments', (req, res) => {
  res.json(ok({ files: [] }));
});

// ---------------- SEO ----------------
app.get('/sitemap.xml', (req, res) => {
  const base = `http://${req.headers.host}`;
  const urls = ['/', '/about', '/products', '/services', '/projects', '/contact', '/quote']
    .concat(products.map((p) => `/products/${p.slug}`))
    .concat(services.map((s) => `/services/${s.slug}`))
    .concat(projects.map((p) => `/projects/${p.slug}`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')
    + `\n</urlset>`;
  res.type('application/xml').send(xml);
});

// ---------------- 404 ----------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[api-shim] listening on http://localhost:${PORT}`);
  console.log(`[api-shim] ${products.length} products, ${services.length} services, ${projects.length} projects`);
});