const express = require('express');
const router = express.Router();

router.use('/countries', require('./country.routes'));
router.use('/products', require('./product.routes'));
router.use('/country-products', require('./country-product.routes'));

module.exports = router;
