/**
 * Redis high-availability acceptance against the Sentinel staging topology in
 * infra/ha (primary + 2 replicas + 3 Sentinels, TLS-only, ACL default-deny,
 * noeviction). Run `infra/ha/setup.sh` first.
 *
 * Uses the production limiter client factory in Sentinel mode, so what is
 * proven is the gateway's own behavior through a real failover.
 */
import fs from 'fs';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';
import Redis from 'ioredis';
import { haEnv, haService, waitFor } from '@nexacommerce/test-utils';
import {
  createRateLimitRedisClient,
  rateLimitStoreErrorHandler,
  RedisRateLimitStore,
} from '../../src/redis/rate-limit-store';

jest.setTimeout(300_000);

const PRIMARY_IP_TO_SERVICE: Record<string, string> = {
  '172.29.10.21': 'redis-primary',
  '172.29.10.22': 'redis-replica-1',
  '172.29.10.23': 'redis-replica-2',
};
const clients: Redis[] = [];
/** Per-run limiter namespace so no case depends on counters left by another run. */
const RUN = `ha-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const tls = () => ({ ca: [fs.readFileSync(haEnv('HA_CA_FILE'))], rejectUnauthorized: true });

function track<T extends Redis>(client: T): T {
  client.on('error', () => undefined);
  clients.push(client);
  return client;
}

/** A direct TLS client to one node, authenticated as `url`'s ACL user. */
function direct(host: string, url?: string, extra: Record<string, unknown> = {}): Redis {
  const parsed = url ? new URL(url) : undefined;
  return track(new Redis({
    host,
    port: 6379,
    tls: tls(),
    ...(parsed ? { username: decodeURIComponent(parsed.username), password: decodeURIComponent(parsed.password) } : {}),
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
    connectTimeout: 3_000,
    ...extra,
  }));
}

function sentinel(): Redis {
  return track(new Redis({
    host: '172.29.10.31',
    port: 26379,
    tls: tls(),
    password: haEnv('HA_REDIS_SENTINEL_PASSWORD'),
    lazyConnect: true,
    retryStrategy: () => null,
  }));
}

async function currentPrimaryIp(): Promise<string> {
  const client = sentinel();
  await client.connect();
  const [ip] = (await client.call('SENTINEL', 'get-master-addr-by-name', haEnv('HA_REDIS_SENTINEL_NAME'))) as string[];
  client.disconnect(); // Sentinel has no QUIT command
  return ip;
}

function limiterApp(redis: Redis, prefix: string, max = 10_000): Express {
  const app = express();
  app.use(rateLimit({
    windowMs: 60_000,
    max,
    store: new RedisRateLimitStore(redis, prefix, 60_000),
    passOnStoreError: false,
    standardHeaders: true,
    legacyHeaders: false,
  }));
  app.get('/ping', (_req, res) => res.status(200).json({ ok: true }));
  app.use(rateLimitStoreErrorHandler);
  return app;
}

describe('Redis Sentinel topology (HA staging)', () => {
  beforeAll(() => {
    // The production factory reads these, exactly as a deployed gateway would.
    process.env.REDIS_SENTINELS = haEnv('HA_REDIS_SENTINELS');
    process.env.REDIS_SENTINEL_NAME = haEnv('HA_REDIS_SENTINEL_NAME');
    process.env.REDIS_SENTINEL_PASSWORD = haEnv('HA_REDIS_SENTINEL_PASSWORD');
    process.env.REDIS_TLS_CA_FILE = haEnv('HA_CA_FILE');
  });

  afterAll(async () => {
    for (const service of ['redis-primary', 'redis-replica-1', 'redis-replica-2']) {
      try { haService(service).start(); } catch { /* already running */ }
    }
    await Promise.all(clients.map(async (client) => {
      if (client.status === 'ready') await client.quit().catch(() => client.disconnect());
      else client.disconnect();
    }));
    // ioredis destroys a stream that did not close (e.g. to a stopped node)
    // after its 2 s disconnectTimeout; let that bounded timer finish.
    await new Promise((resolve) => setTimeout(resolve, 2_500));
  });

  it('refuses plaintext and untrusted TLS clients', async () => {
    const plain = track(new Redis({ host: '172.29.10.21', port: 6379, lazyConnect: true, retryStrategy: () => null, connectTimeout: 2_000, maxRetriesPerRequest: 0 }));
    await expect(plain.connect().then(() => plain.ping())).rejects.toThrow();

    const foreignCa = fs.readFileSync(fs.readdirSync('/etc/ssl/certs').filter((f) => f.endsWith('.pem')).map((f) => `/etc/ssl/certs/${f}`)[0]);
    const untrusted = new Redis({ host: '172.29.10.21', port: 6379, tls: { ca: [foreignCa] }, lazyConnect: true, retryStrategy: () => null, maxRetriesPerRequest: 0 });
    const errors: string[] = [];
    untrusted.on('error', (error) => errors.push(error.message));
    clients.push(untrusted);
    await expect(untrusted.connect()).rejects.toThrow();
    // ioredis reports the TLS verification failure on its error channel.
    expect(errors.join(' ')).toMatch(/certificate|verify|self.signed/i);
  });

  it('denies by default and scopes each service to its own key prefix', async () => {
    const primary = await currentPrimaryIp();

    // No ready check: the INFO it sends is itself refused for an anonymous client.
    const anonymous = direct(primary, undefined, { enableReadyCheck: false });
    await anonymous.connect();
    await expect(anonymous.ping()).rejects.toThrow(/NOAUTH|WRONGPASS|default/i);

    const gateway = direct(primary, haEnv('HA_REDIS_GATEWAY_URL'));
    await gateway.connect();
    await expect(gateway.incr(`rate-limit:${RUN}:acl`)).resolves.toBeGreaterThan(0);
    await expect(gateway.get('cart:someone')).rejects.toThrow(/NOPERM/);
    await expect(gateway.call('FLUSHALL')).rejects.toThrow(/NOPERM/);
    await expect(gateway.call('FLUSHDB')).rejects.toThrow(/NOPERM/);
    await expect(gateway.call('KEYS', '*')).rejects.toThrow(/NOPERM/);
    await expect(gateway.call('CONFIG', 'GET', 'maxmemory')).rejects.toThrow(/NOPERM/);

    const cart = direct(primary, haEnv('HA_REDIS_CART_URL'));
    await cart.connect();
    await expect(cart.set(`cart:${RUN}`, '{}', 'EX', 60)).resolves.toBe('OK');
    await expect(cart.incr(`rate-limit:${RUN}:acl`)).rejects.toThrow(/NOPERM/);
  });

  it('fails closed with 503 when memory is exhausted (noeviction) instead of evicting counters', async () => {
    const primary = await currentPrimaryIp();
    const admin = direct(primary, haEnv('HA_REDIS_ADMIN_URL'));
    await admin.connect();
    expect(await admin.call('CONFIG', 'GET', 'maxmemory-policy')).toEqual(['maxmemory-policy', 'noeviction']);

    const limiter = createRateLimitRedisClient(haEnv('HA_REDIS_GATEWAY_URL'));
    track(limiter);
    await limiter.connect();
    const app = limiterApp(limiter, `${RUN}:oom`);
    expect((await request(app).get('/ping')).status).toBe(200);

    await admin.call('CONFIG', 'SET', 'maxmemory', '1');
    try {
      const refused = await request(app).get('/ping');
      expect(refused.status).toBe(503);
    } finally {
      await admin.call('CONFIG', 'SET', 'maxmemory', '64mb');
    }
    expect((await request(app).get('/ping')).status).toBe(200);
  });

  it('follows a Sentinel failover when the primary dies and keeps enforcing limits', async () => {
    const limiter = createRateLimitRedisClient(haEnv('HA_REDIS_GATEWAY_URL'));
    track(limiter);
    await limiter.connect();
    const app = limiterApp(limiter, `${RUN}:failover`, 5);

    const before = await currentPrimaryIp();
    // Two requests counted before the failure.
    expect((await request(app).get('/ping').set('X-Test', '1')).status).toBe(200);
    expect((await request(app).get('/ping')).status).toBe(200);

    const primaryService = PRIMARY_IP_TO_SERVICE[before];
    const started = Date.now();
    haService(primaryService).stop();

    // Sentinel promotes a replica; the client follows it. Requests during the
    // switch are refused (503), never waved through.
    const statuses: number[] = [];
    await waitFor(async () => {
      const status = (await request(app).get('/ping')).status;
      statuses.push(status);
      return status === 200 || status === 429;
    }, { timeoutMs: 60_000, intervalMs: 500, description: 'limiter serving from the promoted primary' });
    const failoverSeconds = (Date.now() - started) / 1000;

    const after = await currentPrimaryIp();
    expect(after).not.toBe(before);
    expect(statuses.every((status) => [503, 200, 429].includes(status))).toBe(true);

    // The limit is still enforced on the new primary (async replication may
    // lose the last pre-failure increments, so the exact count can reset).
    const burst: number[] = [];
    for (let i = 0; i < 8; i += 1) burst.push((await request(app).get('/ping')).status);
    expect(burst).toContain(429);

    // The old primary returns as a replica of the new one.
    haService(primaryService).start();
    const admin = direct(before, haEnv('HA_REDIS_ADMIN_URL'), { retryStrategy: (n: number) => (n > 40 ? null : 500) });
    await waitFor(async () => {
      if (admin.status !== 'ready') await admin.connect().catch(() => undefined);
      const info = await admin.info('replication').catch(() => '');
      return /role:slave/.test(info) && info.includes(`master_host:${after}`);
    }, { timeoutMs: 90_000, intervalMs: 1_000, description: 'old primary rejoined as replica' });

    console.log(`[HA] Redis failover ${before} -> ${after} in ${failoverSeconds.toFixed(1)}s; statuses during switch: ${[...new Set(statuses)].join(',')}`);
  });
});
