const prisma = require('../config/database').prisma;

class ProductRepository {
  async create(data) {
    return prisma.product.create({
      data,
      include: { images: true },
    });
  }

  async findAll({ isActive } = {}) {
    return prisma.product.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
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

  async update(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      include: { images: true },
    });
  }

  async delete(id) {
    return prisma.product.delete({ where: { id } });
  }
}

module.exports = new ProductRepository();
