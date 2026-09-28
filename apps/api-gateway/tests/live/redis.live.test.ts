/**
 * Distributed rate limiting against a live Redis.
 *
 * Uses the production client factory, store, limiter wiring, and fail-closed
 * handler. Requires REDIS_LIVE_URL and, for the outage cases,
 * PHASE3_REDIS_CONTAINER naming a disposable `phase3-test-*` container. Every
 * key lives under a per-run limiter namespace that is deleted afterwards.
 */
import crypto from 'crypto';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';
import type Redis from 'ioredis';
import { isDependencyReady } from '@nexacommerce/common';
import { dockerContainer, requireLiveEnv, waitFor } from '@nexacommerce/test-utils';
import {
  createRateLimitRedisClient,
  RATE_LIMIT_KEY_NAMESPACE,
  rateLimitStoreErrorCount,
  rateLimitStoreErrorHandler,
  RedisRateLimitStore,
  trackRedisReadiness,
} from '../../src/redis/rate-limit-store';

const RUN = `phase3-live-${crypto.randomBytes(4).toString('hex')}`;
const clients: Redis[] = [];

async function client(): Promise<Redis> {
  const redis = createRateLimitRedisClient(requireLiveEnv('REDIS_LIVE_URL'));
  clients.push(redis);
  await redis.connect();
  return redis;
}

/** One gateway replica: its own Redis client and store, shared key space. */
function replica(redis: Redis, prefix: string, max: number, windowMs = 60_000): Express {
  const app = express();
  app.use(rateLimit({
    windowMs,
    max,
    store: new RedisRateLimitStore(redis, prefix, windowMs),
    passOnStoreError: false,
    standardHeaders: true,
    legacyHeaders: false,
  }));
  app.get('/ping', (_req, res) => res.status(200).json({ ok: true }));
  app.use(rateLimitStoreErrorHandler);
  return app;
}

async function deleteRunKeys(): Promise<void> {
  const redis = await client();
  const keys = await redis.keys(`${RATE_LIMIT_KEY_NAMESPACE}:${RUN}*`);
  if (keys.length > 0) await redis.del(...keys);
}

