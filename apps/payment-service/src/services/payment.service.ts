import { paymentRepository } from '../repositories/payment.repository';
import { prisma } from '../prisma/client';
import { AppError, ConflictError, ForbiddenError, NotFoundError, ValidationError, buildInternalServiceHeaders } from '@nexacommerce/common';
import { config } from '../config';
import { Prisma } from '../generated/client';
import { enqueuePaymentExpired, enqueuePaymentFailed, enqueuePaymentSuccess } from '../messaging/outbox';
import midtransClient from 'midtrans-client';
import crypto from 'crypto';

export class PaymentService {
  private async getApprovedReturnOrder(orderId: string, customerId: string) {
    let response: Response;
    try {
      response = await fetch(`${config.orderServiceUrl}/orders/internal/orders/${encodeURIComponent(orderId)}`, {
        headers: buildInternalServiceHeaders('payment-service'),
      });
    } catch {
      throw new AppError('Order Service is unavailable; refund was not submitted', 502);
    }
    if (!response.ok) throw new AppError('Could not verify return approval; refund was not submitted', 502);
    const body = await response.json() as { data?: any };
    const order = body?.data;
    if (!order || order.customerId !== customerId) throw new ValidationError('Order and payment customer do not match');
    if (!['RETURN_APPROVED', 'PARTIALLY_REFUNDED'].includes(order.status)) {
      throw new ValidationError('Refunds may only be issued for an approved return');
    }
    return order;
  }

  async requestRefund(orderId: string, amount: number, reason: string, idempotencyKey: string) {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new ValidationError('Refund amount must be a positive integer in IDR');
    if (!reason?.trim() || reason.trim().length > 255) throw new ValidationError('Refund reason is required and must not exceed 255 characters');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      throw new ValidationError('A UUID Idempotency-Key header is required');
    }

    const payment = await paymentRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundError('Payment not found');

    let refund = await prisma.refund.findUnique({ where: { id: idempotencyKey } });
    if (refund && (refund.paymentId !== payment.id || refund.amount.toString() !== amount.toString() || refund.reason !== reason.trim())) {
      throw new ConflictError('Idempotency key was already used for a different refund request');
    }
    if (refund?.status === 'PROCESSED') return refund;
    if (refund?.status === 'FAILED') {
      await this.getApprovedReturnOrder(orderId, payment.customerId);
      refund = await prisma.refund.update({ where: { id: refund.id }, data: { status: 'PENDING', processedAt: null } });
    }

