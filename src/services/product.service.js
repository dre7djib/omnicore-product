const productRepository = require('../repositories/product.repository');
const productImageRepository = require('../repositories/product-image.repository');
const cloudinaryService = require('./cloudinary.service');

class ProductService {
  async createProduct(data) {
    const { images, ...productData } = data;

    const product = await productRepository.create(productData);

    if (images && images.length > 0) {
      const imageData = images.map((img, index) => ({
        productId: product.id,
        url: img.url,
        isPrimary: index === 0 || img.isPrimary || false,
      }));
      await productImageRepository.createMany(imageData);
    }

    return productRepository.findById(product.id);
  }

  async createProductWithUpload(data, files) {
    const product = await productRepository.create(data);

    if (files && files.length > 0) {
      const uploadedImages = await cloudinaryService.uploadMultiple(
        files,
        { folder: `omnicore/products/${product.id}` },
      );

      const imageData = uploadedImages.map((img, index) => ({
        productId: product.id,
        url: img.url,
        publicId: img.publicId,
        isPrimary: index === 0,
      }));

      await productImageRepository.createMany(imageData);
    }

    return productRepository.findById(product.id);
  }

  getAllProducts(filters = {}) {
    return productRepository.findAll(filters);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async updateProduct(id, data) {
    await this.getProductById(id);
    return productRepository.update(id, data);
  }

  async deleteProduct(id) {
    await this.getProductById(id);
    const itemCount = await productRepository.hasOrderItems(id);
    if (itemCount > 0) {
      const err = new Error(`Cannot delete: this product has ${itemCount} existing order item(s)`);
      err.status = 409;
      throw err;
    }
    return productRepository.delete(id);
  }

  async addProductImage(productId, imageData) {
    await this.getProductById(productId);
    return productImageRepository.create({
      productId,
      ...imageData,
    });
  }

  async addProductImageWithUpload(productId, file) {
    await this.getProductById(productId);

    const uploadedImage = await cloudinaryService.uploadImage(
      file,
      { folder: `omnicore/products/${productId}` },
    );

    return productImageRepository.create({
      productId,
      url: uploadedImage.url,
      publicId: uploadedImage.publicId,
      isPrimary: false,
    });
  }

  async setProductPrimaryImage(productId, imageId) {
    await this.getProductById(productId);
    const image = await productImageRepository.findById(imageId);

    if (!image || image.productId !== productId) {
      throw new Error('Image not found for this product');
    }

    await productImageRepository.setPrimary(productId, imageId);
    return productImageRepository.findById(imageId);
  }

  async deleteProductImage(imageId) {
    const image = await productImageRepository.findById(imageId);
    if (!image) {
      throw new Error('Image not found');
    }

    if (image.publicId) {
      try {
        await cloudinaryService.deleteImage(image.publicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
      }
    }

    return productImageRepository.delete(imageId);
  }
}

module.exports = new ProductService();
