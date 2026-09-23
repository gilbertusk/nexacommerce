import { Channel, connect } from 'amqplib';
import { connectRabbitMQ, setupExchangeAndQueues, createPublisher, createConsumer, buildInternalServiceHeaders } from '@nexacommerce/common';
import { config } from '../config';
import { QUEUES, ROUTING_KEYS } from '@nexacommerce/event-contracts';
import { shippingService } from '../services/shipping.service';

let channel: Channel;
let publish: ReturnType<typeof createPublisher>;

export async function initRabbitMQ() {
  try {
    const connection = await connectRabbitMQ(config.rabbitmqUrl);
    channel = await connection.createChannel();
    
    // Ensure topology
    await setupExchangeAndQueues(channel);
    
    publish = createPublisher(channel);

    // Register OrderPaid consumer
    await createConsumer(channel, QUEUES.SHIPPING_ORDER_EVENTS, async (event: any) => {
      if (event.eventName === 'OrderPaid') {
        const { orderId } = event.payload;
        console.log(`[Shipping Service] Processing OrderPaid event for order ${orderId}`);
        
        // Fetch order details from order service
        const response = await fetch(`${config.orderServiceUrl}/orders/internal/orders/${orderId}`, {
          headers: buildInternalServiceHeaders('shipping-service')
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order ${orderId} details: ${response.statusText}`);
        }
        
        const resBody = await response.json() as any;
        const order = resBody.data;

        // Origin city is hardcoded or fetched, let's say "Jakarta"
        const originCity = 'Jakarta';

        // Calculate total weight of the order
        // Default 1000g per item if not specified
        let totalWeight = 0;
        for (const item of order.items) {
          const weight = item.weight || 1000;
          totalWeight += weight * item.quantity;
        }

        // Determine service code & courierId
        // In checkout, customer chose courierName and courierService
        // Let's find the courier code in our DB
        const couriers = await shippingService.getCouriers();
        const matchedCourier = couriers.find((c) => c.name.toLowerCase() === order.courierName.toLowerCase());
        
        if (!matchedCourier) {
          throw new Error(`No matching courier found for name ${order.courierName}`);
        }

        const destinationAddress = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;

        // Create Shipping Order
        await shippingService.createShippingOrder({
          orderId: order.id,
          courierId: matchedCourier.id,
          serviceCode: order.courierService || 'REG',
          weight: totalWeight || 1000,
          originCity,
          destinationAddress,
          notes: order.notes || undefined,
        });

        console.log(`[Shipping Service] Shipping order successfully created for order ${orderId}`);
      }
    });

  } catch (err: any) {
    console.error('[Shipping Service] Failed to initialize RabbitMQ:', err.message);
    throw err;
  }
}

export async function publishOrderShipped(payload: {
  orderId: string;
  customerId: string;
  trackingNumber: string;
  courierName: string;
  serviceName: string;
  estimatedDelivery?: string;
}) {
  if (!publish) {
    console.warn('[Shipping Service] Publisher not initialized. Queue message skipped.');
    return;
  }

  const event = {
    eventId: crypto.randomUUID(),
    eventName: 'OrderShipped' as const,
    timestamp: new Date().toISOString(),
    payload,
  };

  await publish(ROUTING_KEYS.ORDER_SHIPPED, event);
}

export async function publishOrderDelivered(payload: {
  orderId: string;
  customerId: string;
  deliveredAt: string;
}) {
  if (!publish) {
    console.warn('[Shipping Service] Publisher not initialized. Queue message skipped.');
    return;
  }

  const event = {
    eventId: crypto.randomUUID(),
    eventName: 'OrderDelivered' as const,
    timestamp: new Date().toISOString(),
    payload,
  };

  await publish(ROUTING_KEYS.ORDER_DELIVERED, event);
}
