import { config } from '../config';
import {
  kafkaProjectionLag,
  kafkaProjectionMetrics,
} from '../messaging/kafka-consumer';

interface ProjectionMetricSnapshot {
  connected: boolean;
  messagesProjected: number;
  duplicatesSkipped: number;
  rejected: number;
  failures: number;
  lastEventAt: string | null;
  lastErrorAt: string | null;
}

function escapeLabel(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

function timestampSeconds(value: string | null): number {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp / 1000;
}

function metric(lines: string[], help: string, type: 'counter' | 'gauge', name: string, value: number) {
  lines.push(`# HELP ${name} ${help}`);
  lines.push(`# TYPE ${name} ${type}`);
  lines.push(`${name} ${value}`);
}

/** Render the in-process Kafka projection state using Prometheus text format. */
export function renderAnalyticsPrometheusMetrics(
  snapshot: ProjectionMetricSnapshot = kafkaProjectionMetrics(),
  lag: Record<string, number> = kafkaProjectionLag(),
  runtime: { readModel: string; rabbitMqConsumerEnabled: boolean } = {
    readModel: config.dailyReadModel,
    rabbitMqConsumerEnabled: config.rabbitMqConsumerEnabled,
  },
): string {
  const lines: string[] = [];

  metric(
    lines,
    'Whether the Analytics Kafka projection consumer is connected.',
    'gauge',
    'nexacommerce_analytics_kafka_projection_connected',
    snapshot.connected ? 1 : 0,
  );
  metric(
    lines,
    'Kafka business facts successfully applied by this process.',
    'counter',
    'nexacommerce_analytics_kafka_messages_projected_total',
    snapshot.messagesProjected,
  );
  metric(
    lines,
    'Duplicate Kafka facts skipped by the projection inbox.',
    'counter',
    'nexacommerce_analytics_kafka_duplicates_skipped_total',
    snapshot.duplicatesSkipped,
  );
  metric(
    lines,
    'Permanently malformed or unsupported Kafka facts stepped over.',
    'counter',
    'nexacommerce_analytics_kafka_rejected_total',
    snapshot.rejected,
  );
  metric(
    lines,
    'Transient Kafka projection failures that did not advance the offset.',
    'counter',
    'nexacommerce_analytics_kafka_failures_total',
    snapshot.failures,
  );
  metric(
    lines,
    'Unix timestamp of the last valid Kafka fact observed.',
    'gauge',
    'nexacommerce_analytics_kafka_last_event_timestamp_seconds',
    timestampSeconds(snapshot.lastEventAt),
  );
  metric(
    lines,
    'Unix timestamp of the last Kafka projection failure or rejection.',
    'gauge',
    'nexacommerce_analytics_kafka_last_error_timestamp_seconds',
    timestampSeconds(snapshot.lastErrorAt),
  );

  lines.push('# HELP nexacommerce_analytics_kafka_consumer_lag Records not yet consumed by topic partition.');
  lines.push('# TYPE nexacommerce_analytics_kafka_consumer_lag gauge');
  for (const [key, value] of Object.entries(lag).sort(([a], [b]) => a.localeCompare(b))) {
    const separator = key.lastIndexOf('/');
    const topic = separator >= 0 ? key.slice(0, separator) : key;
    const partition = separator >= 0 ? key.slice(separator + 1) : 'unknown';
    lines.push(
      `nexacommerce_analytics_kafka_consumer_lag{topic="${escapeLabel(topic)}",partition="${escapeLabel(partition)}"} ${value}`,
    );
  }

  lines.push('# HELP nexacommerce_analytics_daily_read_model_info Active daily read model.');
  lines.push('# TYPE nexacommerce_analytics_daily_read_model_info gauge');
  lines.push(
    `nexacommerce_analytics_daily_read_model_info{model="${escapeLabel(runtime.readModel)}"} 1`,
  );
  metric(
    lines,
    'Whether the legacy RabbitMQ Analytics consumer is enabled.',
    'gauge',
    'nexacommerce_analytics_rabbitmq_consumer_enabled',
    runtime.rabbitMqConsumerEnabled ? 1 : 0,
  );

  return `${lines.join('\n')}\n`;
}
