const prisma = require('../config/database').prisma;

class ProductImageRepository {
  create(data) {
    return prisma.productImage.create({ data });
  }

  createMany(data) {
    return prisma.productImage.createMany({ data });
  }

  findByProductId(productId) {
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
    });
  }

  findById(id) {
    return prisma.productImage.findUnique({ where: { id } });
  }

  update(id, data) {
    return prisma.productImage.update({ where: { id }, data });
  }

  delete(id) {
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
