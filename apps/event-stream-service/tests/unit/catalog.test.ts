import {
  STREAM_SCHEMA_VERSION,
  TOPIC_DEFINITIONS,
  kafkaTopicDefinitions,
  partitionKeyFor,
  toStreamEnvelope,
  topicNameFor,
  type BusinessEvent,
  type BusinessEventName,
} from '../../src/stream/catalog';

const payloadFor = (eventName: BusinessEventName): Record<string, unknown> => {
  if (eventName.startsWith('Payment')) return { paymentId: 'payment-1', orderId: 'order-1' };
  if (eventName === 'LowStockDetected') return { productId: 'product-1' };
  if (eventName === 'ReviewCreated') return { productId: 'product-1', reviewId: 'review-1' };
  return { orderId: 'order-1' };
};

const event = (eventName: BusinessEventName): BusinessEvent => ({
  eventId: `event-${eventName}`,
  eventName,
  timestamp: '2026-09-24T12:00:00.000Z',
  payload: payloadFor(eventName),
});

describe('Kafka business-fact catalog', () => {
  it.each([
    ['OrderCreated', 'nexacommerce.orders.v1'],
    ['OrderCompleted', 'nexacommerce.orders.v1'],
    ['PaymentSuccess', 'nexacommerce.payments.v1'],
    ['StockConfirmed', 'nexacommerce.inventory.v1'],
    ['LowStockDetected', 'nexacommerce.inventory.v1'],
    ['OrderDelivered', 'nexacommerce.shipping.v1'],
    ['ReviewCreated', 'nexacommerce.reviews.v1'],
  ] as const)('maps %s to %s', (eventName, topic) => {
    expect(topicNameFor(eventName, 'nexacommerce')).toBe(topic);
  });

  it('uses aggregate keys that preserve per-order, payment, or product ordering', () => {
    expect(partitionKeyFor(event('OrderCreated'))).toBe('order-1');
    expect(partitionKeyFor(event('OrderCompleted'))).toBe('order-1');
    expect(partitionKeyFor(event('PaymentSuccess'))).toBe('payment-1');
    expect(partitionKeyFor(event('ReviewCreated'))).toBe('product-1');
  });

  it('adds the stable schema version without changing the source event ID', () => {
    const envelope = toStreamEnvelope(event('OrderPaid'), '2026-09-24T12:01:00.000Z');
    expect(envelope).toEqual(expect.objectContaining({
      schemaVersion: STREAM_SCHEMA_VERSION,
      eventId: 'event-OrderPaid',
      eventName: 'OrderPaid',
      occurredAt: '2026-09-24T12:00:00.000Z',
      streamedAt: '2026-09-24T12:01:00.000Z',
      partitionKey: 'order-1',
    }));
  });

  it('provisions every topic explicitly with retention and delete-only cleanup', () => {
    const topics = kafkaTopicDefinitions('test', 3);
    expect(topics).toHaveLength(Object.keys(TOPIC_DEFINITIONS).length);
    expect(topics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        topic: 'test.orders.v1',
        numPartitions: 6,
        replicationFactor: 3,
        configEntries: expect.arrayContaining([
          { name: 'cleanup.policy', value: 'delete' },
          { name: 'retention.ms', value: String(180 * 24 * 60 * 60 * 1000) },
        ]),
      }),
    ]));
  });

  it('rejects an event missing its aggregate partition key', () => {
    expect(() => partitionKeyFor({ ...event('OrderPaid'), payload: {} })).toThrow('orderId');
  });
});
