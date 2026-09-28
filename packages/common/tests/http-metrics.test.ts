import {
  normalizeHttpRoute,
  recordHttpRequest,
  renderHttpPrometheusMetrics,
  resetHttpMetrics,
} from '../src/http-metrics';

describe('HTTP RED metrics', () => {
  beforeEach(resetHttpMetrics);

  it('bounds identifier labels instead of exporting raw customer IDs', () => {
    expect(normalizeHttpRoute('/api/v1/orders/123')).toBe('/api/v1/orders/:id');
    expect(normalizeHttpRoute('/orders/550e8400-e29b-41d4-a716-446655440000')).toBe('/orders/:id');
  });

  it('renders request counters and cumulative duration buckets', () => {
    recordHttpRequest({
      service: 'api-gateway',
      method: 'get',
      route: '/api/v1/orders/550e8400-e29b-41d4-a716-446655440000',
      status: 200,
      durationSeconds: 0.08,
    });

    const output = renderHttpPrometheusMetrics();

    expect(output).toContain(
      'nexacommerce_http_requests_total{service="api-gateway",method="GET",route="/api/v1/orders/:id",status="200"} 1',
    );
    expect(output).toContain('le="0.05"} 0');
    expect(output).toContain('le="0.1"} 1');
    expect(output).toContain('le="+Inf"} 1');
    expect(output).toContain('nexacommerce_http_request_duration_seconds_count');
  });
});
