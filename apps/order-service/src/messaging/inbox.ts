import { createPrismaInboxPort, InboxPort } from '@nexacommerce/common';
import { Prisma } from '../generated/client';
import { prisma } from '../prisma/client';

export type OrderTx = Prisma.TransactionClient;

export const ORDER_PAYMENT_CONSUMER = 'order-service.payment-events';
export const ORDER_SHIPPING_CONSUMER = 'order-service.shipping-events';

/**
 * Inbox for Order Service consumers. Order handlers read and write only this
 * service's database inside the transaction; HTTP compensation (voucher
 * release) runs after commit.
 */
export const orderInbox: InboxPort<OrderTx> = createPrismaInboxPort<OrderTx>(prisma, {
  transactionTimeoutMs: 15_000,
  isUniqueViolation: (err) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002',
});