    if (!refund) {
      if (!['PAID', 'PARTIALLY_REFUNDED'].includes(payment.status)) {
        throw new ValidationError(`Only settled payments can be refunded. Current status: ${payment.status}`);
      }
      await this.getApprovedReturnOrder(orderId, payment.customerId);

      try {
        refund = await prisma.$transaction(async (tx) => {
          const currentPayment = await tx.payment.findUnique({ where: { id: payment.id } });
          if (!currentPayment || !['PAID', 'PARTIALLY_REFUNDED'].includes(currentPayment.status)) {
            throw new ValidationError('Payment is no longer eligible for a refund');
          }
          const openRefund = await tx.refund.findFirst({ where: { paymentId: payment.id, status: 'PENDING' } });
          if (openRefund) {
            if (Number(openRefund.amount) !== amount || openRefund.reason !== reason.trim()) {
              throw new ConflictError('A different refund request is still awaiting provider confirmation');
            }
            return openRefund;
          }
          const totals = await tx.refund.aggregate({
            where: { paymentId: payment.id, status: { in: ['PENDING', 'PROCESSED'] } },
            _sum: { amount: true },
          });
          const alreadyRefundedOrPending = Number(totals._sum.amount ?? 0);
          if (alreadyRefundedOrPending + amount > Number(currentPayment.amount)) {
            throw new ValidationError('Refund amount exceeds the remaining refundable payment amount');
          }
          return tx.refund.create({
            data: {
              id: idempotencyKey,
              paymentId: payment.id,
              orderId,
              amount: new Prisma.Decimal(amount),
              reason: reason.trim(),
              status: 'PENDING',
            },
          });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error: any) {
        if (error?.code === 'P2002' || error?.code === 'P2034') {
          const existing = await prisma.refund.findUnique({ where: { id: idempotencyKey } });
          if (existing) return existing;
          throw new ConflictError('Another refund request is being processed; refresh and retry');
        }
        throw error;
      }
    }

    if (!config.midtransServerKey || config.midtransServerKey.includes('nexacommerce-stage3-secret') || config.midtransServerKey.includes('SB-Mid-server-XXXX')) {
      throw new AppError('Midtrans is not configured; refund remains pending and can be retried with the same key', 503);
    }
    if (!payment.externalId) throw new AppError('Payment has no Midtrans transaction ID; refund remains pending', 409);

    try {
      const core = new midtransClient.CoreApi({
        isProduction: config.midtransIsProduction,
        serverKey: config.midtransServerKey,
        clientKey: config.midtransClientKey,
      });
      const response = await core.transaction.refund(payment.externalId, {
        refund_key: refund.id,
        amount,
        reason: reason.trim(),
      });
      if (response?.status_code && String(response.status_code) !== '200') {
        await prisma.refund.update({ where: { id: refund.id }, data: { status: 'FAILED' } });
        throw new AppError(response.status_message || 'Midtrans rejected the refund request', 502);
      }
      await paymentRepository.createLog(null, {
        paymentId: payment.id,
        action: 'REFUND_REQUESTED',
        fromStatus: payment.status,
        toStatus: 'PENDING',
        metadata: { refundId: refund.id, amount, providerStatus: response?.transaction_status ?? null },
      });
      // A successful API response means Midtrans accepted the request, not that
      // the bank/provider completed returning funds. Webhook confirmation updates status.
      return refund;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (Number(error?.httpStatusCode) >= 400 && Number(error?.httpStatusCode) < 500) {
        await prisma.refund.update({ where: { id: refund.id }, data: { status: 'FAILED' } });
      }
      throw new AppError('Midtrans refund outcome is not confirmed. Retry only with the same Idempotency-Key.', 502);
    }
  }

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

  private async notifyOrderRefundCompleted(orderId: string) {
    let response: Response;
    try {
      response = await fetch(`${config.orderServiceUrl}/orders/internal/orders/${encodeURIComponent(orderId)}/refund-completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...buildInternalServiceHeaders('payment-service') },
        body: JSON.stringify({}),
      });
    } catch {
      throw new AppError('Order Service unavailable while recording confirmed refund', 502);
    }
    if (!response.ok) throw new AppError('Order Service rejected confirmed refund status update', 502);
  }

  private async notifyOrderPartialRefund(orderId: string) {
    let response: Response;
    try {
      response = await fetch(`${config.orderServiceUrl}/orders/internal/orders/${encodeURIComponent(orderId)}/refund-partial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...buildInternalServiceHeaders('payment-service') },
        body: JSON.stringify({}),
      });
    } catch {
      throw new AppError('Order Service unavailable while recording partial refund', 502);
    }
    if (!response.ok) throw new AppError('Order Service rejected partial refund status update', 502);
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

    const eventKey = crypto.createHash('sha256')
      // Include the complete notification: refund notices can share a
      // transaction ID/status while carrying distinct refund keys or bank
      // confirmation timestamps.
      .update(JSON.stringify(payload))
      .digest('hex');

    const existingEvent = await paymentRepository.findWebhookLogByEventKey(eventKey);
    if (existingEvent?.isProcessed) return { status: 'DUPLICATE' };