describe('Redis rate limiting (live)', () => {
  afterAll(async () => {
    await deleteRunKeys().catch(() => undefined);
    await Promise.all(clients.map((redis) => redis.quit().catch(() => redis.disconnect())));
  });

  it('increments atomically under concurrency from two replicas', async () => {
    const [a, b] = await Promise.all([client(), client()]);
    const storeA = new RedisRateLimitStore(a, `${RUN}:atomic`, 60_000);
    const storeB = new RedisRateLimitStore(b, `${RUN}:atomic`, 60_000);

    const results = await Promise.all(Array.from({ length: 200 }, (_, i) => (i % 2 ? storeA : storeB).increment('client')));

    const totals = results.map((result) => result.totalHits).sort((x, y) => x - y);
    expect(totals).toEqual(Array.from({ length: 200 }, (_, i) => i + 1));
    expect((await storeA.get('client'))?.totalHits).toBe(200);
  });

  it('sets the window once on the first hit and never extends it', async () => {
    const redis = await client();
    const store = new RedisRateLimitStore(redis, `${RUN}:ttl`, 3_000);
    const key = `${RATE_LIMIT_KEY_NAMESPACE}:${RUN}:ttl:client`;

    await store.increment('client');
    const first = await redis.pttl(key);
    await new Promise((resolve) => setTimeout(resolve, 600));
    await store.increment('client');
    const second = await redis.pttl(key);

    expect(first).toBeGreaterThan(2_500);
    expect(first).toBeLessThanOrEqual(3_000);
    expect(second).toBeLessThan(first - 400);
  });

  it('repairs a counter that somehow lost its expiry instead of leaving it immortal', async () => {
    const redis = await client();
    const store = new RedisRateLimitStore(redis, `${RUN}:immortal`, 2_000);
    const key = `${RATE_LIMIT_KEY_NAMESPACE}:${RUN}:immortal:client`;
    await redis.set(key, '5'); // no TTL

    const result = await store.increment('client');

    expect(result.totalHits).toBe(6);
    const ttl = await redis.pttl(key);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(2_000);
  });

  it('starts a fresh window after expiry', async () => {
    const redis = await client();
    const store = new RedisRateLimitStore(redis, `${RUN}:expiry`, 400);
    await store.increment('client');
    await store.increment('client');

    await new Promise((resolve) => setTimeout(resolve, 700));

    await expect(store.get('client')).resolves.toBeUndefined();
    await expect(store.increment('client')).resolves.toMatchObject({ totalHits: 1 });
  });

  it('keeps limiter namespaces apart for the same client key', async () => {
    const redis = await client();
    const auth = new RedisRateLimitStore(redis, `${RUN}:auth`, 60_000);
    const global = new RedisRateLimitStore(redis, `${RUN}:global`, 60_000);

    for (let i = 0; i < 3; i += 1) await auth.increment('203.0.113.9');
    await global.increment('203.0.113.9');

    expect((await auth.get('203.0.113.9'))?.totalHits).toBe(3);
    expect((await global.get('203.0.113.9'))?.totalHits).toBe(1);
    expect(await redis.exists(`${RATE_LIMIT_KEY_NAMESPACE}:${RUN}:auth:203.0.113.9`)).toBe(1);
  });

  it('enforces one limit across two gateway replicas', async () => {
    const [a, b] = await Promise.all([client(), client()]);
    const replicas = [replica(a, `${RUN}:shared`, 5), replica(b, `${RUN}:shared`, 5)];

    const statuses = [];
    for (let i = 0; i < 7; i += 1) {
      statuses.push((await request(replicas[i % 2]).get('/ping')).status);
    }

    expect(statuses).toEqual([200, 200, 200, 200, 200, 429, 429]);
  });

  describe('Redis outage and recovery', () => {
    const redisContainer = () => dockerContainer('PHASE3_REDIS_CONTAINER');

    afterAll(() => {
      // Never leave the disposable container stopped for later suites.
      try { redisContainer().start(); } catch { /* already running */ }
    });

    it('fails closed with 503 while Redis is down and recovers after it returns', async () => {
      const redis = await client();
      trackRedisReadiness(redis);
      await waitFor(async () => redis.status === 'ready', { description: 'client ready' });
      const app = replica(redis, `${RUN}:outage`, 100);
      expect((await request(app).get('/ping')).status).toBe(200);

      const errorsBefore = rateLimitStoreErrorCount();
      redisContainer().stop();
      await waitFor(async () => redis.status !== 'ready', { description: 'client notices outage' });

      const down = await request(app).get('/ping');
      expect(down.status).toBe(503);
      expect(down.body).toEqual({ success: false, message: 'Request protection is temporarily unavailable' });
      expect(rateLimitStoreErrorCount()).toBeGreaterThan(errorsBefore);
      expect(isDependencyReady('redis')).toBe(false);

      redisContainer().start();
      await waitFor(async () => redis.status === 'ready', { timeoutMs: 60_000, intervalMs: 250, description: 'client reconnected' });
      expect(isDependencyReady('redis')).toBe(true);
      await waitFor(async () => (await request(app).get('/ping')).status === 200, { description: 'limiter serving again' });
    });

    it('never leaves a counter without an expiry across a Redis restart', async () => {
      const redis = await client();
      const store = new RedisRateLimitStore(redis, `${RUN}:restart`, 60_000);
      const key = `${RATE_LIMIT_KEY_NAMESPACE}:${RUN}:restart:client`;
      await store.increment('client');
      await store.increment('client');
      await redis.save().catch(() => undefined); // make persistence deterministic if RDB is enabled

      redisContainer().stop();
      redisContainer().start();
      await waitFor(async () => redis.status === 'ready', { timeoutMs: 60_000, intervalMs: 250, description: 'client reconnected' });

      // Rate-limit state is ephemeral: it may survive (with its original
      // absolute expiry) or be gone. It must never become immortal or grow.
      const total = await redis.get(key);
      if (total !== null) {
        expect(Number(total)).toBeLessThanOrEqual(2);
        const ttl = await redis.pttl(key);
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(60_000);
      }
      await expect(store.increment('client')).resolves.toMatchObject({ totalHits: total === null ? 1 : Number(total) + 1 });
    });
  });
});
