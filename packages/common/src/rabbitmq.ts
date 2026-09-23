import { connect, Connection, Channel, ConsumeMessage, Replies } from 'amqplib';
import { EXCHANGE_NAME, EXCHANGE_TYPE, QUEUE_BINDINGS } from '@nexacommerce/event-contracts';

export async function connectRabbitMQ(url: string, retries = 5, delay = 1000): Promise<any> {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`[RabbitMQ] Connecting to ${url} (Attempt ${i}/${retries})...`);
      const connection = await connect(url) as any;
      console.log(`[RabbitMQ] Connected successfully.`);
      
      connection.on('error', (err: any) => {
        console.error('[RabbitMQ] Connection error:', err);
      });
      
      connection.on('close', () => {
        console.warn('[RabbitMQ] Connection closed.');
      });

      return connection;
    } catch (err: any) {
      console.error(`[RabbitMQ] Connection failed: ${err.message}`);
      if (i === retries) throw err;
      console.log(`[RabbitMQ] Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error('[RabbitMQ] Failed to connect after retries.');
}

export async function setupExchangeAndQueues(channel: Channel): Promise<void> {
  console.log(`[RabbitMQ] Setting up topology (Exchange: ${EXCHANGE_NAME})...`);
  
  // Assert Topic Exchange
  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

  // Assert and Bind Queues
  for (const binding of QUEUE_BINDINGS) {
    console.log(`[RabbitMQ] Asserting queue: ${binding.queue}`);
    await channel.assertQueue(binding.queue, { durable: true });
    
    for (const key of binding.routingKeys) {
      console.log(`[RabbitMQ] Binding queue ${binding.queue} to routing key ${key}`);
      await channel.bindQueue(binding.queue, EXCHANGE_NAME, key);
    }
  }
  
  console.log(`[RabbitMQ] Topology setup completed.`);
}

export function createPublisher(channel: Channel, exchange = EXCHANGE_NAME) {
  return async (routingKey: string, event: any): Promise<boolean> => {
    const payload = Buffer.from(JSON.stringify(event));
    console.log(`[RabbitMQ] Publishing event ${event.eventName} to key ${routingKey}`);
    return channel.publish(exchange, routingKey, payload, { persistent: true });
  };
}

export async function createConsumer(
  channel: Channel,
  queue: string,
  handler: (payload: any, message: ConsumeMessage) => Promise<void>
): Promise<Replies.Consume> {
  console.log(`[RabbitMQ] Registering consumer for queue ${queue}...`);
  return channel.consume(queue, async (msg) => {
    if (!msg) return;
    
    try {
      const content = msg.content.toString();
      const payload = JSON.parse(content);
      console.log(`[RabbitMQ] Received message from ${queue}: ${payload.eventName || 'Unknown Event'}`);
      
      await handler(payload, msg);
      
      // Auto-ack on success
      channel.ack(msg);
    } catch (err: any) {
      console.error(`[RabbitMQ] Error handling message from ${queue}:`, err);
      // Nack and requeue on failure
      channel.nack(msg, false, true);
    }
  });
}
