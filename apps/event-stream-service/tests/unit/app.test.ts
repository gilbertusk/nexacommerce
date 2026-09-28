import request from 'supertest';
import app from '../../src/app';
import { setKafkaReady, setRabbitReady } from '../../src/health';
import { resetHttpMetrics } from '@nexacommerce/common';

describe('event stream service health', () => {
  afterEach(() => {
    setKafkaReady(false);
    setRabbitReady(false);
    resetHttpMetrics();
  });

  it('keeps liveness separate from dependency readiness', async () => {
    await request(app).get('/health').expect(200);
    await request(app).get('/ready').expect(503);

    setKafkaReady(true);
    setRabbitReady(true);
    const ready = await request(app).get('/ready').expect(200);
    expect(ready.body.dependencies).toEqual({ kafka: true, rabbitmq: true });
  });

  it('exposes the versioned topic catalog', async () => {
    const response = await request(app).get('/stream/catalog').expect(200);
    expect(response.body.schemaVersion).toBe(1);
    expect(response.body.topics.orders.suffix).toBe('orders.v1');
  });

  it('keeps Prometheus metrics private and exports bounded HTTP RED labels', async () => {
    await request(app).get('/health').expect(200);
    await request(app).get('/metrics').expect(403);

    const response = await request(app)
      .get('/metrics')
      .set('x-internal-service', 'prometheus')
      .set('x-internal-token', process.env.INTERNAL_SERVICE_TOKEN || 'development-only-internal-token')
      .expect(200)
      .expect('Content-Type', /text\/plain/);

    expect(response.text).toContain(
      'nexacommerce_http_requests_total{service="event-stream-service",method="GET",route="/health",status="200"} 1',
    );
    expect(response.text).toContain(
      'nexacommerce_http_requests_total{service="event-stream-service",method="GET",route="/metrics",status="403"} 1',
    );
  });
});
