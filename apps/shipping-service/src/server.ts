import { app } from './app';
import { config } from './config';
import { initRabbitMQ } from './messaging/rabbitmq';
import { shippingService } from './services/shipping.service';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('shipping-service');

async function startServer() {
  try {
    // Seed database with couriers and rates
    await shippingService.seedData();

    // Connect to message broker
    await initRabbitMQ();

    app.listen(config.port, () => {
      logger.info(`[Shipping Service] Running on port ${config.port}`);
    });
  } catch (err: any) {
    logger.error(`[Shipping Service] Startup failed: ${err.message}`, err);
    process.exit(1);
  }
}

startServer();
