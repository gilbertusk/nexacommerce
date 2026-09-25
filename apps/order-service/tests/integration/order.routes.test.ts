import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/prisma/client';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('Order Routes (integration)', () => {
  // Importing the app opens a Prisma connection pool. Closing it here is what
  // lets Jest exit on its own instead of needing --forceExit.
  afterAll(async () => {
    await prisma.$disconnect();
  });

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

    it('returns the customer\'s order list from the database', async () => {
      // A 500 is not accepted here. This suite runs against a live database, so
      // tolerating one would hide exactly the failure it is meant to catch.
      const res = await request(app).get('/orders').set(customerHeaders);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
    });
  });

  describe('POST /orders/checkout', () => {
    const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

    it('rejects an empty payload', async () => {
      const res = await request(app).post('/orders/checkout').set(customerHeaders).send({});
      expect(res.status).toBe(400);
    });

    it('rejects a request that omits the shipping quote id', async () => {
      const res = await request(app)
        .post('/orders/checkout')
        .set(customerHeaders)
        .send({ shippingAddressId: VALID_UUID });
      expect(res.status).toBe(400);
    });

    it('rejects a browser-supplied shipping cost instead of ignoring it', async () => {
      // `.strict()` on the schema means a client still sending the old field
      // gets a loud failure rather than silently having it dropped.
      const res = await request(app)
        .post('/orders/checkout')
        .set(customerHeaders)
        .send({
          shippingAddressId: VALID_UUID,
          shippingQuoteId: VALID_UUID,
          shippingCost: 0,
          courierName: 'JNE',
        });
      expect(res.status).toBe(400);
    });

    it('rejects a quote id that is not a uuid', async () => {
      const res = await request(app)
        .post('/orders/checkout')
        .set(customerHeaders)
        .send({ shippingAddressId: VALID_UUID, shippingQuoteId: 'not-a-uuid' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /orders/:id', () => {
    it('returns 404 for a non-existent order', async () => {
      const res = await request(app)
        .get('/orders/non-existent-id')
        .set(customerHeaders);
      expect(res.status).toBe(404);
    });
  });
});
