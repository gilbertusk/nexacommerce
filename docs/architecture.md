# NexaCommerce Architecture

This document details the architectural layout, core design decisions, communication patterns, database layouts, and security blueprints of NexaCommerce.

## 1. Architectural Overview

NexaCommerce is an enterprise-grade e-commerce microservices engine built using **Node.js, Express.js, TypeScript, PostgreSQL, Redis, and RabbitMQ**. It uses a monorepo structure with npm workspaces to coordinate the development of 13 separate microservices and 7 shared library packages.

```
                                ┌──────────────────┐
                                │   Client Apps    │
                                └────────┬─────────┘
                                         │ REST HTTP
                                ┌────────▼─────────┐
                                │   API Gateway    │ (Port 3000)
                                └────────┬─────────┘
                                         │
        ┌──────────────┬─────────────────┼────────────────┬──────────────┐
        │              │                 │                │              │
 ┌──────▼──────┐ ┌─────▼───────┐ ┌───────▼───────┐ ┌──────▼──────┐ ┌─────▼──────┐
 │Auth Service │ │User Service │ │Product Service│ │Cart Service │ │Order Serv. │ ...
 └──────┬──────┘ └─────┬───────┘ └───────┬───────┘ └──────┬──────┘ └─────┬──────┘
        │              │                 │                │              │
        └──────────────┼─────────────────┼────────────────┼──────────────┘
                       │                 │                │
                ┌──────▼──────┐   ┌──────▼──────┐  ┌──────▼──────┐
                │ PostgreSQL  │   │ Redis Cache │  │  RabbitMQ   │
                │ (Port 5445) │   │ (Port 6379) │  │ (Port 5672) │
                └─────────────┘   └─────────────┘  └─────────────┘
```

---

## 2. Architecture Decision Records (ADRs)

### 2.1 Why Express.js + TypeScript (over NestJS)?
- **Decision:** Use Express.js with raw routing structures enforced by custom middlewares.
- **Rationale:** NestJS introduces significant boilerplate, heavy decorators, and magic injectors that can obscure microservice designs. Express.js keeps services thin, start times minimal (crucial for containerization), and routing mechanics explicit. TypeScript guarantees compile-time type safety.

### 2.2 Why PostgreSQL?
- **Decision:** Use a single PostgreSQL cluster partitioned into separate schema namespaces for each microservice.
- **Rationale:** E-commerce transactions require strict ACID guarantees (e.g., checkout calculations, stock reservations). Relational constraints prevent orphan records. Utilizing database schemas allows logical separation of service models while minimizing running infrastructure costs.

### 2.3 Why Prisma?
- **Decision:** Use Prisma ORM with distinct schemas and clients generated inside each service's source directory (`src/generated/client`).
- **Rationale:** Prisma offers type-safe database queries, auto-generated TypeScript typings matching schemas, and simple declarative database migrations. Isolated schemas prevent service databases from tightly coupling together.

### 2.4 Why Redis?
- **Decision:** Use Redis to store active shopping carts and token blacklists.
- **Rationale:** Cart reads/writes occur frequently. Storing carts in Redis reduces PostgreSQL read pressure.

### 2.5 Why RabbitMQ?
- **Decision:** Use RabbitMQ with topic exchanges and named queues.
- **Rationale:** Promotes loose coupling. Downstream tasks (notifications, analytics, search indexing) are run asynchronously.

### 2.6 Why Monorepo?
- **Decision:** Organize components under `apps/` and shared modules under `packages/` in a single monorepo.
- **Rationale:** Allows sharing common libraries (schemas, validation blocks, custom logger configurations) without publishing packages to a private npm registry.

---

## 3. Communication Patterns

### 3.1 Synchronous Communication
- **Client to Gateway:** Clients communicate only with the API Gateway (`localhost:3000`) over REST HTTP.
- **Gateway to Services:** Gateway acts as a reverse proxy, parsing JSON Web Tokens and routing traffic to downstream services.
- **Internal Orchestration:** During checkout, the Order Service performs synchronous HTTP REST requests (using `X-Internal-Service` security headers) to product, inventory, user, and voucher services to validate constraints.

### 3.2 Asynchronous Communication
- **Event-Driven Broker:** All async operations occur via RabbitMQ.
- **Topic Exchange:** Services publish events to the `nexacommerce.events` topic exchange. Named queues bind to routing keys (e.g., `order.paid`, `review.created`) to process notifications and build reports.

---

## 4. Security Blueprint
- **Token Verification:** API Gateway decodes the access token JWT and injects `x-user-id`, `x-user-role`, and `x-user-email` headers into downstream requests.
- **RBAC:** downstream routers use authorization middlewares to restrict access based on roles (`CUSTOMER`, `SELLER`, `ADMIN`, `COURIER`).
- **Refresh Token Rotation:** Handled in the Auth Service using secure HttpOnly cookies.

---

## 5. Error Handling & Logging Strategy
- **Standardized Errors:** The `@nexacommerce/common` package provides wrapper classes (e.g., `BadRequestError`, `UnauthorizedError`) mapping to HTTP status codes.
- **Centralized Logger:** `@nexacommerce/logger` wraps Winston, outputting structured JSON logs to stdout in production, and colorized formatting in development.
