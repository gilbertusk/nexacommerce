import Redis from 'ioredis';
import type { NextFunction, Request, Response } from 'express';
import { ClientRateLimitInfo, Store } from 'express-rate-limit';
import { createLogger } from '@nexacommerce/logger';
import { setDependencyReady } from '@nexacommerce/common';
import { config } from '../config';

const logger = createLogger('api-gateway-rate-limit');

/**
 * Every limiter key lives under this namespace so rate-limit counters cannot
 * collide with other ephemeral Redis data (carts, caches) on a shared server.
 */
export const RATE_LIMIT_KEY_NAMESPACE = 'rate-limit';

let storeErrors = 0;

/** Count of limiter storage failures observed by this replica. */
export function rateLimitStoreErrorCount(): number {
  return storeErrors;
}

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
    return `${RATE_LIMIT_KEY_NAMESPACE}:${this.prefix}:${key}`;
  }

  private async run<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      storeErrors += 1;
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

/**
 * Build a limiter Redis client. Commands fail fast instead of queueing while
 * disconnected (`enableOfflineQueue: false`, one retry), which is what makes
 * the limiter fail closed quickly; reconnection continues in the background.
 */
export function createRateLimitRedisClient(url: string, options: { connectionName?: string } = {}): Redis {
  const client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    retryStrategy: (attempt) => Math.min(attempt * 500, 5000),
    ...(options.connectionName ? { connectionName: options.connectionName } : {}),
  });
  // Without an error listener ioredis reports every failed reconnect as an
  // unhandled 'error' event. Connection state is surfaced through readiness.
  client.on('error', () => undefined);
  return client;
}

export const rateLimitRedis = createRateLimitRedisClient(config.redisUrl, {
  ...(process.env.NODE_ENV === 'test' ? {} : { connectionName: 'nexacommerce-api-gateway-rate-limits' }),
});

/**
 * Publish limiter Redis readiness as `nexacommerce_dependency_ready{dependency="redis"}`
 * and log transitions without the URL (it may carry credentials).
 */
export function trackRedisReadiness(client: Redis): void {
  client.on('ready', () => {
    setDependencyReady('redis', true);
    logger.info('Rate-limit Redis ready');
  });
  client.on('end', () => setDependencyReady('redis', false));
  client.on('close', () => {
    setDependencyReady('redis', false);
    logger.warn('Rate-limit Redis connection closed; limiter fails closed until it returns');
  });
}

/**
 * Connect eagerly at startup. With `lazyConnect` and no offline queue, the
 * first commands after boot would otherwise race the connection and be
 * rejected with 503 even though Redis is healthy.
 */
export async function connectRateLimitRedis(client: Redis = rateLimitRedis): Promise<void> {
  trackRedisReadiness(client);
  try {
    await client.connect();
  } catch (error) {
    setDependencyReady('redis', false);
    logger.error('Rate-limit Redis unavailable at startup; requests fail closed until it connects', {
      error: error instanceof Error ? error.message : 'unknown error',
    });
  }
}

/**
 * Map limiter storage failures to 503. Protection that cannot be enforced is
 * treated as unavailable, never silently skipped.
 */
export function rateLimitStoreErrorHandler(error: unknown, _req: Request, res: Response, next: NextFunction) {
  if (error instanceof RateLimitStoreUnavailableError) {
    logger.error('Distributed rate-limit store unavailable; rejecting request', { outcome: 'FAIL_CLOSED_503' });
    return res.status(503).json({ success: false, message: 'Request protection is temporarily unavailable' });
  }
  return next(error);
}

export function createRateLimitStore(prefix: string, windowMs: number): Store | undefined {
  // Keep route tests hermetic; production must use the shared Redis store.
  if (process.env.NODE_ENV === 'test') return undefined;
  return new RedisRateLimitStore(rateLimitRedis, prefix, windowMs);
}
