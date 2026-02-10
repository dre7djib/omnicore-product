const countryRepository = require('../repositories/country.repository');

class CountryService {
  async createCountry(data) {
    const existingCountry = await countryRepository.findByCode(data.countryCode);
    if (existingCountry) {
      throw new Error(`Country with code ${data.countryCode} already exists`);
    }
    return countryRepository.create(data);
  }

  getAllCountries(filters = {}) {
    return countryRepository.findAll(filters);
  }

  async getCountryById(id) {
    const country = await countryRepository.findById(id);
    if (!country) {
      throw new Error('Country not found');
    }
    return country;
  }

  async updateCountry(id, data) {
    await this.getCountryById(id);

    if (data.countryCode) {
      const existingCountry = await countryRepository.findByCode(data.countryCode);
      if (existingCountry && existingCountry.id !== id) {
        throw new Error(`Country with code ${data.countryCode} already exists`);
      }
    }

    return countryRepository.update(id, data);
  }

  async deleteCountry(id) {
    await this.getCountryById(id);
    return countryRepository.delete(id);
  }
}

module.exports = new CountryService();
