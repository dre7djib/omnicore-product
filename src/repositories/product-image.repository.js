const prisma = require('../config/database').prisma;

class ProductImageRepository {
  async create(data) {
    return prisma.productImage.create({ data });
  }

  async createMany(data) {
    return prisma.productImage.createMany({ data });
  }

  async findByProductId(productId) {
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
    });
  }

  async findById(id) {
    return prisma.productImage.findUnique({ where: { id } });
  }

  async update(id, data) {
    return prisma.productImage.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.productImage.delete({ where: { id } });
  }

  async setPrimary(productId, imageId) {
    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);
  }
}

module.exports = new ProductImageRepository();
