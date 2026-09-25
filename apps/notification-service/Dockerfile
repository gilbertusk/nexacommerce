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
COPY apps/notification-service/package.json ./apps/notification-service/

RUN npm ci --workspace=apps/notification-service --include-workspace-root

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY . .

RUN npx prisma generate --schema=apps/notification-service/prisma/schema.prisma

RUN npm run build --workspace=packages/types --if-present
RUN npm run build --workspace=packages/config --if-present
RUN npm run build --workspace=packages/logger --if-present
RUN npm run build --workspace=packages/event-contracts --if-present
RUN npm run build --workspace=packages/validation --if-present
RUN npm run build --workspace=packages/common --if-present

RUN npm run build --workspace=apps/notification-service

RUN cp -r apps/notification-service/src/generated apps/notification-service/dist/ 2>/dev/null || true

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nexacommerce

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/notification-service/dist ./apps/notification-service/dist
COPY --from=builder /app/apps/notification-service/package.json ./apps/notification-service/
COPY --from=builder /app/apps/notification-service/prisma ./apps/notification-service/prisma 2>/dev/null || true
COPY --from=builder /app/apps/notification-service/node_modules/.prisma ./apps/notification-service/node_modules/.prisma 2>/dev/null || true

USER nexacommerce

EXPOSE 3011

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3011/health || exit 1

CMD ["node", "apps/notification-service/dist/server.js"]
