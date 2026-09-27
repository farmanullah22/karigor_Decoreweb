const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').isString().isLength({ min: 1 }).withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.me);

router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters.'),
    body('email').optional().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('phone').optional().isString().trim().isLength({ max: 30 }),
    body('avatar').optional().isString().trim().isLength({ max: 500 }),
  ],
  validate,
  authController.updateProfile
);

router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').isString().isLength({ min: 1 }).withMessage('Current password is required.'),
    body('newPassword')
      .isString()
      .isLength({ min: 8, max: 72 })
      .withMessage('New password must be at least 8 characters.')
      .matches(/[A-Za-z]/)
      .withMessage('New password must contain at least one letter.')
      .matches(/\d/)
      .withMessage('New password must contain at least one number.'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
