import { Channel } from 'amqplib';
import { connectRabbitMQ, setupExchangeAndQueues, createConsumer, buildInternalServiceHeaders } from '@nexacommerce/common';
import { config } from '../config';
import { QUEUES } from '@nexacommerce/event-contracts';
import { notificationService } from '../services/notification.service';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('notification-messaging');

let channel: Channel;

async function fetchUser(userId: string): Promise<{ email: string; name: string }> {
  try {
    const url = `${config.authServiceUrl}/auth/internal/users/${userId}`;
    logger.info(`Fetching user info from: ${url}`);
    const response = await fetch(url, {
      headers: buildInternalServiceHeaders('notification-service'),
    });
    if (!response.ok) {
      throw new Error(`Auth Service returned ${response.status}: ${response.statusText}`);
    }
    const body = (await response.json()) as any;
    return {
      email: body.data?.email || `${userId}@example.com`,
      name: body.data?.username || body.data?.email?.split('@')[0] || 'User',
    };
  } catch (err: any) {
    logger.warn(`Failed to fetch user ${userId} details: ${err.message}. Using fallback.`);
    return {
      email: `${userId}@example.com`,
      name: 'Valued Customer',
    };
  }
}

async function fetchProduct(productId: string): Promise<{ name: string; sellerId: string }> {
  try {
    const url = `${config.productServiceUrl}/internal/products/${productId}`;
    logger.info(`Fetching product info from: ${url}`);
    const response = await fetch(url, {
      headers: buildInternalServiceHeaders('notification-service'),
    });
    if (!response.ok) {
      throw new Error(`Product Service returned ${response.status}: ${response.statusText}`);
    }
    const body = (await response.json()) as any;
    return {
      name: body.data?.name || 'Product',
      sellerId: body.data?.sellerId || 'seller-id-fallback',
    };
  } catch (err: any) {
    logger.warn(`Failed to fetch product ${productId} details: ${err.message}. Using fallback.`);
    return {
      name: 'Premium Product',
      sellerId: 'seller-id-fallback',
    };
  }
}

async function fetchReview(reviewId: string): Promise<{ title: string; content: string }> {
  try {
    const url = `http://localhost:3010/reviews/internal/reviews/${reviewId}`;
    logger.info(`Fetching review info from: ${url}`);
    const response = await fetch(url, {
      headers: buildInternalServiceHeaders('notification-service'),
    });
    if (!response.ok) {
      throw new Error(`Review Service returned ${response.status}: ${response.statusText}`);
    }
    const body = (await response.json()) as any;
    return {
      title: body.data?.title || 'No Title',
      content: body.data?.content || 'No Content',
    };
  } catch (err: any) {
    logger.warn(`Failed to fetch review ${reviewId} details: ${err.message}. Using fallback.`);
    return {
      title: 'Feedback Received',
      content: 'A customer has left a review on your product.',
    };
  }
}

