/**
 * RabbitMQ high-availability acceptance against the 3-node TLS staging cluster
 * in infra/ha (run `infra/ha/setup.sh` first).
 *
 * Proves what a single node cannot: quorum membership across nodes, message
 * safety while the queue leader dies, minority pausing under a network
 * partition, and a rolling restart with a backlog. Also proves the transport
 * and permission boundary: TLS-only listeners and per-service least-privilege
 * users. Every data-plane case runs in a disposable vhost.
 */
import fs from 'fs';
import https from 'https';
import net from 'net';
import crypto from 'crypto';
import { connect, ChannelModel, ConfirmChannel } from 'amqplib';
import { QUEUES } from '@nexacommerce/event-contracts';
import { haEnv, haService, waitFor } from '@nexacommerce/test-utils';
import { connectRabbitMQ, createConsumer, createPublisher, setupExchangeAndQueues } from '../../src/rabbitmq';
import { createResilientConsumer } from '../../src/resilient-consumer';

jest.setTimeout(420_000);

const NODES = [
  { service: 'rmq-1', ip: '172.29.10.11' },
  { service: 'rmq-2', ip: '172.29.10.12' },
  { service: 'rmq-3', ip: '172.29.10.13' },
];
const QUEUE = QUEUES.SHIPPING_ORDER_EVENTS; // bound to order.paid

