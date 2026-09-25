import { Kafka, logLevel, type Admin, type Producer } from 'kafkajs';
import { createLogger } from '@nexacommerce/logger';
import { config } from './config';
import { setKafkaReady } from './health';
import {
  kafkaTopicDefinitions,
  toStreamEnvelope,
  topicNameFor,
  type BusinessEvent,
} from './stream/catalog';

const logger = createLogger('event-stream-kafka');
const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
  logLevel: logLevel.ERROR,
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
});

let producer: Producer | undefined;
let connectPromise: Promise<void> | undefined;

async function provisionTopics(admin: Admin): Promise<void> {
  await admin.connect();
  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: kafkaTopicDefinitions(config.kafkaTopicPrefix, config.kafkaReplicationFactor),
    });
  } finally {
    await admin.disconnect();
  }
}

export async function ensureKafka(): Promise<void> {
  if (producer) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    await provisionTopics(kafka.admin());
    const nextProducer = kafka.producer({
      allowAutoTopicCreation: false,
      idempotent: true,
      maxInFlightRequests: 1,
    });
    try {
      await nextProducer.connect();
    } catch (error) {
      await nextProducer.disconnect().catch(() => undefined);
      throw error;
    }
    producer = nextProducer;
    setKafkaReady(true);
    logger.info('[Kafka] Producer connected and topic catalog verified.');
  })().catch((error) => {
    setKafkaReady(false);
    throw error;
  }).finally(() => {
    connectPromise = undefined;
  });

  return connectPromise;
}

export async function publishBusinessFact(event: BusinessEvent): Promise<void> {
  await ensureKafka();
  const envelope = toStreamEnvelope(event);
  try {
    await producer!.send({
      topic: topicNameFor(event.eventName, config.kafkaTopicPrefix),
      acks: -1,
      messages: [{
        key: envelope.partitionKey,
        value: JSON.stringify(envelope),
        timestamp: String(Date.parse(envelope.occurredAt)),
        headers: {
          eventId: envelope.eventId,
          eventName: envelope.eventName,
          schemaVersion: String(envelope.schemaVersion),
        },
      }],
    });
    setKafkaReady(true);
  } catch (error) {
    setKafkaReady(false);
    throw error;
  }
}

export async function stopKafka(): Promise<void> {
  if (connectPromise) await connectPromise.catch(() => undefined);
  const activeProducer = producer;
  producer = undefined;
  setKafkaReady(false);
  if (activeProducer) await activeProducer.disconnect().catch(() => undefined);
}
