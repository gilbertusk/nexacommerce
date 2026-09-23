import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

export class PaymentRepository {
  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByOrderId(orderId: string) {
    return prisma.payment.findUnique({
      where: { orderId },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: Prisma.PaymentUncheckedCreateInput) {
    return prisma.payment.create({
      data,
    });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput) {
    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  async createLog(tx: any, data: { paymentId: string; action: string; fromStatus?: string | null; toStatus?: string | null; metadata?: any }) {
    const db = tx || prisma;
    return db.paymentLog.create({
      data: {
        paymentId: data.paymentId,
        action: data.action,
        fromStatus: data.fromStatus || null,
        toStatus: data.toStatus || null,
        metadata: data.metadata || Prisma.JsonNull,
      },
    });
  }

  // Webhook log & Idempotency
  async createWebhookLog(data: Prisma.PaymentWebhookLogCreateInput) {
    return prisma.paymentWebhookLog.create({
      data,
    });
  }

  async updateWebhookLog(id: string, data: Prisma.PaymentWebhookLogUpdateInput) {
    return prisma.paymentWebhookLog.update({
      where: { id },
      data,
    });
  }

  async findWebhookLogBySignature(signature: string) {
    return prisma.paymentWebhookLog.findFirst({
      where: { signature },
    });
  }

  async findWebhookLogByEventKey(eventKey: string) {
    return prisma.paymentWebhookLog.findUnique({ where: { eventKey } });
  }

  async findWebhookLogByPayloadKey(orderId: string, transactionStatus: string) {
    // Check if we already processed a webhook log for this orderId and status
    return prisma.paymentWebhookLog.findFirst({
      where: {
        isValid: true,
        isProcessed: true,
        rawPayload: {
          path: ['order_id'],
          equals: orderId,
        },
        // We also match the transaction status in raw payload
        AND: {
          rawPayload: {
            path: ['transaction_status'],
            equals: transactionStatus,
          },
        },
      },
    });
  }
}

export const paymentRepository = new PaymentRepository();