const caFile = () => haEnv('HA_CA_FILE');
const vhost = `ha-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
const openConnections = new Set<ChannelModel>();

function mgmtOn(node: number, method: string, path: string, body?: unknown): Promise<any> {
  const url = new URL(haEnv('HA_RABBITMQ_MANAGEMENT_URL'));
  const auth = Buffer.from(`${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`).toString('base64');
  return new Promise((resolve, reject) => {
    const req = https.request({
      host: NODES[node].ip,
      port: Number(url.port),
      path: `/api${path}`,
      method,
      ca: fs.readFileSync(caFile()),
      headers: { authorization: `Basic ${auth}`, 'content-type': 'application/json' },
      timeout: 10_000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if ((res.statusCode ?? 500) >= 400 && !(method === 'GET' && res.statusCode === 404)) {
          reject(new Error(`management ${method} ${path}: ${res.statusCode}`));
        } else {
          resolve(data ? JSON.parse(data) : undefined);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('management request timed out')));
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

/** Admin URLs for every node, retargeted at the disposable vhost. */
function adminUrls(order: number[] = [0, 1, 2]): string {
  const urls = haEnv('HA_RABBITMQ_ADMIN_URLS').split(',');
  return order.map((index) => urls[index].replace(/\/nexacommerce$/, `/${encodeURIComponent(vhost)}`)).join(',');
}

async function open(urls = adminUrls()): Promise<{ connection: ChannelModel; channel: ConfirmChannel }> {
  const connection = await connectRabbitMQ(urls, 30, 500);
  connection.on('error', () => undefined);
  openConnections.add(connection);
  connection.on('close', () => openConnections.delete(connection));
  const channel = await connection.createConfirmChannel();
  channel.on('error', () => undefined);
  return { connection, channel };
}

/** Management API on the first node that answers (any node can serve it). */
async function mgmt(method: string, path: string, body?: unknown): Promise<any> {
  let lastError: unknown;
  for (let node = 0; node < NODES.length; node += 1) {
    try {
      return await mgmtOn(node, method, path, body);
    } catch (error) {
      lastError = error;
      if (!/EHOSTUNREACH|ECONNREFUSED|ECONNRESET|timed out|503/.test(String(error))) throw error;
    }
  }
  throw lastError;
}

async function queueInfo() {
  return mgmt('GET', `/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(QUEUE)}`);
}

/** Bring every node back and reconnected, whatever a previous case did. */
function heal(): void {
  for (const node of NODES) {
    const service = haService(node.service);
    try { service.start(); } catch { /* already running */ }
    try { service.connect(node.ip); } catch { /* already connected */ }
  }
}

async function clusterHealthy(): Promise<boolean> {
  const nodes = await mgmt('GET', '/nodes').catch(() => undefined);
  if (!Array.isArray(nodes) || nodes.filter((node: any) => node.running).length !== 3) return false;
  const queue = await queueInfo().catch(() => undefined);
  return Array.isArray(queue?.online) && queue.online.length === 3;
}

function eventFor(id: string) {
  return { eventId: id, eventName: 'OrderPaid', timestamp: new Date().toISOString(), payload: { orderId: `order-${id}` } };
}

/**
 * Publish `ids` with confirms, reconnecting and republishing anything whose
 * confirm did not arrive. At-least-once: duplicates are possible, loss is not.
 */
async function publishAll(ids: string[], urls = adminUrls(), onProgress?: (confirmed: number) => void): Promise<number> {
  let session = await open(urls);
  let republished = 0;
  for (let i = 0; i < ids.length; i += 1) {
    for (;;) {
      try {
        await createPublisher(session.channel)('order.paid', eventFor(ids[i]));
        break;
      } catch {
        republished += 1;
        await session.connection.close().catch(() => undefined);
        session = await open(urls);
      }
    }
    onProgress?.(i + 1);
  }
  await session.connection.close().catch(() => undefined);
  return republished;
}

async function drainIds(expected: number): Promise<Set<string>> {
  const seen = new Set<string>();
  const { connection, channel } = await open();
  await createConsumer(channel, QUEUE, async (payload) => { seen.add(payload.eventId); });
  await waitFor(async () => seen.size >= expected, { timeoutMs: 120_000, description: `${expected} unique messages` });
  await connection.close().catch(() => undefined);
  return seen;
}

describe('RabbitMQ 3-node cluster (HA staging)', () => {
  beforeAll(async () => {
    heal();
    await waitFor(async () => (await mgmt('GET', '/nodes').catch(() => []))
      .filter((node: any) => node.running).length === 3, { timeoutMs: 180_000, intervalMs: 1_000, description: 'three running nodes' });
    // Remove disposable vhosts left by an interrupted earlier run.
    for (const stale of (await mgmt('GET', '/vhosts')).map((entry: any) => entry.name).filter((name: string) => name.startsWith('ha-'))) {
      await mgmt('DELETE', `/vhosts/${encodeURIComponent(stale)}`).catch(() => undefined);
    }
    await mgmt('PUT', `/vhosts/${encodeURIComponent(vhost)}`, { description: 'HA acceptance, disposable' });
    const admin = decodeURIComponent(new URL(haEnv('HA_RABBITMQ_MANAGEMENT_URL')).username);
    await mgmt('PUT', `/permissions/${encodeURIComponent(vhost)}/${encodeURIComponent(admin)}`, { configure: '.*', write: '.*', read: '.*' });
    const { connection, channel } = await open();
    await setupExchangeAndQueues(channel, 'declare');
    await connection.close();
  });

  afterEach(async () => {
    await Promise.all([...openConnections].map((connection) => connection.close().catch(() => undefined)));
    heal();
    await waitFor(clusterHealthy, { timeoutMs: 180_000, intervalMs: 1_000, description: 'cluster healthy between cases' });
    const { connection, channel } = await open();
    await channel.purgeQueue(QUEUE);
    await connection.close();
  });

  afterAll(async () => {
    await Promise.all([...openConnections].map((connection) => connection.close().catch(() => undefined)));
    await mgmt('DELETE', `/vhosts/${encodeURIComponent(vhost)}`).catch(() => undefined);
  });

  it('runs three nodes and replicates every quorum queue to all of them', async () => {
    const nodes = await mgmt('GET', '/nodes');
    expect(nodes.filter((node: any) => node.running).map((node: any) => node.name).sort())
      .toEqual(['rabbit@rmq-1', 'rabbit@rmq-2', 'rabbit@rmq-3']);
    const queue = await queueInfo();
    expect(queue.type).toBe('quorum');
    expect([...queue.members].sort()).toEqual(['rabbit@rmq-1', 'rabbit@rmq-2', 'rabbit@rmq-3']);
    expect(queue.online).toHaveLength(3);
  });

  it('accepts only verified TLS connections', async () => {
    // No plaintext AMQP listener.
    await expect(new Promise((resolve, reject) => {
      const socket = net.connect(5672, NODES[0].ip);
      socket.once('connect', () => { socket.destroy(); resolve('open'); });
      socket.once('error', reject);
    })).rejects.toThrow(/ECONNREFUSED/);

    // A client that does not trust the staging CA is refused by verification.
    const foreignCa = fs.readFileSync(fs.readdirSync('/etc/ssl/certs').filter((f) => f.endsWith('.pem')).map((f) => `/etc/ssl/certs/${f}`)[0]);
    const url = adminUrls([0]);
    await expect(connect(url, { ca: [foreignCa], rejectUnauthorized: true })).rejects.toThrow(/certificate|self.signed|unable to verify/i);
  });

  it('confines a service user to publishing events and reading its own queues', async () => {
    const orderUrls = haEnv('HA_RABBITMQ_ORDER_URLS');
    const tryChannel = async (fn: (channel: ConfirmChannel) => Promise<unknown>) => {
      const connection = await connectRabbitMQ(orderUrls, 3, 500);
      connection.on('error', () => undefined);
      const channel = await connection.createConfirmChannel();
      channel.on('error', () => undefined);
      try {
        return await fn(channel);
      } finally {
        await connection.close().catch(() => undefined);
      }
    };

    // Passive verification works; declaring topology needs `configure`, which it lacks.
    await expect(tryChannel((channel) => setupExchangeAndQueues(channel, 'verify'))).resolves.toBeUndefined();
    await expect(tryChannel((channel) => setupExchangeAndQueues(channel, 'declare'))).rejects.toThrow(/ACCESS_REFUSED/);
    // Its own queue is readable; another service's queue is not.
    await expect(tryChannel((channel) => channel.consume(QUEUES.ORDER_PAYMENT_EVENTS, () => undefined))).resolves.toBeDefined();
    await expect(tryChannel((channel) => channel.consume(QUEUES.NOTIFICATION_EVENTS, () => undefined))).rejects.toThrow(/ACCESS_REFUSED/);
    // It may publish events (an unroutable key leaves nothing behind).
    await expect(tryChannel((channel) => createPublisher(channel)('ha.acl.probe', eventFor('acl-probe')))).resolves.toBe(true);
  });

  it('loses no confirmed message while the queue leader is killed mid-stream', async () => {
    const leader = String((await queueInfo()).leader); // e.g. rabbit@rmq-2
    const leaderIndex = NODES.findIndex((node) => leader.endsWith(node.service));
    const others = [0, 1, 2].filter((index) => index !== leaderIndex);
    const ids = Array.from({ length: 1500 }, (_, i) => `leader-loss-${i}`);

    const received = new Map<string, number>();
    const consumer = createResilientConsumer({
      url: adminUrls([leaderIndex, ...others]), // consumer starts on the doomed node
      name: 'ha-leader-loss',
      reconnectIntervalMs: 500,
      setup: async (channel) => {
        await createConsumer(channel, QUEUE, async (payload) => {
          received.set(payload.eventId, (received.get(payload.eventId) ?? 0) + 1);
        });
      },
    });
    await consumer.start();

    let killed = false;
    let republished = 0;
    let newLeader = '';
    try {
      republished = await publishAll(ids, adminUrls([leaderIndex, ...others]), (confirmed) => {
        if (confirmed === 300 && !killed) {
          killed = true;
          haService(NODES[leaderIndex].service).stop();
        }
      });
      await waitFor(async () => ids.every((id) => received.has(id)), {
        timeoutMs: 180_000,
        description: `every id consumed (have ${received.size})`,
      });
      newLeader = String((await queueInfo()).leader);
    } finally {
      await consumer.stop();
      haService(NODES[leaderIndex].service).start();
    }

    expect(killed).toBe(true);
    expect(newLeader).not.toBe(leader);
    expect(ids.filter((id) => !received.has(id))).toEqual([]);
    // Duplicates are the price of at-least-once; consumers dedupe with the inbox.
    const duplicates = [...received.values()].filter((count) => count > 1).length;
    console.log(`[HA] leader ${leader} killed after 300 confirms; new leader ${newLeader}; republished=${republished}; duplicate deliveries=${duplicates}`);
  });

  it('pauses the minority side of a partition while the majority keeps serving, then heals without loss', async () => {
    const isolated = haService('rmq-3');
    const ids = Array.from({ length: 400 }, (_, i) => `partition-${i}`);
    isolated.disconnect();
    try {
      // The majority (rmq-1, rmq-2) keeps accepting confirmed publishes.
      await publishAll(ids, adminUrls([0, 1]));
      await waitFor(async () => {
        const nodes = await mgmt('GET', '/nodes');
        return nodes.find((node: any) => node.name === 'rabbit@rmq-3')?.running === false;
      }, { timeoutMs: 90_000, intervalMs: 1_000, description: 'majority sees rmq-3 as down' });
    } finally {
      isolated.connect('172.29.10.13');
    }

    await waitFor(clusterHealthy, { timeoutMs: 180_000, intervalMs: 1_000, description: 'partition healed, 3 members online' });
    const seen = await drainIds(ids.length);
    expect(ids.filter((id) => !seen.has(id))).toEqual([]);
  });

  it('keeps a backlog through a rolling restart of every node', async () => {
    const ids = Array.from({ length: 500 }, (_, i) => `rolling-${i}`);
    await publishAll(ids);

    for (const node of NODES) {
      haService(node.service).restart();
      await waitFor(clusterHealthy, { timeoutMs: 180_000, intervalMs: 1_000, description: `${node.service} rejoined` });
    }

    const seen = await drainIds(ids.length);
    expect(seen.size).toBe(ids.length);
  });
});
