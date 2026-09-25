import { ConsumeMessage } from 'amqplib';
import {
  createConsumer,
  createPublisher,
  DEAD_LETTER_EXCHANGE,
  DEFAULT_RETRY_DELAY_MS,
  RETRY_EXCHANGE,
  setupExchangeAndQueues,
} from '../src/rabbitmq';
import { QUEUES } from '@nexacommerce/event-contracts';

function makeChannel() {
  let onMessage: ((message: ConsumeMessage | null) => Promise<void>) | undefined;
  const channel: any = {
    assertExchange: jest.fn().mockResolvedValue({}),
    assertQueue: jest.fn().mockResolvedValue({}),
    bindQueue: jest.fn().mockResolvedValue({}),
    prefetch: jest.fn().mockResolvedValue(undefined),
    consume: jest.fn((_queue: string, handler: typeof onMessage) => {
      onMessage = handler;
      return Promise.resolve({ consumerTag: 'consumer-1' });
    }),
    ack: jest.fn(),
    nack: jest.fn(),
    publish: jest.fn((_exchange, _routingKey, _content, _options, confirm) => {
      confirm?.(null);
      return true;
    }),
    waitForConfirms: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
    once: jest.fn(),
  };
  return {
    channel,
    deliver: async (message: Partial<ConsumeMessage>) => {
      if (!onMessage) throw new Error('Consumer has not been registered');
      await onMessage(message as ConsumeMessage);
    },
  };
}

function makeMessage({
  body = { eventId: 'event-1', eventName: 'OrderPaid' },
  routingKey = 'order.paid',
  headers = {},
}: { body?: unknown; routingKey?: string; headers?: Record<string, unknown> } = {}) {
  return {
    content: Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)),
    fields: { routingKey },
    properties: { headers },
  } as unknown as ConsumeMessage;
}

describe('RabbitMQ reliability helpers', () => {
  it('declares durable quorum queues, bounded retry queues, and dead-letter routes', async () => {
    const { channel } = makeChannel();
    await setupExchangeAndQueues(channel);

    expect(channel.assertExchange).toHaveBeenCalledWith(RETRY_EXCHANGE, 'direct', { durable: true });
    expect(channel.assertExchange).toHaveBeenCalledWith(DEAD_LETTER_EXCHANGE, 'direct', { durable: true });
    expect(channel.assertQueue).toHaveBeenCalledWith(QUEUES.SHIPPING_ORDER_EVENTS, expect.objectContaining({
      durable: true,
      arguments: expect.objectContaining({
        'x-queue-type': 'quorum',
        'x-delivery-limit': 20,
        'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE,
      }),
    }));
    expect(channel.assertQueue).toHaveBeenCalledWith(
      `${QUEUES.SHIPPING_ORDER_EVENTS}.retry.order_paid`,
      expect.objectContaining({
        durable: true,
        arguments: expect.objectContaining({
          'x-message-ttl': DEFAULT_RETRY_DELAY_MS,
          'x-dead-letter-exchange': expect.any(String),
          'x-dead-letter-routing-key': 'order.paid',
        }),
      }),
    );
    expect(channel.assertQueue).toHaveBeenCalledWith(
      QUEUES.EVENT_STREAM_BUSINESS_FACTS,
      expect.objectContaining({ durable: true }),
    );
    expect(channel.bindQueue).toHaveBeenCalledWith(
      QUEUES.EVENT_STREAM_BUSINESS_FACTS,
      expect.any(String),
      'payment.success',
    );
  });

  it('waits for publisher confirmation and requires an event envelope', async () => {
    const { channel } = makeChannel();
    const publish = createPublisher(channel);
    await expect(publish('order.paid', { eventId: 'evt-1', eventName: 'OrderPaid' })).resolves.toBe(true);
    expect(channel.publish).toHaveBeenCalledWith(
      expect.any(String), 'order.paid', expect.any(Buffer), expect.objectContaining({ persistent: true }), expect.any(Function),
    );
    await expect(publish('order.paid', { eventName: 'OrderPaid' })).rejects.toThrow('eventId');
  });

  it('acks successful deliveries only after handler completion', async () => {
    const { channel, deliver } = makeChannel();
    await createConsumer(channel, QUEUES.SHIPPING_ORDER_EVENTS, async () => undefined);
    const message = makeMessage();
    await deliver(message);
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('publishes failed deliveries to a delayed retry queue, confirms, then acks', async () => {
    const { channel, deliver } = makeChannel();
    await createConsumer(channel, QUEUES.SHIPPING_ORDER_EVENTS, async () => { throw new Error('transient'); }, { maxRetries: 2 });
    const message = makeMessage();
    await deliver(message);
    expect(channel.publish).toHaveBeenCalledWith(
      RETRY_EXCHANGE,
      `${QUEUES.SHIPPING_ORDER_EVENTS}.order.paid`,
      message.content,
      expect.objectContaining({ headers: expect.objectContaining({ 'x-retry-count': 1 }) }),
      expect.any(Function),
    );
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('dead-letters exhausted retries and malformed envelopes', async () => {
    const { channel, deliver } = makeChannel();
    await createConsumer(channel, QUEUES.SHIPPING_ORDER_EVENTS, async () => { throw new Error('permanent'); }, { maxRetries: 0 });
    const message = makeMessage();
    await deliver(message);
    expect(channel.publish).toHaveBeenCalledWith(
      DEAD_LETTER_EXCHANGE, QUEUES.SHIPPING_ORDER_EVENTS, message.content,
      expect.objectContaining({ headers: expect.objectContaining({ 'x-dead-letter-reason': 'permanent' }) }),
      expect.any(Function),
    );
    expect(channel.ack).toHaveBeenCalledWith(message);

    channel.publish.mockClear();
    channel.ack.mockClear();
    await deliver(makeMessage({ body: 'not-json' }));
    expect(channel.publish).toHaveBeenCalledWith(DEAD_LETTER_EXCHANGE, QUEUES.SHIPPING_ORDER_EVENTS,
      expect.any(Buffer), expect.any(Object), expect.any(Function));
  });

  it('nacks for redelivery when retry publishing is not confirmed', async () => {
    const { channel, deliver } = makeChannel();
    channel.publish.mockImplementation((...args: any[]) => {
      const confirm = args[4] as ((error: Error | null) => void) | undefined;
      confirm?.(new Error('broker unavailable'));
      return true;
    });
    await createConsumer(channel, QUEUES.SHIPPING_ORDER_EVENTS, async () => { throw new Error('transient'); });
    const message = makeMessage();
    await deliver(message);
    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, true);
  });
});
