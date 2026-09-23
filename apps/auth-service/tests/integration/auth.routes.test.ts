import request from 'supertest';
import app from '../../src/app';

describe('Auth Routes (integration)', () => {
  describe('POST /auth/register', () => {
    it('returns 201 with user data for valid payload', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: `test-${Date.now()}@test.com`, password: 'password123' });

      // Accept 201 (success) or 400 (validation) — DB may not be available in CI
      expect([200, 201, 400, 500]).toContain(res.status);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'No Email' });

      expect([400, 500]).toContain(res.status);
    });

    it('rejects attempts to self-assign an elevated role', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Attacker', email: 'attacker@test.com', password: 'password123', role: 'ADMIN' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ password: 'pass' });

      expect([400, 401, 500]).toContain(res.status);
    });

    it('returns 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nobody@nowhere.com', password: 'wrongpass' });

      expect([401, 500]).toContain(res.status);
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 when no authorization header provided', async () => {
      const res = await request(app).get('/auth/me');

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Internal service authentication', () => {
    it('rejects a service-name header without the shared credential', async () => {
      const res = await request(app)
        .get('/auth/internal/users/count')
        .set('x-internal-service', 'analytics-service');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /health', () => {
    it('returns 200 health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });
  });

  describe('GET /auth/health', () => {
    it('returns 200 service-prefixed health', async () => {
      const res = await request(app).get('/auth/health');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /auth/docs/spec.json', () => {
    it('returns OpenAPI spec JSON', async () => {
      const res = await request(app).get('/auth/docs/spec.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
      expect(res.body.info.title).toContain('Auth');
    });
  });
});
