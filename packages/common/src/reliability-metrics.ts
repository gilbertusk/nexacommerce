/**
 * Process-local reliability signals for the Phase 3 messaging path.
 *
 * Counters cover what one replica observed (consumer outcomes, inbox
 * outcomes, outbox dispatch results). Gauges that describe durable state —
 * outbox backlog, email queue backlog — are read from the database on scrape
 * through registered providers, so every replica reports the same shared
 * backlog rather than a guess.
 *
 * Nothing here records payloads, URLs, or credentials; labels are bounded to
 * queue/consumer/service names and fixed outcome strings.
 */

export type ConsumerOutcome = 'ACKED' | 'RETRY_SCHEDULED' | 'DEAD_LETTERED' | 'REQUEUED';
export type InboxMetricOutcome = 'PROCESSED' | 'SKIPPED_DUPLICATE' | 'FAILED';
export type OutboxDispatchOutcome = 'PUBLISHED' | 'RESCHEDULED';

/** Durable-queue backlog, as read from a service's own table. */
export interface QueueBacklogStats {
  pending: number;
  processing: number;
  failed: number;
  /** Pending rows that already failed at least once and are backing off. */
  retrying: number;
  /** Age of the oldest row still waiting to be delivered, or 0 when empty. */
  oldestPendingAgeSeconds: number;
}

type BacklogProvider = () => Promise<QueueBacklogStats>;

const consumerOutcomes = new Map<string, number>();
const inboxOutcomes = new Map<string, number>();
const outboxDispatches = new Map<string, number>();
const dependencyReady = new Map<string, boolean>();
const backlogProviders = new Map<string, { kind: string; service: string; provider: BacklogProvider }>();

