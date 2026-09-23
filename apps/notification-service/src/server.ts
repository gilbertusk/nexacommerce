import { app } from './app';
import { config } from './config';
import { initRabbitMQ } from './messaging/rabbitmq';
import { notificationService } from './services/notification.service';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('notification-service');

async function startServer() {
  try {
    // Connect to message broker
    await initRabbitMQ();

    // Seed Email Templates
    await notificationService.seedTemplates();

    app.listen(config.port, () => {
      logger.info(`[Notification Service] Running on port ${config.port}`);
    });
  } catch (err: any) {
    logger.error(`[Notification Service] Startup failed: ${err.message}`, err);
    process.exit(1);
  }
}

startServer();
