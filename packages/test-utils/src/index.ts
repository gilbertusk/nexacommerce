import jwt from 'jsonwebtoken';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-local-key';

export function generateTestToken(payload: { userId: string; role: string; email: string }): string {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

export const testTokens = {
  admin: generateTestToken({ userId: 'admin-test-id', role: 'ADMIN', email: 'admin@test.com' }),
  seller: generateTestToken({ userId: 'seller-test-id', role: 'SELLER', email: 'seller@test.com' }),
  customer: generateTestToken({ userId: 'customer-test-id', role: 'CUSTOMER', email: 'customer@test.com' }),
};

export const testHeaders = {
  admin: {
    'x-user-id': 'admin-test-id',
    'x-user-role': 'ADMIN',
    'x-user-email': 'admin@test.com',
  },
  seller: {
    'x-user-id': 'seller-test-id',
    'x-user-role': 'SELLER',
    'x-user-email': 'seller@test.com',
  },
  customer: {
    'x-user-id': 'customer-test-id',
    'x-user-role': 'CUSTOMER',
    'x-user-email': 'customer@test.com',
  },
  internal: {
    'x-internal-service': 'test-service',
    'x-internal-token': process.env.INTERNAL_SERVICE_TOKEN || 'development-only-internal-token',
  },
};

export function mockRabbitMQChannel() {
  return {
    assertExchange: jest.fn().mockResolvedValue({}),
    assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue' }),
    bindQueue: jest.fn().mockResolvedValue({}),
    consume: jest.fn(),
    publish: jest.fn().mockReturnValue(true),
    ack: jest.fn(),
    nack: jest.fn(),
  };
}

export function mockRabbitMQConnection() {
  const channel = mockRabbitMQChannel();
  return {
    createChannel: jest.fn().mockResolvedValue(channel),
    on: jest.fn(),
    close: jest.fn(),
    _channel: channel,
  };
}
