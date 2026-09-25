import type { StreamEnvelope } from './catalog';

export interface StreamInbox {
  claim(eventId: string): Promise<boolean>;
  markProcessed(eventId: string): Promise<void>;
  release(eventId: string): Promise<void>;
}

export async function processIdempotently(
  event: StreamEnvelope,
  inbox: StreamInbox,
  handler: (event: StreamEnvelope) => Promise<void>,
): Promise<'PROCESSED' | 'DUPLICATE'> {
  const claimed = await inbox.claim(event.eventId);
  if (!claimed) return 'DUPLICATE';

  try {
    await handler(event);
    await inbox.markProcessed(event.eventId);
    return 'PROCESSED';
  } catch (error) {
    await inbox.release(event.eventId);
    throw error;
  }
}
