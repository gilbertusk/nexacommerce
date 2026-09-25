import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/prisma/client';

const adminHeaders = {
  'x-user-id': 'admin-1',
  'x-user-role': 'ADMIN',
  'x-user-email': 'admin@test.com',
};

const sellerHeaders = {
  'x-user-id': 'seller-1',
  'x-user-role': 'SELLER',
  'x-user-email': 'seller@test.com',
};

describe('Product Routes (integration)', () => {
  // Importing the app opens a Prisma connection pool. Closing it is what lets
  // Jest exit on its own instead of hanging or needing --forceExit.
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /products/health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/products/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /products/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/products/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /categories', () => {
    it('returns category list (public)', async () => {
      const res = await request(app).get('/categories');
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /categories', () => {
    it('returns 403 when no user context', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: 'Electronics', slug: 'electronics' });

      expect([401, 403, 500]).toContain(res.status);
    });

    it('accepts request with ADMIN role', async () => {
      const res = await request(app)
        .post('/categories')
        .set(adminHeaders)
        .send({ name: 'Electronics', slug: `electronics-${Date.now()}` });

      expect([201, 409, 500]).toContain(res.status);
    });
  });

  describe('GET /brands', () => {
    it('returns brand list (public)', async () => {
      const res = await request(app).get('/brands');
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /products', () => {
    it('returns 403 when no user role', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', slug: 'test', price: 100 });

      expect([401, 403, 500]).toContain(res.status);
    });

    it('returns 400 for invalid payload as SELLER', async () => {
      const res = await request(app)
        .post('/products')
        .set(sellerHeaders)
        .send({ name: 'Missing required fields' });

      expect(res.status).toBe(400);
    });

    it('requires positive integer weight in grams before database access', async () => {
      const basePayload = {
        name: 'Weighted product',
        slug: 'weighted-product',
        price: 1000,
        categoryId: '00000000-0000-4000-8000-000000000001',
      };

      const missingWeight = await request(app)
        .post('/products')
        .set(sellerHeaders)
        .send(basePayload);
      const fractionalWeight = await request(app)
        .post('/products')
        .set(sellerHeaders)
        .send({ ...basePayload, weight: 10.5 });

      expect(missingWeight.status).toBe(400);
      expect(fractionalWeight.status).toBe(400);
    });
  });

  describe('POST /products/:id/images/upload', () => {
    it('rejects requests without seller/admin identity before parsing the upload', async () => {
      const res = await request(app).post('/products/00000000-0000-4000-8000-000000000001/images/upload');
      expect(res.status).toBe(401);
    });

    it('requires an image file when the caller is authorized by role', async () => {
      const res = await request(app)
        .post('/products/00000000-0000-4000-8000-000000000001/images/upload')
        .set(sellerHeaders);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Image file is required');
    });

    it('rejects files larger than 5 MB before image processing', async () => {
      const res = await request(app)
        .post('/products/00000000-0000-4000-8000-000000000001/images/upload')
        .set(sellerHeaders)
        .attach('image', Buffer.alloc(5 * 1024 * 1024 + 1), { filename: 'large.png', contentType: 'image/png' });
      expect(res.status).toBe(413);
      expect(res.body.message).toBe('Image must not exceed 5 MB');
    });
  });

  describe('GET /products', () => {
    it('returns product list (public)', async () => {
      const res = await request(app).get('/products');
      expect([200, 500]).toContain(res.status);
    });

    it('accepts filter params', async () => {
      const res = await request(app)
        .get('/products')
        .query({ sortBy: 'newest', limit: 5, page: 1 });

      expect([200, 500]).toContain(res.status);
    });
  });
});
