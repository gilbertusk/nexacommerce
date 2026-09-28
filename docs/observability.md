# Observability

Vendor-neutral. Nothing here depends on a particular APM or log vendor, because no production
target has been chosen; the contracts below hold whichever one is picked.

## Correlation

Every inbound HTTP request carries a correlation id, in the `x-request-id` header.

- If the caller supplies one, it is reused so a trace spans services. If it is missing or malformed
  it is replaced, because the value ends up in logs and an attacker-supplied newline can forge log
  entries.
- Accepted form: `[A-Za-z0-9._-]{8,128}`. Anything else is discarded and a UUID generated.
- The id is echoed on the response, so a customer or support agent can quote it.
- It propagates to internal service calls through `buildInternalServiceHeaders()`, so one customer
  action is traceable across every hop it causes.

Implementation: `packages/common/src/request-context.ts`. The id travels through
`AsyncLocalStorage`, not through function signatures — threading it manually would mean editing
every call site in the codebase for a value almost none of them use, and any missed call site would
silently break the trace.

Broker consumers have no HTTP request, so they establish a context explicitly with
`runWithRequestId(...)`, keyed on the event id. A projection failure can therefore be traced back to
the exact event that caused it.

## Logging

`@nexacommerce/logger` emits structured JSON to stdout in production. Every line carries the
correlation id when one is in scope.

What must never be logged:

- Passwords, tokens, refresh tokens, verification or reset links, session cookies.
- Full payment instrument data, Midtrans server keys, webhook signatures.
- Customer email addresses in analytics or debug paths. Notification Service needs a recipient to
  send mail; nothing else needs it in a log line.

Existing precedent to follow: `email_logs.templateData` redacts any key matching `/token|url/i`
before persisting, and public review attribution stores a neutral label rather than the customer's
email.

Log levels:

| Level | Use |
|---|---|
| `error` | A request or event failed in a way that needs someone to look |
| `warn` | Degraded but handled — a retry scheduled, an unsupported schema rejected |
| `info` | Lifecycle: startup, shutdown, consumer connected, event consumed |
| `debug` | Off in production |

## Metrics

Already exposed:

- `GET /metrics` on all 14 HTTP processes (API Gateway plus 13 backend services) — shared HTTP RED
  metrics: completed request count by bounded route and status, duration histogram, and in-flight
  requests. API Gateway mounts it before Redis-backed public rate limiting so monitoring remains
  reachable during a Redis incident.
- Analytics Service additionally exports Prometheus projection connectivity,
  projected/duplicate/rejected/failure counters, last event/error timestamps, per-partition lag,
  active daily read model, and legacy RabbitMQ-consumer state. The endpoint requires the internal
  scraper identity (`x-internal-service: prometheus` plus the shared internal token) on every
  service; none of these endpoints is a public diagnostics route.
- `GET /analytics/readiness` — Kafka projection connected state, messages projected, duplicates
  skipped, rejected, failures, last event time, and **per-partition consumer lag**.
- `GET /ready` on Event Stream Service — RabbitMQ and Kafka dependency readiness, separate from
  liveness.
- Phase 3 reliability metrics, appended to `GET /metrics` on every messaging service
  (2026-09-28): consumer settlement outcomes per queue, inbox outcomes per consumer, outbox
  publish/reschedule counts, outbox and email-queue backlog by state with the oldest pending
  age (read from PostgreSQL on each scrape, so every replica reports the same durable backlog),
  and RabbitMQ/Redis/Kafka readiness per replica. API Gateway also exports
  `nexacommerce_rate_limit_store_errors_total`. Metric names and meanings are listed in
  `docs/phase-3-reliability.md`.

What a production deployment still needs, per service:

| Metric | Why it matters |
|---|---|
| HTTP request rate, error rate, duration histogram | The baseline signal for every service |
| Outbox pending count and oldest pending age | Exported (Phase 3). Still needs an alert rule: a growing backlog means events are not reaching the broker |
| Inbox failure count by consumer | Exported (Phase 3). Repeated failures mean poison messages heading for the DLQ |
| Email queue depth, oldest PENDING age, FAILED count | Exported (Phase 3). A FAILED row is a message the system promised and never sent |
| DLQ depth per queue | Read from RabbitMQ (`<queue>.dead`) by a broker exporter; not yet scraped |
| Consumer lag per partition and per group | The single best indicator that a projection is falling behind |
| Rejected-message count (unsupported schema, malformed) | A deployment problem, not an outage |
| Shipping quote refusals by reason | `SELLER_ORIGIN_UNVERIFIED` spiking means checkout is closed for real customers |
| Database pool utilisation and query duration | The usual first bottleneck |

## Readiness versus liveness

They are different questions and must stay different endpoints.

- **Liveness** (`/health`): is the process running? It must not check dependencies. A database
  outage that fails liveness gets every replica restarted, turning a recoverable incident into an
  outage.
- **Readiness** (`/ready`, `/analytics/readiness`): should this instance receive traffic? This does
  check dependencies.

## Alerting

Prometheus-compatible starter rules now live in
`infra/observability/analytics-alerts.yml`. They cover an absent exporter, a disconnected
projection, new projection failures, sustained partition lag above 100 records, rejected messages,
per-service 5xx rate, and per-service p95 latency. Message rejection and latency are warning
severity; failures, disconnection, missing metrics, sustained lag, and elevated 5xx rate are
critical. Thresholds are initial operational defaults and must be tuned against real traffic.

Should page:

- Error rate above baseline for a sustained window.
- Readiness failing across more than one instance.
- Outbox oldest-pending age beyond a few minutes — events are silently not being published.
- Consumer lag growing monotonically.
- Any offline Kafka partition, or ISR below `min.insync.replicas`.
- Email FAILED count increasing — customers are not receiving order confirmations.

Should be visible but not page:

- Projection rejected-message counter. A deployment shipped an envelope this consumer does not
  understand; urgent to fix, but the partition is still moving.
- Shipping quote refusal rate by reason. A rise in `NO_RATE_AVAILABLE` means the rate table has a
  gap; a rise in `SELLER_ORIGIN_UNVERIFIED` means sellers are waiting on admin verification.
- Backup age from `scripts/backup-restore-drill.sh`.

## Not yet done

- All HTTP services expose HTTP RED metrics; Analytics additionally exports Kafka state.
  Outbox/inbox/email queue metrics and database pool metrics remain open.
- No Prometheus-compatible collector or Alertmanager is deployed, and the starter rule file has not
  been loaded into a running monitoring system. A YAML parse is not alert-delivery proof.
- No distributed tracing. Correlation ids make a trace reconstructable from logs; they are not spans.
- No log aggregation, retention, or access control, which are deployment-environment decisions.
