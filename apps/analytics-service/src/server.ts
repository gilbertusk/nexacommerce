import { app } from './app';
import { config } from './config';
import { initRabbitMQ, stopRabbitMQ } from './messaging/rabbitmq';
import { startKafkaProjection, stopKafkaProjection } from './messaging/kafka-consumer';
import { createLogger } from '@nexacommerce/logger';
import { verifyConfiguredDailyReadModel } from './services/projection-comparison';

const logger = createLogger('analytics-service');

async function startServer() {
  try {
    const cutover = await verifyConfiguredDailyReadModel();
    if (cutover) {
      logger.info(
        `[Analytics Service] Kafka daily read model approved across ${cutover.daysCompared} compared day(s)`,
      );
    }

    if (config.rabbitMqConsumerEnabled) {
      await initRabbitMQ();
    } else {
      logger.info('[Analytics Service] RabbitMQ analytics consumer is disabled');
    }
    await startKafkaProjection();
    const server = app.listen(config.port, () => {
      logger.info(`[Analytics Service] Running on port ${config.port}`);
    });

    // Stop reading the stream before the process goes away, so in-flight
    // projections finish rather than being abandoned mid-transaction.
    const shutdown = async (signal: string) => {
      logger.info(`[Analytics Service] ${signal} received, shutting down`);
      await stopKafkaProjection().catch(() => undefined);
      await stopRabbitMQ().catch(() => undefined);
      server.close(() => process.exit(0));
    };
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (err: any) {
    logger.error(`[Analytics Service] Startup failed: ${err.message}`, err);
    process.exit(1);
  }
}

startServer();
