# Phase 4 — Kafka Event Streaming

Last updated: 2026-09-25
Status: In progress; local live bridge, topic catalog, schema envelope, replay, ordering, restart, and single-broker outage checks passed; a real database-backed projection and production cluster acceptance remain pending

## System boundary

| Component | Responsibility | Must not be used for |
|---|---|---|
| PostgreSQL | Authoritative commerce state and transactional outbox | Replay fan-out or ephemeral cache |
| RabbitMQ | Operational workflow delivery, retries, and commands/events that drive order/payment/inventory actions | Long-term analytics replay |
| Kafka | Retained, replayable business facts for analytics, audit, indexing, and future recommendations | Blocking checkout or other synchronous business decisions |
| Redis | Ephemeral cart, cache, session, rate-limit, and coordination state | Durable business facts |

Services do not publish independently to RabbitMQ and Kafka. A domain transaction writes one stable event to its outbox. The existing outbox dispatcher publishes it to RabbitMQ. RabbitMQ fans replayable facts into the durable `event-stream-service.business-facts` queue, and Event Stream Service acknowledges that delivery only after Kafka acknowledges the record.

This design is deliberately at-least-once across the RabbitMQ/Kafka boundary. A process crash after Kafka acknowledgement but before RabbitMQ acknowledgement can create a Kafka duplicate with the same `eventId`. Every Kafka projection must therefore persist an inbox claim keyed by `eventId` and apply the projection mutation atomically with that claim.

## Topic catalog

All topics carry immutable facts and use `cleanup.policy=delete`. Compaction is intentionally disabled: compacting facts by aggregate key would erase history needed for audit/replay. A future latest-state projection must use a separately named compacted topic such as `nexacommerce.product-state.v1`, never change a fact topic in place.

| Topic | Key | Partitions | Retention | Intended consumer groups |
|---|---|---:|---:|---|
| `nexacommerce.orders.v1` | `orderId` | 6 | 180 days | `analytics-projection-v1`, `audit-archive-v1`, `search-index-v1` |
| `nexacommerce.payments.v1` | `paymentId` | 6 | 365 days | `analytics-projection-v1`, `audit-archive-v1` |
| `nexacommerce.inventory.v1` | `orderId`; low-stock uses `productId` | 6 | 90 days | `analytics-projection-v1`, `recommendations-v1` |
| `nexacommerce.shipping.v1` | `orderId` | 6 | 180 days | `analytics-projection-v1`, `audit-archive-v1` |
| `nexacommerce.reviews.v1` | `productId` | 6 | 365 days | `analytics-projection-v1`, `search-index-v1`, `recommendations-v1` |

The key guarantees ordering only for records with the same key inside one topic/partition. It does not create a global order across topics.

## Schema contract

Kafka values use a JSON envelope:

```json
{
  "schemaVersion": 1,
  "eventId": "stable-source-event-id",
  "eventName": "OrderPaid",
  "occurredAt": "2026-09-25T00:00:00.000Z",
  "streamedAt": "2026-09-25T00:00:01.000Z",
  "partitionKey": "order-id",
  "payload": {}
}
```

Compatibility rules:

- Additive optional payload fields are allowed within version 1.
- Existing field meaning, type, and partition-key semantics cannot change in place.
- Breaking changes require a new topic suffix and schema version, for example `orders.v2`.
- Consumers must reject unsupported schema versions rather than silently interpreting them.
- `eventId`, `eventName`, and `schemaVersion` are repeated in Kafka headers for inspection; the JSON value remains authoritative.

## Replay and consumer rules

1. Pause the affected projection group and record its current offsets.
2. Prefer a new, explicitly named replay group (for example `analytics-rebuild-20260925`) to build a side-by-side projection.
3. Consume from the required earliest timestamp/offset with the same inbox deduplication rules used in normal processing.
4. Validate counts, aggregates, and lag before switching reads to the rebuilt projection.
5. Keep the original group/offset record until rollback is no longer required.

