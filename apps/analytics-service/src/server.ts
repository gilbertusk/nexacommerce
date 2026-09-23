import { app } from './app';
import { config } from './config';
import { initRabbitMQ } from './messaging/rabbitmq';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('analytics-service');

async function startServer() {
  try {
    await initRabbitMQ();
    app.listen(config.port, () => {
      logger.info(`[Analytics Service] Running on port ${config.port}`);
    });
  } catch (err: any) {
    logger.error(`[Analytics Service] Startup failed: ${err.message}`, err);
    process.exit(1);
  }
}

startServer();
