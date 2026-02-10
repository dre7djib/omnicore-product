# Omnicore Product Service

Microservice for managing products with multi-country inventory, per-country pricing, and Cloudinary CDN image management.

## Prerequisites

- Node.js 22+
- PostgreSQL 13+
- npm

## Quick Start

```bash
git clone <repo-url> && cd omnicore-product
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev
npx prisma generate
npm run dev
```

Open http://localhost:3001/api-docs to browse the API.

## API Documentation

Interactive Swagger UI is available at `/api-docs` when the server is running.

The API exposes three resource groups under `/api`:

| Group | Base path | Endpoints |
|-------|-----------|-----------|
| Countries | `/api/countries` | 5 |
| Products | `/api/products` | 10 |
| Country Products | `/api/country-products` | 7 |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start dev server with hot reload |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm test` | Run unit tests |
| `npm run test:unit` | Run unit tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run security:check` | Audit dependencies for vulnerabilities |

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `PORT` | Server port | No | `3001` |
| `NODE_ENV` | `development` or `production` | No | `development` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No* | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No* | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No* | - |

\* Required only for file-upload image features. URL-based images work without Cloudinary.

## Project Structure

```
src/
  config/        # Database, logger, Cloudinary, Swagger config
  controllers/   # Request/response handlers
  services/      # Business logic
  repositories/  # Prisma database queries
  routes/        # Express routes & validation
  middlewares/    # Logging, upload, correlation ID
  utils/         # Helpers
  app.js         # Express app setup
  server.js      # Server bootstrap
prisma/
  schema.prisma  # Database schema
  migrations/    # Migration history
tests/           # Jest unit tests
```

## CI Pipeline

GitHub Actions runs on every push to `dev` and on PRs to `main`:

1. Install dependencies
2. Generate Prisma Client
3. ESLint check
4. Unit tests with coverage
5. Security audit

## Testing

```bash
npm run test:unit   # 52 unit tests with coverage
npm run lint        # ESLint checks
```

## License

ISC
