FROM node:22-alpine AS deps

EXPOSE 3001
EXPOSE 80

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate

CMD ["npm", "start"]