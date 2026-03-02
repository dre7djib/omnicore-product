const express = require('express');
const router = express.Router();
const countryProductController = require('../controllers/country-product.controller');
const { body, param, validationResult } = require('express-validator');

// Stripe-supported ISO 4217 currency codes
const STRIPE_CURRENCIES = [
  'usd','aed','afn','all','amd','ang','aoa','ars','aud','awg','azn','bam','bbd','bdt','bgn',
  'bhd','bif','bmd','bnd','bob','brl','bsd','bwp','byn','bzd','cad','cdf','chf','clp','cny',
  'cop','crc','cve','czk','djf','dkk','dop','dzd','egp','etb','eur','fjd','fkp','gbp','gel',
  'gip','gmd','gnf','gtq','gyd','hkd','hnl','htg','huf','idr','ils','inr','isk','jmd','jod',
  'jpy','kes','kgs','khr','kmf','krw','kwd','kyd','kzt','lak','lbp','lkr','lrd','lsl','mad',
  'mdl','mga','mkd','mmk','mnt','mop','mur','mvr','mwk','mxn','myr','mzn','nad','ngn','nio',
  'nok','npr','nzd','omr','pab','pen','pgk','php','pkr','pln','pyg','qar','ron','rsd','rub',
  'rwf','sar','sbd','scr','sek','sgd','shp','sle','sos','srd','szl','thb','tjs','tnd','top',
  'try','ttd','twd','tzs','uah','ugx','uyu','uzs','vnd','vuv','wst','xaf','xcd','xof','xpf',
  'yer','zar','zmw','usdc',
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @swagger
 * /api/country-products:
 *   post:
 *     tags: [Country Products]
 *     summary: Create country-specific stock and pricing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountryProductInput'
 *     responses:
 *       201:
 *         description: Country product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountryProduct'
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
    body('productId').isUUID().withMessage('Valid product ID is required'),
    body('countryId').isUUID().withMessage('Valid country ID is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('currency').trim().toLowerCase().isIn(STRIPE_CURRENCIES).withMessage(`Currency must be a valid Stripe-supported ISO 4217 code (e.g. eur, usd)`),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
    validate,
  ],
  countryProductController.create,
);

/**
 * @swagger
 * /api/country-products:
 *   get:
 *     tags: [Country Products]
 *     summary: List all country products
 *     parameters:
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by country ID
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by product ID
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *     responses:
 *       200:
 *         description: List of country products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CountryProduct'
 */
router.get('/', countryProductController.getAll);

/**
 * @swagger
 * /api/country-products/country/{countryId}:
 *   get:
 *     tags: [Country Products]
 *     summary: Get products for a specific country
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Country ID
 *     responses:
 *       200:
 *         description: Products available in the specified country
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CountryProduct'
 */
router.get(
  '/country/:countryId',
  [
    param('countryId').isUUID().withMessage('Invalid country ID'),
    validate,
  ],
  countryProductController.getByCountry,
);

/**
 * @swagger
 * /api/country-products/{id}:
 *   get:
 *     tags: [Country Products]
 *     summary: Get a country product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Country product ID
 *     responses:
 *       200:
 *         description: Country product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountryProduct'
 *       404:
 *         description: Country product not found
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country product ID'),
    validate,
  ],
  countryProductController.getById,
);

/**
 * @swagger
 * /api/country-products/{id}:
 *   put:
 *     tags: [Country Products]
 *     summary: Update a country product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Country product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 format: float
 *               currency:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Country product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountryProduct'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Country product not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country product ID'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('currency').optional().trim().toLowerCase().isIn(STRIPE_CURRENCIES).withMessage(`Currency must be a valid Stripe-supported ISO 4217 code (e.g. eur, usd)`),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
    validate,
  ],
  countryProductController.update,
);

/**
 * @swagger
 * /api/country-products/{id}/stock:
 *   patch:
 *     tags: [Country Products]
 *     summary: Update stock quantity
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Country product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Stock updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountryProduct'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Country product not found
 */
router.patch(
  '/:id/stock',
  [
    param('id').isUUID().withMessage('Invalid country product ID'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    validate,
  ],
  countryProductController.updateStock,
);

/**
 * @swagger
 * /api/country-products/{id}:
 *   delete:
 *     tags: [Country Products]
 *     summary: Delete a country product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Country product ID
 *     responses:
 *       200:
 *         description: Country product deleted
 *       404:
 *         description: Country product not found
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country product ID'),
    validate,
  ],
  countryProductController.delete,
);

module.exports = router;
