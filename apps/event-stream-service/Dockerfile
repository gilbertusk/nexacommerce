FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/config/package.json ./packages/config/
COPY packages/event-contracts/package.json ./packages/event-contracts/
COPY packages/logger/package.json ./packages/logger/
COPY apps/event-stream-service/package.json ./apps/event-stream-service/

RUN npm ci --workspace=apps/event-stream-service --include-workspace-root

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY . .

RUN npm run build --workspace=packages/config --if-present
RUN npm run build --workspace=packages/logger --if-present
RUN npm run build --workspace=packages/event-contracts --if-present
RUN npm run build --workspace=packages/common --if-present
RUN npm run build --workspace=apps/event-stream-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nexacommerce

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/event-stream-service/dist ./apps/event-stream-service/dist
COPY --from=builder /app/apps/event-stream-service/package.json ./apps/event-stream-service/

USER nexacommerce
EXPOSE 3013

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3013/health || exit 1

CMD ["node", "apps/event-stream-service/dist/server.js"]
