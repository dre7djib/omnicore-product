# ── Builder ───────────────────────────────────────────────────────────────────
FROM node:22-alpine3.21 AS builder

WORKDIR /app

# Root workspace metadata
COPY package.json package-lock.json ./

# Workspace package.json files (required for npm ci to resolve the workspace graph)
COPY omnicore-db/package.json      ./omnicore-db/package.json
COPY omnicore-auth/package.json    ./omnicore-auth/package.json
COPY omnicore-user/package.json    ./omnicore-user/package.json
COPY omnicore-product/package.json ./omnicore-product/package.json
COPY omnicore-gateway/package.json ./omnicore-gateway/package.json
COPY omnicore-order/package.json   ./omnicore-order/package.json
COPY omnicore-payment/package.json ./omnicore-payment/package.json

# Shared DB package — contains schema + migrations + Prisma client source
COPY omnicore-db/ ./omnicore-db/

# Install all deps (devDeps included so prisma CLI is available for generate)
RUN npm ci && npm cache clean --force

# Generate Prisma client into root node_modules/@prisma/client
RUN cd omnicore-db && npx prisma generate

# Prune devDependencies for a lean production image
RUN npm prune --omit=dev
# Remove @types/jest from workspace node_modules — its nested picomatch@4.x has a CVE
# and npm prune does not always clean deeply nested workspace-specific devDep trees.
RUN find . -path "*/omnicore-product/node_modules/@types/jest" -type d -exec rm -rf {} + 2>/dev/null; true

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine3.21

WORKDIR /app

# Patch all OS-level packages to eliminate known CVEs
RUN apk upgrade --no-cache

# Upgrade npm to get patched tar bundled version (fixes tar CVEs in npm's own bundled copy)
RUN npm install -g npm@latest

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Pruned node_modules (workspace symlinks resolved to real directories by Docker COPY)
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Per-service node_modules (packages npm did not hoist to root in workspace layout)
COPY --from=builder --chown=nodejs:nodejs /app/omnicore-product/node_modules ./omnicore-product/node_modules

# Shared DB package (needed to resolve node_modules/@omnicore/db symlink → ../../omnicore-db)
COPY --chown=nodejs:nodejs omnicore-db/ ./omnicore-db/

# Service source code
COPY --chown=nodejs:nodejs omnicore-product/ ./omnicore-product/

USER nodejs

WORKDIR /app/omnicore-product

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
