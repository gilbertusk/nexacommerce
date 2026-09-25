import { connect, Channel, ChannelModel, ConfirmChannel, ConsumeMessage, Replies } from 'amqplib';
import { EXCHANGE_NAME, EXCHANGE_TYPE, QUEUE_BINDINGS } from '@nexacommerce/event-contracts';

export const RETRY_EXCHANGE = `${EXCHANGE_NAME}.retry`;
export const DEAD_LETTER_EXCHANGE = `${EXCHANGE_NAME}.dead`;
export const DEFAULT_MAX_RETRIES = 5;
export const DEFAULT_RETRY_DELAY_MS = 5_000;

type ConsumerOptions = {
  maxRetries?: number;
  retryDelayMs?: number;
  prefetch?: number;
};

export async function connectRabbitMQ(url: string, retries = 5, delay = 1000): Promise<ChannelModel> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      // Do not print broker URLs: production URLs may embed credentials.
      console.log(`[RabbitMQ] Connecting (attempt ${attempt}/${retries})...`);
      const connection = await connect(url);
      connection.on('error', (err: Error) => console.error('[RabbitMQ] Connection error:', err.message));
      connection.on('close', () => console.warn('[RabbitMQ] Connection closed.'));
      return connection;
    } catch (err: any) {
      console.error(`[RabbitMQ] Connection failed: ${err?.message || 'unknown error'}`);
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 30_000);
    }
  }
  throw new Error('[RabbitMQ] Failed to connect after retries.');
}

function retryRoutingKey(queue: string, routingKey: string): string {
  return `${queue}.${routingKey}`;
}

