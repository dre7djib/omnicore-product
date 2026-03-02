const prisma = require('../config/database').prisma;

class CountryProductRepository {
  create(data) {
    return prisma.countryProduct.create({
      data,
      include: {
        product: { include: { images: true } },
        country: true,
      },
    });
  }

  findAll({ countryId, productId, isAvailable } = {}) {
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

  findById(id) {
    return prisma.countryProduct.findUnique({
      where: { id },
      include: {
        product: { include: { images: true } },
        country: true,
      },
    });
  }

  findByProductAndCountry(productId, countryId) {
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

  update(id, data) {
    return prisma.countryProduct.update({
      where: { id },
      data,
      include: {
        product: { include: { images: true } },
        country: true,
      },
    });
  }

  hasOrderItems(id) {
    return prisma.orderItem.count({ where: { countryProductId: id } });
  }

  delete(id) {
    return prisma.countryProduct.delete({ where: { id } });
  }
}

module.exports = new CountryProductRepository();
