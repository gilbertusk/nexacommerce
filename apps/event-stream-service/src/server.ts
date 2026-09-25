import app from './app';
import { config } from './config';
import { initEventStreamBridge, stopEventStreamBridge } from './rabbitmq';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('event-stream-service');

const server = app.listen(config.port, async () => {
  logger.info(`[Event Stream Service] Running on port ${config.port}`);
  await initEventStreamBridge();
});

async function shutdown(signal: string) {
  logger.info(`[Event Stream Service] ${signal} received; shutting down.`);
  server.close(async () => {
    await stopEventStreamBridge();
    process.exit(0);
  });
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
