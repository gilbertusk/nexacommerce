const mockAdmin = {
  connect: jest.fn(),
  createTopics: jest.fn(),
  disconnect: jest.fn(),
};
const mockProducer = {
  connect: jest.fn(),
  send: jest.fn(),
  disconnect: jest.fn(),
};
const mockProducerFactory = jest.fn(() => mockProducer);
const mockKafkaConstructor = jest.fn(() => ({
  admin: jest.fn(() => mockAdmin),
  producer: mockProducerFactory,
}));

jest.mock('kafkajs', () => ({
  Kafka: mockKafkaConstructor,
  logLevel: { ERROR: 1 },
}));

import { publishBusinessFact, stopKafka } from '../../src/kafka';
import { getReadiness } from '../../src/health';

const orderPaidEvent = {
  eventId: 'event-1',
  eventName: 'OrderPaid' as const,
  timestamp: '2026-09-24T12:00:00.000Z',
  payload: { orderId: 'order-1', customerId: 'customer-1' },
};

describe('Kafka producer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdmin.connect.mockResolvedValue(undefined);
    mockAdmin.createTopics.mockResolvedValue(true);
    mockAdmin.disconnect.mockResolvedValue(undefined);
    mockProducer.connect.mockResolvedValue(undefined);
    mockProducer.send.mockResolvedValue([]);
    mockProducer.disconnect.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await stopKafka();
  });

  it('provisions topics and publishes an acknowledged, keyed, versioned record', async () => {
    await publishBusinessFact(orderPaidEvent);

    expect(mockAdmin.createTopics).toHaveBeenCalledWith(expect.objectContaining({
      waitForLeaders: true,
      topics: expect.arrayContaining([expect.objectContaining({ topic: 'nexacommerce.orders.v1' })]),
    }));
    expect(mockProducerFactory).toHaveBeenCalledWith({
      allowAutoTopicCreation: false,
      idempotent: true,
      maxInFlightRequests: 1,
    });
    expect(mockProducer.send).toHaveBeenCalledWith(expect.objectContaining({
      topic: 'nexacommerce.orders.v1',
      acks: -1,
      messages: [expect.objectContaining({
        key: 'order-1',
        headers: expect.objectContaining({ eventId: 'event-1', schemaVersion: '1' }),
      })],
    }));
    const value = JSON.parse(mockProducer.send.mock.calls[0][0].messages[0].value);
    expect(value).toEqual(expect.objectContaining({
      schemaVersion: 1,
      eventId: 'event-1',
      partitionKey: 'order-1',
    }));
  });

  it('marks Kafka unready on send failure and ready again after recovery', async () => {
    mockProducer.send.mockRejectedValueOnce(new Error('broker unavailable'));

    await expect(publishBusinessFact(orderPaidEvent)).rejects.toThrow('broker unavailable');
    expect(getReadiness().dependencies.kafka).toBe(false);

    await expect(publishBusinessFact(orderPaidEvent)).resolves.toBeUndefined();
    expect(getReadiness().dependencies.kafka).toBe(true);
  });

  it('disconnects a partially initialized producer when connection fails', async () => {
    mockProducer.connect.mockRejectedValueOnce(new Error('connect failed'));

    await expect(publishBusinessFact(orderPaidEvent)).rejects.toThrow('connect failed');

    expect(mockProducer.disconnect).toHaveBeenCalledTimes(1);
    expect(getReadiness().dependencies.kafka).toBe(false);
  });
});
