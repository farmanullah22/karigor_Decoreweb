const Homepage = require('../models/Homepage');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const MAX_HERO_SLIDES = Homepage.MAX_HERO_SLIDES || 8;

/** Keeps only images that actually point somewhere. */
function normalizeImage(value) {
  if (!value || !value.url) return null;
  return { url: String(value.url).trim(), alt: String(value.alt || '').trim() };
}

/** Drops buttons that are missing a label or a link. */
function normalizeButtons(buttons) {
  if (!Array.isArray(buttons)) return [];
  return buttons
    .filter((button) => button && button.label && button.link)
    .map((button) => ({
      label: String(button.label).trim(),
      link: String(button.link).trim(),
      variant: button.variant || 'primary',
    }));
}

/** True when a slide carries no image and no text - nothing to show. */
function isEmptySlide(slide) {
  return !slide.backgroundImage && !slide.heading && !slide.subheading && !slide.description;
}

/**
 * Normalizes the hero payload: at most MAX_HERO_SLIDES slides, empty slides
 * removed, images/buttons cleaned. Returns null when the caller sent no
 * `slides` key at all (so a legacy update leaves the slider untouched).
 */
function normalizeHeroSlides(slides) {
  if (!Array.isArray(slides)) return null;

  return slides
    .slice(0, MAX_HERO_SLIDES)
    .map((slide) => ({
      heading: String(slide.heading || '').trim(),
      subheading: String(slide.subheading || '').trim(),
      description: String(slide.description || '').trim(),
      backgroundImage: normalizeImage(slide.backgroundImage),
      buttons: normalizeButtons(slide.buttons),
    }))
    .filter((slide) => !isEmptySlide(slide));
}

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

  if (body.hero) {
    const heroPatch = { ...body.hero };
    const slides = normalizeHeroSlides(heroPatch.slides);

    if (slides !== null) {
      // The first slide doubles as the legacy single-hero content so older
      // consumers keep rendering the same thing.
      const first = slides[0];
      heroPatch.slides = slides;
      heroPatch.heading = first ? first.heading : '';
      heroPatch.subheading = first ? first.subheading : '';
      heroPatch.description = first ? first.description : '';
      heroPatch.backgroundImage = first ? first.backgroundImage : null;
      heroPatch.buttons = first ? first.buttons : [];
    }

    homepage.hero = { ...homepage.hero.toObject(), ...heroPatch };
  }

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
