# NexaCommerce — Enterprise E-Commerce Microservice Platform

NexaCommerce is a high-performance, enterprise-grade e-commerce backend platform built on top of a Node.js microservices architecture.

## Tech Stack
- **API Gateway & Services**: Express.js, TypeScript, TS-Node
- **Database & Cache**: PostgreSQL, Prisma ORM, Redis
- **Event Streaming**: RabbitMQ
- **Validation & Authentication**: Zod, JSON Web Tokens (JWT), Bcrypt
- **Infrastructure**: Docker, Docker Compose

---

## Directory Structure
- `apps/`: Contains isolated microservices.
  - `api-gateway/`: Main routing entrypoint (Port 3000).
  - `auth-service/`: User registration, logins, and JWT token issuance (Port 3001).
  - `product-service/`: Catalog, categories, products, search, and pagination (Port 3003).
- `packages/`: Common internal utility packages (shared logging, config, interfaces, events validation).
- `frontend/`: Placeholders for Web client and dashboard apps.
- `infra/`: Docker compose files and local software setup.
- `docs/`: Technical plans and architecture schemas.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Installation
1. Install root workspace packages:
   ```bash
   npm install
   ```
2. Start the local database, cache, and messaging infrastructure:
   ```bash
   npm run docker:up
   ```
3. Run Prisma Migrations:
   - For Auth Service:
     ```bash
     npm run db:migrate:auth
     ```
   - For Product Service:
     ```bash
     npm run db:migrate:product
     ```
4. Start Services in Development Mode:
   - Gateway: `npm run dev:gateway`
   - Auth: `npm run dev:auth`
   - Product: `npm run dev:product`
