const prisma = require('../config/database').prisma;

class CountryProductRepository {
  async create(data) {
    return prisma.countryProduct.create({
      data,
      include: {
        product: { include: { images: true } },
        country: true,
      },
    });
  }

  async findAll({ countryId, productId, isAvailable } = {}) {
    const where = {};
    if (countryId) {
      where.countryId = countryId;
    }
    if (productId) {
      where.productId = productId;
    }
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    return prisma.countryProduct.findMany({
      where,
      include: {
        product: { include: { images: true } },
        country: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id) {
    return prisma.countryProduct.findUnique({
      where: { id },
      include: {
        product: { include: { images: true } },
        country: true,
      },
    });
  }

  async findByProductAndCountry(productId, countryId) {
    return prisma.countryProduct.findUnique({
      where: {
        productId_countryId: { productId, countryId },
      },
      include: {
        product: { include: { images: true } },
        country: true,
      },
    });
  }

  async update(id, data) {
    return prisma.countryProduct.update({
      where: { id },
      data,
      include: {
        product: { include: { images: true } },
        country: true,
      },
    });
  }

  async delete(id) {
    return prisma.countryProduct.delete({ where: { id } });
  }
}

module.exports = new CountryProductRepository();
