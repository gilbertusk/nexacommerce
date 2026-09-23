import { app } from './app';
import { config } from './config';
import { initRabbitMQ } from './messaging/rabbitmq';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('review-service');

async function startServer() {
  try {
    // Connect to message broker
    await initRabbitMQ();

    app.listen(config.port, () => {
      logger.info(`[Review Service] Running on port ${config.port}`);
    });
  } catch (err: any) {
    logger.error(`[Review Service] Startup failed: ${err.message}`, err);
    process.exit(1);
  }
}

startServer();
