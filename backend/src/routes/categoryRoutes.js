const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

const categoryValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Category name is required (2-80 characters).'),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('scope').optional().isIn(['product', 'project']),
  body('image').optional({ nullable: true }).isObject(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0, max: 9999 }),
];

// --- Public ---
router.get('/', optionalAuth, categoryController.listCategories);

// --- Admin ---
router.get('/:id', authenticate, [param('id').isMongoId()], validate, categoryController.getCategoryById);

router.post('/', authenticate, [...categoryValidators, body('slug').optional().isString().trim()], validate, categoryController.createCategory);

router.put(
  '/:id',
  authenticate,
  [param('id').isMongoId(), ...categoryValidators.map((chain) => chain.optional())],
  validate,
  categoryController.updateCategory
);

router.delete('/:id', authenticate, [param('id').isMongoId()], validate, categoryController.deleteCategory);

module.exports = router;
