import fs from 'fs';
import net from 'net';

/**
 * Connection settings for highly available RabbitMQ and Redis deployments.
 *
 * Everything is read from the environment so a single-node development setup
 * needs no change, while production can list several broker nodes, use
 * Sentinel for Redis failover, and require TLS. Connection strings and
 * credentials are never logged by these helpers.
 */

type Env = Record<string, string | undefined>;

function readFileEnv(env: Env, name: string): Buffer | undefined {
  const path = env[name];
  if (!path) return undefined;
  return fs.readFileSync(path);
}

/**
 * `RABBITMQ_URL` may list several nodes separated by commas, e.g.
 * `amqps://svc:pw@rmq-1:5671/prod,amqps://svc:pw@rmq-2:5671/prod`. The client
 * connects to the first reachable node; quorum queues are served by the
 * cluster regardless of which node the client is attached to.
 */
export function rabbitEndpoints(url: string): string[] {
  const endpoints = url.split(',').map((entry) => entry.trim()).filter(Boolean);
  if (endpoints.length === 0) throw new Error('RABBITMQ_URL must contain at least one broker URL');
  return endpoints;
}

/**
 * TLS socket options for `amqps://` endpoints:
 * `RABBITMQ_TLS_CA_FILE` (required to trust a private CA) and, for mutual TLS,
 * `RABBITMQ_TLS_CERT_FILE` / `RABBITMQ_TLS_KEY_FILE`. Certificate verification
 * is never disabled.
 */
export function rabbitSocketOptions(endpoint: string, env: Env = process.env): Record<string, unknown> {
  if (!endpoint.startsWith('amqps://')) return {};
  const host = new URL(endpoint).hostname.replace(/^\[|\]$/g, '');
  const options: Record<string, unknown> = {
    // SNI takes a DNS name only; an IP endpoint is verified against IP SANs.
    ...(net.isIP(host) ? {} : { servername: host }),
    rejectUnauthorized: true,
  };
  const ca = readFileEnv(env, 'RABBITMQ_TLS_CA_FILE');
  const cert = readFileEnv(env, 'RABBITMQ_TLS_CERT_FILE');
  const key = readFileEnv(env, 'RABBITMQ_TLS_KEY_FILE');
  if (ca) options.ca = [ca];
  if (cert) options.cert = cert;
  if (key) options.key = key;
  return options;
}

export interface RedisConnectionSettings {
  /** Direct-mode URL; absent in Sentinel mode. */
  url?: string;
  /** ioredis options to merge with the caller's own (timeouts, retry policy). */
  options: Record<string, unknown>;
}

function parseHostPort(entry: string): { host: string; port: number } {
  const index = entry.lastIndexOf(':');
  const host = index > 0 ? entry.slice(0, index) : entry;
  const port = index > 0 ? Number(entry.slice(index + 1)) : 26379;
  if (!host || !Number.isSafeInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`REDIS_SENTINELS entry "${entry}" must be host:port`);
  }
  return { host: host.replace(/^\[|\]$/g, ''), port };
}

/**
 * Redis settings for direct or Sentinel mode.
 *
 * Direct: `REDIS_URL` (`redis://` or `rediss://user:password@host:port/db`).
 * Sentinel: additionally set `REDIS_SENTINELS=host:26379,host:26379,...` and
 * `REDIS_SENTINEL_NAME`; the ACL user, password, and database still come from
 * `REDIS_URL`, and `REDIS_SENTINEL_PASSWORD` authenticates to the Sentinels.
 * The client follows a failover to the newly promoted primary.
 *
 * TLS: a `rediss://` URL enables TLS; `REDIS_TLS_CA_FILE` trusts a private CA
 * (and is also used for Sentinel connections). Verification stays on.
 */
export function redisConnectionSettings(url: string, env: Env = process.env): RedisConnectionSettings {
  const parsed = new URL(url);
  const useTls = parsed.protocol === 'rediss:';
  const ca = readFileEnv(env, 'REDIS_TLS_CA_FILE');
  const tls = useTls ? { rejectUnauthorized: true, ...(ca ? { ca: [ca] } : {}) } : undefined;

  const sentinels = (env.REDIS_SENTINELS ?? '').split(',').map((entry) => entry.trim()).filter(Boolean);
  if (sentinels.length === 0) {
    return { url, options: tls ? { tls } : {} };
  }

  const name = env.REDIS_SENTINEL_NAME;
  if (!name) throw new Error('REDIS_SENTINEL_NAME is required when REDIS_SENTINELS is set');
  const db = parsed.pathname && parsed.pathname !== '/' ? Number(parsed.pathname.slice(1)) : 0;

  return {
    options: {
      sentinels: sentinels.map(parseHostPort),
      name,
      ...(parsed.username ? { username: decodeURIComponent(parsed.username) } : {}),
      ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
      ...(env.REDIS_SENTINEL_USERNAME ? { sentinelUsername: env.REDIS_SENTINEL_USERNAME } : {}),
      ...(env.REDIS_SENTINEL_PASSWORD ? { sentinelPassword: env.REDIS_SENTINEL_PASSWORD } : {}),
      db: Number.isSafeInteger(db) ? db : 0,
      ...(tls ? { tls, sentinelTLS: tls, enableTLSForSentinelMode: true } : {}),
    },
  };
}
