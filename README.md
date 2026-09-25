# NexaCommerce — Enterprise E-Commerce Microservices Engine

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js%2020-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis%207-red.svg)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/Message%20Broker-RabbitMQ%203-orange.svg)](https://www.rabbitmq.com/)
[![Kafka](https://img.shields.io/badge/Event%20Stream-Apache%20Kafka%204.3.1-black.svg)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-blue.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

NexaCommerce is an enterprise e-commerce microservices platform under active production hardening. It demonstrates domain separation, secure API routing, distributed caching, RabbitMQ workflow messaging, Kafka business-fact streaming, resilient SAGA checkouts, payment gateway integrations, and automated Docker/CI pipelines. Local quality gates are documented separately from live broker, provider, and deployment acceptance.

The platform is designed to scale horizontally, ensuring transactional consistency and strict isolation of database schemas per microservice while facilitating rich asynchronous side-effects such as email alerts, low-stock warnings, analytics ingestion, and real-time review aggregations.

---

## Table of Contents

- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Microservice Map](#microservice-map)
- [Tech Stack](#tech-stack)
- [Event-Driven Communication Flow](#event-driven-communication-flow)
- [Checkout Orchestration Steps](#checkout-orchestration-steps)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run Infrastructure](#run-infrastructure)
  - [Database Migrations](#database-migrations)
  - [Populate Demo Data](#populate-demo-data)
  - [Running the Services](#running-the-services)
- [Demo Accounts](#demo-accounts)
- [Running Tests](#running-tests)
- [Environment Variables Matrix](#environment-variables-matrix)
- [Project Directory Structure](#project-directory-structure)
- [Shared Packages Breakdown](#shared-packages-breakdown)
- [Database Schema Namespaces](#database-schema-namespaces)
- [Platform Standard Error Codes Matrix](#platform-standard-error-codes-matrix)
- [RabbitMQ Topology Details](#rabbitmq-topology-details)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)
- [License](#license)
- [Author](#author)

---

## Key Features

### 🌐 Architecture & Infrastructure
- **API Gateway Pattern:** Single entry point for clients providing reverse proxy routing, rate limiting, access control validation, and Swagger documentation aggregation.
- **Monorepo Structure:** Structured via npm workspaces with isolated dependency chains and shared custom library packages.
- **Service Isolation:** Clean architectural separation of 14 backend applications communicating synchronously via REST HTTP, operationally via RabbitMQ, and analytically through a RabbitMQ-to-Kafka bridge.
- **Isolated Database Schemas:** Logical isolation using postgres schema namespaces to enforce data decoupling per domain.

### 🔐 Security & Access Control
- **JSON Web Tokens (JWT):** Short-lived access tokens passed in HTTP headers coupled with secure, HttpOnly, SameSite refresh tokens in rotation.
- **Role-Based Access Control (RBAC):** Strict endpoint access protection verifying roles: `CUSTOMER`, `SELLER`, `ADMIN`, `COURIER`.
- **Login Audit Trails:** Full database history logging for IP tracking and user-agent audits.

### 🛍️ E-Commerce Engine
- **Product Catalog & Management:** Deep advanced product query system supporting multi-tier filtering, rating syncs, seller moderation, and category/brand mappings.
- **Redis Shopping Carts:** Low-latency cart operations stored in Redis, validated against real-time product price and stock availability constraints.
- **SAGA Checkout Orchestration:** Distributed transaction pattern orchestrating cart collections, stock check, address validation, shipping fees, voucher application, and payment gateway snap token requests.
- **Resilient Inventory Manager:** Race-condition-free stock reservations (Reserve-Confirm-Release) featuring pessimistic transaction locks and automatic expired reservation cleanups.
- **Voucher engine:** Multi-scope vouchers (Platform-wide, Seller-specific, Category-specific) enforcing total purchases and usage limits.
- **Shipping Tracker:** Standard shipping cost calculations mapped across city matrices, shipping order creation, and trackable status updates (`WAITING_PICKUP` to `DELIVERED`).

### 💳 Payments & Webhooks
- **Midtrans QRIS Sandbox:** Full integration with Midtrans Snap API for sandboxed payments.
- **Secure Webhook Verification:** SHA-512 signature validation preventing webhook spoofing attacks.
- **Idempotency Guard:** Prevents duplicate transaction status updates.
- **Refund Orchestration:** Integrated refund request handling and logging.

### 📊 Operations & Analytics
- **Review System:** Eligibility checks, average rating aggregations, spam reporting, and admin-led review moderations.
- **Notification Engine:** Winston-backed structured logging, in-app notifications, and custom compiler template HTML/Text email dispatches via Nodemailer.
- **Analytics Dashboard:** Background data aggregators compiling daily/monthly reports, top products, category performances, and seller metrics.

---

## System Architecture

The client interacts solely with the API Gateway. The API Gateway verifies the JWT, injects user metadata headers, and forwards requests to the appropriate downstream service. Domain services commit business events to transactional outboxes; dispatchers publish them once to RabbitMQ for operational workflows. A dedicated Event Stream Service forwards the durable business-fact copy to Kafka for replayable projections without making Kafka part of the checkout path.

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
                └─────────────┘   └─────────────┘  └──────┬──────┘
                                                          │ durable fact queue
                                                   ┌──────▼─────────────┐
                                                   │ Event Stream Bridge │
                                                   └──────┬─────────────┘
                                                          │ keyed records
                                                   ┌──────▼──────┐
                                                   │ Kafka 4.3.1 │
                                                   └─────────────┘
```

---

## Microservice Map

| Service | Port | Base Path | Database Schema | Primary Responsibility |
|---|---|---|---|---|
| **API Gateway** | 3000 | `/` | *None* | Request routing, JWT validation, Swagger aggregation |
| **Auth Service** | 3001 | `/api/v1/auth` | `auth` | User register, login, token rotation, RBAC, password resets |
| **User Service** | 3002 | `/api/v1/users` | `users` | Profile databases, seller registers, shipping address books |
| **Product Service** | 3003 | `/api/v1/products` | `products` | Product listings, filter/sort queries, brand & category maps |
| **Cart Service** | 3004 | `/api/v1/cart` | *Redis* | Redis cart management, product stock/price checks |
| **Order Service** | 3005 | `/api/v1/orders` | `orders` | Checkout SAGA coordinator, order listings, completed crons |
| **Payment Service** | 3006 | `/api/v1/payments` | `payments` | Midtrans Snap token generation, webhook handler, refunds |
| **Inventory Service** | 3007 | `/api/v1/inventory` | `inventory` | Stock level writes, reserves, auto-expire stock cleanups |
| **Voucher Service** | 3008 | `/api/v1/vouchers` | `vouchers` | Voucher validation, purchase logic limits, scopes |
| **Shipping Service** | 3009 | `/api/v1/shipping` | `shipping` | Shipping rates database, tracking status registers |
| **Review Service** | 3010 | `/api/v1/reviews` | `reviews` | Customer ratings, average updates, admin moderations |
| **Notification Service** | 3011| `/api/v1/notifications`| `notifications`| In-app notification logs, template HTML email dispatches |
| **Analytics Service** | 3012| `/api/v1/analytics`| `analytics` | Performance aggregation tables, dashboards metrics |
| **Event Stream Service** | 3013 | `/health`, `/ready`, `/stream/catalog` | *None* | Confirmed RabbitMQ-to-Kafka business-fact bridge and topic provisioning |

---

## Tech Stack

- **Languages:** TypeScript, Node.js (v20 LTS), SQL
- **Framework:** Express.js, npm Workspaces
- **Databases & Cache:** PostgreSQL 16, Redis 7 (appendonly)
- **Messaging:** RabbitMQ 3.13 for operational workflows; Apache Kafka 4.3.1 for retained, replayable business facts
- **ORM:** Prisma v5 (schema-per-service isolation)
- **Testing:** Jest, Supertest
- **Containerization:** Docker, Docker Compose
- **Integrations:** Midtrans Core/Snap SDK, Nodemailer

---

## Event-Driven Communication Flow

NexaCommerce uses RabbitMQ for asynchronous operational decoupling. Domain services commit events through transactional outboxes and dispatch them to `nexacommerce.events`. Interested services execute localized handlers, while the durable Event Stream queue is forwarded to a keyed Kafka topic only after RabbitMQ delivery. Domain services do not independently publish the same event to both brokers.

```
[Payment Success Event] (payment.success)
       │
       ├───> [Order Service] ───> Updates order status to PAID, publishes (order.paid)
       │                                                                   │
       │                                                                   ├───> [Shipping Service] ───>WAITS PICKUP
       │                                                                   └───> [Notif Service] ───> Email Paid Alert
       ├───> [Inventory Service] ───> Confirms stock (RESERVED -> CONFIRMED)
       ├───> [Analytics Service] ───> Increments sales report matrices
       └───> [Notification Service] ───> Logs in-app notification & dispatches receipt email

[RabbitMQ durable business-fact copy] ───> [Event Stream Service] ───> [Kafka topic by domain]
```

See [Phase 4 Kafka Streaming](docs/phase-4-kafka-streaming.md) for topic ownership, partition keys, retention, schemas, consumer groups, and replay rules.

---

## Checkout Orchestration Steps

The Order Service coordinates checkout as follows:
1. Fetch cart items from **Cart Service**.
2. Retrieve product pricing and verify details from **Product Service**.
3. Verify address details from **User Service**.
4. Retrieve shipping cost from **Shipping Service**.
5. Calculate discounts and validate scope from **Voucher Service**.
6. Check stock availability from **Inventory Service**.
7. Create local Order records under database transaction.
8. Reserve stock inside **Inventory Service** (pessimistic lock).
9. Lock voucher usage inside **Voucher Service**.
10. Retrieve payment token from **Payment Service** (Midtrans API).
11. Clear active cart in **Cart Service** and publish `OrderCreated`.

If any step fails, the orchestrator triggers compensating transactions to release stock and unlock the voucher.

---

## Database Design

PostgreSQL partitions tables using schemas. For full diagrams, field lists, keys, and foreign relationship matrices, see [Database ERD Documentation](docs/erd.md).

---

## API Documentation

Interactive OpenAPI/Swagger documentation aggregates at the gateway level. For base paths, request payloads, and status codes, see [API Documentation Reference](docs/api-documentation.md).
Access Swagger UI at `http://localhost:3000/api/docs`.

---

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- Docker & Docker Compose
- npm (v9 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nexacommerce.git
   cd nexacommerce
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

### Run Infrastructure
Boot PostgreSQL, Redis, and RabbitMQ dependencies locally:
```bash
npm run docker:dev
```

### Database Migrations
Apply schemas and build clients for all 11 database services:
```bash
# Windows
powershell .\scripts\migrate-all.ps1

# Linux / macOS
bash ./scripts/migrate-all.sh
```

### Populate Demo Data
Populate the database schemas with realistic local Indonesian testing data:
```bash
npm run seed
```
To clean database tables completely and reload seed data:
```bash
npm run seed:reset
```

### Running the Services

#### Development Mode
Run all configured backend and frontend development processes concurrently in hot-reload mode:
```bash
npm run dev:all
```
Or run a specific microservice (e.g., API Gateway or Auth Service):
```bash
npm run dev:gateway
npm run dev:auth
```

#### Production Mode (Docker Containerized)
Build and spin up the entire cluster within production Docker environments:
```bash
npm run docker:prod
```
To stop the production cluster:
```bash
npm run docker:down
```

---

## Demo Accounts

The following seeded developer accounts are available:

| Role | Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `superadmin@nexacommerce.com` | `SuperAdmin123!` | Global administrative rights |
| **Admin** | `admin@nexacommerce.com` | `Admin123!` | Moderate catalog, reviews, view logs |
| **Seller 1** | `seller1@nexacommerce.com` | `Seller123!` | Toko Elektronik Jakarta owner |
| **Seller 2** | `seller2@nexacommerce.com` | `Seller123!` | Fashion Bandung Store owner |
| **Customer 1**| `customer1@nexacommerce.com` | `Customer123!` | Jakarta South address book |
| **Customer 2**| `customer2@nexacommerce.com` | `Customer123!` | Bandung address book |
| **Courier** | `courier@nexacommerce.com` | `Courier123!` | Simulated package picker/courier |

---

## Running Tests

### Execute All Tests
```bash
npm test
```

### Run Unit or Integration Tests Only
```bash
npm run test:unit
npm run test:integration
```

### Check Coverage
```bash
npm run test:coverage
```

---

## Environment Variables Matrix

See [.env.example](.env.example) for the full configuration template.

---

## Project Directory Structure

```
nexacommerce/
├── apps/                        # Microservice Applications
│   ├── analytics-service/       # Aggregate analytics & daily reports
│   ├── api-gateway/             # Request router & JWT access control
│   ├── auth-service/            # Register, log-ins, RBAC, refresh rotation
│   ├── cart-service/            # Redis carts manager
│   ├── event-stream-service/    # RabbitMQ-to-Kafka business-fact bridge
│   ├── inventory-service/       # Stock levels & auto-expiring reserves
│   ├── notification-service/    # Bell logs & Nodemailer email alerts
│   ├── order-service/           # Checkout saga coordinator
│   ├── payment-service/         # Midtrans payment hooks & refunds
│   ├── product-service/         # Catalog search, sort & filters
│   ├── review-service/          # Ratings review, reporting, aggregates
│   ├── shipping-service/        # Courier rates & package histories
│   ├── user-service/            # Customer profiles, seller profiles & address books
│   └── voucher-service/         # Platform vouchers scopes & rules
├── packages/                    # Shared workspace library packages
│   ├── common/                  # Global exceptions, middlewares & interfaces
│   ├── config/                  # Zod schema parser env configs
│   ├── event-contracts/         # Rabbitmq exchanges, bindings & types
│   ├── logger/                  # Winston logger configuration
│   ├── test-utils/              # Database transactional rollback cleaners
│   ├── types/                   # Unified microservice types definitions
│   └── validation/              # Zod payload request validators
├── docs/                        # Technical Architecture documents
│   ├── erd.md                   # Database entity relation diagrams
│   ├── architecture.md          # Architectural decisions & patterns
│   ├── api-documentation.md     # Gateway base paths & endpoint inputs
│   ├── event-flow.md            # Rabbitmq topic exchange event binds
│   ├── checkout-flow.md         # SAGA checkout order processes
│   ├── payment-webhook-flow.md  # Webhook signature checks & status cascades
│   ├── stock-reservation-flow.md# Stock lifecycle reserve-confirm states
│   ├── deployment.md            # Production deployment manuals
│   └── testing.md               # Testing paradigms & mock brokers
├── infra/                       # Database initialization scripts
│   └── postgres/
│       └── init.sql             # SQL initializer schema tables
├── scripts/                     # Seeding, resets, & database migrators
├── docker-compose.yml           # Multi-profile docker orchestration
└── package.json                 # Monorepo workspaces coordinator
```

---

## Shared Packages Breakdown

NexaCommerce utilizes shared packages to promote DRY code and ensure type safety across workspaces:

- **`@nexacommerce/common`**: Shared HTTP exceptions, internal verification middlewares, error handler hooks, and generic response wrappers.
- **`@nexacommerce/types`**: Consolidated TypeScript interfaces for entities, payloads, and internal routing payloads.
- **`@nexacommerce/config`**: Configuration validation library using Zod to parse and secure environment variables at startup.
- **`@nexacommerce/logger`**: Custom structured JSON logger library powered by Winston.
- **`@nexacommerce/validation`**: Request body schemas and validators using Zod.
- **`@nexacommerce/event-contracts`**: Domain event types plus RabbitMQ topology, queue bindings, and routing-key contracts.
- **`@nexacommerce/test-utils`**: Deep transaction cleaning utilities and mock instances for testing databases.

---

## Database Schema Namespaces

Logical separation of data domains is strictly maintained across 11 namespaces within the `nexacommerce_db` instance:

1. **`auth`**: Manages credentials, password reset hashes, session refresh tokens, and login history logs.
2. **`users`**: Customer data, Seller shop descriptions, and address books.
3. **`products`**: Brands, Categories, Catalog products details, and image URLs.
4. **`inventory`**: Available stock, reserved queues, threshold warnings, and logs of stock movements.
5. **`orders`**: Transaction amounts, delivery destinations, cart contents, and state transition histories.
6. **`payments`**: Payment gateway reference numbers, gross amounts, snapshot tokens, and refunds logs.
7. **`vouchers`**: Voucher identifiers, values, scope definitions, and user limits usage counts.
8. **`shipping`**: Available courier tables, shipping cost rules, tracking IDs, and courier location logs.
9. **`reviews`**: Product score rankings, comments, image attachments, report flags, and average statistics.
10. **`notifications`**: User alert entries and Nodemailer email dispatch history tracking.
11. **`analytics`**: Business metrics, daily/monthly summaries, category scores, and performance stats.

---

## Platform Standard Error Codes Matrix

NexaCommerce implements a consistent, typed global exception handler across all microservices. When a request encounters an error, the platform returns a standard JSON payload format containing descriptive context and clean HTTP status codes:

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message details",
    "code": "BAD_REQUEST",
    "statusCode": 400,
    "details": []
  }
}
```

| HTTP Status | Internal Code | Scenario Trigger | Typical Resolution |
|---|---|---|---|
| **400** | `BAD_REQUEST` | Missing request parameter, invalid JSON body, Zod schema validation mismatch, or stock checkout checks fail. | Verify validation constraints and parameter types in the payload schema. |
| **401** | `UNAUTHORIZED` | Expired access token, invalid signature, or missing `Authorization: Bearer <JWT>` header in gateway. | Re-authenticate by calling the `/login` or `/refresh-token` endpoint. |
| **403** | `FORBIDDEN` | Role mismatch during route authorization evaluation (e.g. customer attempts admin or seller route). | Check user account roles and permissions setup. |
| **404** | `NOT_FOUND` | Database record missing (e.g. invalid product ID, address ID, or order tracking number). | Ensure query lookup values exist and are correctly specified. |
| **409** | `CONFLICT` | Unique key violation (e.g., registering an already registered email, duplicate reviews on a purchase item). | Check constraints or perform updates instead of creations. |
| **422** | `UNPROCESSABLE_ENTITY` | Failed business logic rules (e.g. applying an expired voucher or order checkout with zero items). | Follow business conditions listed in the validation guides. |
| **500** | `INTERNAL_SERVER_ERROR` | Database connection timeout, network drop, unhandled exception inside controller. | Audit Winstron logs to find code errors and trace context stack traces. |

---

## RabbitMQ Topology Details

To prevent message loss and ensure asynchronous delivery guarantees, RabbitMQ exchanges, queues, and bindings are dynamically asserted at service boot:

- **Exchange Durability:** The `nexacommerce.events` topic exchange is declared with `durable: true`, ensuring exchange metadata survives message broker restarts.
- **Queue Durability:** Named queues (e.g., `notification-service.events`, `analytics-service.events`) are declared with `durable: true`.
- **Publisher Confirms:** Microservices publish messages with confirmation mode enabled, listening for broker ACKs before marking events as sent.
- **Consumer Acknowledgements:** Consumers use manual acknowledgements. Successful deliveries are acknowledged after the handler finishes; failures are copied to confirmed delayed-retry queues and then per-consumer dead-letter queues when the retry budget is exhausted. The original is requeued only if that safety copy cannot be confirmed.

---

## Troubleshooting & FAQ

### 1. RabbitMQ broker throws connection failure on service start
* **Symptom:** Services crash at boot with error `connect ECONNREFUSED 127.0.0.1:5672`.
* **Reason:** The RabbitMQ Docker container is still booting or initializing.
* **Solution:** Verify that the broker container is fully up (`docker ps`). In production profiles, `depends_on` conditions check health check scripts, but in local development, ensure you wait 10-15 seconds after booting Docker before launching services.

### 2. Prisma fails to find generated clients at build time
* **Symptom:** TypeScript compilation reports `Cannot find module '../generated/client'`.
* **Reason:** Database schemas have not been introspected or `npx prisma generate` was not run.
* **Solution:** Run database migrations locally using `npm run db:migrate` or run `npx prisma generate` inside the specific microservice folder to trigger client builds.

### 3. Webhook calls fail with 400 Bad Request
* **Symptom:** Payments status checks do not propagate, webhooks return invalid signature logs.
* **Reason:** The computed SHA-512 checksum does not match the header signature key.
* **Solution:** Verify that your `MIDTRANS_SERVER_KEY` environment variable matches your merchant credentials. In staging/sandbox environments, make sure the simulation server is using the sandbox server key.

### 4. Emails are not sent or Ethereal account fails to generate
* **Symptom:** Notification logs report Ethereal creation timeouts.
* **Reason:** Nodemailer fails to request an Ethereal credentials token over SMTP.
* **Solution:** Ensure your server host has outbound internet access. If you have custom SMTP access, fill in the credentials explicitly (`SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`) inside your `.env` to bypass the auto-generator.

---

## Screenshots

Screenshots will be added after the Next.js frontend client is completed.

---

## Deployment

Refer to [Production Deployment Manual](docs/deployment.md) for full instructions.

---

## Architecture Design Decisions

### 1. Saga Orchestration vs. Choreography
NexaCommerce utilizes the **Orchestrator-based Saga** pattern for order checkouts. The `order-service` acts as the orchestrator.
- **Why?** Checkouts involve complex state validation (e.g. verifying cart items, locking vouchers, reserving stock, charging payment). In choreography, services would need to know too much about each other's domain boundaries. An orchestrator centralizes checkout logic and keeps downstream services simple and focused.
- **Compensating Transactions:** If the Snap payment token generation fails or if a user inputs an invalid shipping address, the orchestrator dispatches compensating events to the topic exchange (`vouchers.unlock`, `inventory.release`) to restore system consistency.

### 2. Database Isolation: Logical Schema Namespaces
Instead of provisioning separate database instances for each service, NexaCommerce uses a single PostgreSQL instance segmented into logical schemas (`auth`, `users`, `products`, etc.).
- **Why?** A single DB instance minimizes memory footprint and operational costs on developer machines, while logical schemas preserve the primary microservice rule: **never execute cross-service SQL joins**. Services interact exclusively through APIs and RabbitMQ events.

### 3. Pessimistic Locking for Stock Reservation
During checkout, stock is locked using Prisma's `$queryRaw` with a `FOR UPDATE` clause in the database to prevent race conditions.
- **Why?** Standard optimistic locks can fail under high concurrency (e.g. flash sales). Pessimistic locking ensures only one transaction modifies the row at a time. If the order completes, the state transitions to `CONFIRMED`. If the order is cancelled, a cron task automatically releases the reserved stock back to the inventory.

---

## Observability & Telemetry

### Winston Logger Standard
Every microservice implements structured JSON logs written to both console and local log rotations. Logging levels are categorized as:
- `error`: Log trace stack on unhandled exceptions and query failures.
- `warn`: Deprecated calls, failed login attempts, or minor recovery logic.
- `info`: Server bootstraps, database connections, and event consumption notices.

### Healthcheck Configuration
Docker containers use health check scripts to detect deadlocks. The `api-gateway` and downstream microservices check the database connection and cache accessibility before declaring `/health` as valid `200 OK`.

---

## Future Roadmap

- **Frontend Client Web App:** Next.js application for customers, and dashboard dashboards for Sellers/Admins.
- **Elasticsearch Catalog Search:** Sync products index databases to Elasticsearch to support fuzzy matches and autocompletes.
- **WebSockets Live Notification:** Real-time bell triggers.
- **Kubernetes (K8s) Configurations:** Provisioning Helm charts, deployment structures, and horizontal pod autoscaling.
- **Distributed Tracing (OpenTelemetry):** Integrate Jaeger to trace requests end-to-end across Gateway, Auth, Order, and RabbitMQ event hops.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**NexaCommerce Authors** - [GitHub Repository](https://github.com/yourusername/nexacommerce)
