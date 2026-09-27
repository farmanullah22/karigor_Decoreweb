const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const productController = require('../controllers/productController');

const router = express.Router();

const productValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Product name is required (2-120 characters).'),
  body('category').isMongoId().withMessage('A valid category is required.'),
  body('shortDescription').optional().isString().trim().isLength({ max: 300 }),
  body('description').optional().isString().trim().isLength({ max: 20000 }),
  body('features').optional().isArray({ max: 40 }),
  body('specifications').optional().isArray({ max: 60 }),
  body('materials').optional().isArray({ max: 40 }),
  body('colors').optional().isArray({ max: 40 }),
  body('image').optional({ nullable: true }).isObject(),
  body('gallery').optional().isArray({ max: 12 }),
  body('featured').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0, max: 9999 }),
];

// --- Public ---
router.get('/', optionalAuth, productController.listProducts);
router.get('/:slug', productController.getProductBySlug);

// --- Admin ---
router.get('/id/:id', authenticate, productController.getProductById);

router.post(
  '/',
  authenticate,
  [
    ...productValidators,
    body('slug').optional().isString().trim().isLength({ max: 140 }),
  ],
  validate,
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid product id.'),
    ...productValidators.map((chain) => chain.optional()),
  ],
  validate,
  productController.updateProduct
);

router.patch('/:id/toggle', authenticate, [param('id').isMongoId()], validate, productController.toggleProduct);
router.patch(
  '/:id/featured',
  authenticate,
  [param('id').isMongoId()],
  validate,
  productController.toggleProductFeatured
);

router.delete('/:id', authenticate, [param('id').isMongoId()], validate, productController.deleteProduct);

module.exports = router;
