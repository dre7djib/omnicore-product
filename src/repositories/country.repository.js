const prisma = require('../config/database').prisma;

class CountryRepository {
  async create(data) {
    return prisma.country.create({ data });
  }

  async findAll({ isActive } = {}) {
    return prisma.country.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id) {
    return prisma.country.findUnique({ where: { id } });
  }

  async findByCode(countryCode) {
    return prisma.country.findUnique({ where: { countryCode } });
  }

  async update(id, data) {
    return prisma.country.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.country.delete({ where: { id } });
  }
}

module.exports = new CountryRepository();