Resetting an existing production group in place requires an approved rollback window. Replays must never invoke RabbitMQ workflow commands or mutate authoritative order/payment/inventory state.

## Implemented locally

- `event-stream-service.business-facts` is a durable quorum queue bound to all 16 versioned business-event routing keys.
- Event Stream Service provisions five explicit topics; automatic topic creation is disabled.
- Kafka records use aggregate keys, schema envelope version 1, source timestamps, stable event IDs, and all-in-sync-replica acknowledgement.
- Producer settings enable KafkaJS idempotence and one in-flight request. This reduces producer-session duplicates but does not replace consumer inbox deduplication across bridge restarts.
- Liveness (`/health`) is separate from dependency readiness (`/ready`). The bridge reconnects without making Kafka part of a commerce workflow's availability path.
- A reusable inbox contract and `processIdempotently` helper cover claim, completion, duplicate skip, and failed-claim release behavior.
- The official Apache Kafka 4.3.1 JVM image is pinned in Compose in single-node KRaft mode for local validation.

## Validation record

| Check | Result | Limitation |
|---|---|---|
| Event Stream Service unit tests | Pass, 20/20 | Includes publish failure/readiness recovery and failed-connect cleanup; broker behavior is covered separately below |
| Event Stream Service typecheck/build | Pass | Compile only |
| Shared RabbitMQ reliability tests | Pass, 6/6 | Mock channel |
| Dependency audit after KafkaJS install | Pass, 0 vulnerabilities | Registry audit only |
| Compose config and container packaging | Pass | Single-node local topology; Event Stream and representative API Gateway images build and resolve every required internal package after a live startup failure exposed invalid wildcard copy paths |
| Kafka/RabbitMQ live bridge | Pass | RabbitMQ event reached Kafka with the same `eventId`, aggregate key, source timestamp, payload, and schema-v1 envelope |
| Topic provisioning | Pass | Five topics, 6 partitions each, replication factor 1, delete retention 90/180/365 days as catalogued |
| Replay from earliest | Pass | Fresh console consumer read the retained records from the beginning |
| Same-key ordering | Pass | Two sequential `OrderPaid` facts with one `orderId` were observed in source order |
| Duplicate delivery | Pass as at-least-once evidence | Publishing the same `eventId` twice produced two Kafka records; real projections must deduplicate atomically |
| Bridge restart/backlog recovery | Pass | Event remained ready in the durable RabbitMQ queue with zero consumers and was forwarded after bridge restart |
| Kafka outage/recovery | Pass | Delivery remained unacknowledged while Kafka was stopped and the queue drained only after Kafka recovered and accepted the record |
| RabbitMQ outage/recovery | Pass | `/ready` returned 503 during outage, then returned ready with one restored consumer after broker recovery |
| Container CI smoke test | Added | CI waits for bridge readiness, publishes a synthetic RabbitMQ fact, and asserts the matching Kafka record |
| Root typecheck/lint | Pass | 24 workspaces typecheck; lint has 0 errors and 6 pre-existing Google-font warnings |

## Remaining exit gates

- Implement at least one real Kafka projection with a database-backed atomic inbox; Analytics is the preferred first candidate.
- Run the database-backed Kafka projection through duplicate delivery, offset replay, consumer restart, and projection-write crash windows; bridge-level duplicate/order/replay/restart and local broker outage behavior are already proven above.
- Define production Kafka cluster size, replication factor, `min.insync.replicas`, storage sizing, monitoring, TLS/SASL, ACLs, backup/export, and disaster recovery.
- Decide retention/privacy deletion requirements with business/legal owners before public production.
- Replace the single-node plaintext Compose validation topology with the intended secured multi-node environment for production acceptance.

Phase 4 remains open. Kafka is not on the critical path for checkout, payment, stock, or shipping workflows.
