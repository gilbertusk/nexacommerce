import { app } from './app';
import { config } from './config';
import { initRabbitMQ, stopRabbitMQ } from './messaging/rabbitmq';
import { prisma } from './prisma/client';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('review-service');

const server = app.listen(config.port, async () => {
  logger.info(`[Review Service] Running on port ${config.port}`);
  await initRabbitMQ();
});

async function shutdown(signal: string) {
  logger.info(`[Review Service] ${signal} received; shutting down.`);
  server.close(async () => {
    await stopRabbitMQ();
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
