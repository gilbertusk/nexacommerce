import { processIdempotently, type StreamInbox } from '../../src/stream/idempotency';
import type { StreamEnvelope } from '../../src/stream/catalog';

const streamEvent: StreamEnvelope = {
  schemaVersion: 1,
  eventId: 'event-1',
  eventName: 'OrderPaid',
  occurredAt: '2026-09-24T12:00:00.000Z',
  streamedAt: '2026-09-24T12:00:01.000Z',
  partitionKey: 'order-1',
  payload: { orderId: 'order-1' },
};

describe('idempotent stream processing helper', () => {
  const inbox: jest.Mocked<StreamInbox> = {
    claim: jest.fn(),
    markProcessed: jest.fn(),
    release: jest.fn(),
  };
  const handler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    inbox.claim.mockResolvedValue(true);
    inbox.markProcessed.mockResolvedValue(undefined);
    inbox.release.mockResolvedValue(undefined);
    handler.mockResolvedValue(undefined);
  });

  it('processes and marks a newly claimed event', async () => {
    await expect(processIdempotently(streamEvent, inbox, handler)).resolves.toBe('PROCESSED');
    expect(handler).toHaveBeenCalledWith(streamEvent);
    expect(inbox.markProcessed).toHaveBeenCalledWith('event-1');
  });

  it('skips an event ID already owned or processed by the inbox', async () => {
    inbox.claim.mockResolvedValueOnce(false);
    await expect(processIdempotently(streamEvent, inbox, handler)).resolves.toBe('DUPLICATE');
    expect(handler).not.toHaveBeenCalled();
  });

  it('releases a failed claim so Kafka can redeliver it', async () => {
    handler.mockRejectedValueOnce(new Error('projection unavailable'));
    await expect(processIdempotently(streamEvent, inbox, handler)).rejects.toThrow('projection unavailable');
    expect(inbox.release).toHaveBeenCalledWith('event-1');
    expect(inbox.markProcessed).not.toHaveBeenCalled();
  });
});