    // 1. Log Webhook entry
    let webhookLog: any = existingEvent;
    if (!webhookLog) {
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

    if (transaction_status === 'refund' || transaction_status === 'partial_refund') {
      const refundNotices = Array.isArray(payload.refunds)
        ? payload.refunds
        : [{ refund_key: payload.refund_key, refund_amount: payload.refund_amount, bank_confirmed_at: payload.bank_confirmed_at }];
      let hasBankConfirmation = false;
      for (const notice of refundNotices) {
        if (!notice?.refund_key) continue;
        const refund = await prisma.refund.findUnique({ where: { id: notice.refund_key } });
        if (!refund || refund.paymentId !== payment.id || refund.orderId !== payment.orderId) {
          await paymentRepository.updateWebhookLog(webhookLog.id, { error: 'Refund reference does not match a pending refund record' });
          throw new ValidationError('Unknown Midtrans refund reference');
        }
        if (notice.bank_confirmed_at && refund.status !== 'PROCESSED') {
          await prisma.refund.update({
            where: { id: refund.id },
            data: { status: 'PROCESSED', processedAt: new Date(notice.bank_confirmed_at) },
          });
          hasBankConfirmation = true;
        } else if (notice.bank_confirmed_at) {
          hasBankConfirmation = true;
        }
      }

      const totals = await prisma.refund.aggregate({
        where: { paymentId: payment.id, status: 'PROCESSED' },
        _sum: { amount: true },
      });
      const confirmedRefundAmount = Number(totals._sum.amount ?? 0);
      const isFullyRefunded = confirmedRefundAmount >= Number(payment.amount);
      const targetRefundStatus = isFullyRefunded ? 'REFUNDED' : confirmedRefundAmount > 0 ? 'PARTIALLY_REFUNDED' : payment.status;

      if (targetRefundStatus !== payment.status) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({ where: { id: payment.id }, data: { status: targetRefundStatus } });
          await paymentRepository.createLog(tx, {
            paymentId: payment.id,
            action: 'REFUND_STATUS_UPDATED',
            fromStatus: payment.status,
            toStatus: targetRefundStatus,
            metadata: { confirmedRefundAmount },
          });
        });
      }

      if (isFullyRefunded) await this.notifyOrderRefundCompleted(payment.orderId);
      else if (confirmedRefundAmount > 0) await this.notifyOrderPartialRefund(payment.orderId);
      await paymentRepository.updateWebhookLog(webhookLog.id, { isProcessed: true, processedAt: new Date() });
      return {
        status: hasBankConfirmation ? 'PROCESSED' : 'REFUND_PENDING_PROVIDER_CONFIRMATION',
        paymentStatus: targetRefundStatus,
      };
    }

    let targetStatus = payment.status;
    let enqueueAction: ((tx: Prisma.TransactionClient) => Promise<void>) | null = null;
    const paidAt = payload.settlement_time || new Date().toISOString();

    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      if (status_code !== '200') {
        throw new ValidationError('Successful payment must have Midtrans status code 200');
      }
      targetStatus = 'PAID';
      enqueueAction = async (tx) => {
        await enqueuePaymentSuccess(tx, {
          paymentId: payment.id,
          orderId: payment.orderId,
          customerId: payment.customerId,
          amount: Number(payment.amount),
          paidAt,
        });
      };
    } else if (transaction_status === 'expire') {
      targetStatus = 'EXPIRED';
      enqueueAction = async (tx) => {
        await enqueuePaymentExpired(tx, {
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
      enqueueAction = async (tx) => {
        await enqueuePaymentFailed(tx, {
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

        if (enqueueAction) await enqueueAction(tx);
        await tx.paymentWebhookLog.update({
          where: { id: webhookLog.id },
          data: { isProcessed: true, processedAt: new Date(), error: null },
        });
      });

      return { status: 'PROCESSED', paymentStatus: targetStatus };
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

  async listAllPayments(params: { page: number; limit: number; status?: string }) {
    const skip = (params.page - 1) * params.limit;
    const where = params.status ? { status: params.status } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
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
      prisma.payment.count({ where }),
    ]);

    const paymentIds = payments.map((payment: any) => payment.id);
    const [confirmedRefunds, pendingRefunds] = await Promise.all([
      prisma.refund.groupBy({ by: ['paymentId'], where: { paymentId: { in: paymentIds }, status: 'PROCESSED' }, _sum: { amount: true } }),
      prisma.refund.findMany({ where: { paymentId: { in: paymentIds }, status: 'PENDING' }, orderBy: { createdAt: 'asc' } }),
    ]);
    const confirmedByPayment = new Map(confirmedRefunds.map((item: any) => [item.paymentId, Number(item._sum.amount ?? 0)]));
    const pendingByPayment = new Map<string, any>();
    for (const refund of pendingRefunds as any[]) if (!pendingByPayment.has(refund.paymentId)) pendingByPayment.set(refund.paymentId, refund);

    const paymentsWithRefundTotals = payments.map((payment: any) => {
      const refundedAmount = confirmedByPayment.get(payment.id) ?? 0;
      const pendingRefund = pendingByPayment.get(payment.id);
      const pendingRefundAmount = Number(pendingRefund?.amount ?? 0);
      return {
        ...payment,
        refundedAmount,
        pendingRefundAmount,
        remainingRefundableAmount: Math.max(0, Number(payment.amount) - refundedAmount - pendingRefundAmount),
        pendingRefund: pendingRefund ? { id: pendingRefund.id, amount: pendingRefundAmount, reason: pendingRefund.reason } : null,
      };
    });

    return {
      payments: paymentsWithRefundTotals,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async getPaymentStats() {
    const [total, successCount, failedCount, pendingCount, expiredCount] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: { in: ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'] } } }),
      prisma.payment.count({ where: { status: 'FAILED' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'EXPIRED' } }),
    ]);

    const [totalAmountResult, processedRefunds] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: { in: ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'] } },
        _sum: { amount: true },
      }),
      prisma.refund.aggregate({ where: { status: 'PROCESSED' }, _sum: { amount: true } }),
    ]);

    return {
      total,
      breakdown: {
        paid: successCount,
        failed: failedCount,
        pending: pendingCount,
        expired: expiredCount,
      },
      totalRevenue: Math.max(0, Number(totalAmountResult._sum.amount || 0) - Number(processedRefunds._sum.amount || 0)),
    };
  }
}

export const paymentService = new PaymentService();
