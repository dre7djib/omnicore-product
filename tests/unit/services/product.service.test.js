const productService = require('../../../src/services/product.service');
const productRepository = require('../../../src/repositories/product.repository');
const productImageRepository = require('../../../src/repositories/product-image.repository');
const cloudinaryService = require('../../../src/services/cloudinary.service');

jest.mock('../../../src/repositories/product.repository');
jest.mock('../../../src/repositories/product-image.repository');
jest.mock('../../../src/services/cloudinary.service');

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product without images', async () => {
      const mockProduct = { id: '1', name: 'Test Product', description: 'Test' };
      productRepository.create.mockResolvedValue(mockProduct);
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.createProduct({
        name: 'Test Product',
        description: 'Test',
      });

      expect(productRepository.create).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'Test',
      });
      expect(productImageRepository.createMany).not.toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should create a product with images', async () => {
      const mockProduct = { id: '1', name: 'Test Product', description: 'Test' };
      const mockProductWithImages = {
        ...mockProduct,
        images: [{ id: '1', url: 'http://test.com/img1.jpg', isPrimary: true }],
      };

      productRepository.create.mockResolvedValue(mockProduct);
      productImageRepository.createMany.mockResolvedValue([]);
      productRepository.findById.mockResolvedValue(mockProductWithImages);

      const result = await productService.createProduct({
        name: 'Test Product',
        description: 'Test',
        images: [{ url: 'http://test.com/img1.jpg' }],
      });

      expect(productImageRepository.createMany).toHaveBeenCalledWith([{
        productId: '1',
        url: 'http://test.com/img1.jpg',
        isPrimary: true,
      }]);
      expect(result).toEqual(mockProductWithImages);
    });

    it('should set first image as primary when multiple images provided', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      productRepository.create.mockResolvedValue(mockProduct);
      productImageRepository.createMany.mockResolvedValue([]);
      productRepository.findById.mockResolvedValue(mockProduct);

      await productService.createProduct({
        name: 'Test Product',
        images: [
          { url: 'http://test.com/img1.jpg' },
          { url: 'http://test.com/img2.jpg' },
        ],
      });

      expect(productImageRepository.createMany).toHaveBeenCalledWith([
        { productId: '1', url: 'http://test.com/img1.jpg', isPrimary: true },
        { productId: '1', url: 'http://test.com/img2.jpg', isPrimary: false },
      ]);
    });
  });

  describe('createProductWithUpload', () => {
    it('should create product and upload images to Cloudinary', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      const mockFiles = [{ path: '/tmp/img1.jpg' }, { path: '/tmp/img2.jpg' }];
      const mockUploadedImages = [
        { url: 'http://cloudinary.com/img1.jpg', publicId: 'img1' },
        { url: 'http://cloudinary.com/img2.jpg', publicId: 'img2' },
      ];

      productRepository.create.mockResolvedValue(mockProduct);
      cloudinaryService.uploadMultiple.mockResolvedValue(mockUploadedImages);
      productImageRepository.createMany.mockResolvedValue([]);
      productRepository.findById.mockResolvedValue(mockProduct);

      await productService.createProductWithUpload({ name: 'Test Product' }, mockFiles);

      expect(cloudinaryService.uploadMultiple).toHaveBeenCalledWith(
        mockFiles,
        { folder: 'omnicore/products/1' },
      );
      expect(productImageRepository.createMany).toHaveBeenCalledWith([
        { productId: '1', url: 'http://cloudinary.com/img1.jpg', publicId: 'img1', isPrimary: true },
        { productId: '1', url: 'http://cloudinary.com/img2.jpg', publicId: 'img2', isPrimary: false },
      ]);
    });

    it('should create product without images when no files provided', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      productRepository.create.mockResolvedValue(mockProduct);
      productRepository.findById.mockResolvedValue(mockProduct);

      await productService.createProductWithUpload({ name: 'Test Product' }, []);

      expect(cloudinaryService.uploadMultiple).not.toHaveBeenCalled();
      expect(productImageRepository.createMany).not.toHaveBeenCalled();
    });
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getProductById('1');

      expect(result).toEqual(mockProduct);
      expect(productRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.getProductById('999'))
        .rejects.toThrow('Product not found');
    });
  });

  describe('updateProduct', () => {
    it('should update product when it exists', async () => {
      const mockProduct = { id: '1', name: 'Old Name' };
      const updatedProduct = { id: '1', name: 'New Name' };

      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct('1', { name: 'New Name' });

      expect(productRepository.update).toHaveBeenCalledWith('1', { name: 'New Name' });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.updateProduct('999', { name: 'New Name' }))
        .rejects.toThrow('Product not found');
    });
  });

  describe('patchProduct (partial update)', () => {
    it('should update only the provided fields', async () => {
      const existingProduct = { id: '1', name: 'Old Name', description: 'Old Desc', isActive: true };
      const patchedProduct = { id: '1', name: 'Old Name', description: 'New Desc', isActive: true };

      productRepository.findById.mockResolvedValue(existingProduct);
      productRepository.update.mockResolvedValue(patchedProduct);

      const result = await productService.updateProduct('1', { description: 'New Desc' });

      expect(productRepository.update).toHaveBeenCalledWith('1', { description: 'New Desc' });
      expect(result.name).toEqual('Old Name');
      expect(result.description).toEqual('New Desc');
    });

    it('should update only the name when only name is provided', async () => {
      const existingProduct = { id: '1', name: 'Old Name', description: 'Desc', isActive: true };
      const patchedProduct = { id: '1', name: 'Patched Name', description: 'Desc', isActive: true };

      productRepository.findById.mockResolvedValue(existingProduct);
      productRepository.update.mockResolvedValue(patchedProduct);

      const result = await productService.updateProduct('1', { name: 'Patched Name' });

      expect(productRepository.update).toHaveBeenCalledWith('1', { name: 'Patched Name' });
      expect(result.name).toEqual('Patched Name');
      expect(result.description).toEqual('Desc');
    });

    it('should throw error when product not found for patch', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.updateProduct('999', { name: 'New' }))
        .rejects.toThrow('Product not found');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product when it exists', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.delete.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct('1');

      expect(productRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProduct);
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.deleteProduct('999'))
        .rejects.toThrow('Product not found');
    });
  });

  describe('addProductImage', () => {
    it('should add image to existing product', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      const mockImage = { id: '1', productId: '1', url: 'http://test.com/img.jpg', isPrimary: false };

      productRepository.findById.mockResolvedValue(mockProduct);
      productImageRepository.create.mockResolvedValue(mockImage);

      const result = await productService.addProductImage('1', {
        url: 'http://test.com/img.jpg',
        isPrimary: false,
      });

      expect(productImageRepository.create).toHaveBeenCalledWith({
        productId: '1',
        url: 'http://test.com/img.jpg',
        isPrimary: false,
      });
      expect(result).toEqual(mockImage);
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.addProductImage('999', { url: 'http://test.com/img.jpg' }))
        .rejects.toThrow('Product not found');
    });
  });

  describe('addProductImageWithUpload', () => {
    it('should upload image to Cloudinary and add to product', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      const mockFile = { path: '/tmp/img.jpg' };
      const mockUploadedImage = { url: 'http://cloudinary.com/img.jpg', publicId: 'img1' };
      const mockImage = { id: '1', productId: '1', url: mockUploadedImage.url, publicId: 'img1' };

      productRepository.findById.mockResolvedValue(mockProduct);
      cloudinaryService.uploadImage.mockResolvedValue(mockUploadedImage);
      productImageRepository.create.mockResolvedValue(mockImage);

      const result = await productService.addProductImageWithUpload('1', mockFile);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFile,
        { folder: 'omnicore/products/1' },
      );
      expect(result).toEqual(mockImage);
    });
  });

  describe('setProductPrimaryImage', () => {
    it('should set image as primary', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      const mockImage = { id: '1', productId: '1', url: 'http://test.com/img.jpg', isPrimary: false };
      const updatedImage = { ...mockImage, isPrimary: true };

      productRepository.findById.mockResolvedValue(mockProduct);
      productImageRepository.findById.mockResolvedValueOnce(mockImage);
      productImageRepository.setPrimary.mockResolvedValue(undefined);
      productImageRepository.findById.mockResolvedValueOnce(updatedImage);

      const result = await productService.setProductPrimaryImage('1', '1');

      expect(productImageRepository.setPrimary).toHaveBeenCalledWith('1', '1');
      expect(result).toEqual(updatedImage);
    });

    it('should throw error when image does not belong to product', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      const mockImage = { id: '1', productId: '2', url: 'http://test.com/img.jpg' };

      productRepository.findById.mockResolvedValue(mockProduct);
      productImageRepository.findById.mockResolvedValue(mockImage);

      await expect(productService.setProductPrimaryImage('1', '1'))
        .rejects.toThrow('Image not found for this product');
    });

    it('should throw error when image not found', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      productRepository.findById.mockResolvedValue(mockProduct);
      productImageRepository.findById.mockResolvedValue(null);

      await expect(productService.setProductPrimaryImage('1', '999'))
        .rejects.toThrow('Image not found for this product');
    });
  });

  describe('deleteProductImage', () => {
    it('should delete image with Cloudinary publicId', async () => {
      const mockImage = { id: '1', productId: '1', url: 'http://cloudinary.com/img.jpg', publicId: 'img1' };

      productImageRepository.findById.mockResolvedValue(mockImage);
      cloudinaryService.deleteImage.mockResolvedValue(undefined);
      productImageRepository.delete.mockResolvedValue(mockImage);

      const result = await productService.deleteProductImage('1');

      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith('img1');
      expect(productImageRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockImage);
    });

    it('should delete image without Cloudinary publicId', async () => {
      const mockImage = { id: '1', productId: '1', url: 'http://test.com/img.jpg', publicId: null };

      productImageRepository.findById.mockResolvedValue(mockImage);
      productImageRepository.delete.mockResolvedValue(mockImage);

      await productService.deleteProductImage('1');

      expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(productImageRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should continue deletion even if Cloudinary delete fails', async () => {
      const mockImage = { id: '1', productId: '1', url: 'http://cloudinary.com/img.jpg', publicId: 'img1' };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      productImageRepository.findById.mockResolvedValue(mockImage);
      cloudinaryService.deleteImage.mockRejectedValue(new Error('Cloudinary error'));
      productImageRepository.delete.mockResolvedValue(mockImage);

      const result = await productService.deleteProductImage('1');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(productImageRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockImage);

      consoleErrorSpy.mockRestore();
    });

    it('should throw error when image not found', async () => {
      productImageRepository.findById.mockResolvedValue(null);

      await expect(productService.deleteProductImage('999'))
        .rejects.toThrow('Image not found');
    });
  });

  describe('getAllProducts', () => {
    it('should return all products without filters', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ];
      productRepository.findAll.mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts();

      expect(productRepository.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockProducts);
    });

    it('should return filtered products', async () => {
      const mockProducts = [{ id: '1', name: 'Active Product' }];
      productRepository.findAll.mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts({ isActive: true });

      expect(productRepository.findAll).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(mockProducts);
    });
  });
});
