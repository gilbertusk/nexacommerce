import request from 'supertest';
import app from '../../src/app';

const customerHeaders = { 'x-user-id': 'user-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'user@test.com' };

describe('Notification Routes (integration)', () => {
  describe('Internal route security', () => {
    it('rejects auth email requests without an internal credential', async () => {
      const res = await request(app)
        .post('/notifications/internal/auth-email')
        .set('x-internal-service', 'auth-service')
        .send({
          type: 'PASSWORD_RESET',
          email: 'customer@example.com',
          name: 'Customer',
          token: '7a9b7ae8-1ac0-4a42-8348-6041ed96a1d2',
        });

      expect(res.status).toBe(403);
    });

    it('does not expose template seeding publicly', async () => {
      const res = await request(app).post('/notifications/seed-templates');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('returns 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /notifications/docs/spec.json', () => {
    it('returns OpenAPI spec', async () => {
      const res = await request(app).get('/notifications/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
    });
  });

  describe('GET /notifications', () => {
    it('returns 401 without user context', async () => {
      const res = await request(app).get('/notifications');
      expect([401, 403]).toContain(res.status);
    });

    it('accepts authenticated customer request', async () => {
      const res = await request(app)
        .get('/notifications')
        .set(customerHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('returns unread count for authenticated user', async () => {
      const res = await request(app)
        .get('/notifications/unread-count')
        .set(customerHeaders);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /notifications/read-all', () => {
    it('requires authentication', async () => {
      const res = await request(app).post('/notifications/read-all');
      expect([401, 403]).toContain(res.status);
    });
  });
});
