const express = require('express');
const { param, body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

// Media management is admin-only.
router.use(authenticate);

router.get('/', mediaController.listMedia);
router.get('/:id/usage', [param('id').isMongoId()], validate, mediaController.getMediaUsage);

router.post(
  '/upload',
  upload.array('files', 12),
  [body('alt').optional().isString().trim().isLength({ max: 200 })],
  validate,
  mediaController.uploadMedia
);

router.delete('/:id', [param('id').isMongoId()], validate, mediaController.deleteMedia);

module.exports = router;
