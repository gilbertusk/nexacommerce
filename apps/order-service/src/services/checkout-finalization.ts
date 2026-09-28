import type { OrderCreated } from '@nexacommerce/event-contracts';
import { ConflictError } from '@nexacommerce/common';
import { prisma } from '../prisma/client';
import { enqueueOrderCreated } from '../messaging/outbox';

/**
 * Commit the checkout saga boundary and its business fact together.
 *
 * External inventory/voucher/payment setup must finish before this function is
 * called. Once it returns, OrderCreated is durable even when RabbitMQ is down.
 */
export async function finalizeCheckoutWithOrderCreated(
  payload: OrderCreated['payload'],
  checkoutFinalizedAt = new Date(),
): Promise<Date> {
  return prisma.$transaction(async (tx) => {
    const finalized = await tx.order.updateMany({
      where: {
        id: payload.orderId,
        status: 'PENDING_PAYMENT',
        checkoutFinalizedAt: null,
      },
      data: { checkoutFinalizedAt },
    });
    if (finalized.count !== 1) {
      throw new ConflictError('Order checkout finalization was already processed');
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: payload.orderId,
        fromStatus: 'PENDING_PAYMENT',
        toStatus: 'PENDING_PAYMENT',
        note: 'Checkout saga finalized; OrderCreated queued',
        changedBy: 'SYSTEM',
      },
    });

    await enqueueOrderCreated(tx, payload);
    return checkoutFinalizedAt;
  });
}
