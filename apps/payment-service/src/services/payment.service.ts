import { paymentRepository } from '../repositories/payment.repository';
import { prisma } from '../prisma/client';
import { AppError, ForbiddenError, NotFoundError, ValidationError } from '@nexacommerce/common';
import { config } from '../config';
import { Prisma } from '../generated/client';
import { publishPaymentSuccess, publishPaymentExpired, publishPaymentFailed } from '../messaging/rabbitmq';
import midtransClient from 'midtrans-client';
import crypto from 'crypto';

export class PaymentService {
  async getPaymentByOrderId(orderId: string, actor?: { userId: string; role: string }) {
    const payment = await paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }
    if (actor?.role !== 'ADMIN' && actor?.userId !== payment.customerId) {
      throw new ForbiddenError('You are not allowed to view this payment');
    }
    return payment;
  }

  async getPaymentById(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }
    return payment;
  }

  async createPayment(orderId: string, customerId: string, amount: number) {
    const existing = await paymentRepository.findByOrderId(orderId);
    if (existing) {
      return existing; // Idempotent check
    }

    const isKeyPlaceholder =
      !config.midtransServerKey ||
      config.midtransServerKey.includes('SB-Mid-server-XXXX') ||
      config.midtransServerKey.includes('nexacommerce-stage3-secret');
    if (isKeyPlaceholder) {
      throw new AppError('Midtrans is not configured', 503);
    }

    const snap = new midtransClient.Snap({
      isProduction: config.midtransIsProduction,
      serverKey: config.midtransServerKey,
      clientKey: config.midtransClientKey,
    });

    const response = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount),
      },
      credit_card: { secure: true },
    });
    if (!response?.redirect_url || !response?.token) {
      throw new AppError('Midtrans returned an incomplete transaction response', 502);
    }

    const paymentUrl = response.redirect_url;
    const externalId = response.token;

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId,
          customerId,
          amount: new Prisma.Decimal(amount),
          provider: 'MIDTRANS',
          method: 'QRIS',
          externalId,
          paymentUrl,
          qrisString: null,
          status: 'PENDING',
        },
      });

      await paymentRepository.createLog(tx, {
        paymentId: payment.id,
        action: 'CREATED',
        fromStatus: null,
        toStatus: 'PENDING',
        metadata: { paymentUrl, externalId },
      });

      return payment;
    });
  }

  async handleWebhook(payload: any) {
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
      transaction_id,
      fraud_status,
      merchant_id,
    } = payload;

    if (![order_id, transaction_status, status_code, gross_amount, signature_key, transaction_id, merchant_id].every((value) => typeof value === 'string' && value.length > 0)) {
      throw new ValidationError('Incomplete Midtrans webhook payload');
    }

    const eventKey = crypto
      .createHash('sha256')
      // Include every non-signature field that is not covered by Midtrans'
      // signature formula, plus the signature itself. An invalid callback can
      // no longer occupy the deduplication key of a later valid callback.
      .update(`${merchant_id}:${transaction_id}:${order_id}:${transaction_status}:${status_code}:${signature_key}`)
      .digest('hex');

    const existingEvent = await paymentRepository.findWebhookLogByEventKey(eventKey);
    if (existingEvent) return { status: 'DUPLICATE' };

    // 1. Log Webhook entry
    let webhookLog;
    try {
      webhookLog = await paymentRepository.createWebhookLog({
        provider: 'MIDTRANS',
        eventKey,
        eventType: transaction_status,
        rawPayload: payload,
        signature: signature_key,
        isValid: false,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') return { status: 'DUPLICATE' };
      throw error;
    }

    // 2. Validate Signature
    const isSignatureValid = this.verifySignature(order_id, status_code, gross_amount, signature_key);
    if (!isSignatureValid) {
      await paymentRepository.updateWebhookLog(webhookLog.id, {
        error: 'Invalid signature key',
      });
      throw new ValidationError('Invalid signature');
    }

    if (merchant_id !== config.midtransMerchantId) {
      await paymentRepository.updateWebhookLog(webhookLog.id, { error: 'Merchant ID mismatch' });
      throw new ValidationError('Midtrans merchant does not match');
    }

    // 3. Validate the transaction against the authoritative payment record.
    const payment = await paymentRepository.findByOrderId(order_id);
    if (!payment) {
      await paymentRepository.updateWebhookLog(webhookLog.id, {
        error: 'Associated payment record not found',
      });
      throw new NotFoundError('Payment not found');
    }

    let notificationAmount: Prisma.Decimal;
    try {
      notificationAmount = new Prisma.Decimal(gross_amount);
    } catch {
      await paymentRepository.updateWebhookLog(webhookLog.id, { error: 'Invalid gross amount' });
      throw new ValidationError('Invalid payment amount');
    }

    if (!notificationAmount.equals(payment.amount)) {
      await paymentRepository.updateWebhookLog(webhookLog.id, { error: 'Gross amount mismatch' });
      throw new ValidationError('Payment amount does not match');
    }

    await paymentRepository.updateWebhookLog(webhookLog.id, {
      isValid: true,
    });

    let targetStatus = payment.status;
    let publishAction: (() => Promise<void>) | null = null;
    const paidAt = payload.settlement_time || new Date().toISOString();

    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      if (status_code !== '200') {
        throw new ValidationError('Successful payment must have Midtrans status code 200');
      }
      targetStatus = 'PAID';
      publishAction = async () => {
        await publishPaymentSuccess({
          paymentId: payment.id,
          orderId: payment.orderId,
          customerId: payment.customerId,
          amount: Number(payment.amount),
          paidAt,
        });
      };
    } else if (transaction_status === 'expire') {
      targetStatus = 'EXPIRED';
      publishAction = async () => {
        await publishPaymentExpired({
          paymentId: payment.id,
          orderId: payment.orderId,
          customerId: payment.customerId,
        });
      };
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'failure'
    ) {
      targetStatus = 'FAILED';
      publishAction = async () => {
        await publishPaymentFailed({
          paymentId: payment.id,
          orderId: payment.orderId,
          customerId: payment.customerId,
          reason: transaction_status,
        });
      };
    }

    if (targetStatus !== payment.status && payment.status !== 'PENDING') {
      await paymentRepository.updateWebhookLog(webhookLog.id, {
        isProcessed: true,
        processedAt: new Date(),
        error: `Ignored terminal payment transition ${payment.status} -> ${targetStatus}`,
      });
      return { status: 'IGNORED', paymentStatus: payment.status };
    }

    if (targetStatus !== payment.status) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: targetStatus,
            externalId: transaction_id || payment.externalId,
            paidAt: targetStatus === 'PAID' ? new Date(paidAt) : undefined,
            expiredAt: targetStatus === 'EXPIRED' ? new Date() : undefined,
            failedAt: targetStatus === 'FAILED' ? new Date() : undefined,
          },
        });

        await paymentRepository.createLog(tx, {
          paymentId: payment.id,
          action: 'STATUS_UPDATED',
          fromStatus: payment.status,
          toStatus: targetStatus,
          metadata: payload,
        });
      });

      // Publish events outside transaction
      if (publishAction) {
        await publishAction();
      }
    }

    // Mark webhook log as processed
    await paymentRepository.updateWebhookLog(webhookLog.id, {
      isProcessed: true,
      processedAt: new Date(),
    });

    return { status: 'PROCESSED', paymentStatus: targetStatus };
  }

  private verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
    const serverKey = config.midtransServerKey;
    const signatureSource = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    
    const hash = crypto.createHash('sha512');
    hash.update(signatureSource);
    const calculated = hash.digest('hex');

    const supplied = Buffer.from(signatureKey, 'utf8');
    const expected = Buffer.from(calculated, 'utf8');
    return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
  }

  async listAllPayments(params: { page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          logs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.payment.count(),
    ]);

    return {
      payments,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async getPaymentStats() {
    const [total, successCount, failedCount, pendingCount, expiredCount] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'PAID' } }),
      prisma.payment.count({ where: { status: 'FAILED' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'EXPIRED' } }),
    ]);

    const totalAmountResult = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      total,
      breakdown: {
        paid: successCount,
        failed: failedCount,
        pending: pendingCount,
        expired: expiredCount,
      },
      totalRevenue: Number(totalAmountResult._sum.amount || 0),
    };
  }
}

export const paymentService = new PaymentService();