function retryQueueName(queue: string, routingKey: string): string {
  return `${queue}.retry.${routingKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

export async function setupExchangeAndQueues(channel: Channel): Promise<void> {
  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
  await channel.assertExchange(RETRY_EXCHANGE, 'direct', { durable: true });
  await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', { durable: true });

  for (const binding of QUEUE_BINDINGS) {
    await channel.assertQueue(binding.queue, {
      durable: true,
      arguments: {
        'x-queue-type': 'quorum',
        'x-delivery-limit': 20,
        'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE,
        'x-dead-letter-routing-key': binding.queue,
      },
    });

    const deadLetterQueue = `${binding.queue}.dead`;
    await channel.assertQueue(deadLetterQueue, {
      durable: true,
      arguments: { 'x-queue-type': 'quorum' },
    });
    await channel.bindQueue(deadLetterQueue, DEAD_LETTER_EXCHANGE, binding.queue);

    for (const routingKey of binding.routingKeys) {
      await channel.bindQueue(binding.queue, EXCHANGE_NAME, routingKey);

      const retryQueue = retryQueueName(binding.queue, routingKey);
      await channel.assertQueue(retryQueue, {
        durable: true,
        arguments: {
          'x-queue-type': 'quorum',
          'x-message-ttl': DEFAULT_RETRY_DELAY_MS,
          'x-dead-letter-exchange': EXCHANGE_NAME,
          'x-dead-letter-routing-key': routingKey,
        },
      });
      await channel.bindQueue(retryQueue, RETRY_EXCHANGE, retryRoutingKey(binding.queue, routingKey));
    }
  }
}

function asConfirmChannel(channel: Channel): ConfirmChannel {
  const confirmChannel = channel as ConfirmChannel;
  if (typeof confirmChannel.waitForConfirms !== 'function') {
    throw new Error('RabbitMQ publisher/consumer requires a confirm channel');
  }
  return confirmChannel;
}

async function publishConfirmed(
  channel: Channel,
  exchange: string,
  routingKey: string,
  content: Buffer,
  options: Record<string, any>,
): Promise<void> {
  const confirmChannel = asConfirmChannel(channel);
  let drain: Promise<void> | undefined;
  const confirmed = new Promise<void>((resolve, reject) => {
    const writable = confirmChannel.publish(exchange, routingKey, content, options, (error) => {
      if (error) reject(error);
      else resolve();
    });
    if (!writable) {
      drain = new Promise<void>((drainResolve) => confirmChannel.once('drain', drainResolve));
    }
  });
  await Promise.all([confirmed, ...(drain ? [drain] : [])]);
}

export function createPublisher(channel: Channel, exchange = EXCHANGE_NAME) {
  return async (routingKey: string, event: any): Promise<boolean> => {
    if (!event || typeof event.eventName !== 'string' || typeof event.eventId !== 'string') {
      throw new Error('RabbitMQ event requires eventName and eventId');
    }
    const payload = Buffer.from(JSON.stringify(event));
    await publishConfirmed(channel, exchange, routingKey, payload, {
      persistent: true,
      contentType: 'application/json',
      messageId: event.eventId,
      type: event.eventName,
      timestamp: Date.now(),
    });
    return true;
  };
}

async function forwardForRetry(
  channel: Channel,
  queue: string,
  routingKey: string,
  message: ConsumeMessage,
  error: unknown,
  retryCount: number,
): Promise<void> {
  const headers = {
    ...(message.properties.headers || {}),
    'x-retry-count': retryCount,
    'x-original-routing-key': routingKey,
    'x-last-error': String(error instanceof Error ? error.message : error).slice(0, 500),
  };
  await publishConfirmed(channel, RETRY_EXCHANGE, retryRoutingKey(queue, routingKey), message.content, {
    ...message.properties,
    headers,
    persistent: true,
  });
}

async function forwardToDeadLetter(
  channel: Channel,
  queue: string,
  message: ConsumeMessage,
  error: unknown,
): Promise<void> {
  await publishConfirmed(channel, DEAD_LETTER_EXCHANGE, queue, message.content, {
    ...message.properties,
    headers: {
      ...(message.properties.headers || {}),
      'x-original-routing-key': message.fields.routingKey,
      'x-dead-letter-reason': String(error instanceof Error ? error.message : error).slice(0, 500),
      'x-dead-lettered-at': new Date().toISOString(),
    },
    persistent: true,
  });
}

export async function createConsumer(
  channel: Channel,
  queue: string,
  handler: (payload: any, message: ConsumeMessage) => Promise<void>,
  options: ConsumerOptions = {},
): Promise<Replies.Consume> {
  asConfirmChannel(channel);
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const prefetch = options.prefetch ?? 10;
  if (!Number.isSafeInteger(maxRetries) || maxRetries < 0) throw new Error('maxRetries must be a non-negative integer');
  if (!Number.isSafeInteger(prefetch) || prefetch <= 0) throw new Error('prefetch must be a positive integer');
  await channel.prefetch(prefetch);

  return channel.consume(queue, async (message) => {
    if (!message) return;

    let event: any;
    let error: unknown;
    try {
      event = JSON.parse(message.content.toString());
      if (!event || typeof event.eventId !== 'string' || typeof event.eventName !== 'string') {
        throw new Error('Invalid event envelope');
      }
      await handler(event, message);
      channel.ack(message);
      return;
    } catch (handlerError) {
      error = handlerError;
    }

    try {
      const binding = QUEUE_BINDINGS.find((candidate) => candidate.queue === queue);
      const routingKey = message.fields.routingKey;
      const retryCount = Number(message.properties.headers?.['x-retry-count'] || 0);
      if (binding?.routingKeys.includes(routingKey) && retryCount < maxRetries) {
        await forwardForRetry(channel, queue, routingKey, message, error, retryCount + 1);
      } else {
        await forwardToDeadLetter(channel, queue, message, error);
      }
      // Ack only after the retry/DLQ copy has been broker-confirmed.
      channel.ack(message);
    } catch (forwardError) {
      console.error(`[RabbitMQ] Failed to forward message from ${queue}; leaving it for redelivery:`,
        forwardError instanceof Error ? forwardError.message : 'unknown error');
      // If broker forwarding cannot be confirmed, preserve the original delivery.
      channel.nack(message, false, true);
    }
  });
}
