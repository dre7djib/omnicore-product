const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Omnicore Product Service API',
      version: '1.0.0',
      description: 'API for managing products with multi-country inventory, pricing, and image management.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Country: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Belgium' },
            countryCode: { type: 'string', example: 'BE' },
            currency: { type: 'string', example: 'EUR' },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CountryInput: {
          type: 'object',
          required: ['name', 'countryCode', 'currency'],
          properties: {
            name: { type: 'string', example: 'Belgium' },
            countryCode: { type: 'string', example: 'BE' },
            currency: { type: 'string', example: 'EUR' },
            isActive: { type: 'boolean', default: true },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'T-Shirt Premium' },
            description: { type: 'string', example: 'High quality cotton' },
            isActive: { type: 'boolean', default: true },
            images: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductImage' },
            },
            countryProducts: {
              type: 'array',
              items: { $ref: '#/components/schemas/CountryProduct' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'T-Shirt Premium' },
            description: { type: 'string', example: 'High quality cotton' },
            isActive: { type: 'boolean', default: true },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string', format: 'uri', example: 'https://example.com/image.jpg' },
                  isPrimary: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        ProductImage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            url: { type: 'string', format: 'uri' },
            publicId: { type: 'string', nullable: true },
            isPrimary: { type: 'boolean' },
            productId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CountryProduct: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            countryId: { type: 'string', format: 'uuid' },
            price: { type: 'number', format: 'float', example: 29.99 },
            currency: { type: 'string', example: 'EUR' },
            quantity: { type: 'integer', example: 100 },
            isAvailable: { type: 'boolean', default: true },
            product: { $ref: '#/components/schemas/Product' },
            country: { $ref: '#/components/schemas/Country' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CountryProductInput: {
          type: 'object',
          required: ['productId', 'countryId', 'price', 'currency', 'quantity'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
            countryId: { type: 'string', format: 'uuid' },
            price: { type: 'number', format: 'float', example: 29.99 },
            currency: { type: 'string', example: 'EUR' },
            quantity: { type: 'integer', example: 100 },
            isAvailable: { type: 'boolean', default: true },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  param: { type: 'string' },
                  location: { type: 'string' },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                status: { type: 'integer' },
                correlationId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
