const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const serviceController = require('../controllers/serviceController');

const router = express.Router();

const serviceValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Service name is required (2-120 characters).'),
  body('shortDescription').optional().isString().trim().isLength({ max: 300 }),
  body('description').optional().isString().trim().isLength({ max: 20000 }),
  body('icon').optional().isString().trim().isLength({ max: 60 }),
  body('image').optional({ nullable: true }).isObject(),
  body('features').optional().isArray({ max: 40 }),
  body('process').optional().isArray({ max: 20 }),
  body('featured').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0, max: 9999 }),
];

// --- Public ---
router.get('/', optionalAuth, serviceController.listServices);
router.get('/:slug', serviceController.getServiceBySlug);

// --- Admin ---
router.get('/id/:id', authenticate, serviceController.getServiceById);

router.post('/', authenticate, [...serviceValidators, body('slug').optional().isString().trim()], validate, serviceController.createService);

router.put(
  '/:id',
  authenticate,
  [param('id').isMongoId(), ...serviceValidators.map((chain) => chain.optional())],
  validate,
  serviceController.updateService
);

router.patch('/:id/toggle', authenticate, [param('id').isMongoId()], validate, serviceController.toggleService);
router.patch('/:id/featured', authenticate, [param('id').isMongoId()], validate, serviceController.toggleServiceFeatured);
router.delete('/:id', authenticate, [param('id').isMongoId()], validate, serviceController.deleteService);

module.exports = router;
