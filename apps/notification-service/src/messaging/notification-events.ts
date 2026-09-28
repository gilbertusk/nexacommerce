import { buildInternalServiceHeaders } from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';
import config from '../config';
import { notificationService } from '../services/notification.service';
import type { NotificationTx } from './inbox';

const logger = createLogger('notification-events');

/**
 * Turning a broker event into notifications happens in two phases.
 *
 * `prepareNotificationEvent` resolves recipients and display data over HTTP.
 * `applyNotificationEvent` performs only database writes, so it can run inside
 * the inbox transaction without holding row locks across a network call.
 *
 * Lookups here deliberately throw instead of substituting placeholder values.
 * A guessed recipient address means mail sent to the wrong person, and an
 * invented product or seller name means a notification that misinforms; both
 * are worse than letting the consumer retry and eventually dead-letter.
 */

interface UserInfo {
  email: string;
  name: string;
}

interface ProductInfo {
  name: string;
  sellerId: string;
}

async function internalGet(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: buildInternalServiceHeaders('notification-service'),
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  const body = (await response.json()) as any;
  return body.data;
}

async function fetchUser(userId: string): Promise<UserInfo> {
  const data = await internalGet(`${config.authServiceUrl}/auth/internal/users/${userId}`);
  const email = data?.email;
  if (!email) {
    throw new Error(`Auth Service returned no email for user ${userId}`);
  }
  return { email, name: data?.username || String(email).split('@')[0] };
}

async function fetchProduct(productId: string): Promise<ProductInfo> {
  const data = await internalGet(`${config.productServiceUrl}/internal/products/${productId}`);
  if (!data?.name || !data?.sellerId) {
    throw new Error(`Product Service returned incomplete data for product ${productId}`);
  }
  return { name: data.name, sellerId: data.sellerId };
}

async function fetchReview(reviewId: string): Promise<{ title: string; content: string }> {
  const data = await internalGet(`${config.reviewServiceUrl}/reviews/internal/reviews/${reviewId}`);
  return { title: data?.title || '', content: data?.content || '' };
}

/** One notification to write, already fully resolved. */
export interface PreparedNotification {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channel: 'IN_APP' | 'EMAIL' | 'BOTH';
  emailTo: string;
  emailTemplateName: string;
  emailTemplateData: Record<string, unknown>;
}

export type PreparedNotificationEvent =
  | { kind: 'Notifications'; notifications: PreparedNotification[] }
  | { kind: 'Ignored'; eventName: string };

