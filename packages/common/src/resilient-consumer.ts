import type { ChannelModel, ConfirmChannel } from 'amqplib';
import { createLogger } from '@nexacommerce/logger';
import { connectRabbitMQ, setupExchangeAndQueues } from './rabbitmq';
import { setDependencyReady } from './reliability-metrics';

const logger = createLogger('rabbitmq-lifecycle');

export interface ResilientConsumerOptions {
  /** Broker URL. Never logged: production URLs carry credentials. */
  url: string;
  /** Short name for logs. */
  name: string;
  /** Register consumers on a fresh confirm channel after topology is declared. */
  setup(channel: ConfirmChannel): Promise<void>;
  /** Delay between reconnect attempts. */
  reconnectIntervalMs?: number;
}

export interface ResilientConsumer {
  /** Attempt a connection now and keep retrying in the background. Never throws. */
  start(): Promise<void>;
  /** Stop reconnecting and close the channel and connection. */
  stop(): Promise<void>;
  /** True while a channel with registered consumers is open. */
  isReady(): boolean;
}

/**
 * Keep a set of RabbitMQ consumers attached across broker restarts.
 *
 * A consumer registered once at startup dies silently when its connection
 * closes: the process stays up, health checks stay green, and the queue fills.
 * This wrapper re-establishes the connection, re-declares topology, and
 * re-registers the consumers after any close. Unacknowledged deliveries are
 * returned to the queue by the broker when the old channel closes, so the
 * backlog is resumed rather than lost. Readiness is published as
 * `nexacommerce_dependency_ready{dependency="rabbitmq"}`.
 */
export function createResilientConsumer(options: ResilientConsumerOptions): ResilientConsumer {
  const intervalMs = options.reconnectIntervalMs ?? 5_000;
  let connection: ChannelModel | undefined;
  let channel: ConfirmChannel | undefined;
  let connecting: Promise<void> | undefined;
  let timer: NodeJS.Timeout | undefined;
  let stopped = false;

  const markReady = (ready: boolean) => setDependencyReady('rabbitmq', ready);

  async function ensure(): Promise<void> {
    if (channel || stopped) return;
    if (connecting) return connecting;

    connecting = (async () => {
      const nextConnection = await connectRabbitMQ(options.url, 1);
      let nextChannel: ConfirmChannel | undefined;
      try {
        nextChannel = await nextConnection.createConfirmChannel();
        await setupExchangeAndQueues(nextChannel);
        await options.setup(nextChannel);
      } catch (error) {
        if (nextChannel) await nextChannel.close().catch(() => undefined);
        await nextConnection.close().catch(() => undefined);
        throw error;
      }

      const reset = () => {
        if (channel === nextChannel) {
          channel = undefined;
          connection = undefined;
          markReady(false);
          if (!stopped) logger.warn('Consumer channel closed; reconnecting', { consumer: options.name });
        }
      };
      nextConnection.on('close', reset);
      nextChannel.on('close', reset);

      if (stopped) {
        await nextChannel.close().catch(() => undefined);
        await nextConnection.close().catch(() => undefined);
        return;
      }
      connection = nextConnection;
      channel = nextChannel;
      markReady(true);
      logger.info('Consumers attached', { consumer: options.name });
    })().finally(() => {
      connecting = undefined;
    });

    return connecting;
  }

  return {
    async start() {
      stopped = false;
      if (!timer) {
        timer = setInterval(() => {
          void ensure().catch((error) => {
            logger.warn('Reconnect attempt failed', {
              consumer: options.name,
              error: error instanceof Error ? error.message : String(error),
            });
          });
        }, intervalMs);
        timer.unref();
      }
      try {
        await ensure();
      } catch (error) {
        markReady(false);
        logger.error('Initial connection failed; reconnect loop active', {
          consumer: options.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },

    async stop() {
      stopped = true;
      if (timer) clearInterval(timer);
      timer = undefined;
      if (connecting) await connecting.catch(() => undefined);
      const activeChannel = channel;
      const activeConnection = connection;
      channel = undefined;
      connection = undefined;
      markReady(false);
      if (activeChannel) await activeChannel.close().catch(() => undefined);
      if (activeConnection) await activeConnection.close().catch(() => undefined);
    },

    isReady() {
      return channel !== undefined;
    },
  };
}
