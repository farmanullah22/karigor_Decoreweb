const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

const router = express.Router();

const projectValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 140 }).withMessage('Project name is required (2-140 characters).'),
  body('category').optional().isString().trim().isLength({ max: 80 }),
  body('location').optional().isString().trim().isLength({ max: 160 }),
  body('completionDate').optional({ nullable: true }).isISO8601().withMessage('Completion date must be a valid date.'),
  body('description').optional().isString().trim().isLength({ max: 20000 }),
  body('shortDescription').optional().isString().trim().isLength({ max: 300 }),
  body('materialsUsed').optional().isArray({ max: 40 }),
  body('servicesProvided').optional().isArray({ max: 40 }),
  body('coverImage').optional({ nullable: true }).isObject(),
  body('gallery').optional().isArray({ max: 20 }),
  body('featured').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0, max: 9999 }),
];

// --- Public ---
router.get('/', optionalAuth, projectController.listProjects);
router.get('/categories', projectController.listProjectCategories);
router.get('/:slug', projectController.getProjectBySlug);

// --- Admin ---
router.get('/id/:id', authenticate, projectController.getProjectById);

router.post('/', authenticate, [...projectValidators, body('slug').optional().isString().trim()], validate, projectController.createProject);

router.put(
  '/:id',
  authenticate,
  [param('id').isMongoId(), ...projectValidators.map((chain) => chain.optional())],
  validate,
  projectController.updateProject
);

router.patch('/:id/toggle', authenticate, [param('id').isMongoId()], validate, projectController.toggleProject);
router.patch('/:id/featured', authenticate, [param('id').isMongoId()], validate, projectController.toggleProjectFeatured);
router.delete('/:id', authenticate, [param('id').isMongoId()], validate, projectController.deleteProject);

module.exports = router;
