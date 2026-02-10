const countryProductService = require('../services/country-product.service');
const { logger } = require('../config/logger');

class CountryProductController {
  async create(req, res, next) {
    try {
      const countryProduct = await countryProductService.createCountryProduct(req.body);
      logger.info({ countryProductId: countryProduct.id }, 'Country product created');
      res.status(201).json(countryProduct);
    } catch (error) {
      logger.error({ err: error }, 'Failed to create country product');
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { countryId, productId, isAvailable } = req.query;
      const filters = {};

      if (countryId) {
        filters.countryId = countryId;
      }
      if (productId) {
        filters.productId = productId;
      }
      if (isAvailable !== undefined) {
        filters.isAvailable = isAvailable === 'true';
      }

      const countryProducts = await countryProductService.getAllCountryProducts(filters);
      res.json(countryProducts);
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch country products');
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const countryProduct = await countryProductService.getCountryProductById(req.params.id);
      res.json(countryProduct);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to fetch country product');
      next(error);
    }
  }

  async getByCountry(req, res, next) {
    try {
      const products = await countryProductService.getProductsByCountry(req.params.countryId);
      res.json(products);
    } catch (error) {
      logger.error({ err: error, countryId: req.params.countryId }, 'Failed to fetch products by country');
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const countryProduct = await countryProductService.updateCountryProduct(
        req.params.id,
        req.body,
      );
      logger.info({ countryProductId: countryProduct.id }, 'Country product updated');
      res.json(countryProduct);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to update country product');
      next(error);
    }
  }

  async updateStock(req, res, next) {
    try {
      const { quantity } = req.body;
      const countryProduct = await countryProductService.updateStock(
        req.params.id,
        quantity,
      );
      logger.info({ countryProductId: countryProduct.id, quantity }, 'Stock updated');
      res.json(countryProduct);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to update stock');
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await countryProductService.deleteCountryProduct(req.params.id);
      logger.info({ countryProductId: req.params.id }, 'Country product deleted');
      res.status(204).send();
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to delete country product');
      next(error);
    }
  }
}

module.exports = new CountryProductController();
