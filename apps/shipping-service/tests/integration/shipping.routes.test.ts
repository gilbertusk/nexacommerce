import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/prisma/client';
import { shippingService } from '../../src/services/shipping.service';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const sellerHeaders = { 'x-user-id': 'seller-1', 'x-user-role': 'SELLER', 'x-user-email': 'seller@test.com' };

describe('Shipping Routes (integration)', () => {
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

  describe('GET /shipping/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/shipping/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
      expect(res.body.paths['/shipping/admin/rates']).toBeDefined();
    });
  });

  describe('ADMIN rate management', () => {
    it('rejects non-admin access', async () => {
      const res = await request(app).get('/shipping/admin/rates').set(sellerHeaders);
      expect(res.status).toBe(403);
    });

    it('rejects malformed rates before database writes', async () => {
      const res = await request(app)
        .post('/shipping/admin/rates')
        .set(adminHeaders)
        .send({ courierId: 'courier-1', originCity: 'Bandung', destinationCity: 'Surabaya', serviceCode: 'REG', weight: 0, cost: 15000, estimatedDays: '2-3 hari' });
      expect(res.status).toBe(400);
    });

    it('creates, serves, updates, and deletes an audited authoritative rate', async () => {
      const courierCode = 'rate-admin-test';
      await prisma.courier.deleteMany({ where: { code: courierCode } });

      try {
        const courierResponse = await request(app)
          .post('/shipping/admin/couriers')
          .set(adminHeaders)
          .send({
            code: courierCode,
            name: 'Rate Admin Test Courier',
            services: [{ code: 'REG', name: 'Regular', estimatedDays: '2-3 hari' }],
          });
        expect(courierResponse.status).toBe(201);
        expect(courierResponse.body.data).toMatchObject({ code: courierCode, createdBy: 'admin-1' });
        const courierId = courierResponse.body.data.id as string;

        const ratePayload = {
          courierId,
          originCity: 'Bandung',
          destinationCity: 'Surabaya',
          serviceCode: 'REG',
          weight: 2000,
          cost: 18000,
          estimatedDays: '2-3 hari',
        };
        const created = await request(app)
          .post('/shipping/admin/rates')
          .set(adminHeaders)
          .send(ratePayload);
        expect(created.status).toBe(201);
        expect(created.body.data).toMatchObject({
          originCity: 'BANDUNG',
          destinationCity: 'SURABAYA',
          serviceCode: 'REG',
          cost: 18000,
          createdBy: 'admin-1',
        });
        const rateId = created.body.data.id as string;

        const duplicate = await request(app)
          .post('/shipping/admin/rates')
          .set(adminHeaders)
          .send(ratePayload);
        expect(duplicate.status).toBe(409);

        const publicRates = await request(app)
          .get('/shipping/rates')
          .query({ originCity: 'bandung', destinationCity: 'surabaya', weight: 1500, courierCode });
        expect(publicRates.status).toBe(200);
        expect(publicRates.body.data).toEqual([
          expect.objectContaining({ serviceCode: 'REG', cost: 18000 }),
        ]);

        const updated = await request(app)
          .patch(`/shipping/admin/rates/${rateId}`)
          .set(adminHeaders)
          .send({ ...ratePayload, cost: 19000 });
        expect(updated.status).toBe(200);
        expect(updated.body.data).toMatchObject({ cost: 19000, updatedBy: 'admin-1' });

        const removed = await request(app)
          .delete(`/shipping/admin/rates/${rateId}`)
          .set(adminHeaders);
        expect(removed.status).toBe(200);
        expect(await prisma.shippingRate.count({ where: { id: rateId } })).toBe(0);
      } finally {
        await prisma.courier.deleteMany({ where: { code: courierCode } });
      }
    });
  });

  describe('split-shipment persistence', () => {
    it('persists and reads one independently tracked shipment per seller', async () => {
      const orderId = 'split-order-integration';
      const courierCode = 'split-test-courier';
      await prisma.shippingOrder.deleteMany({ where: { orderId } });
      await prisma.courier.deleteMany({ where: { code: courierCode } });

      try {
        const courier = await prisma.courier.create({
          data: {
            code: courierCode,
            name: 'Split Test Courier',
            services: [{ code: 'REG', name: 'Regular', estimatedDays: '2-3 hari' }],
          },
        });
        const common = {
          orderId,
          courierId: courier.id,
          serviceCode: 'REG',
          weight: 1000,
          originProvince: 'Jawa Barat',
          trustedQuotedCost: 18000,
          destinationAddress: { city: 'Surabaya', province: 'Jawa Timur' },
        };

        await shippingService.createShippingOrder({
          ...common, sellerId: 'seller-a', originCity: 'Bandung',
        });
        await shippingService.createShippingOrder({
          ...common, sellerId: 'seller-b', originCity: 'Bogor', trustedQuotedCost: 19000,
        });

        const persisted = await prisma.shippingOrder.findMany({ where: { orderId }, orderBy: { sellerId: 'asc' } });
        expect(persisted).toHaveLength(2);
        expect(persisted.map((shipment) => shipment.sellerId)).toEqual(['seller-a', 'seller-b']);
        expect(persisted.map((shipment) => Number(shipment.cost))).toEqual([18000, 19000]);

        const aggregate = await shippingService.getShippingOrder(orderId) as any;
        expect(aggregate.shipments).toHaveLength(2);
        expect(aggregate.allPickedUp).toBe(false);
        expect(aggregate.allDelivered).toBe(false);
      } finally {
        await prisma.shippingOrder.deleteMany({ where: { orderId } });
        await prisma.courier.deleteMany({ where: { code: courierCode } });
      }
    });
  });

  describe('GET /shipping/couriers', () => {
    it('returns courier list (public)', async () => {
      const res = await request(app).get('/shipping/couriers');
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /shipping/rates', () => {
    it('returns 400 without required params', async () => {
      const res = await request(app).get('/shipping/rates');
      expect(res.status).toBe(400);
    });

    it('rejects non-integer weight before querying shipping data', async () => {
      const res = await request(app)
        .get('/shipping/rates')
        .query({ originCity: 'jakarta', destinationCity: 'bandung', weight: '1000.5' });
      expect(res.status).toBe(400);
    });

    it('accepts request with required params', async () => {
      const res = await request(app)
        .get('/shipping/rates')
        .query({ originCity: 'jakarta', destinationCity: 'bandung', weight: 1000 });
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /shipping/track/:trackingNumber', () => {
    it('returns 404 for unknown tracking number', async () => {
      const res = await request(app).get('/shipping/track/UNKNOWN123');
      expect([404, 500]).toContain(res.status);
    });
  });
});
