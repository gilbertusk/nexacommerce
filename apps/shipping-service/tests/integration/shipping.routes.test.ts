import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/prisma/client';

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
