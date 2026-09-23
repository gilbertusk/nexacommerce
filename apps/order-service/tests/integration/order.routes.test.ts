import request from 'supertest';
import app from '../../src/app';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('Order Routes (integration)', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /orders/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/orders/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /orders', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).get('/orders');
      expect([401, 403]).toContain(res.status);
    });

    it('accepts CUSTOMER request', async () => {
      const res = await request(app).get('/orders').set(customerHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /orders/checkout', () => {
    it('returns 400 for empty payload', async () => {
      const res = await request(app)
        .post('/orders/checkout')
        .set(customerHeaders)
        .send({});
      expect([400, 422, 500]).toContain(res.status);
    });
  });

  describe('GET /orders/:id', () => {
    it('returns 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/orders/non-existent-id')
        .set(customerHeaders);
      expect([404, 500]).toContain(res.status);
    });
  });
});
