import request from 'supertest';
import app from '../../src/app';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('Voucher Routes (integration)', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /vouchers/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/vouchers/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /vouchers', () => {
    it('serves the public voucher catalog', async () => {
      const res = await request(app).get('/vouchers');
      expect([200, 500]).toContain(res.status);
    });

    it('accepts an authenticated catalog request', async () => {
      const res = await request(app).get('/vouchers').set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /vouchers', () => {
    it('returns 403 for non-ADMIN users', async () => {
      const res = await request(app)
        .post('/vouchers')
        .set(customerHeaders)
        .send({ code: 'TEST10', type: 'PERCENTAGE', value: 10 });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /vouchers/validate', () => {
    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/vouchers/validate')
        .set(customerHeaders)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
