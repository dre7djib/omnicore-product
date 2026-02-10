const express = require('express');
const router = express.Router();
const countryController = require('../controllers/country.controller');
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
 * /api/countries:
 *   post:
 *     tags: [Countries]
 *     summary: Create a new country
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountryInput'
 *     responses:
 *       201:
 *         description: Country created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
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
    body('countryCode').trim().notEmpty().withMessage('Country code is required'),
    body('currency').trim().notEmpty().withMessage('Currency is required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    validate,
  ],
  countryController.create,
);

/**
 * @swagger
 * /api/countries:
 *   get:
 *     tags: [Countries]
 *     summary: List all countries
 *     responses:
 *       200:
 *         description: List of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 */
router.get('/', countryController.getAll);

/**
 * @swagger
 * /api/countries/{id}:
 *   get:
 *     tags: [Countries]
 *     summary: Get a country by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Country ID
 *     responses:
 *       200:
 *         description: Country found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *       404:
 *         description: Country not found
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country ID'),
    validate,
  ],
  countryController.getById,
);

/**
 * @swagger
 * /api/countries/{id}:
 *   put:
 *     tags: [Countries]
 *     summary: Update a country
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Country ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountryInput'
 *     responses:
 *       200:
 *         description: Country updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Country not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('countryCode').optional().trim().notEmpty().withMessage('Country code cannot be empty'),
    body('currency').optional().trim().notEmpty().withMessage('Currency cannot be empty'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    validate,
  ],
  countryController.update,
);

/**
 * @swagger
 * /api/countries/{id}:
 *   delete:
 *     tags: [Countries]
 *     summary: Delete a country
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Country ID
 *     responses:
 *       200:
 *         description: Country deleted
 *       404:
 *         description: Country not found
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country ID'),
    validate,
  ],
  countryController.delete,
);

module.exports = router;
