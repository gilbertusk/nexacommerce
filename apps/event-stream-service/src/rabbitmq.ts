import type { Channel, ChannelModel } from 'amqplib';
import { connectRabbitMQ, createConsumer, setupExchangeAndQueues } from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { createLogger } from '@nexacommerce/logger';
import { config } from './config';
import { setRabbitReady } from './health';
import { ensureKafka, publishBusinessFact, stopKafka } from './kafka';
import type { BusinessEvent } from './stream/catalog';

const logger = createLogger('event-stream-bridge');

let connection: ChannelModel | undefined;
let channel: Channel | undefined;
let connectPromise: Promise<void> | undefined;
let retryTimer: NodeJS.Timeout | undefined;

export async function forwardBusinessFact(event: BusinessEvent): Promise<void> {
  await publishBusinessFact(event);
}

async function ensureBridge(): Promise<void> {
  if (channel) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    await ensureKafka();
    const nextConnection = await connectRabbitMQ(config.rabbitmqUrl);
    let nextChannel: Channel | undefined;
    try {
      nextChannel = await nextConnection.createConfirmChannel();
      await setupExchangeAndQueues(nextChannel);
      await createConsumer(
        nextChannel,
        QUEUES.EVENT_STREAM_BUSINESS_FACTS,
        async (event: BusinessEvent) => forwardBusinessFact(event),
        { maxRetries: config.bridgeMaxRetries, prefetch: 50 },
      );
    } catch (error) {
      if (nextChannel) await nextChannel.close().catch(() => undefined);
      await nextConnection.close().catch(() => undefined);
      throw error;
    }

    const resetBridge = () => {
      if (channel === nextChannel) {
        channel = undefined;
        connection = undefined;
        setRabbitReady(false);
      }
    };
    nextConnection.on('close', resetBridge);
    nextChannel.on('close', resetBridge);

    connection = nextConnection;
    channel = nextChannel;
    setRabbitReady(true);
    logger.info('[Bridge] RabbitMQ business-fact consumer started.');
  })().finally(() => {
    connectPromise = undefined;
  });

  return connectPromise;
}

function startReconnectLoop(): void {
  if (retryTimer) return;
  retryTimer = setInterval(() => {
    void ensureBridge().catch((error) => {
      logger.error('[Bridge] Dependency connection failed; retrying:', error);
    });
  }, config.bridgeRetryIntervalMs);
  retryTimer.unref();
}

export async function initEventStreamBridge(): Promise<void> {
  startReconnectLoop();
  try {
    await ensureBridge();
  } catch (error) {
    logger.error('[Bridge] Initial connection failed; background retry remains active:', error);
  }
}

export async function stopEventStreamBridge(): Promise<void> {
  if (retryTimer) clearInterval(retryTimer);
  retryTimer = undefined;
  if (connectPromise) await connectPromise.catch(() => undefined);
  const activeChannel = channel;
  const activeConnection = connection;
  channel = undefined;
  connection = undefined;
  setRabbitReady(false);
  if (activeChannel) await activeChannel.close().catch(() => undefined);
  if (activeConnection) await activeConnection.close().catch(() => undefined);
  await stopKafka();
}
