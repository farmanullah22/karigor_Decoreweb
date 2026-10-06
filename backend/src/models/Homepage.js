const mongoose = require('mongoose');
const { imageSchema } = require('./common');

const buttonSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    variant: { type: String, enum: ['primary', 'secondary', 'ghost'], default: 'primary' },
  },
  { _id: false }
);

<<<<<<< HEAD
/** Hard cap on hero slides, mirrored by the dashboard editor. */
const MAX_HERO_SLIDES = 8;

/**
 * One hero slide: its own background image, copy and buttons. The first
 * slide doubles as the legacy single-hero content (heading/subheading/
 * description/backgroundImage/buttons) so older consumers keep working.
 */
const heroSlideSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '', trim: true, maxlength: 200 },
    subheading: { type: String, default: '', trim: true, maxlength: 300 },
=======
/** One entry in the homepage hero carousel. */
const heroSlideSchema = new mongoose.Schema(
  {
    subheading: { type: String, default: '', trim: true, maxlength: 300 },
    heading: { type: String, default: '', trim: true, maxlength: 200 },
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10
    description: { type: String, default: '', trim: true, maxlength: 800 },
    backgroundImage: { type: imageSchema, default: null },
    buttons: { type: [buttonSchema], default: [] },
  },
<<<<<<< HEAD
  { _id: true }
=======
  { _id: false }
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10
);

/**
 * Homepage - singleton document holding all editable homepage content:
 * hero, about teaser, section headings, why-choose-us items, CTA and SEO.
 * Featured products/projects/services are selected via the `featured`
 * flag on each document - this model stores the section copy and toggles.
 */
const homepageSchema = new mongoose.Schema(
  {
    hero: {
      heading: { type: String, default: '', trim: true, maxlength: 200 },
      subheading: { type: String, default: '', trim: true, maxlength: 300 },
      description: { type: String, default: '', trim: true, maxlength: 800 },
      backgroundImage: { type: imageSchema, default: null },
      buttons: { type: [buttonSchema], default: [] },
<<<<<<< HEAD
=======
      /**
       * Optional carousel entries. When two or more slides are published the
       * public hero renders as a crossfading slider; with zero or one it
       * renders as the original single hero, so existing content is safe.
       */
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10
      slides: { type: [heroSlideSchema], default: [] },
    },
    about: {
      heading: { type: String, default: '', trim: true, maxlength: 200 },
      description: { type: String, default: '', trim: true, maxlength: 2000 },
      image: { type: imageSchema, default: null },
      ctaLabel: { type: String, default: '', trim: true },
      ctaLink: { type: String, default: '', trim: true },
    },
    sections: {
      products: {
        heading: { type: String, default: '', trim: true },
        subheading: { type: String, default: '', trim: true },
        enabled: { type: Boolean, default: true },
      },
      services: {
        heading: { type: String, default: '', trim: true },
        subheading: { type: String, default: '', trim: true },
        enabled: { type: Boolean, default: true },
      },
      projects: {
        heading: { type: String, default: '', trim: true },
        subheading: { type: String, default: '', trim: true },
        enabled: { type: Boolean, default: true },
      },
      whyUs: {
        heading: { type: String, default: '', trim: true },
        subheading: { type: String, default: '', trim: true },
        enabled: { type: Boolean, default: true },
        items: {
          type: [{ title: String, description: String }],
          default: [],
        },
      },
      stats: {
        enabled: { type: Boolean, default: false },
        items: {
          type: [{ label: String, value: String, suffix: String }],
          default: [],
        },
      },
    },
    cta: {
      heading: { type: String, default: '', trim: true, maxlength: 200 },
      description: { type: String, default: '', trim: true, maxlength: 500 },
      primaryLabel: { type: String, default: '', trim: true },
      primaryLink: { type: String, default: '', trim: true },
      secondaryLabel: { type: String, default: '', trim: true },
      secondaryLink: { type: String, default: '', trim: true },
    },
    seo: {
      title: { type: String, default: '', trim: true },
      description: { type: String, default: '', trim: true, maxlength: 300 },
    },
  },
  { timestamps: true }
);

homepageSchema.statics.getSingleton = async function getSingleton() {
  let homepage = await this.findOne();
  if (!homepage) homepage = await this.create({});
  return homepage;
};

const Homepage = mongoose.model('Homepage', homepageSchema);

/** Exposed so the controller and the dashboard editor share one limit. */
Homepage.MAX_HERO_SLIDES = MAX_HERO_SLIDES;

module.exports = Homepage;
