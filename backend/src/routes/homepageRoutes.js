const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const homepageController = require('../controllers/homepageController');
const Homepage = require('../models/Homepage');

const router = express.Router();
const MAX_HERO_SLIDES = Homepage.MAX_HERO_SLIDES || 8;

/** GET /api/homepage - public homepage content + featured items. */
router.get('/', homepageController.getHomepage);

/** GET /api/homepage/admin - full document for the dashboard editor. */
router.get('/admin', authenticate, homepageController.getHomepageForAdmin);

/** PUT /api/homepage - admin update. */
router.put(
  '/',
  authenticate,
  [
    body('hero').optional().isObject(),
    body('hero.slides').optional().isArray({ max: MAX_HERO_SLIDES }),
    // `nullable` because the dashboard sends explicit nulls for cleared
    // images and empty text fields.
    body('hero.slides.*.heading').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
    body('hero.slides.*.subheading').optional({ nullable: true }).isString().trim().isLength({ max: 300 }),
    body('hero.slides.*.description').optional({ nullable: true }).isString().trim().isLength({ max: 800 }),
    body('hero.slides.*.backgroundImage').optional({ nullable: true }).isObject(),
    body('hero.slides.*.buttons').optional({ nullable: true }).isArray(),
    body('about').optional().isObject(),
    body('sections').optional().isObject(),
    body('cta').optional().isObject(),
    body('seo').optional().isObject(),
  ],
  validate,
  homepageController.updateHomepage
);

module.exports = router;
