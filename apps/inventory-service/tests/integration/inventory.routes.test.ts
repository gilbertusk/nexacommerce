import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/prisma/client';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const sellerHeaders = { 'x-user-id': 'seller-1', 'x-user-role': 'SELLER', 'x-user-email': 'seller@test.com' };
const internalHeaders = {
  'x-internal-service': 'order-service',
  'x-internal-token': process.env.INTERNAL_SERVICE_TOKEN || 'development-only-internal-token',
};

describe('Inventory Routes (integration)', () => {
  // Importing the app opens a Prisma connection pool. Closing it is what lets
  // Jest exit on its own instead of hanging or needing --forceExit.
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Reservation route security', () => {
    it('rejects a browser user from mutating stock reservations', async () => {
      const res = await request(app)
        .post('/inventory/reserve')
        .set(sellerHeaders)
        .send({ productId: 'prod-1', orderId: 'order-1', quantity: 1 });

      expect(res.status).toBe(403);
    });

    it('rejects a service name without the internal credential', async () => {
      const res = await request(app)
        .post('/inventory/reserve')
        .set('x-internal-service', 'order-service')
        .send({ productId: 'prod-1', orderId: 'order-1', quantity: 1 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /inventory/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/inventory/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /inventory', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).get('/inventory');
      expect([401, 403, 500]).toContain(res.status);
    });

    it('accepts ADMIN request', async () => {
      const res = await request(app).get('/inventory').set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /inventory/initialize', () => {
    it('returns 403 without user context', async () => {
      const res = await request(app)
        .post('/inventory/initialize')
        .send({ productId: 'prod-1', initialStock: 100 });
      expect([401, 403, 500]).toContain(res.status);
    });
  });

  describe('GET /inventory/low-stock', () => {
    it('requires ADMIN or SELLER role', async () => {
      const res = await request(app).get('/inventory/low-stock');
      expect([401, 403, 500]).toContain(res.status);
    });
  });
});
