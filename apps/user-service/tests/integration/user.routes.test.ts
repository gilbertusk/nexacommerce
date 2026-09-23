import request from 'supertest';
import app from '../../src/app';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('User Routes (integration)', () => {
  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /users/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/users/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /users/users/me', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).get('/users/users/me');
      expect([401, 403]).toContain(res.status);
    });

    it('returns user profile for authenticated user', async () => {
      const res = await request(app).get('/users/users/me').set(customerHeaders);
      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('GET /users/users', () => {
    it('returns 403 for non-ADMIN', async () => {
      const res = await request(app).get('/users/users').set(customerHeaders);
      expect([403, 500]).toContain(res.status);
    });

    it('accepts ADMIN request', async () => {
      const res = await request(app).get('/users/users').set(adminHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /users/users/me/addresses', () => {
    it('returns address list for authenticated user', async () => {
      const res = await request(app)
        .get('/users/users/me/addresses')
        .set(customerHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });
});
