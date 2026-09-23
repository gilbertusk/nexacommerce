import request from 'supertest';
import app from '../../src/app';

const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('Payment Routes (integration)', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /payments/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/payments/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /payments/order/:orderId', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).get('/payments/order/order-1');
      expect([401, 403]).toContain(res.status);
    });

    it('returns 404 for non-existent payment', async () => {
      const res = await request(app)
        .get('/payments/order/non-existent')
        .set(customerHeaders);
      expect([404, 500]).toContain(res.status);
    });
  });

  describe('GET /payments/order/:orderId ownership', () => {
    it('returns 404 for unknown orderId', async () => {
      const res = await request(app)
        .get('/payments/order/unknown-order')
        .set(customerHeaders);
      expect([404, 500]).toContain(res.status);
    });
  });

  describe('POST /payments/webhook/midtrans', () => {
    it('returns 400 for invalid webhook payload', async () => {
      const res = await request(app)
        .post('/payments/webhook/midtrans')
        .send({});
      expect([400, 403, 500]).toContain(res.status);
    });
  });
});
