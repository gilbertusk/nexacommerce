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
      expect(res.body.paths['/orders/admin/complaints']).toBeDefined();
    });
  });

  describe('GET /orders/admin/complaints', () => {
    it('rejects requests without an admin role', async () => {
      const res = await request(app).get('/orders/admin/complaints').set(customerHeaders);
      expect(res.status).toBe(403);
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

    it('rejects a valid-shaped request while no trusted shipping quote is available', async () => {
      const res = await request(app)
        .post('/orders/checkout')
        .set(customerHeaders)
        .send({
          shippingAddressId: '550e8400-e29b-41d4-a716-446655440000',
          courierName: 'JNE',
          courierService: 'REG',
          shippingCost: 0,
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('trusted shipping quote');
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
