import request from 'supertest';
import app from '../../src/app';
import { setKafkaReady, setRabbitReady } from '../../src/health';

describe('event stream service health', () => {
  afterEach(() => {
    setKafkaReady(false);
    setRabbitReady(false);
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
});
