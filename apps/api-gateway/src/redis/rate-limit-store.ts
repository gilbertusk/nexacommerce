import Redis from 'ioredis';
import { ClientRateLimitInfo, Store } from 'express-rate-limit';
import { config } from '../config';

const INCREMENT_SCRIPT = `
local total = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if total == 1 or ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { total, ttl }
`;

const READ_SCRIPT = `
local total = redis.call('GET', KEYS[1])
if not total then return { 0, -2 } end
local ttl = redis.call('PTTL', KEYS[1])
return { tonumber(total), ttl }
`;

const DECREMENT_SCRIPT = `
local total = redis.call('DECR', KEYS[1])
if total <= 0 then
  redis.call('DEL', KEYS[1])
  return 0
end
return total
`;

export class RateLimitStoreUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Distributed rate-limit storage is unavailable');
    this.name = 'RateLimitStoreUnavailableError';
    (this as Error & { cause?: unknown }).cause = cause;
  }
}

export class RedisRateLimitStore implements Store {
  constructor(
    private readonly client: Redis,
    readonly prefix: string,
    private readonly windowMs: number,
  ) {
    if (!Number.isSafeInteger(windowMs) || windowMs <= 0) throw new Error('windowMs must be a positive integer');
  }

  private key(key: string) {
    return `${this.prefix}:${key}`;
  }

  private async run<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new RateLimitStoreUnavailableError(error);
    }
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    return this.run(async () => {
      const [totalHits, ttl] = await this.client.eval(INCREMENT_SCRIPT, 1, this.key(key), this.windowMs) as [number | string, number | string];
      const total = Number(totalHits);
      const ttlMs = Number(ttl);
      if (!Number.isSafeInteger(total) || total <= 0 || !Number.isFinite(ttlMs) || ttlMs < 0) {
        throw new Error('Redis returned an invalid rate-limit counter');
      }
      return { totalHits: total, resetTime: new Date(Date.now() + ttlMs) };
    });
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    return this.run(async () => {
      const [totalHits, ttl] = await this.client.eval(READ_SCRIPT, 1, this.key(key)) as [number | string, number | string];
      const total = Number(totalHits);
      const ttlMs = Number(ttl);
      if (!Number.isFinite(total) || total <= 0 || ttlMs < 0) return undefined;
      return { totalHits: total, resetTime: new Date(Date.now() + ttlMs) };
    });
  }

  async decrement(key: string): Promise<void> {
    await this.run(() => this.client.eval(DECREMENT_SCRIPT, 1, this.key(key)).then(() => undefined));
  }

  async resetKey(key: string): Promise<void> {
    await this.run(() => this.client.del(this.key(key)).then(() => undefined));
  }
}

export const rateLimitRedis = new Redis(config.redisUrl, {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  connectTimeout: 1000,
  retryStrategy: (attempt) => Math.min(attempt * 500, 5000),
  ...(process.env.NODE_ENV === 'test' ? {} : { connectionName: 'nexacommerce-api-gateway-rate-limits' }),
});

export function createRateLimitStore(prefix: string, windowMs: number): Store | undefined {
  // Keep route tests hermetic; production must use the shared Redis store.
  if (process.env.NODE_ENV === 'test') return undefined;
  return new RedisRateLimitStore(rateLimitRedis, prefix, windowMs);
}
