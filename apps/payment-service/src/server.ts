import app from './app';
import { config } from './config/index';
import { initRabbitMQ } from './messaging/rabbitmq';

app.listen(config.port, async () => {
  console.log(`[Payment Service] running on port ${config.port}`);
  await initRabbitMQ();
});
