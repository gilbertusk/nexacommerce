# NexaCommerce Architecture

This document describes the architectural layout of NexaCommerce.

## Monorepo Microservices Layout
NexaCommerce relies on Express.js with TypeScript endpoints organized via npm workspaces.

### Database Design
- Shared PostgreSQL instance with individual microservice schemas/tables.
- Redis handles caching and transient sessions.
- RabbitMQ brokers asynchronous message communication.
