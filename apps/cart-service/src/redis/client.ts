import Redis from 'ioredis';
import { config } from '../config';

// Integration tests may run without Redis; fail promptly rather than leaving
// Jest retrying an unreachable local service indefinitely. Production retains
// ioredis' normal reconnection behavior.
export const redis = process.env.NODE_ENV === 'test'
  ? new Redis(config.redisUrl, {
      retryStrategy: () => null,
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
    })
  : new Redis(config.redisUrl);

redis.on('connect', () => {
  console.log('[Redis] Connected to Redis instance');
});

redis.on('error', (err: any) => {
  if (process.env.NODE_ENV === 'test') return;
  console.error('[Redis] Connection error:', err);
});

export default redis;
