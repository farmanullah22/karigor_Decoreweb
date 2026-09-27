const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

const router = express.Router();

router.use(authenticate);

router.get('/', customerController.listCustomers);
router.get('/:id', [param('id').isMongoId()], validate, customerController.getCustomerById);
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().isString().trim().isLength({ max: 30 }),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Please provide a valid email address.'),
    body('status').optional().isIn(['lead', 'contacted', 'customer', 'inactive']),
    body('notes').optional().isString().isLength({ max: 4000 }),
    body('interestedServices').optional().isArray({ max: 30 }),
  ],
  validate,
  customerController.updateCustomer
);
router.delete('/:id', [param('id').isMongoId()], validate, customerController.deleteCustomer);

module.exports = router;
