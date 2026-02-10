const { cloudinary } = require('../config/cloudinary');
const { logger } = require('../config/logger');

class CloudinaryService {
  async uploadImage(file, options = {}) {
    try {
      const {
        folder = 'omnicore/products',
        transformation = { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
        public_id,
      } = options;

      const uploadOptions = {
        folder,
        resource_type: 'image',
        transformation,
      };

      if (public_id) {
        uploadOptions.public_id = public_id;
      }

      let result;
      if (file.buffer && Buffer.isBuffer(file.buffer)) {
        result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file.buffer.toString('base64')}`, uploadOptions);
      } else if (Buffer.isBuffer(file)) {
        result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file.toString('base64')}`, uploadOptions);
      } else if (typeof file === 'string') {
        result = await cloudinary.uploader.upload(file, uploadOptions);
      } else if (file.path) {
        result = await cloudinary.uploader.upload(file.path, uploadOptions);
      } else {
        throw new Error('Invalid file format');
      }

      logger.info('Image uploaded to Cloudinary', {
        publicId: result.public_id,
        url: result.secure_url,
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      logger.error('Cloudinary upload failed', { error: error.message });
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async uploadMultiple(files, options = {}) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, options));
      return await Promise.all(uploadPromises);
    } catch (error) {
      logger.error('Multiple upload failed', { error: error.message });
      throw error;
    }
  }

  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      logger.info('Image deleted from Cloudinary', { publicId, result: result.result });

      return result.result === 'ok';
    } catch (error) {
      logger.error('Cloudinary delete failed', { publicId, error: error.message });
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  async deleteMultiple(publicIds) {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);

      logger.info('Multiple images deleted', { count: publicIds.length });

      return result;
    } catch (error) {
      logger.error('Multiple delete failed', { error: error.message });
      throw error;
    }
  }

  getTransformedUrl(publicId, transformations = {}) {
    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
    } = transformations;

    return cloudinary.url(publicId, {
      transformation: [
        { width, height, crop, quality, fetch_format: format },
      ],
      secure: true,
    });
  }

  getThumbnail(publicId, size = 150) {
    return this.getTransformedUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
      quality: 'auto',
    });
  }
}

module.exports = new CloudinaryService();
