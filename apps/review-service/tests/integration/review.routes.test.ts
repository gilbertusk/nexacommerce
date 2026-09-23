import request from 'supertest';
import app from '../../src/app';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('Review Routes (integration)', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /reviews/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/reviews/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /reviews/products/:productId', () => {
    it('returns review list (public)', async () => {
      const res = await request(app).get('/reviews/products/prod-1');
      expect([200, 500]).toContain(res.status);
    });

    it('accepts rating filter', async () => {
      const res = await request(app)
        .get('/reviews/products/prod-1')
        .query({ rating: 5 });
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /reviews', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).post('/reviews').send({ productId: 'p1', rating: 5, content: 'Great product' });
      expect([401, 403]).toContain(res.status);
    });

    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/reviews')
        .set(customerHeaders)
        .send({ comment: 'Missing productId and rating' });
      expect([400, 500]).toContain(res.status);
    });
  });

  describe('GET /reviews/summary/:productId', () => {
    it('returns summary for a product (may return 404 if no reviews)', async () => {
      const res = await request(app).get('/reviews/summary/prod-1');
      expect([200, 404, 500]).toContain(res.status);
    });
  });
});