export async function initRabbitMQ() {
  try {
    const connection = await connectRabbitMQ(config.rabbitmqUrl);
    channel = await connection.createConfirmChannel();

    // Ensure exchange and queues topology exists
    await setupExchangeAndQueues(channel);

    // Register consumer for notification-service.events
    await createConsumer(channel, QUEUES.NOTIFICATION_EVENTS, async (event: any) => {
      logger.info(`[Notification Service] Received event: ${event.eventName}`);

      const { eventId, eventName, payload } = event;

      try {
        switch (eventName) {
          case 'OrderCreated': {
            const { orderId, customerId, grandTotal } = payload;
            const customer = await fetchUser(customerId);

            await notificationService.createNotification({
              userId: customerId,
              type: 'ORDER_CREATED',
              title: 'Order Created',
              message: `Order #${orderId} has been created successfully.`,
              data: { orderId, grandTotal },
              channel: 'BOTH',
              emailTo: customer.email,
              emailTemplateName: 'ORDER_CREATED',
              emailTemplateData: {
                customerName: customer.name,
                orderId,
                totalAmount: `$${grandTotal}`,
              },
              sourceEventId: eventId,
            });
            break;
          }

          case 'PaymentSuccess': {
            const { orderId, customerId, amount } = payload;
            const customer = await fetchUser(customerId);

            await notificationService.createNotification({
              userId: customerId,
              type: 'PAYMENT_SUCCESS',
              title: 'Payment Successful',
              message: `Payment of $${amount} for Order #${orderId} was received.`,
              data: { orderId, amount },
              channel: 'BOTH',
              emailTo: customer.email,
              emailTemplateName: 'PAYMENT_SUCCESS',
              emailTemplateData: {
                customerName: customer.name,
                orderId,
              },
              sourceEventId: eventId,
            });
            break;
          }

          case 'PaymentFailed': {
            const { orderId, customerId, reason } = payload;
            const customer = await fetchUser(customerId);

            await notificationService.createNotification({
              userId: customerId,
              type: 'PAYMENT_FAILED',
              title: 'Payment Failed',
              message: `Payment for Order #${orderId} failed: ${reason}`,
              data: { orderId, reason },
              channel: 'BOTH',
              emailTo: customer.email,
              emailTemplateName: 'PAYMENT_FAILED',
              emailTemplateData: {
                customerName: customer.name,
                orderId,
              },
              sourceEventId: eventId,
            });
            break;
          }

          case 'OrderShipped': {
            const { orderId, customerId, trackingNumber, courierName, serviceName } = payload;
            const customer = await fetchUser(customerId);

            await notificationService.createNotification({
              userId: customerId,
              type: 'ORDER_SHIPPED',
              title: 'Order Shipped',
              message: `Your Order #${orderId} has been shipped via ${courierName}. Resi: ${trackingNumber}`,
              data: { orderId, trackingNumber, courierName },
              channel: 'BOTH',
              emailTo: customer.email,
              emailTemplateName: 'ORDER_SHIPPED',
              emailTemplateData: {
                customerName: customer.name,
                orderId,
                courierName,
                serviceCode: serviceName,
                trackingNumber,
              },
              sourceEventId: eventId,
            });
            break;
          }

          case 'OrderDelivered': {
            const { orderId, customerId } = payload;
            const customer = await fetchUser(customerId);

            await notificationService.createNotification({
              userId: customerId,
              type: 'ORDER_DELIVERED',
              title: 'Order Delivered',
              message: `Your Order #${orderId} has been successfully delivered. Please confirm completion.`,
              data: { orderId },
              channel: 'BOTH',
              emailTo: customer.email,
              emailTemplateName: 'ORDER_DELIVERED',
              emailTemplateData: {
                customerName: customer.name,
                orderId,
              },
              sourceEventId: eventId,
            });
            break;
          }

          case 'LowStockDetected': {
            const { productId, currentStock, threshold, sellerId } = payload;
            const product = await fetchProduct(productId);
            const seller = await fetchUser(sellerId);

            await notificationService.createNotification({
              userId: sellerId,
              type: 'LOW_STOCK',
              title: 'Low Stock Alert',
              message: `Product "${product.name}" stock is low: ${currentStock} remaining (threshold: ${threshold})`,
              data: { productId, currentStock, threshold },
              channel: 'BOTH',
              emailTo: seller.email,
              emailTemplateName: 'LOW_STOCK',
              emailTemplateData: {
                productName: product.name,
                productId,
                currentStock,
                threshold,
              },
              sourceEventId: eventId,
            });
            break;
          }

          case 'ReviewCreated': {
            const { reviewId, productId, customerId, rating } = payload;
            const product = await fetchProduct(productId);
            const seller = await fetchUser(product.sellerId);
            const review = await fetchReview(reviewId);

            await notificationService.createNotification({
              userId: product.sellerId,
              type: 'REVIEW_RECEIVED',
              title: 'New Review Received',
              message: `Your product "${product.name}" received a new ${rating}-star review.`,
              data: { reviewId, productId, rating },
              channel: 'BOTH',
              emailTo: seller.email,
              emailTemplateName: 'REVIEW_RECEIVED',
              emailTemplateData: {
                productName: product.name,
                rating,
                title: review.title,
                content: review.content,
              },
              sourceEventId: eventId,
            });
            break;
          }

          case 'OrderCompleted': {
            const { orderId, customerId } = payload;
            const customer = await fetchUser(customerId);

            await notificationService.createNotification({
              userId: customerId,
              type: 'ORDER_COMPLETED',
              title: 'Order Completed',
              message: `Order #${orderId} is completed. Thank you for shopping with us!`,
              data: { orderId },
              channel: 'BOTH',
              emailTo: customer.email,
              emailTemplateName: 'ORDER_COMPLETED',
              emailTemplateData: {
                customerName: customer.name,
                orderId,
              },
              sourceEventId: eventId,
            });
            break;
          }

          default:
            logger.warn(`Unhandled event type in notification consumer: ${eventName}`);
        }
      } catch (innerErr: any) {
        logger.error(`Error processing event payload for ${eventName}: ${innerErr.message}`, { stack: innerErr.stack });
        // Propagate failures so the shared consumer can broker-confirm a retry
        // (or route the event to the DLQ after the retry budget is exhausted).
        throw innerErr;
      }
    });

    logger.info('RabbitMQ Consumers initialized for Notification Service.');
  } catch (err: any) {
    logger.error('Failed to initialize RabbitMQ connection in Notification Service:', err);
    throw err;
  }
}
