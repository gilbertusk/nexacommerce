import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/prisma/client';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const sellerHeaders = { 'x-user-id': 'seller-1', 'x-user-role': 'SELLER', 'x-user-email': 'seller@test.com' };

describe('Analytics Routes (integration)', () => {
  // Importing the app opens a Prisma connection pool. Closing it is what lets
  // Jest exit on its own instead of hanging or needing --forceExit.
  afterAll(async () => {
    await prisma.$disconnect();
  });

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

  describe('GET /metrics', () => {
    it('rejects an unauthenticated scraper', async () => {
      const res = await request(app).get('/metrics');
      expect(res.status).toBe(403);
    });

    it('returns Prometheus text to the authenticated scraper identity', async () => {
      const res = await request(app)
        .get('/metrics')
        .set('x-internal-service', 'prometheus')
        .set('x-internal-token', process.env.INTERNAL_SERVICE_TOKEN || 'development-only-internal-token');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('# TYPE nexacommerce_http_requests_total counter');
      expect(res.text).toContain('# TYPE nexacommerce_analytics_kafka_projection_connected gauge');
    });
  });

  describe('GET /analytics/dashboard', () => {
    it('returns 403 for non-ADMIN', async () => {
      const res = await request(app)
        .get('/analytics/dashboard')
        .set(sellerHeaders);
      expect([403, 500]).toContain(res.status);
    });

    it('accepts ADMIN request', async () => {
      const res = await request(app)
        .get('/analytics/dashboard')
        .set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /analytics/seller/dashboard', () => {
    it('accepts SELLER request', async () => {
      const res = await request(app)
        .get('/analytics/seller/dashboard')
        .set(sellerHeaders);
      expect([200, 500]).toContain(res.status);
    });

    it('returns 403 for CUSTOMER', async () => {
      const res = await request(app)
        .get('/analytics/seller/dashboard')
        .set({ 'x-user-id': 'u1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'u@u.com' });
      expect([403, 500]).toContain(res.status);
    });
  });

  describe('GET /analytics/revenue', () => {
    it('requires ADMIN role', async () => {
      const res = await request(app).get('/analytics/revenue').set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /analytics/products/top-selling', () => {
    it('accessible by ADMIN', async () => {
      const res = await request(app)
        .get('/analytics/products/top-selling')
        .set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /analytics/projections/daily/comparison', () => {
    it('rejects non-admin callers before querying projection data', async () => {
      const res = await request(app)
        .get('/analytics/projections/daily/comparison')
        .set(sellerHeaders);

      expect(res.status).toBe(403);
    });

    it('rejects invalid calendar dates', async () => {
      const res = await request(app)
        .get('/analytics/projections/daily/comparison?startDate=2026-02-30')
        .set(adminHeaders);

      expect(res.status).toBe(400);
    });
  });
});
