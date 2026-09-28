import Redis from 'ioredis';
import { createRateLimitStore, RedisRateLimitStore, RateLimitStoreUnavailableError } from '../src/redis/rate-limit-store';

function makeRedis() {
  return {
    eval: jest.fn().mockResolvedValue([2, 30_000]),
    del: jest.fn().mockResolvedValue(1),
  } as unknown as Redis & { eval: jest.Mock; del: jest.Mock };
}

describe('RedisRateLimitStore', () => {
  it('increments atomically with a namespaced key and reports Redis expiry', async () => {
    const redis = makeRedis();
    const store = new RedisRateLimitStore(redis, 'gateway:auth', 60_000);

    const result = await store.increment('ip:127.0.0.1');

    expect(redis.eval).toHaveBeenCalledWith(expect.stringContaining('INCR'), 1, 'rate-limit:gateway:auth:ip:127.0.0.1', 60_000);
    expect(result.totalHits).toBe(2);
    expect(result.resetTime?.getTime()).toBeGreaterThan(Date.now() + 29_000);
  });

  it('reads counters and handles expired keys as missing', async () => {
    const redis = makeRedis();
    const store = new RedisRateLimitStore(redis, 'gateway:global', 60_000);
    await expect(store.get('client')).resolves.toMatchObject({ totalHits: 2 });
    redis.eval.mockResolvedValueOnce([0, -2]);
    await expect(store.get('expired')).resolves.toBeUndefined();
  });

  it('decrements, resets, and rejects Redis failures instead of failing open', async () => {
    const redis = makeRedis();
    const store = new RedisRateLimitStore(redis, 'gateway:checkout', 60_000);
    await store.decrement('client');
    await store.resetKey('client');
    expect(redis.del).toHaveBeenCalledWith('rate-limit:gateway:checkout:client');

    redis.eval.mockRejectedValueOnce(new Error('connection refused'));
    await expect(store.increment('offline')).rejects.toBeInstanceOf(RateLimitStoreUnavailableError);
  });

  it('uses process-local storage only in test mode', () => {
    expect(createRateLimitStore('test', 1000)).toBeUndefined();
  });
});
