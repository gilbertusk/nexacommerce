import { app } from './app';
import { config } from './config';
import { initRabbitMQ, stopRabbitMQ } from './messaging/rabbitmq';
import { stopEmailDispatcher } from './messaging/email-dispatcher';
import { notificationService } from './services/notification.service';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('notification-service');

async function startServer() {
  try {
    // Templates are seeded before the broker consumer starts. The consumer
    // refuses to queue an email whose template is missing, so starting it first
    // would reject events for no reason during the seeding window.
    await notificationService.seedTemplates();

    // Also starts the email dispatcher.
    await initRabbitMQ();

    const server = app.listen(config.port, () => {
      logger.info(`[Notification Service] Running on port ${config.port}`);
    });

    // Stop claiming email jobs before exiting, so a job in flight is not left
    // leased by a process that is going away.
    const shutdown = (signal: string) => {
      logger.info(`[Notification Service] ${signal} received, shutting down`);
      stopEmailDispatcher();
      void stopRabbitMQ().finally(() => server.close(() => process.exit(0)));
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err: any) {
    logger.error(`[Notification Service] Startup failed: ${err.message}`, err);
    process.exit(1);
  }
}

startServer();
