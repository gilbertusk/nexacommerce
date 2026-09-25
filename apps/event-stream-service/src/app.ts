import express from 'express';
import { getReadiness } from './health';
import { TOPIC_DEFINITIONS, STREAM_SCHEMA_VERSION } from './stream/catalog';
import { requestIdMiddleware } from '@nexacommerce/common';

const app = express();

// Establish the request correlation id before anything else runs, so every
// log line and every outbound internal call in this request carries it.
app.use(requestIdMiddleware);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'event-stream-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', (_req, res) => {
  const readiness = getReadiness();
  res.status(readiness.ready ? 200 : 503).json({
    status: readiness.ready ? 'READY' : 'NOT_READY',
    ...readiness,
  });
});

app.get('/stream/catalog', (_req, res) => {
  res.json({ schemaVersion: STREAM_SCHEMA_VERSION, topics: TOPIC_DEFINITIONS });
});

export default app;
export { app };
