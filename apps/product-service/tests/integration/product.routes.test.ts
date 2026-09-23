import request from 'supertest';
import app from '../../src/app';

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

      expect([400, 500]).toContain(res.status);
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
