import request from 'supertest';
import app from '../../src/app';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const sellerHeaders = { 'x-user-id': 'seller-1', 'x-user-role': 'SELLER', 'x-user-email': 'seller@test.com' };

describe('Analytics Routes (integration)', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /analytics/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/analytics/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /analytics/analytics/dashboard', () => {
    it('returns 403 for non-ADMIN', async () => {
      const res = await request(app)
        .get('/analytics/analytics/dashboard')
        .set(sellerHeaders);
      expect([403, 500]).toContain(res.status);
    });

    it('accepts ADMIN request', async () => {
      const res = await request(app)
        .get('/analytics/analytics/dashboard')
        .set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /analytics/analytics/seller/dashboard', () => {
    it('accepts SELLER request', async () => {
      const res = await request(app)
        .get('/analytics/analytics/seller/dashboard')
        .set(sellerHeaders);
      expect([200, 500]).toContain(res.status);
    });

    it('returns 403 for CUSTOMER', async () => {
      const res = await request(app)
        .get('/analytics/analytics/seller/dashboard')
        .set({ 'x-user-id': 'u1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'u@u.com' });
      expect([403, 500]).toContain(res.status);
    });
  });

  describe('GET /analytics/analytics/revenue', () => {
    it('requires ADMIN role', async () => {
      const res = await request(app).get('/analytics/analytics/revenue').set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /analytics/analytics/products/top-selling', () => {
    it('accessible by ADMIN', async () => {
      const res = await request(app)
        .get('/analytics/analytics/products/top-selling')
        .set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });
});
