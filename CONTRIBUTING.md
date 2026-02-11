# Contributing to Omnicore Product Service

## Getting Started

1. Fork and clone the repository
2. Follow the setup steps in the [README](README.md#quick-start)
3. Create a feature branch off `dev`

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable / production-ready code |
| `dev` | Active development — all feature branches merge here |

Feature branches should be named descriptively (e.g. `feat/add-patch-endpoint`, `fix/price-validation`).

When CI passes on `dev`, a PR from `dev` to `main` is automatically created.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use |
|--------|-----|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `test:` | Adding or updating tests |
| `ci:` | CI/CD configuration changes |

Example: `feat: add PATCH route for partial product updates`

## Code Style

ESLint is enforced via CI. Key rules:

- 2-space indentation
- Single quotes
- Semicolons required
- `prefer-const` / `no-var`
- No `console` — use [pino](https://github.com/pinojs/pino) for logging

Run before committing:

```bash
npm run lint:fix
```

## Testing

### Unit Tests

Required for any service logic changes. Tests live in `tests/unit/` and use Jest.

```bash
npm run test:unit
```

Coverage thresholds (enforced by Jest):

| Metric | Minimum |
|--------|---------|
| Branches | 30% |
| Functions | 25% |
| Lines | 20% |
| Statements | 20% |

### Integration Tests

Required for new or changed endpoints. Tests are defined in `postman_collection.json` and executed via Newman.

```bash
npm run test:integration
```

This starts the Postman collection against a running server, so make sure the server is up (`npm run dev`) before running locally.

## Adding a New Endpoint

Checklist:

1. **Route** — define in `src/routes/` with Express Router and request validation
2. **Controller** — add handler in `src/controllers/`
3. **Service** — implement business logic in `src/services/`
4. **Repository** — add Prisma queries in `src/repositories/`
5. **Swagger JSDoc** — annotate the route with `@swagger` comments for `/api-docs`
6. **Unit test** — add Jest tests in `tests/unit/services/`
7. **Postman test** — add requests and assertions to `postman_collection.json`

## Database Changes

This project uses Prisma ORM. To create a new migration:

```bash
npx prisma migrate dev --name <migration-name>
```

The schema (`prisma/schema.prisma`) is shared across services — keep it in sync when making changes.

Always commit the generated migration files in `prisma/migrations/`.

## Pull Requests

1. Branch off `dev`
2. Fill in the [PR template](.github/pull_request_template.md)
3. CI must pass: lint + unit tests + security audit + integration tests
4. Reference related issues (e.g. `Closes #42`)
5. Request a review from at least one team member
