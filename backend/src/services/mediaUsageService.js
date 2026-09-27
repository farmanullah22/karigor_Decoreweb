const Product = require('../models/Product');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Category = require('../models/Category');
const CompanySettings = require('../models/CompanySettings');
const Homepage = require('../models/Homepage');
const { escapeRegex } = require('../utils/query');

/**
 * Finds every place an uploaded image is referenced, so the media library
 * can prevent accidental deletion of images that are still in use.
 *
 * @param {string} url - public URL of the image (e.g. /uploads/2026/09/x.jpg)
 * @returns {Promise<Array<{ type: string, name: string }>>}
 */
async function findImageUsage(url) {
  if (!url) return [];
  const safe = escapeRegex(url);
  const contains = { $regex: safe };

  const [products, projects, services, categories, settings, homepages] = await Promise.all([
    Product.find({ deletedAt: null, $or: [{ 'image.url': contains }, { 'gallery.url': contains }] })
      .select('name')
      .lean(),
    Project.find({ deletedAt: null, $or: [{ 'coverImage.url': contains }, { 'gallery.url': contains }] })
      .select('name')
      .lean(),
    Service.find({ deletedAt: null, 'image.url': contains }).select('name').lean(),
    Category.find({ deletedAt: null, 'image.url': contains }).select('name').lean(),
    CompanySettings.find({ $or: [{ logo: contains }, { favicon: contains }] }).lean(),
    Homepage.find({
      $or: [
        { 'hero.backgroundImage.url': contains },
        { 'about.image.url': contains },
      ],
    }).lean(),
  ]);

  const usages = [];
  products.forEach((p) => usages.push({ type: 'product', name: p.name }));
  projects.forEach((p) => usages.push({ type: 'project', name: p.name }));
  services.forEach((s) => usages.push({ type: 'service', name: s.name }));
  categories.forEach((c) => usages.push({ type: 'category', name: c.name }));
  if (settings.length) usages.push({ type: 'company_settings', name: 'Company logo/favicon' });
  if (homepages.length) usages.push({ type: 'homepage', name: 'Homepage content' });

  return usages;
}

module.exports = { findImageUsage };
