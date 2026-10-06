/**
 * Dynamic in-memory API for Karigor Decore (no MongoDB required).
 * Extends the contract to support full CRUD for CMS entities so the admin
 * dashboard can mutate content and the public site reflects changes live.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/seed-images')));

const data = require('./src/seed/data');
const { toSlug } = require('./src/utils/slug');

const ok = (payload, meta) => ({ success: true, message: 'OK', data: payload, meta: meta || undefined });

const clone = (x) => (x === undefined || x === null ? x : JSON.parse(JSON.stringify(x)));

function paginate(arr, page = 1, limit = 12) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(parseInt(limit, 10) || 12, 100);
  const total = arr.length;
  const start = (p - 1) * l;
  return {
    items: arr.slice(start, start + l),
    meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) || 1 },
  };
}

// ----- Categories -----
const productCategories = data.productCategories.map((c, i) => ({
  _id: `cat-p-${i + 1}`,
  name: c.name,
  slug: toSlug(c.name),
  scope: 'product',
  description: c.description || '',
  isActive: true,
  createdAt: new Date(Date.now() - (i * 3600e3)).toISOString(),
  updatedAt: new Date().toISOString(),
}));

// ----- Products -----
const products = data.products.map((p, i) => {
  const cat = productCategories.find((c) => c.name === p.category) || null;
  return {
    _id: `prod-${i + 1}`,
    name: p.name,
    slug: toSlug(p.name),
    category: cat ? cat._id : null,
    categoryRef: cat,
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
    createdAt: new Date(Date.now() - (i * 3600e3)).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

// ----- Services -----
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
  createdAt: new Date(Date.now() - (i * 3600e3)).toISOString(),
  updatedAt: new Date().toISOString(),
}));

// ----- Projects -----
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
  createdAt: new Date(Date.now() - (i * 3600e3)).toISOString(),
  updatedAt: new Date().toISOString(),
}));

const settings = clone(data.settings) || {
  companyName: 'Karigor Decore',
  tagline: 'Modern Windows, Glass, Aluminum & Interior Solutions',
  email: 'info@karigordecore.com',
  phone: '+880 1712345678',
  address: 'House 42, Road 11, Banani, Dhaka 1213, Bangladesh',
  website: 'https://karigordecore.com',
  businessHours: [{ days: 'Saturday - Thursday', hours: '9:00 AM - 7:00 PM' }, { days: 'Friday', hours: 'Closed' }],
  mapEmbedUrl: '',
  socialLinks: [],
  defaultMeta: { title: '', description: '' },
  footerText: '',
};

const homepage = clone(data.homepage);

// Media store (in-mem metadata)
const media = [];
const nextId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;

// Customers/Inquiries/Quotes minimal in-mem
const customers = [];
const inquiries = [];
const quotes = [];
const dashboardStats = () => ({
  totalProducts: products.length,
  totalServices: services.length,
  totalProjects: projects.length,
  totalInquiries: inquiries.length,
  totalQuotes: quotes.length,
  totalCustomers: customers.length,
});

module.exports = { app, state: { products, services, projects, productCategories, settings, homepage, media, customers, inquiries, quotes, dashboardStats } };
