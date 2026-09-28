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
      expect(res.body.paths['/orders/{id}/return-receipt']).toBeDefined();
    });
  });

  describe('POST /orders/:id/return-receipt', () => {
    it('requires an admin role', async () => {
      const res = await request(app)
        .post('/orders/order-1/return-receipt')
        .set(customerHeaders)
        .send({ note: 'Package received' });
      expect(res.status).toBe(403);
    });

    it('rejects a note longer than the audit field allows', async () => {
      const res = await request(app)
        .post('/orders/order-1/return-receipt')
        .set(adminHeaders)
        .send({ note: 'x'.repeat(1001) });
      expect(res.status).toBe(400);
    });

    it('atomically records the admin, timestamp, note, status, and one audit entry', async () => {
      const orderId = 'return-receipt-integration-order';
      await prisma.order.deleteMany({ where: { id: orderId } });
      await prisma.order.create({
        data: {
          id: orderId,
          orderNumber: 'NXC-RETURN-RECEIPT-INTEGRATION',
          customerId: 'customer-return-test',
          customerName: 'Return Test',
          customerEmail: 'return-test@example.com',
          subtotal: 100000,
          discount: 0,
          shippingCost: 10000,
          grandTotal: 110000,
          shippingAddressId: 'address-return-test',
          shippingAddress: { city: 'Bandung' },
          status: 'RETURN_APPROVED',
          expiresAt: new Date(Date.now() + 60_000),
        },
      });

      try {
        const first = await request(app)
          .post(`/orders/${orderId}/return-receipt`)
          .set(adminHeaders)
          .send({ note: 'Package and contents verified' });
        expect(first.status).toBe(200);
        expect(first.body.data).toMatchObject({
          status: 'RETURN_RECEIVED',
          returnReceivedBy: 'admin-1',
          returnReceiptNote: 'Package and contents verified',
        });
        expect(first.body.data.returnReceivedAt).toBeTruthy();

        const retry = await request(app)
          .post(`/orders/${orderId}/return-receipt`)
          .set(adminHeaders)
          .send({ note: 'Retry must not overwrite audit data' });
        expect(retry.status).toBe(200);

        const stored = await prisma.order.findUniqueOrThrow({
          where: { id: orderId },
          include: { statusHistory: true },
        });
        expect(stored.status).toBe('RETURN_RECEIVED');
        expect(stored.returnReceivedBy).toBe('admin-1');
        expect(stored.returnReceiptNote).toBe('Package and contents verified');
        expect(stored.statusHistory).toHaveLength(1);
        expect(stored.statusHistory[0]).toMatchObject({
          fromStatus: 'RETURN_APPROVED',
          toStatus: 'RETURN_RECEIVED',
          changedBy: 'admin-1',
          note: 'Package and contents verified',
        });
      } finally {
        await prisma.order.deleteMany({ where: { id: orderId } });
      }
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
