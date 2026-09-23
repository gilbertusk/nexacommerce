import request from 'supertest';

jest.mock('../../src/services/auth.service', () => ({
  authService: {
    login: jest.fn().mockResolvedValue({
      accessToken: 'access-secret',
      refreshToken: 'refresh-secret',
      user: {
        id: 'user-1',
        name: 'Cookie User',
        email: 'cookie@test.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        emailVerified: true,
      },
    }),
  },
}));

import app from '../../src/app';

describe('Auth cookie boundary', () => {
  it('sets HttpOnly cookies and does not expose tokens in JSON', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'cookie@test.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toHaveProperty('accessToken');
    expect(response.body.data).not.toHaveProperty('refreshToken');
    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies).toEqual(expect.arrayContaining([
      expect.stringContaining('nexa_access_token=access-secret'),
      expect.stringContaining('nexa_refresh_token=refresh-secret'),
    ]));
    expect(cookies.every((cookie) => cookie.includes('HttpOnly'))).toBe(true);
  });
});
