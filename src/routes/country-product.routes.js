const express = require('express');
const router = express.Router();
const countryProductController = require('../controllers/country-product.controller');
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
    body('productId').isUUID().withMessage('Valid product ID is required'),
    body('countryId').isUUID().withMessage('Valid country ID is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('currency').trim().notEmpty().withMessage('Currency is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
    validate,
  ],
  countryProductController.create,
);

router.get('/', countryProductController.getAll);

router.get(
  '/country/:countryId',
  [
    param('countryId').isUUID().withMessage('Invalid country ID'),
    validate,
  ],
  countryProductController.getByCountry,
);

router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country product ID'),
    validate,
  ],
  countryProductController.getById,
);

router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country product ID'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('currency').optional().trim().notEmpty().withMessage('Currency cannot be empty'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
    validate,
  ],
  countryProductController.update,
);

router.patch(
  '/:id/stock',
  [
    param('id').isUUID().withMessage('Invalid country product ID'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    validate,
  ],
  countryProductController.updateStock,
);

router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country product ID'),
    validate,
  ],
  countryProductController.delete,
);

module.exports = router;
