/**
 * RabbitMQ topology audit and classic-to-quorum migration helper.
 *
 *   npm run rabbitmq:topology -- audit [--vhost /]
 *       Read-only. Compares every declared queue with the production spec
 *       (type, durability, arguments, bindings) through the management API and
 *       exits 1 on any issue. Needs RABBITMQ_MANAGEMENT_URL.
 *
 *   npm run rabbitmq:topology -- move --from <queue> --to <queue> [--limit N]
 *       Moves messages with publisher confirms, acknowledging each source
 *       message only after its copy is confirmed. Needs RABBITMQ_URL.
 *
 * Neither command deletes a queue, a binding, or a message. Deleting an
 * emptied legacy queue is a deliberate operator step in the documented
 * procedure (docs/phase-3-reliability.md), never something this tool does.
 * Credentials are read from the environment and never printed.
 */
import { connect } from 'amqplib';
import { auditQueue, expectedQueueSpecs, moveQueueMessages } from '@nexacommerce/common';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function managementGet(path: string): Promise<any> {
  const raw = process.env.RABBITMQ_MANAGEMENT_URL;
  if (!raw) throw new Error('RABBITMQ_MANAGEMENT_URL is required (http://user:password@host:15672)');
  const url = new URL(raw);
  const auth = Buffer.from(`${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`).toString('base64');
  url.username = '';
  url.password = '';
  const response = await fetch(`${url.toString().replace(/\/$/, '')}/api${path}`, {
    headers: { authorization: `Basic ${auth}` },
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Management API ${path} returned ${response.status}`);
  return response.json();
}

async function audit(): Promise<number> {
  const vhost = encodeURIComponent(arg('vhost') ?? '/');
  const results = [];
  for (const spec of expectedQueueSpecs()) {
    const queue = await managementGet(`/queues/${vhost}/${encodeURIComponent(spec.name)}`);
    const bindings = queue ? await managementGet(`/queues/${vhost}/${encodeURIComponent(spec.name)}/bindings`) : [];
    results.push(auditQueue(spec, queue, bindings ?? []));
  }
  const failing = results.filter((result) => !result.ok);
  for (const result of results) {
    const status = result.ok ? 'OK  ' : 'FAIL';
    const detail = result.issues.map((issue) => `${issue.issue} (${issue.detail})`).join('; ');
    console.log(`${status} ${result.role.padEnd(11)} ${result.queue}${result.messages !== undefined ? ` [${result.messages} msg]` : ''}${detail ? ` - ${detail}` : ''}`);
  }
  console.log(`\n${results.length - failing.length}/${results.length} queues match the production topology.`);
  if (failing.some((result) => result.issues.some((issue) => issue.issue === 'CLASSIC_NEEDS_MIGRATION'))) {
    console.log('Classic queues found: follow "Classic-to-quorum migration" in docs/phase-3-reliability.md.');
  }
  return failing.length === 0 ? 0 : 1;
}

async function move(): Promise<number> {
  const from = arg('from');
  const to = arg('to');
  const limit = arg('limit') ? Number(arg('limit')) : undefined;
  if (!from || !to) throw new Error('move requires --from and --to');
  if (limit !== undefined && (!Number.isSafeInteger(limit) || limit <= 0)) throw new Error('--limit must be a positive integer');
  const url = process.env.RABBITMQ_URL;
  if (!url) throw new Error('RABBITMQ_URL is required');

  const connection = await connect(url);
  try {
    const channel = await connection.createConfirmChannel();
    const moved = await moveQueueMessages(channel, from, to, limit);
    const remaining = (await channel.checkQueue(from)).messageCount;
    console.log(`Moved ${moved} message(s) from ${from} to ${to}; ${remaining} ready message(s) remain in ${from}.`);
    return 0;
  } finally {
    await connection.close().catch(() => undefined);
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];
  const handlers: Record<string, () => Promise<number>> = { audit, move };
  const handler = handlers[command ?? ''];
  if (!handler) {
    console.error('Usage: rabbitmq-topology <audit|move> [options]');
    process.exitCode = 2;
    return;
  }
  process.exitCode = await handler();
}

main().catch((error) => {
  console.error(`rabbitmq-topology failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exitCode = 1;
});
