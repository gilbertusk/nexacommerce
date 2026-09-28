/**
 * Helpers for live RabbitMQ/Redis acceptance suites.
 *
 * Every RabbitMQ suite runs inside its own freshly created virtual host, so the
 * real production topology (exchange, quorum queues, retry and DLQ queues) can
 * be declared with its production names without touching any other queue on
 * the broker. Cleanup deletes only that vhost.
 *
 * These helpers throw when the required environment is missing: a live suite
 * that silently skips would be worthless as acceptance evidence.
 */
import { execFileSync } from 'child_process';
import crypto from 'crypto';

export function requireLiveEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for live broker acceptance tests (see docs/phase-3-reliability.md)`);
  }
  return value;
}

export async function waitFor<T>(
  probe: () => Promise<T | undefined | false | null>,
  { timeoutMs = 20_000, intervalMs = 100, description = 'condition' } = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const value = await probe();
      if (value) return value as T;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  const reason = lastError instanceof Error ? `: ${lastError.message}` : '';
  throw new Error(`Timed out after ${timeoutMs}ms waiting for ${description}${reason}`);
}

interface ManagementEndpoint {
  baseUrl: string;
  authorization: string;
  user: string;
}

function managementEndpoint(): ManagementEndpoint {
  const url = new URL(requireLiveEnv('RABBITMQ_MANAGEMENT_URL'));
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  url.username = '';
  url.password = '';
  return {
    baseUrl: url.toString().replace(/\/$/, ''),
    authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`,
    user,
  };
}

async function management(method: string, path: string, body?: unknown): Promise<any> {
  const endpoint = managementEndpoint();
  const response = await fetch(`${endpoint.baseUrl}/api${path}`, {
    method,
    headers: { authorization: endpoint.authorization, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 404 && method === 'GET') return undefined;
  if (!response.ok) {
    throw new Error(`RabbitMQ management ${method} ${path} failed with ${response.status}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

export interface IsolatedVhost {
  vhost: string;
  amqpUrl: string;
  queue(name: string): Promise<any>;
  queueBindings(name: string): Promise<Array<{ source: string; routing_key: string }>>;
  setPolicy(name: string, definition: Record<string, unknown>, pattern: string): Promise<void>;
  deletePolicy(name: string): Promise<void>;
  deleteExchange(name: string): Promise<void>;
  cleanup(): Promise<void>;
}

/** A unique acceptance vhost name; deterministic callers can pre-compute it. */
export function acceptanceVhostName(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

/** AMQP URL for `vhost` on the live broker. */
export function liveAmqpUrl(vhost: string): string {
  const base = new URL(requireLiveEnv('RABBITMQ_LIVE_URL'));
  base.pathname = `/${encodeURIComponent(vhost)}`;
  return base.toString();
}

/**
 * Create a throwaway vhost with full permissions for the management user.
 * Pass `name` when a service must learn its broker URL before the vhost exists
 * (service config is read from the environment at import time).
 */
export async function createIsolatedVhost(prefix: string, name?: string): Promise<IsolatedVhost> {
  const vhost = name ?? acceptanceVhostName(prefix);
  const encoded = encodeURIComponent(vhost);
  const { user } = managementEndpoint();

  await management('PUT', `/vhosts/${encoded}`, { description: 'Phase 3 disposable acceptance vhost' });
  await management('PUT', `/permissions/${encoded}/${encodeURIComponent(user)}`, {
    configure: '.*',
    write: '.*',
    read: '.*',
  });

  return {
    vhost,
    amqpUrl: liveAmqpUrl(vhost),
    queue: (name) => management('GET', `/queues/${encoded}/${encodeURIComponent(name)}`),
    queueBindings: async (name) => (await management('GET', `/queues/${encoded}/${encodeURIComponent(name)}/bindings`)) ?? [],
    async setPolicy(name, definition, pattern) {
      await management('PUT', `/policies/${encoded}/${encodeURIComponent(name)}`, {
        pattern,
        definition,
        'apply-to': 'queues',
        priority: 10,
      });
    },
    async deletePolicy(name) {
      await management('DELETE', `/policies/${encoded}/${encodeURIComponent(name)}`);
    },
    async deleteExchange(name) {
      await management('DELETE', `/exchanges/${encoded}/${encodeURIComponent(name)}`);
    },
    async cleanup() {
      await management('DELETE', `/vhosts/${encoded}`).catch(() => undefined);
    },
  };
}

/** List vhosts created by these suites (for leak checks). */
export async function listAcceptanceVhosts(prefix: string): Promise<string[]> {
  const vhosts = (await management('GET', '/vhosts')) as Array<{ name: string }>;
  return vhosts.map((entry) => entry.name).filter((name) => name.startsWith(prefix));
}

/**
 * Control the disposable broker container named by `PHASE3_RABBITMQ_CONTAINER`
 * (or `PHASE3_REDIS_CONTAINER`). Only a container name supplied explicitly for
 * the acceptance run is ever touched.
 */
export function dockerContainer(envName: 'PHASE3_RABBITMQ_CONTAINER' | 'PHASE3_REDIS_CONTAINER') {
  const name = requireLiveEnv(envName);
  if (!/^phase3-test-[a-z0-9-]+$/.test(name)) {
    throw new Error(`${envName} must name a disposable phase3-test-* container`);
  }
  const run = (...args: string[]) => execFileSync('docker', [...args, name], { stdio: 'pipe', timeout: 120_000 });
  return {
    name,
    restart: () => run('restart'),
    stop: () => run('stop'),
    start: () => run('start'),
  };
}
