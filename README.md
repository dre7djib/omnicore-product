# Omnicore Product Service

Product management microservice for the Omnicore e-commerce platform.

## Features

- Product CRUD operations
- Multi-country product management
- Country-specific pricing and inventory
- Product image management
- RESTful API endpoints

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run database migrations:
```bash
npm run prisma:migrate
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

## Running the Service

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reload
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| PORT | Server port | 3001 |
| NODE_ENV | Environment (development/production) | development |

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Countries
- `GET /api/countries` - List all countries
- `GET /api/countries/:id` - Get country by ID
- `POST /api/countries` - Create new country
- `PUT /api/countries/:id` - Update country
- `DELETE /api/countries/:id` - Delete country

## Database Schema

### Models
- **Product** - Product information
- **Country** - Country configuration
- **CountryProduct** - Country-specific product data (pricing, inventory)
- **ProductImage** - Product images

## Project Structure

```
omnicore-product/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Express middlewares
│   ├── repositories/   # Data access layer
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── .env                # Environment variables
└── package.json        # Dependencies
```

## License

ISC
