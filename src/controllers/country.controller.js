const countryService = require('../services/country.service');
const { logger } = require('../config/logger');

class CountryController {
  async create(req, res, next) {
    try {
      const country = await countryService.createCountry(req.body);
      logger.info({ countryId: country.id }, 'Country created');
      res.status(201).json(country);
    } catch (error) {
      logger.error({ err: error }, 'Failed to create country');
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { isActive } = req.query;
      const filters = {};
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const countries = await countryService.getAllCountries(filters);
      res.json(countries);
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch countries');
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const country = await countryService.getCountryById(req.params.id);
      res.json(country);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to fetch country');
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const country = await countryService.updateCountry(req.params.id, req.body);
      logger.info({ countryId: country.id }, 'Country updated');
      res.json(country);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to update country');
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await countryService.deleteCountry(req.params.id);
      logger.info({ countryId: req.params.id }, 'Country deleted');
      res.status(204).send();
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to delete country');
      next(error);
    }
  }
}

module.exports = new CountryController();
