const mockChannel = {
  on: jest.fn(),
  close: jest.fn(),
};
const mockConnection = {
  createConfirmChannel: jest.fn(async () => mockChannel),
  on: jest.fn(),
  close: jest.fn(),
};
const mockConnectRabbitMQ = jest.fn(async () => mockConnection);
const mockSetupExchangeAndQueues = jest.fn();
const mockCreateConsumer = jest.fn();

jest.mock('@nexacommerce/common', () => ({
  assertProductionSecret: jest.fn(),
  connectRabbitMQ: mockConnectRabbitMQ,
  setupExchangeAndQueues: mockSetupExchangeAndQueues,
  createConsumer: mockCreateConsumer,
}));

const mockEnsureKafka = jest.fn();
const mockPublishBusinessFact = jest.fn();
const mockStopKafka = jest.fn();
jest.mock('../../src/kafka', () => ({
  ensureKafka: mockEnsureKafka,
  publishBusinessFact: mockPublishBusinessFact,
  stopKafka: mockStopKafka,
}));

import { QUEUES } from '@nexacommerce/event-contracts';
import { initEventStreamBridge, stopEventStreamBridge } from '../../src/rabbitmq';

describe('RabbitMQ to Kafka bridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureKafka.mockResolvedValue(undefined);
    mockSetupExchangeAndQueues.mockResolvedValue(undefined);
    mockCreateConsumer.mockResolvedValue({ consumerTag: 'stream-bridge' });
    mockPublishBusinessFact.mockResolvedValue(undefined);
    mockChannel.close.mockResolvedValue(undefined);
    mockConnection.close.mockResolvedValue(undefined);
    mockStopKafka.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await stopEventStreamBridge();
  });

  it('consumes the dedicated durable queue and forwards before handler completion', async () => {
    await initEventStreamBridge();

    expect(mockEnsureKafka).toHaveBeenCalledTimes(1);
    expect(mockSetupExchangeAndQueues).toHaveBeenCalledWith(mockChannel);
    expect(mockCreateConsumer).toHaveBeenCalledWith(
      mockChannel,
      QUEUES.EVENT_STREAM_BUSINESS_FACTS,
      expect.any(Function),
      { maxRetries: 1000, prefetch: 50 },
    );

    const handler = mockCreateConsumer.mock.calls[0][2];
    const event = {
      eventId: 'event-1', eventName: 'OrderPaid', timestamp: '2026-09-25T00:00:00.000Z',
      payload: { orderId: 'order-1' },
    };
    await handler(event);
    expect(mockPublishBusinessFact).toHaveBeenCalledWith(event);
  });
});
