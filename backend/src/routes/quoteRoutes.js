const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { publicFormLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');
const quoteController = require('../controllers/quoteController');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

// --- Public: request a quote ---
router.post(
  '/',
  publicFormLimiter,
  [
    body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Please provide your name.'),
    body('phone')
      .isString()
      .trim()
      .matches(/^[+\d][\d\s\-()]{5,24}$/)
      .withMessage('Please provide a valid phone number.'),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
    body('productService').optional().isString().trim().isLength({ max: 200 }),
    body('quantity').optional().isString().trim().isLength({ max: 120 }),
    body('projectType').optional().isIn(['', 'residential', 'commercial', 'office', 'industrial', 'other']),
    body('budget').optional().isString().trim().isLength({ max: 120 }),
    body('message').isString().trim().isLength({ min: 5, max: 4000 }).withMessage('Please describe your requirement (5-4000 characters).'),
    body('source').optional().isIn(['quote_page', 'product', 'service', 'homepage']),
    body('attachments').optional().isArray({ max: 5 }),
    // Honeypot anti-spam field.
    body('website').custom((value) => {
      if (value) throw new Error('Spam detected.');
      return true;
    }),
  ],
  validate,
  quoteController.createQuoteRequest
);

// --- Public: optional attachment upload used before submitting the quote ---
router.post(
  '/attachments',
  publicFormLimiter,
  upload.array('files', 5),
  mediaController.uploadPublicAttachment
);

// --- Admin ---
router.get('/', authenticate, quoteController.listQuoteRequests);
router.get('/:id', authenticate, [param('id').isMongoId()], validate, quoteController.getQuoteRequestById);
router.patch('/:id/status', authenticate, [param('id').isMongoId(), body('status').isString()], validate, quoteController.updateQuoteStatus);
router.put('/:id/notes', authenticate, [param('id').isMongoId(), body('adminNotes').optional().isString().isLength({ max: 4000 })], validate, quoteController.updateQuoteNotes);
router.delete('/:id', authenticate, [param('id').isMongoId()], validate, quoteController.deleteQuoteRequest);

module.exports = router;
