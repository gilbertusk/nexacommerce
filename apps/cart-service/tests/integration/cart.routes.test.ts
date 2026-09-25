import request from 'supertest';
import app from '../../src/app';
import { redis } from '../../src/redis/client';

const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('Cart Routes (integration)', () => {
  // Importing the app opens a Redis connection. Closing it is what lets Jest
  // exit on its own instead of hanging or needing --forceExit.
  afterAll(async () => {
    await redis.quit();
  });

  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /cart/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/cart/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /cart', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).get('/cart');
      expect(res.status).toBe(401);
    });

    it('accepts customer request (Redis may not be available)', async () => {
      const res = await request(app).get('/cart').set(customerHeaders);
      // Redis is reachable in this suite, so a 500 is a real failure and is
      // not accepted.
      expect(res.status).toBe(200);
    });
  });

  describe('POST /cart/items', () => {
    it('returns 400 for missing productId', async () => {
      const res = await request(app)
        .post('/cart/items')
        .set(customerHeaders)
        .send({ quantity: 1 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /cart/clear', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).delete('/cart/clear');
      expect(res.status).toBe(401);
    });
  });
});
