import app from './app';
import { config } from './config/index';
import { connectRateLimitRedis, rateLimitRedis } from './redis/rate-limit-store';

void connectRateLimitRedis();

const server = app.listen(config.port, () => {
  console.log(`[API Gateway] running on port ${config.port}`);
});

async function shutdown(signal: string) {
  console.log(`[API Gateway] ${signal} received; shutting down.`);
  server.close(() => {
    void rateLimitRedis.quit().catch(() => undefined).finally(() => process.exit(0));
  });
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
