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
COPY apps/analytics-service/package.json ./apps/analytics-service/

RUN npm ci --workspace=apps/analytics-service --include-workspace-root

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY . .

RUN npx prisma generate --schema=apps/analytics-service/prisma/schema.prisma

RUN npm run build --workspace=packages/types --if-present
RUN npm run build --workspace=packages/config --if-present
RUN npm run build --workspace=packages/logger --if-present
RUN npm run build --workspace=packages/event-contracts --if-present
RUN npm run build --workspace=packages/validation --if-present
RUN npm run build --workspace=packages/common --if-present

RUN npm run build --workspace=apps/analytics-service

RUN cp -r apps/analytics-service/src/generated apps/analytics-service/dist/ 2>/dev/null || true

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nexacommerce

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/analytics-service/dist ./apps/analytics-service/dist
COPY --from=builder /app/apps/analytics-service/package.json ./apps/analytics-service/
COPY --from=builder /app/apps/analytics-service/prisma ./apps/analytics-service/prisma 2>/dev/null || true
COPY --from=builder /app/apps/analytics-service/node_modules/.prisma ./apps/analytics-service/node_modules/.prisma 2>/dev/null || true

USER nexacommerce

EXPOSE 3012

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3012/health || exit 1

CMD ["node", "apps/analytics-service/dist/server.js"]
