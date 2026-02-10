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

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
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

/**
 * @swagger
 * /api/products/upload:
 *   post:
 *     tags: [Products]
 *     summary: Create a product with image file upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created with uploaded images
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 */
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

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List all products
 *     responses:
 *       200:
 *         description: List of products with images and country stock
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', productController.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    validate,
  ],
  productController.getById,
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    validate,
  ],
  productController.delete,
);

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     tags: [Products]
 *     summary: Add an image URL to a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               isPrimary:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Image added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductImage'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
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

/**
 * @swagger
 * /api/products/{id}/images/upload:
 *   post:
 *     tags: [Products]
 *     summary: Upload an image file for a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Product not found
 */
router.post(
  '/:id/images/upload',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    validate,
  ],
  upload.single('image'),
  productController.uploadImage,
);

/**
 * @swagger
 * /api/products/{id}/images/{imageId}/primary:
 *   put:
 *     tags: [Products]
 *     summary: Set an image as the primary image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Primary image updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Product or image not found
 */
router.put(
  '/:id/images/:imageId/primary',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    param('imageId').isUUID().withMessage('Invalid image ID'),
    validate,
  ],
  productController.setPrimaryImage,
);

/**
 * @swagger
 * /api/products/images/{imageId}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete an image
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted
 *       404:
 *         description: Image not found
 */
router.delete(
  '/images/:imageId',
  [
    param('imageId').isUUID().withMessage('Invalid image ID'),
    validate,
  ],
  productController.deleteImage,
);

module.exports = router;
