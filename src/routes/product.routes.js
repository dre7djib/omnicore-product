const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const upload = require('../middlewares/upload');
const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('images').optional().isArray().withMessage('Images must be an array'),
    body('images.*.url').optional().isURL().withMessage('Invalid image URL'),
    body('images.*.isPrimary').optional().isBoolean().withMessage('isPrimary must be boolean'),
    validate,
  ],
  productController.create,
);

router.post(
  '/upload',
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    validate,
  ],
  productController.createWithUpload,
);

router.get('/', productController.getAll);

router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    validate,
  ],
  productController.getById,
);

router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    validate,
  ],
  productController.update,
);

router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    validate,
  ],
  productController.delete,
);

router.post(
  '/:id/images',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    body('url').isURL().withMessage('Valid URL is required'),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be boolean'),
    validate,
  ],
  productController.addImage,
);

router.post(
  '/:id/images/upload',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    validate,
  ],
  upload.single('image'),
  productController.uploadImage,
);

router.put(
  '/:id/images/:imageId/primary',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    param('imageId').isUUID().withMessage('Invalid image ID'),
    validate,
  ],
  productController.setPrimaryImage,
);

router.delete(
  '/images/:imageId',
  [
    param('imageId').isUUID().withMessage('Invalid image ID'),
    validate,
  ],
  productController.deleteImage,
);

module.exports = router;