function escapeLabel(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function recordConsumerOutcome(queue: string, outcome: ConsumerOutcome): void {
  increment(consumerOutcomes, JSON.stringify([queue, outcome]));
}

export function recordInboxOutcome(consumer: string, outcome: InboxMetricOutcome): void {
  increment(inboxOutcomes, JSON.stringify([consumer, outcome]));
}

export function recordOutboxDispatch(service: string, outcome: OutboxDispatchOutcome): void {
  increment(outboxDispatches, JSON.stringify([service, outcome]));
}

/** Mark a broker/storage dependency as usable (1) or not (0) for this replica. */
export function setDependencyReady(dependency: string, ready: boolean): void {
  dependencyReady.set(dependency, ready);
}

export function isDependencyReady(dependency: string): boolean {
  return dependencyReady.get(dependency) === true;
}

/**
 * Register a durable backlog reader. `kind` is `outbox` or `email`, and the
 * reader is invoked on every scrape.
 */
export function registerBacklogProvider(kind: 'outbox' | 'email', service: string, provider: BacklogProvider): void {
  backlogProviders.set(`${kind}:${service}`, { kind, service, provider });
}

/**
 * SQL that summarizes an `outbox_events`-shaped table. All five producer
 * services share this column layout. Kept as a literal so it can be passed to
 * Prisma's `$queryRawUnsafe` without interpolation.
 */
export const OUTBOX_BACKLOG_SQL = `
  SELECT
    COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
    COUNT(*) FILTER (WHERE status = 'PROCESSING')::int AS processing,
    COUNT(*) FILTER (WHERE status = 'FAILED')::int AS failed,
    COUNT(*) FILTER (WHERE status = 'PENDING' AND attempts > 0)::int AS retrying,
    COALESCE(EXTRACT(EPOCH FROM (NOW() - MIN(created_at) FILTER (WHERE status IN ('PENDING', 'PROCESSING')))), 0)::float AS oldest_pending_age_seconds
  FROM outbox_events
`;

/** Normalize the single row returned by {@link OUTBOX_BACKLOG_SQL}-style queries. */
export function toBacklogStats(rows: Array<Record<string, unknown>>): QueueBacklogStats {
  const row = rows[0] ?? {};
  const num = (value: unknown) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  return {
    pending: num(row.pending),
    processing: num(row.processing),
    failed: num(row.failed),
    retrying: num(row.retrying),
    oldestPendingAgeSeconds: Math.max(0, num(row.oldest_pending_age_seconds)),
  };
}

function renderCounter(name: string, help: string, labelNames: string[], values: Map<string, number>): string[] {
  const lines = [`# HELP ${name} ${help}`, `# TYPE ${name} counter`];
  for (const [key, value] of values) {
    const labelValues = JSON.parse(key) as string[];
    const labels = labelNames.map((labelName, index) => `${labelName}="${escapeLabel(labelValues[index])}"`).join(',');
    lines.push(`${name}{${labels}} ${value}`);
  }
  return lines;
}

/**
 * Render reliability metrics in Prometheus text format. A failing backlog
 * provider is reported through `nexacommerce_backlog_scrape_success 0`
 * instead of failing the whole scrape.
 */
export async function renderReliabilityPrometheusMetrics(): Promise<string> {
  const lines: string[] = [
    ...renderCounter(
      'nexacommerce_consumer_messages_total',
      'RabbitMQ deliveries by queue and settlement outcome.',
      ['queue', 'outcome'],
      consumerOutcomes,
    ),
    ...renderCounter(
      'nexacommerce_inbox_events_total',
      'Inbox-guarded event processing by consumer and outcome.',
      ['consumer', 'outcome'],
      inboxOutcomes,
    ),
    ...renderCounter(
      'nexacommerce_outbox_dispatch_total',
      'Outbox rows published or rescheduled by this replica.',
      ['service', 'outcome'],
      outboxDispatches,
    ),
    '# HELP nexacommerce_dependency_ready Whether this replica currently holds a usable connection (1) or not (0).',
    '# TYPE nexacommerce_dependency_ready gauge',
  ];
  for (const [dependency, ready] of dependencyReady) {
    lines.push(`nexacommerce_dependency_ready{dependency="${escapeLabel(dependency)}"} ${ready ? 1 : 0}`);
  }

  const backlogLines = [
    '# HELP nexacommerce_backlog_rows Durable queue rows by state (outbox_events or email_logs).',
    '# TYPE nexacommerce_backlog_rows gauge',
  ];
  const ageLines = [
    '# HELP nexacommerce_backlog_oldest_pending_age_seconds Age of the oldest undelivered durable row.',
    '# TYPE nexacommerce_backlog_oldest_pending_age_seconds gauge',
  ];
  const scrapeLines = [
    '# HELP nexacommerce_backlog_scrape_success Whether the backlog query succeeded on this scrape.',
    '# TYPE nexacommerce_backlog_scrape_success gauge',
  ];
  for (const { kind, service, provider } of backlogProviders.values()) {
    const base = `kind="${escapeLabel(kind)}",service="${escapeLabel(service)}"`;
    try {
      const stats = await provider();
      for (const state of ['pending', 'processing', 'failed', 'retrying'] as const) {
        backlogLines.push(`nexacommerce_backlog_rows{${base},state="${state}"} ${stats[state]}`);
      }
      ageLines.push(`nexacommerce_backlog_oldest_pending_age_seconds{${base}} ${stats.oldestPendingAgeSeconds}`);
      scrapeLines.push(`nexacommerce_backlog_scrape_success{${base}} 1`);
    } catch {
      scrapeLines.push(`nexacommerce_backlog_scrape_success{${base}} 0`);
    }
  }

  return [...lines, ...backlogLines, ...ageLines, ...scrapeLines].join('\n') + '\n';
}

/** Test helper: clear all counters, readiness flags, and providers. */
export function resetReliabilityMetrics(): void {
  consumerOutcomes.clear();
  inboxOutcomes.clear();
  outboxDispatches.clear();
  dependencyReady.clear();
  backlogProviders.clear();
}
