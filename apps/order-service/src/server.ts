import app from './app';
import { config } from './config/index';
import { initRabbitMQ, stopRabbitMQ } from './messaging/rabbitmq';
import { prisma } from './prisma/client';

const server = app.listen(config.port, async () => {
  console.log(`[Order Service] running on port ${config.port}`);
  await initRabbitMQ();
});

async function shutdown(signal: string) {
  console.log(`[Order Service] ${signal} received; shutting down.`);
  server.close(async () => {
    await stopRabbitMQ();
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
