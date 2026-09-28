import { createPrismaInboxPort, InboxPort } from '@nexacommerce/common';
import { Prisma } from '../generated/client';
import { prisma } from '../prisma/client';

export type ShippingTx = Prisma.TransactionClient;

/**
 * Inbox for the OrderPaid consumer. Label creation writes only Shipping's own
 * tables inside the transaction; the order lookup happens before it opens.
 */
export const shippingInbox: InboxPort<ShippingTx> = createPrismaInboxPort<ShippingTx>(prisma, {
  transactionTimeoutMs: 15_000,
  isUniqueViolation: (err) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002',
});
