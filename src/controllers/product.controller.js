const productService = require('../services/product.service');
const { logger } = require('../config/logger');

class ProductController {
  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      logger.info({ productId: product.id }, 'Product created');
      res.status(201).json(product);
    } catch (error) {
      logger.error({ err: error }, 'Failed to create product');
      next(error);
    }
  }

  async createWithUpload(req, res, next) {
    try {
      const files = req.files;
      const { name, description, isActive } = req.body;

      const productData = {
        name,
        description,
        isActive: isActive === 'true' || isActive === true,
      };

      const product = await productService.createProductWithUpload(productData, files);
      logger.info({ productId: product.id }, 'Product created with uploaded images');
      res.status(201).json(product);
    } catch (error) {
      logger.error({ err: error }, 'Failed to create product with upload');
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { isActive } = req.query;
      const filters = {};
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const products = await productService.getAllProducts(filters);
      res.json(products);
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch products');
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to fetch product');
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      logger.info({ productId: product.id }, 'Product updated');
      res.json(product);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to update product');
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      logger.info({ productId: req.params.id }, 'Product deleted');
      res.status(204).send();
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to delete product');
      next(error);
    }
  }

  async addImage(req, res, next) {
    try {
      const image = await productService.addProductImage(req.params.id, req.body);
      logger.info({ productId: req.params.id, imageId: image.id }, 'Product image added');
      res.status(201).json(image);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to add product image');
      next(error);
    }
  }

  async uploadImage(req, res, next) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const image = await productService.addProductImageWithUpload(req.params.id, file.buffer);
      logger.info({ productId: req.params.id, imageId: image.id }, 'Product image uploaded');
      res.status(201).json(image);
    } catch (error) {
      logger.error({ err: error, id: req.params.id }, 'Failed to upload product image');
      next(error);
    }
  }

  async setPrimaryImage(req, res, next) {
    try {
      const image = await productService.setProductPrimaryImage(
        req.params.id,
        req.params.imageId,
      );
      logger.info({ productId: req.params.id, imageId: req.params.imageId }, 'Primary image set');
      res.json(image);
    } catch (error) {
      logger.error({ err: error, id: req.params.id, imageId: req.params.imageId }, 'Failed to set primary image');
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      await productService.deleteProductImage(req.params.imageId);
      logger.info({ imageId: req.params.imageId }, 'Product image deleted');
      res.status(204).send();
    } catch (error) {
      logger.error({ err: error, imageId: req.params.imageId }, 'Failed to delete product image');
      next(error);
    }
  }
}

module.exports = new ProductController();
