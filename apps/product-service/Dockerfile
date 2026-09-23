# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/logger/package.json ./packages/logger/
COPY packages/validation/package.json ./packages/validation/
COPY packages/event-contracts/package.json ./packages/event-contracts/
COPY apps/product-service/package.json ./apps/product-service/

RUN npm ci --workspace=apps/product-service --include-workspace-root

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY . .

RUN npx prisma generate --schema=apps/product-service/prisma/schema.prisma 2>/dev/null || true

RUN npm run build --workspace=packages/types --if-present
RUN npm run build --workspace=packages/config --if-present
RUN npm run build --workspace=packages/logger --if-present
RUN npm run build --workspace=packages/event-contracts --if-present
RUN npm run build --workspace=packages/validation --if-present
RUN npm run build --workspace=packages/common --if-present

RUN npm run build --workspace=apps/product-service

RUN cp -r apps/product-service/src/generated apps/product-service/dist/ 2>/dev/null || true

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nexacommerce

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/*/dist ./packages/*/dist
COPY --from=builder /app/packages/*/package.json ./packages/*/
COPY --from=builder /app/apps/product-service/dist ./apps/product-service/dist
COPY --from=builder /app/apps/product-service/package.json ./apps/product-service/
COPY --from=builder /app/apps/product-service/prisma ./apps/product-service/prisma 2>/dev/null || true
COPY --from=builder /app/apps/product-service/node_modules/.prisma ./apps/product-service/node_modules/.prisma 2>/dev/null || true

USER nexacommerce

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3003/health || exit 1

CMD ["node", "apps/product-service/dist/server.js"]
