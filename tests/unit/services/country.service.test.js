const countryService = require('../../../src/services/country.service');
const countryRepository = require('../../../src/repositories/country.repository');

jest.mock('../../../src/repositories/country.repository');

describe('CountryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCountry', () => {
    it('should create a country when country code does not exist', async () => {
      const mockCountry = {
        id: '1',
        name: 'Belgium',
        countryCode: 'BE',
        currency: 'EUR',
        isActive: true,
      };

      countryRepository.findByCode.mockResolvedValue(null);
      countryRepository.create.mockResolvedValue(mockCountry);

      const result = await countryService.createCountry({
        name: 'Belgium',
        countryCode: 'BE',
        currency: 'EUR',
        isActive: true,
      });

      expect(countryRepository.findByCode).toHaveBeenCalledWith('BE');
      expect(countryRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockCountry);
    });

    it('should throw error when country code already exists', async () => {
      const existingCountry = {
        id: '1',
        name: 'Belgium',
        countryCode: 'BE',
      };

      countryRepository.findByCode.mockResolvedValue(existingCountry);

      await expect(countryService.createCountry({
        name: 'Belgium',
        countryCode: 'BE',
        currency: 'EUR',
      })).rejects.toThrow('Country with code BE already exists');

      expect(countryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllCountries', () => {
    it('should return all countries without filters', async () => {
      const mockCountries = [
        { id: '1', name: 'Belgium', countryCode: 'BE' },
        { id: '2', name: 'France', countryCode: 'FR' },
      ];
      countryRepository.findAll.mockResolvedValue(mockCountries);

      const result = await countryService.getAllCountries();

      expect(countryRepository.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockCountries);
    });

    it('should return filtered countries', async () => {
      const mockCountries = [
        { id: '1', name: 'Belgium', countryCode: 'BE', isActive: true },
      ];
      countryRepository.findAll.mockResolvedValue(mockCountries);

      const result = await countryService.getAllCountries({ isActive: true });

      expect(countryRepository.findAll).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(mockCountries);
    });
  });

  describe('getCountryById', () => {
    it('should return country when found', async () => {
      const mockCountry = {
        id: '1',
        name: 'Belgium',
        countryCode: 'BE',
      };
      countryRepository.findById.mockResolvedValue(mockCountry);

      const result = await countryService.getCountryById('1');

      expect(countryRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCountry);
    });

    it('should throw error when country not found', async () => {
      countryRepository.findById.mockResolvedValue(null);

      await expect(countryService.getCountryById('999'))
        .rejects.toThrow('Country not found');
    });
  });

  describe('updateCountry', () => {
    it('should update country when it exists', async () => {
      const mockCountry = {
        id: '1',
        name: 'Belgium',
        countryCode: 'BE',
      };
      const updatedCountry = {
        ...mockCountry,
        currency: 'EUR',
      };

      countryRepository.findById.mockResolvedValue(mockCountry);
      countryRepository.update.mockResolvedValue(updatedCountry);

      const result = await countryService.updateCountry('1', { currency: 'EUR' });

      expect(countryRepository.findById).toHaveBeenCalledWith('1');
      expect(countryRepository.update).toHaveBeenCalledWith('1', { currency: 'EUR' });
      expect(result).toEqual(updatedCountry);
    });

    it('should throw error when country not found', async () => {
      countryRepository.findById.mockResolvedValue(null);

      await expect(countryService.updateCountry('999', { currency: 'EUR' }))
        .rejects.toThrow('Country not found');

      expect(countryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when updating to existing country code', async () => {
      const mockCountry = {
        id: '1',
        name: 'Belgium',
        countryCode: 'BE',
      };
      const existingCountry = {
        id: '2',
        name: 'France',
        countryCode: 'FR',
      };

      countryRepository.findById.mockResolvedValue(mockCountry);
      countryRepository.findByCode.mockResolvedValue(existingCountry);

      await expect(countryService.updateCountry('1', { countryCode: 'FR' }))
        .rejects.toThrow('Country with code FR already exists');

      expect(countryRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating country with same country code', async () => {
      const mockCountry = {
        id: '1',
        name: 'Belgium',
        countryCode: 'BE',
      };
      const updatedCountry = {
        ...mockCountry,
        name: 'Belgium Updated',
      };

      countryRepository.findById.mockResolvedValue(mockCountry);
      countryRepository.findByCode.mockResolvedValue(mockCountry);
      countryRepository.update.mockResolvedValue(updatedCountry);

      const result = await countryService.updateCountry('1', {
        countryCode: 'BE',
        name: 'Belgium Updated',
      });

      expect(countryRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updatedCountry);
    });
  });

  describe('deleteCountry', () => {
    it('should delete country when it exists', async () => {
      const mockCountry = {
        id: '1',
        name: 'Belgium',
        countryCode: 'BE',
      };

      countryRepository.findById.mockResolvedValue(mockCountry);
      countryRepository.delete.mockResolvedValue(mockCountry);

      const result = await countryService.deleteCountry('1');

      expect(countryRepository.findById).toHaveBeenCalledWith('1');
      expect(countryRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCountry);
    });

    it('should throw error when country not found', async () => {
      countryRepository.findById.mockResolvedValue(null);

      await expect(countryService.deleteCountry('999'))
        .rejects.toThrow('Country not found');

      expect(countryRepository.delete).not.toHaveBeenCalled();
    });
  });
});
