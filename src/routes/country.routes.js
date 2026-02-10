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

router.get('/', countryController.getAll);

router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country ID'),
    validate,
  ],
  countryController.getById,
);

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

router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid country ID'),
    validate,
  ],
  countryController.delete,
);

module.exports = router;
