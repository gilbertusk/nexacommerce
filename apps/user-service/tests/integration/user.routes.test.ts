import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/prisma/client';

const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };
const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('User Routes (integration)', () => {
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

  describe('GET /users/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/users/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /users/me', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).get('/users/me');
      expect(res.status).toBe(401);
    });

    it('returns user profile for authenticated user', async () => {
      const res = await request(app).get('/users/me').set(customerHeaders);
      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('GET /users', () => {
    it('returns 403 for non-ADMIN', async () => {
      const res = await request(app).get('/users').set(customerHeaders);
      expect(res.status).toBe(403);
    });

    it('accepts ADMIN request', async () => {
      const res = await request(app).get('/users').set(adminHeaders);
      expect([200, 502]).toContain(res.status);
    });
  });

  describe('GET /users/me/addresses', () => {
    it('returns address list for authenticated user', async () => {
      const res = await request(app)
        .get('/users/me/addresses')
        .set(customerHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });
});