export async function prepareNotificationEvent(
  eventName: string,
  payload: any,
): Promise<PreparedNotificationEvent> {
  switch (eventName) {
    case 'OrderCreated': {
      const { orderId, customerId, grandTotal } = payload;
      const customer = await fetchUser(customerId);
      return {
        kind: 'Notifications',
        notifications: [
          {
            userId: customerId,
            type: 'ORDER_CREATED',
            title: 'Order Created',
            message: `Order #${orderId} has been created successfully.`,
            data: { orderId, grandTotal },
            channel: 'BOTH',
            emailTo: customer.email,
            emailTemplateName: 'ORDER_CREATED',
            emailTemplateData: { customerName: customer.name, orderId, totalAmount: grandTotal },
          },
        ],
      };
    }

    case 'PaymentSuccess': {
      const { orderId, customerId, amount } = payload;
      const customer = await fetchUser(customerId);
      return {
        kind: 'Notifications',
        notifications: [
          {
            userId: customerId,
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Successful',
            message: `Payment of ${amount} for Order #${orderId} was received.`,
            data: { orderId, amount },
            channel: 'BOTH',
            emailTo: customer.email,
            emailTemplateName: 'PAYMENT_SUCCESS',
            emailTemplateData: { customerName: customer.name, orderId },
          },
        ],
      };
    }

    case 'PaymentFailed': {
      const { orderId, customerId, reason } = payload;
      const customer = await fetchUser(customerId);
      return {
        kind: 'Notifications',
        notifications: [
          {
            userId: customerId,
            type: 'PAYMENT_FAILED',
            title: 'Payment Failed',
            message: `Payment for Order #${orderId} failed: ${reason}`,
            data: { orderId, reason },
            channel: 'BOTH',
            emailTo: customer.email,
            emailTemplateName: 'PAYMENT_FAILED',
            emailTemplateData: { customerName: customer.name, orderId },
          },
        ],
      };
    }

    case 'OrderShipped': {
      const { orderId, customerId, trackingNumber, courierName, serviceName, shipments } = payload;
      const customer = await fetchUser(customerId);
      const splitShipments = Array.isArray(shipments) ? shipments : [];
      const message = splitShipments.length > 1
        ? `${splitShipments.length} paket untuk Order #${orderId} telah diserahkan ke kurir.`
        : `Your Order #${orderId} has been shipped via ${courierName}. Resi: ${trackingNumber}`;
      return {
        kind: 'Notifications',
        notifications: [
          {
            userId: customerId,
            type: 'ORDER_SHIPPED',
            title: 'Order Shipped',
            message,
            data: { orderId, trackingNumber, courierName, shipments: splitShipments },
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
          },
        ],
      };
    }

    case 'OrderDelivered': {
      const { orderId, customerId } = payload;
      const customer = await fetchUser(customerId);
      return {
        kind: 'Notifications',
        notifications: [
          {
            userId: customerId,
            type: 'ORDER_DELIVERED',
            title: 'Order Delivered',
            message: `Your Order #${orderId} has been successfully delivered. Please confirm completion.`,
            data: { orderId },
            channel: 'BOTH',
            emailTo: customer.email,
            emailTemplateName: 'ORDER_DELIVERED',
            emailTemplateData: { customerName: customer.name, orderId },
          },
        ],
      };
    }

    case 'OrderCompleted': {
      const { orderId, customerId } = payload;
      const customer = await fetchUser(customerId);
      return {
        kind: 'Notifications',
        notifications: [
          {
            userId: customerId,
            type: 'ORDER_COMPLETED',
            title: 'Order Completed',
            message: `Order #${orderId} is completed. Thank you for shopping with us!`,
            data: { orderId },
            channel: 'BOTH',
            emailTo: customer.email,
            emailTemplateName: 'ORDER_COMPLETED',
            emailTemplateData: { customerName: customer.name, orderId },
          },
        ],
      };
    }

    case 'LowStockDetected': {
      const { productId, currentStock, threshold, sellerId } = payload;
      const [product, seller] = await Promise.all([fetchProduct(productId), fetchUser(sellerId)]);
      return {
        kind: 'Notifications',
        notifications: [
          {
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
          },
        ],
      };
    }

    case 'ReviewCreated': {
      const { reviewId, productId, rating } = payload;
      const product = await fetchProduct(productId);
      const [seller, review] = await Promise.all([
        fetchUser(product.sellerId),
        fetchReview(reviewId),
      ]);
      return {
        kind: 'Notifications',
        notifications: [
          {
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
          },
        ],
      };
    }

    default:
      return { kind: 'Ignored', eventName };
  }
}

/**
 * Write the prepared notifications using `tx`. Every in-app row and queued
 * email lands in the caller's transaction.
 *
 * `sourceEventId` is scoped per notification so two notifications produced by
 * one event do not collide on the unique source-event index.
 */
export async function applyNotificationEvent(
  tx: NotificationTx,
  eventId: string,
  prepared: PreparedNotificationEvent,
): Promise<void> {
  if (prepared.kind === 'Ignored') {
    logger.warn(`Unhandled event type in notification consumer: ${prepared.eventName}`);
    return;
  }

  for (const [index, notification] of prepared.notifications.entries()) {
    await notificationService.createNotification(
      {
        ...notification,
        sourceEventId: index === 0 ? eventId : `${eventId}#${index}`,
      },
      tx,
    );
  }
}
