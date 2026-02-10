const prisma = require('../config/database').prisma;

class ProductRepository {
  create(data) {
    return prisma.product.create({
      data,
      include: { images: true },
    });
  }

  findAll({ isActive } = {}) {
    return prisma.product.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        countryProducts: {
          include: { country: true },
        },
      },
    });
  }

  update(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      include: { images: true },
    });
  }

  delete(id) {
    return prisma.product.delete({ where: { id } });
  }
}

module.exports = new ProductRepository();
