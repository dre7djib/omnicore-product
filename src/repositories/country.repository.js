const prisma = require('../config/database').prisma;

class CountryRepository {
  create(data) {
    return prisma.country.create({ data });
  }

  findAll({ isActive } = {}) {
    return prisma.country.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  findById(id) {
    return prisma.country.findUnique({ where: { id } });
  }

  findByCode(countryCode) {
    return prisma.country.findUnique({ where: { countryCode } });
  }

  update(id, data) {
    return prisma.country.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.country.delete({ where: { id } });
  }
}

module.exports = new CountryRepository();
