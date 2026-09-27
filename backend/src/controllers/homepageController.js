const Homepage = require('../models/Homepage');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/homepage - public.
 * Returns the editable homepage content plus the actual featured
 * products / services / projects selected in the dashboard.
 */
const getHomepage = asyncHandler(async (req, res) => {
  const [homepage, featuredProducts, featuredServices, featuredProjects] = await Promise.all([
    Homepage.getSingleton(),
    Product.find({ deletedAt: null, isActive: true, featured: true })
      .select('name slug shortDescription image category')
      .populate('category', 'name slug')
      .sort('sortOrder -createdAt')
      .limit(8)
      .lean(),
    Service.find({ deletedAt: null, isActive: true, featured: true })
      .select('name slug shortDescription icon image')
      .sort('sortOrder -createdAt')
      .limit(8)
      .lean(),
    Project.find({ deletedAt: null, isActive: true, featured: true })
      .select('name slug shortDescription coverImage category location')
      .sort('sortOrder -completionDate')
      .limit(6)
      .lean(),
  ]);

  return sendSuccess(res, {
    message: 'OK',
    data: { homepage, featuredProducts, featuredServices, featuredProjects },
  });
});

/** GET /api/homepage/admin - full document for the dashboard form. */
const getHomepageForAdmin = asyncHandler(async (req, res) => {
  const homepage = await Homepage.getSingleton();
  return sendSuccess(res, { message: 'OK', data: { homepage } });
});

/** PUT /api/homepage - admin update (deep merge of provided sections). */
const updateHomepage = asyncHandler(async (req, res) => {
  const homepage = await Homepage.getSingleton();
  const body = req.body;

  if (body.hero) homepage.hero = { ...homepage.hero.toObject(), ...body.hero };
  if (body.about) homepage.about = { ...homepage.about.toObject(), ...body.about };

  if (body.sections) {
    ['products', 'services', 'projects', 'whyUs', 'stats'].forEach((key) => {
      if (body.sections[key]) {
        homepage.sections[key] = {
          ...homepage.sections[key].toObject(),
          ...body.sections[key],
        };
      }
    });
  }

  if (body.cta) homepage.cta = { ...homepage.cta.toObject(), ...body.cta };
  if (body.seo) homepage.seo = { ...homepage.seo.toObject(), ...body.seo };

  await homepage.save();
  return sendSuccess(res, { message: 'Homepage content saved successfully.', data: { homepage } });
});

module.exports = { getHomepage, getHomepageForAdmin, updateHomepage };
