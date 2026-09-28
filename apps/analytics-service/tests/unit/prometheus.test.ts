import { renderAnalyticsPrometheusMetrics } from '../../src/metrics/prometheus';

describe('Analytics Prometheus exporter', () => {
  it('renders counters, timestamps, lag labels, and active read-model state', () => {
    const output = renderAnalyticsPrometheusMetrics(
      {
        connected: true,
        messagesProjected: 12,
        duplicatesSkipped: 2,
        rejected: 1,
        failures: 3,
        lastEventAt: '2026-09-26T00:00:00.000Z',
        lastErrorAt: '2026-09-26T00:01:00.000Z',
      },
      {
        'nexacommerce.orders.v1/2': 7,
        'topic"with-quote/0': 1,
      },
      { readModel: 'KAFKA', rabbitMqConsumerEnabled: false },
    );

    expect(output).toContain('nexacommerce_analytics_kafka_projection_connected 1');
    expect(output).toContain('nexacommerce_analytics_kafka_messages_projected_total 12');
    expect(output).toContain('nexacommerce_analytics_kafka_failures_total 3');
    expect(output).toContain(
      'nexacommerce_analytics_kafka_consumer_lag{topic="nexacommerce.orders.v1",partition="2"} 7',
    );
    expect(output).toContain('topic="topic\\"with-quote"');
    expect(output).toContain('nexacommerce_analytics_daily_read_model_info{model="KAFKA"} 1');
    expect(output).toContain('nexacommerce_analytics_rabbitmq_consumer_enabled 0');
    expect(output.endsWith('\n')).toBe(true);
  });

  it('uses zero for timestamps that have not been observed', () => {
    const output = renderAnalyticsPrometheusMetrics(
      {
        connected: false,
        messagesProjected: 0,
        duplicatesSkipped: 0,
        rejected: 0,
        failures: 0,
        lastEventAt: null,
        lastErrorAt: null,
      },
      {},
      { readModel: 'RABBITMQ', rabbitMqConsumerEnabled: true },
    );

    expect(output).toContain('nexacommerce_analytics_kafka_last_event_timestamp_seconds 0');
    expect(output).toContain('nexacommerce_analytics_kafka_last_error_timestamp_seconds 0');
  });
});
