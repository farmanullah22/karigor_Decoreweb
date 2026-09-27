const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const homepageController = require('../controllers/homepageController');

const router = express.Router();

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
    body('about').optional().isObject(),
    body('sections').optional().isObject(),
    body('cta').optional().isObject(),
    body('seo').optional().isObject(),
  ],
  validate,
  homepageController.updateHomepage
);

module.exports = router;
