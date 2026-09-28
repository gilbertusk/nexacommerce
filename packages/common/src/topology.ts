import type { ConfirmChannel, GetMessage } from 'amqplib';
import { EXCHANGE_NAME, QUEUE_BINDINGS } from '@nexacommerce/event-contracts';

/**
 * The broker topology the services declare, as data. Used by the read-only
 * topology audit and the classic-to-quorum migration tooling so both check
 * against exactly what `setupExchangeAndQueues` asserts.
 */
export const TOPOLOGY_RETRY_EXCHANGE = `${EXCHANGE_NAME}.retry`;
export const TOPOLOGY_DEAD_LETTER_EXCHANGE = `${EXCHANGE_NAME}.dead`;
export const TOPOLOGY_RETRY_DELAY_MS = 5_000;
export const TOPOLOGY_DELIVERY_LIMIT = 20;

export interface QueueSpec {
  name: string;
  role: 'main' | 'retry' | 'dead-letter';
  arguments: Record<string, unknown>;
  bindings: Array<{ exchange: string; routingKey: string }>;
}

export function retryQueueName(queue: string, routingKey: string): string {
  return `${queue}.retry.${routingKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

export function retryRoutingKey(queue: string, routingKey: string): string {
  return `${queue}.${routingKey}`;
}

export function expectedQueueSpecs(): QueueSpec[] {
  const specs: QueueSpec[] = [];
  for (const binding of QUEUE_BINDINGS) {
    specs.push({
      name: binding.queue,
      role: 'main',
      arguments: {
        'x-queue-type': 'quorum',
        'x-delivery-limit': TOPOLOGY_DELIVERY_LIMIT,
        'x-dead-letter-exchange': TOPOLOGY_DEAD_LETTER_EXCHANGE,
        'x-dead-letter-routing-key': binding.queue,
      },
      bindings: binding.routingKeys.map((routingKey) => ({ exchange: EXCHANGE_NAME, routingKey })),
    });
    specs.push({
      name: `${binding.queue}.dead`,
      role: 'dead-letter',
      arguments: { 'x-queue-type': 'quorum' },
      bindings: [{ exchange: TOPOLOGY_DEAD_LETTER_EXCHANGE, routingKey: binding.queue }],
    });
    for (const routingKey of binding.routingKeys) {
      specs.push({
        name: retryQueueName(binding.queue, routingKey),
        role: 'retry',
        arguments: {
          'x-queue-type': 'quorum',
          'x-message-ttl': TOPOLOGY_RETRY_DELAY_MS,
          'x-dead-letter-exchange': EXCHANGE_NAME,
          'x-dead-letter-routing-key': routingKey,
        },
        bindings: [{ exchange: TOPOLOGY_RETRY_EXCHANGE, routingKey: retryRoutingKey(binding.queue, routingKey) }],
      });
    }
  }
  return specs;
}

/** The subset of a management-API queue record the audit reads. */
export interface ObservedQueue {
  name: string;
  type?: string;
  durable?: boolean;
  arguments?: Record<string, unknown>;
  messages?: number;
}

export type TopologyIssue =
  | 'MISSING'
  | 'CLASSIC_NEEDS_MIGRATION'
  | 'NOT_DURABLE'
  | 'ARGUMENT_MISMATCH'
  | 'MISSING_BINDING';

export interface QueueAuditResult {
  queue: string;
  role: QueueSpec['role'];
  ok: boolean;
  issues: Array<{ issue: TopologyIssue; detail: string }>;
  messages?: number;
}

/**
 * Compare one observed queue with its spec. Pure: never touches the broker.
 * A classic queue is reported as needing migration, not as something to fix
 * in place — RabbitMQ refuses to change a queue's type, and deleting it would
 * drop its backlog.
 */
export function auditQueue(
  spec: QueueSpec,
  observed: ObservedQueue | undefined,
  observedBindings: Array<{ source: string; routing_key: string }> = [],
): QueueAuditResult {
  const issues: QueueAuditResult['issues'] = [];
  if (!observed) {
    issues.push({ issue: 'MISSING', detail: 'queue is not declared; a service start declares it' });
    return { queue: spec.name, role: spec.role, ok: false, issues };
  }
  if (observed.durable !== true) issues.push({ issue: 'NOT_DURABLE', detail: 'queue is transient' });
  if (observed.type !== 'quorum') {
    issues.push({
      issue: 'CLASSIC_NEEDS_MIGRATION',
      detail: `queue type is ${observed.type ?? 'unknown'}; follow the classic-to-quorum procedure in docs/phase-3-reliability.md`,
    });
  } else {
    for (const [name, expected] of Object.entries(spec.arguments)) {
      const actual = observed.arguments?.[name];
      if (actual !== expected) {
        issues.push({ issue: 'ARGUMENT_MISMATCH', detail: `${name}: expected ${String(expected)}, found ${String(actual)}` });
      }
    }
  }
  for (const binding of spec.bindings) {
    const present = observedBindings.some((candidate) => (
      candidate.source === binding.exchange && candidate.routing_key === binding.routingKey
    ));
    if (!present) {
      issues.push({ issue: 'MISSING_BINDING', detail: `${binding.exchange} -> ${binding.routingKey}` });
    }
  }
  return { queue: spec.name, role: spec.role, ok: issues.length === 0, issues, messages: observed.messages };
}

/**
 * Move up to `limit` messages from one queue to another with publisher
 * confirms. Each source message is acknowledged only after its copy is
 * confirmed, so an interruption leaves at most a duplicate (which the
 * consumers' inboxes absorb), never a loss. Nothing is deleted.
 */
export async function moveQueueMessages(
  channel: ConfirmChannel,
  from: string,
  to: string,
  limit = Number.MAX_SAFE_INTEGER,
): Promise<number> {
  if (from === to) throw new Error('Source and destination queues must differ');
  await channel.checkQueue(from);
  await channel.checkQueue(to);
  let moved = 0;
  while (moved < limit) {
    const message = await channel.get(from, { noAck: false });
    if (!message) break;
    await republish(channel, to, message);
    channel.ack(message);
    moved += 1;
  }
  return moved;
}

async function republish(channel: ConfirmChannel, queue: string, message: GetMessage): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    channel.sendToQueue(queue, message.content, { ...message.properties, persistent: true }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
