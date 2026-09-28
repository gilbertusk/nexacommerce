import request from 'supertest';
import type { Express } from 'express';
import { parseTrustProxy } from '../src/trust-proxy';

/**
 * The login limiter allows 20 attempts per window per client key. These cases
 * drive the real gateway app (in-memory limiter store under NODE_ENV=test) from
 * 127.0.0.1, which stands in for either a direct client or the trusted proxy.
 */
const LOGIN = '/api/v1/auth/login';
const LOGIN_LIMIT = 20;

function loadGateway(trustProxy: string | undefined): Express {
  let app!: Express;
  const previous = process.env.TRUST_PROXY;
  if (trustProxy === undefined) delete process.env.TRUST_PROXY;
  else process.env.TRUST_PROXY = trustProxy;
  jest.isolateModules(() => {
    app = require('../src/app').default;
  });
  if (previous === undefined) delete process.env.TRUST_PROXY;
  else process.env.TRUST_PROXY = previous;
  return app;
}

async function attempt(app: Express, forwardedFor?: string) {
  const req = request(app).post(LOGIN).send({ email: 'someone@example.test', password: 'x' });
  if (forwardedFor) req.set('X-Forwarded-For', forwardedFor);
  const res = await req;
  return { status: res.status, remaining: Number(res.headers['ratelimit-remaining']) };
}

describe('parseTrustProxy', () => {
  it('defaults to not trusting any proxy', () => {
    expect(parseTrustProxy(undefined)).toBe(false);
    expect(parseTrustProxy('')).toBe(false);
    expect(parseTrustProxy('false')).toBe(false);
  });

  it('accepts a bounded hop count and explicit proxy ranges', () => {
    expect(parseTrustProxy('1')).toBe(1);
    expect(parseTrustProxy('10.0.0.0/8, loopback ,2001:db8::/32')).toEqual(['10.0.0.0/8', 'loopback', '2001:db8::/32']);
  });

  it('refuses settings that let clients choose their own address', () => {
    expect(() => parseTrustProxy('true')).toThrow(/X-Forwarded-For/);
    expect(() => parseTrustProxy('all')).toThrow();
    expect(() => parseTrustProxy('0')).toThrow(/between 1 and 10/);
    expect(() => parseTrustProxy('10.0.0.0/33')).toThrow(/not an IP address/);
    expect(() => parseTrustProxy('proxy.internal')).toThrow(/not an IP address/);
  });
});

describe('gateway client identity for rate limiting', () => {
  jest.setTimeout(60_000);

  it('ignores a spoofed X-Forwarded-For on a direct request', async () => {
    const app = loadGateway(undefined);
    const results = [];
    for (let i = 0; i <= LOGIN_LIMIT; i += 1) {
      results.push(await attempt(app, `198.51.100.${i}`));
    }
    // Every forged address counted against the one real peer.
    expect(results.slice(0, LOGIN_LIMIT).every((r) => r.status !== 429)).toBe(true);
    expect(results[LOGIN_LIMIT].status).toBe(429);
  });

  it('keeps customers behind a trusted proxy apart instead of collapsing them onto the proxy address', async () => {
    const app = loadGateway('loopback');
    const results = [];
    for (let i = 0; i <= LOGIN_LIMIT + 5; i += 1) {
      results.push(await attempt(app, `198.51.100.${i}`));
    }
    expect(results.every((r) => r.status !== 429)).toBe(true);
    expect(results.every((r) => r.remaining === LOGIN_LIMIT - 1)).toBe(true);
  });

  it.each([['loopback'], ['1']])(
    'does not let a client behind the trusted proxy (%s) choose its key by prepending forged hops',
    async (setting) => {
      const app = loadGateway(setting);
      const results = [];
      for (let i = 0; i <= LOGIN_LIMIT; i += 1) {
        // The attacker controls everything left of the address the proxy appended.
        results.push(await attempt(app, `10.66.${i}.1, 203.0.113.9`));
      }
      expect(results[LOGIN_LIMIT].status).toBe(429);
    },
  );
});
