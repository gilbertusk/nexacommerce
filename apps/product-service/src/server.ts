import { config } from './config/index';
import { initRabbitMQ } from './messaging/rabbitmq';
import app from './app';
import { assertMediaStorageConfigured } from './services/product-media-storage.service';

if (process.env.NODE_ENV === 'production') assertMediaStorageConfigured();

app.listen(config.port, async () => {
  console.log(`[Product Service] running on port ${config.port}`);
  await initRabbitMQ();
});
