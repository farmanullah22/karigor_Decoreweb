const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { publicFormLimiter } = require('../middleware/rateLimiter');
const inquiryController = require('../controllers/inquiryController');

const router = express.Router();

// --- Public: submit the contact form ---
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
    body('subject').optional().isString().trim().isLength({ max: 200 }),
    body('service').optional().isString().trim().isLength({ max: 160 }),
    body('message').isString().trim().isLength({ min: 5, max: 4000 }).withMessage('Please write a message (5-4000 characters).'),
    body('source').optional().isIn(['contact_form', 'product', 'service', 'footer']),
    // Simple anti-spam honeypot: bots fill hidden fields, humans do not.
    body('website').custom((value) => {
      if (value) throw new Error('Spam detected.');
      return true;
    }),
  ],
  validate,
  inquiryController.createInquiry
);

// --- Admin ---
router.get('/', authenticate, inquiryController.listInquiries);
router.get('/:id', authenticate, [param('id').isMongoId()], validate, inquiryController.getInquiryById);
router.patch('/:id/status', authenticate, [param('id').isMongoId(), body('status').isString()], validate, inquiryController.updateInquiryStatus);
router.put('/:id/notes', authenticate, [param('id').isMongoId(), body('adminNotes').optional().isString().isLength({ max: 4000 })], validate, inquiryController.updateInquiryNotes);
router.delete('/:id', authenticate, [param('id').isMongoId()], validate, inquiryController.deleteInquiry);

module.exports = router;
