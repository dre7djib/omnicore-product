const countryProductRepository = require('../repositories/country-product.repository');
const productRepository = require('../repositories/product.repository');
const countryRepository = require('../repositories/country.repository');

class CountryProductService {
  async createCountryProduct(data) {
    const product = await productRepository.findById(data.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const country = await countryRepository.findById(data.countryId);
    if (!country) {
      throw new Error('Country not found');
    }

    const existing = await countryProductRepository.findByProductAndCountry(
      data.productId,
      data.countryId,
    );
    if (existing) {
      throw new Error('Country product mapping already exists');
    }

    return countryProductRepository.create(data);
  }

  getAllCountryProducts(filters = {}) {
    return countryProductRepository.findAll(filters);
  }

  async getCountryProductById(id) {
    const countryProduct = await countryProductRepository.findById(id);
    if (!countryProduct) {
      throw new Error('Country product not found');
    }
    return countryProduct;
  }

  async getProductsByCountry(countryId) {
    const country = await countryRepository.findById(countryId);
    if (!country) {
      throw new Error('Country not found');
    }

    return countryProductRepository.findAll({
      countryId,
      isAvailable: true,
    });
  }

  async updateCountryProduct(id, data) {
    await this.getCountryProductById(id);
    return countryProductRepository.update(id, data);
  }

  async deleteCountryProduct(id) {
    await this.getCountryProductById(id);
    const itemCount = await countryProductRepository.hasOrderItems(id);
    if (itemCount > 0) {
      const err = new Error(`Cannot delete: this product listing has ${itemCount} existing order item(s)`);
      err.status = 409;
      throw err;
    }
    return countryProductRepository.delete(id);
  }

  async updateStock(id, quantity) {
    await this.getCountryProductById(id);
    return countryProductRepository.update(id, {
      quantity,
      isAvailable: quantity > 0,
    });
  }
}

module.exports = new CountryProductService();
