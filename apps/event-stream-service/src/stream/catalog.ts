export const STREAM_SCHEMA_VERSION = 1 as const;

export type BusinessEventName =
  | 'OrderCreated'
  | 'OrderPaid'
  | 'OrderCancelled'
  | 'OrderCompleted'
  | 'PaymentCreated'
  | 'PaymentSuccess'
  | 'PaymentFailed'
  | 'PaymentExpired'
  | 'StockReserved'
  | 'StockReservationFailed'
  | 'StockConfirmed'
  | 'StockReleased'
  | 'LowStockDetected'
  | 'OrderShipped'
  | 'OrderDelivered'
  | 'ReviewCreated';

export interface BusinessEvent {
  eventId: string;
  eventName: BusinessEventName;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface StreamEnvelope {
  schemaVersion: typeof STREAM_SCHEMA_VERSION;
  eventId: string;
  eventName: BusinessEventName;
  occurredAt: string;
  streamedAt: string;
  partitionKey: string;
  payload: Record<string, unknown>;
}

export interface TopicDefinition {
  suffix: string;
  partitions: number;
  retentionMs: number;
  cleanupPolicy: 'delete';
}

const DAYS = 24 * 60 * 60 * 1000;

export const TOPIC_DEFINITIONS = {
  orders: { suffix: 'orders.v1', partitions: 6, retentionMs: 180 * DAYS, cleanupPolicy: 'delete' },
  payments: { suffix: 'payments.v1', partitions: 6, retentionMs: 365 * DAYS, cleanupPolicy: 'delete' },
  inventory: { suffix: 'inventory.v1', partitions: 6, retentionMs: 90 * DAYS, cleanupPolicy: 'delete' },
  shipping: { suffix: 'shipping.v1', partitions: 6, retentionMs: 180 * DAYS, cleanupPolicy: 'delete' },
  reviews: { suffix: 'reviews.v1', partitions: 6, retentionMs: 365 * DAYS, cleanupPolicy: 'delete' },
} as const satisfies Record<string, TopicDefinition>;

type TopicDomain = keyof typeof TOPIC_DEFINITIONS;

const EVENT_DOMAINS: Record<BusinessEventName, TopicDomain> = {
  OrderCreated: 'orders',
  OrderPaid: 'orders',
  OrderCancelled: 'orders',
  OrderCompleted: 'orders',
  PaymentCreated: 'payments',
  PaymentSuccess: 'payments',
  PaymentFailed: 'payments',
  PaymentExpired: 'payments',
  StockReserved: 'inventory',
  StockReservationFailed: 'inventory',
  StockConfirmed: 'inventory',
  StockReleased: 'inventory',
  LowStockDetected: 'inventory',
  OrderShipped: 'shipping',
  OrderDelivered: 'shipping',
  ReviewCreated: 'reviews',
};

function requireString(payload: Record<string, unknown>, key: string, eventName: string): string {
  const value = payload[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${eventName} payload requires ${key}`);
  }
  return value;
}

export function topicNameFor(eventName: BusinessEventName, prefix: string): string {
  return `${prefix}.${TOPIC_DEFINITIONS[EVENT_DOMAINS[eventName]].suffix}`;
}

export function partitionKeyFor(event: BusinessEvent): string {
  if (event.eventName.startsWith('Payment')) return requireString(event.payload, 'paymentId', event.eventName);
  if (event.eventName === 'LowStockDetected') return requireString(event.payload, 'productId', event.eventName);
  if (event.eventName === 'ReviewCreated') return requireString(event.payload, 'productId', event.eventName);
  return requireString(event.payload, 'orderId', event.eventName);
}

export function toStreamEnvelope(event: BusinessEvent, streamedAt = new Date().toISOString()): StreamEnvelope {
  if (!event.eventId || !event.eventName || !event.timestamp || !event.payload) {
    throw new Error('Invalid business event envelope');
  }
  if (Number.isNaN(Date.parse(event.timestamp))) {
    throw new Error(`Invalid event timestamp for ${event.eventName}`);
  }
  return {
    schemaVersion: STREAM_SCHEMA_VERSION,
    eventId: event.eventId,
    eventName: event.eventName,
    occurredAt: event.timestamp,
    streamedAt,
    partitionKey: partitionKeyFor(event),
    payload: event.payload,
  };
}

export function kafkaTopicDefinitions(prefix: string, replicationFactor: number) {
  return Object.values(TOPIC_DEFINITIONS).map((definition) => ({
    topic: `${prefix}.${definition.suffix}`,
    numPartitions: definition.partitions,
    replicationFactor,
    configEntries: [
      { name: 'cleanup.policy', value: definition.cleanupPolicy },
      { name: 'retention.ms', value: String(definition.retentionMs) },
      { name: 'message.timestamp.type', value: 'CreateTime' },
    ],
  }));
}
