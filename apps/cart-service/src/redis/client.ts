import Redis from 'ioredis';
import { config } from '../config';

export const redis = new Redis(config.redisUrl);

redis.on('connect', () => {
  console.log('[Redis] Connected to Redis instance');
});

redis.on('error', (err: any) => {
  console.error('[Redis] Connection error:', err);
});

export default redis;
