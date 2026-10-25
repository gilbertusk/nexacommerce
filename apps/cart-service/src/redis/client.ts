import Redis from 'ioredis';
import { redisConnectionSettings } from '@nexacommerce/common';
import { config } from '../config';

// Direct URL or Sentinel (REDIS_SENTINELS/REDIS_SENTINEL_NAME), TLS for rediss://.
const settings = redisConnectionSettings(config.redisUrl);
const build = (extra: Record<string, unknown>) => (settings.url
  ? new Redis(settings.url, { ...settings.options, ...extra })
  : new Redis({ ...settings.options, ...extra }));

// Integration tests may run without Redis; fail promptly rather than leaving
// Jest retrying an unreachable local service indefinitely. Production retains
// ioredis' normal reconnection behavior.
export const redis = process.env.NODE_ENV === 'test'
  ? build({
      retryStrategy: () => null,
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
    })
  : build({});

redis.on('connect', () => {
  console.log('[Redis] Connected to Redis instance');
});

redis.on('error', (err: any) => {
  if (process.env.NODE_ENV === 'test') return;
  // Message only: the error object can carry connection details.
  console.error('[Redis] Connection error:', err?.message ?? 'unknown error');
});

export default redis;
