const countryProductService = require('../../../src/services/country-product.service');
const countryProductRepository = require('../../../src/repositories/country-product.repository');
const productRepository = require('../../../src/repositories/product.repository');
const countryRepository = require('../../../src/repositories/country.repository');

jest.mock('../../../src/repositories/country-product.repository');
jest.mock('../../../src/repositories/product.repository');
jest.mock('../../../src/repositories/country.repository');

describe('CountryProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCountryProduct', () => {
    it('should create country product when product and country exist', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      const mockCountry = { id: '1', name: 'Belgium' };
      const mockCountryProduct = {
        id: '1',
        productId: '1',
        countryId: '1',
        price: 29.99,
        currency: 'EUR',
        quantity: 100,
        isAvailable: true,
      };

      productRepository.findById.mockResolvedValue(mockProduct);
      countryRepository.findById.mockResolvedValue(mockCountry);
      countryProductRepository.findByProductAndCountry.mockResolvedValue(null);
      countryProductRepository.create.mockResolvedValue(mockCountryProduct);

      const result = await countryProductService.createCountryProduct({
        productId: '1',
        countryId: '1',
        price: 29.99,
        currency: 'EUR',
        quantity: 100,
        isAvailable: true,
      });

      expect(productRepository.findById).toHaveBeenCalledWith('1');
      expect(countryRepository.findById).toHaveBeenCalledWith('1');
      expect(countryProductRepository.findByProductAndCountry).toHaveBeenCalledWith('1', '1');
      expect(countryProductRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockCountryProduct);
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(countryProductService.createCountryProduct({
        productId: '999',
        countryId: '1',
        price: 29.99,
      })).rejects.toThrow('Product not found');

      expect(countryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when country not found', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      productRepository.findById.mockResolvedValue(mockProduct);
      countryRepository.findById.mockResolvedValue(null);

      await expect(countryProductService.createCountryProduct({
        productId: '1',
        countryId: '999',
        price: 29.99,
      })).rejects.toThrow('Country not found');
    });

    it('should throw error when country product mapping already exists', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      const mockCountry = { id: '1', name: 'Belgium' };
      const existingMapping = { id: '1', productId: '1', countryId: '1' };

      productRepository.findById.mockResolvedValue(mockProduct);
      countryRepository.findById.mockResolvedValue(mockCountry);
      countryProductRepository.findByProductAndCountry.mockResolvedValue(existingMapping);

      await expect(countryProductService.createCountryProduct({
        productId: '1',
        countryId: '1',
        price: 29.99,
      })).rejects.toThrow('Country product mapping already exists');

      expect(countryProductRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllCountryProducts', () => {
    it('should return all country products without filters', async () => {
      const mockCountryProducts = [
        { id: '1', productId: '1', countryId: '1', price: 29.99 },
        { id: '2', productId: '2', countryId: '1', price: 39.99 },
      ];
      countryProductRepository.findAll.mockResolvedValue(mockCountryProducts);

      const result = await countryProductService.getAllCountryProducts();

      expect(countryProductRepository.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockCountryProducts);
    });

    it('should return filtered country products', async () => {
      const mockCountryProducts = [
        { id: '1', productId: '1', countryId: '1', price: 29.99, isAvailable: true },
      ];
      countryProductRepository.findAll.mockResolvedValue(mockCountryProducts);

      const result = await countryProductService.getAllCountryProducts({
        countryId: '1',
        isAvailable: true,
      });

      expect(countryProductRepository.findAll).toHaveBeenCalledWith({
        countryId: '1',
        isAvailable: true,
      });
      expect(result).toEqual(mockCountryProducts);
    });
  });

  describe('getCountryProductById', () => {
    it('should return country product when found', async () => {
      const mockCountryProduct = {
        id: '1',
        productId: '1',
        countryId: '1',
        price: 29.99,
      };
      countryProductRepository.findById.mockResolvedValue(mockCountryProduct);

      const result = await countryProductService.getCountryProductById('1');

      expect(countryProductRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCountryProduct);
    });

    it('should throw error when country product not found', async () => {
      countryProductRepository.findById.mockResolvedValue(null);

      await expect(countryProductService.getCountryProductById('999'))
        .rejects.toThrow('Country product not found');
    });
  });

  describe('getProductsByCountry', () => {
    it('should return available products for a country', async () => {
      const mockCountry = { id: '1', name: 'Belgium' };
      const mockProducts = [
        { id: '1', productId: '1', countryId: '1', isAvailable: true },
        { id: '2', productId: '2', countryId: '1', isAvailable: true },
      ];

      countryRepository.findById.mockResolvedValue(mockCountry);
      countryProductRepository.findAll.mockResolvedValue(mockProducts);

      const result = await countryProductService.getProductsByCountry('1');

      expect(countryRepository.findById).toHaveBeenCalledWith('1');
      expect(countryProductRepository.findAll).toHaveBeenCalledWith({
        countryId: '1',
        isAvailable: true,
      });
      expect(result).toEqual(mockProducts);
    });

    it('should throw error when country not found', async () => {
      countryRepository.findById.mockResolvedValue(null);

      await expect(countryProductService.getProductsByCountry('999'))
        .rejects.toThrow('Country not found');

      expect(countryProductRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('updateCountryProduct', () => {
    it('should update country product when it exists', async () => {
      const mockCountryProduct = {
        id: '1',
        productId: '1',
        countryId: '1',
        price: 29.99,
      };
      const updatedCountryProduct = {
        ...mockCountryProduct,
        price: 34.99,
      };

      countryProductRepository.findById.mockResolvedValue(mockCountryProduct);
      countryProductRepository.update.mockResolvedValue(updatedCountryProduct);

      const result = await countryProductService.updateCountryProduct('1', { price: 34.99 });

      expect(countryProductRepository.findById).toHaveBeenCalledWith('1');
      expect(countryProductRepository.update).toHaveBeenCalledWith('1', { price: 34.99 });
      expect(result).toEqual(updatedCountryProduct);
    });

    it('should throw error when country product not found', async () => {
      countryProductRepository.findById.mockResolvedValue(null);

      await expect(countryProductService.updateCountryProduct('999', { price: 34.99 }))
        .rejects.toThrow('Country product not found');

      expect(countryProductRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCountryProduct', () => {
    it('should delete country product when it exists', async () => {
      const mockCountryProduct = {
        id: '1',
        productId: '1',
        countryId: '1',
        price: 29.99,
      };

      countryProductRepository.findById.mockResolvedValue(mockCountryProduct);
      countryProductRepository.delete.mockResolvedValue(mockCountryProduct);

      const result = await countryProductService.deleteCountryProduct('1');

      expect(countryProductRepository.findById).toHaveBeenCalledWith('1');
      expect(countryProductRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCountryProduct);
    });

    it('should throw error when country product not found', async () => {
      countryProductRepository.findById.mockResolvedValue(null);

      await expect(countryProductService.deleteCountryProduct('999'))
        .rejects.toThrow('Country product not found');

      expect(countryProductRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateStock', () => {
    it('should update stock quantity and set isAvailable to true when quantity > 0', async () => {
      const mockCountryProduct = {
        id: '1',
        productId: '1',
        countryId: '1',
        quantity: 50,
        isAvailable: true,
      };
      const updatedCountryProduct = {
        ...mockCountryProduct,
        quantity: 100,
        isAvailable: true,
      };

      countryProductRepository.findById.mockResolvedValue(mockCountryProduct);
      countryProductRepository.update.mockResolvedValue(updatedCountryProduct);

      const result = await countryProductService.updateStock('1', 100);

      expect(countryProductRepository.update).toHaveBeenCalledWith('1', {
        quantity: 100,
        isAvailable: true,
      });
      expect(result).toEqual(updatedCountryProduct);
    });

    it('should update stock quantity and set isAvailable to false when quantity is 0', async () => {
      const mockCountryProduct = {
        id: '1',
        productId: '1',
        countryId: '1',
        quantity: 50,
        isAvailable: true,
      };
      const updatedCountryProduct = {
        ...mockCountryProduct,
        quantity: 0,
        isAvailable: false,
      };

      countryProductRepository.findById.mockResolvedValue(mockCountryProduct);
      countryProductRepository.update.mockResolvedValue(updatedCountryProduct);

      const result = await countryProductService.updateStock('1', 0);

      expect(countryProductRepository.update).toHaveBeenCalledWith('1', {
        quantity: 0,
        isAvailable: false,
      });
      expect(result).toEqual(updatedCountryProduct);
    });

    it('should throw error when country product not found', async () => {
      countryProductRepository.findById.mockResolvedValue(null);

      await expect(countryProductService.updateStock('999', 100))
        .rejects.toThrow('Country product not found');

      expect(countryProductRepository.update).not.toHaveBeenCalled();
    });
  });
});
