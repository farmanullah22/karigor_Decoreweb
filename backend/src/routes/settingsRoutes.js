const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

/** GET /api/settings - public company information (used across the site). */
router.get('/', settingsController.getPublicSettings);

/** GET /api/settings/admin - full document (dashboard). */
router.get('/admin', authenticate, settingsController.getSettingsForAdmin);

/** PUT /api/settings - admin update. */
router.put(
  '/',
  authenticate,
  [
    body('companyName').optional().isString().trim().isLength({ min: 2, max: 120 }),
    body('tagline').optional().isString().trim().isLength({ max: 200 }),
    body('footerDescription').optional().isString().trim().isLength({ max: 500 }),
    body('logo').optional().isString().trim().isLength({ max: 500 }),
    body('favicon').optional().isString().trim().isLength({ max: 500 }),
    body('phone').optional().isString().trim().isLength({ max: 40 }),
    body('whatsapp').optional().isString().trim().isLength({ max: 40 }),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Please provide a valid email address.'),
    body('address').optional().isString().trim().isLength({ max: 400 }),
    body('googleMapsUrl').optional().isString().trim().isLength({ max: 1000 }),
    body('businessHours').optional().isArray({ max: 14 }),
    body('social').optional().isObject(),
    body('defaultMeta').optional().isObject(),
  ],
  validate,
  settingsController.updateSettings
);

module.exports = router;
