jest.mock('../../src/repositories/payment.repository');
const mockPrisma: any = {
  $transaction: jest.fn((cb) => cb(mockPrisma)),
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  refund: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    aggregate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  paymentLog: {
    create: jest.fn(),
  },
  paymentWebhookLog: {
    update: jest.fn(),
  },
  outboxEvent: {
    create: jest.fn(),
  },
};
jest.mock('../../src/prisma/client', () => ({ prisma: mockPrisma }));
jest.mock('../../src/messaging/rabbitmq');
jest.mock('midtrans-client');

import { PaymentService } from '../../src/services/payment.service';
import { paymentRepository } from '../../src/repositories/payment.repository';
import midtransClient from 'midtrans-client';
import { config } from '../../src/config';

const mockPaymentRepo = paymentRepository as jest.Mocked<typeof paymentRepository>;

const mockPayment = {
  id: 'pay-1', orderId: 'order-1', customerId: 'user-1',
  amount: 115000, status: 'PENDING' as any,
  paymentUrl: 'https://mock-payment.url', externalId: 'ext-1',
  qrisString: null, paidAt: null,
  expiresAt: new Date(Date.now() + 3600000),
  createdAt: new Date(), updatedAt: new Date(),
};

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
    jest.clearAllMocks();
    config.midtransServerKey = 'SB-Mid-server-valid-test-key';
    config.midtransMerchantId = 'test-merchant';
    (midtransClient.Snap as jest.Mock).mockImplementation(() => ({
      createTransaction: jest.fn().mockResolvedValue({
        token: 'midtrans-token',
        redirect_url: 'https://app.sandbox.midtrans.com/snap/test',
      }),
    }));
    (midtransClient.CoreApi as jest.Mock).mockImplementation(() => ({
      transaction: { refund: jest.fn().mockResolvedValue({ status_code: '200', transaction_status: 'refund' }) },
    }));
    (mockPrisma.payment.create as jest.Mock).mockResolvedValue(mockPayment);
    mockPrisma.paymentWebhookLog.update.mockResolvedValue({});
    mockPrisma.outboxEvent.create.mockResolvedValue({});
  });

  describe('getPaymentByOrderId', () => {
    it('returns payment when found', async () => {
      mockPaymentRepo.findByOrderId.mockResolvedValue(mockPayment as any);

      const result = await service.getPaymentByOrderId('order-1', { userId: 'user-1', role: 'CUSTOMER' });
      expect(result.orderId).toBe('order-1');
    });

    it('rejects a customer who does not own the payment', async () => {
      mockPaymentRepo.findByOrderId.mockResolvedValue(mockPayment as any);

      await expect(service.getPaymentByOrderId('order-1', { userId: 'user-2', role: 'CUSTOMER' }))
        .rejects.toThrow('not allowed');
    });

    it('throws NotFoundError when payment does not exist', async () => {
      mockPaymentRepo.findByOrderId.mockResolvedValue(null);

      await expect(service.getPaymentByOrderId('bad')).rejects.toThrow('Payment not found');
    });
  });

  describe('createPayment', () => {
    it('returns existing payment when one already exists (idempotent)', async () => {
      mockPaymentRepo.findByOrderId.mockResolvedValue(mockPayment as any);

      const result = await service.createPayment('order-1', 'user-1', 115000);
      expect(result.id).toBe('pay-1');
      expect(mockPaymentRepo.create).not.toHaveBeenCalled();
    });

    it('creates new payment when none exists', async () => {
      mockPaymentRepo.findByOrderId.mockResolvedValue(null);
      mockPaymentRepo.create.mockResolvedValue(mockPayment as any);

      const result = await service.createPayment('order-1', 'user-1', 115000);
      expect(result.orderId).toBe('order-1');
      expect(mockPrisma.payment.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ qrisString: null, externalId: 'midtrans-token' }),
      }));
    });

    it('fails closed when Midtrans is not configured', async () => {
      mockPaymentRepo.findByOrderId.mockResolvedValue(null);
      config.midtransServerKey = 'SB-Mid-server-nexacommerce-stage3-secret';

      await expect(service.createPayment('order-1', 'user-1', 115000))
        .rejects.toThrow('Midtrans is not configured');
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
    });

    it('does not accept the former mock webhook signature', () => {
      expect((service as any).verifySignature('order-1', '200', '115000.00', 'mock-signature')).toBe(false);
    });
  });

  describe('requestRefund', () => {
    const idempotencyKey = '89ac0ad1-e43f-4fab-8e7e-ffb12a550e63';

    beforeEach(() => {
      mockPaymentRepo.findByOrderId.mockResolvedValue({ ...mockPayment, status: 'PAID' } as any);
      mockPrisma.refund.findUnique.mockResolvedValue(null);
      mockPrisma.refund.findFirst.mockResolvedValue(null);
      mockPrisma.refund.aggregate.mockResolvedValue({ _sum: { amount: null } });
      mockPrisma.refund.create.mockResolvedValue({ id: idempotencyKey, paymentId: 'pay-1', orderId: 'order-1', amount: 115000, reason: 'Return approved', status: 'PENDING' });
      mockPrisma.refund.update.mockResolvedValue({ id: idempotencyKey, status: 'FAILED' });
      mockPrisma.payment.findUnique.mockResolvedValue({ ...mockPayment, status: 'PAID' });
      mockPrisma.paymentLog.create.mockResolvedValue({ id: 'log-1' });
      (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'order-1', customerId: 'user-1', status: 'RETURN_RECEIVED', returnReceivedAt: '2026-09-28T03:00:00Z' } }),
      });
    });

    it('reserves and submits a received-return refund using Midtrans refund_key', async () => {
      const result = await service.requestRefund('order-1', 115000, 'Return approved', idempotencyKey);

      expect(result).toMatchObject({ id: idempotencyKey, status: 'PENDING' });
      expect(mockPrisma.refund.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ id: idempotencyKey, amount: expect.anything(), status: 'PENDING' }),
      }));
      const coreApi = (midtransClient.CoreApi as jest.Mock).mock.results[0].value;
      expect(coreApi.transaction.refund).toHaveBeenCalledWith('ext-1', {
        refund_key: idempotencyKey,
        amount: 115000,
        reason: 'Return approved',
      });
    });

    it('refuses to submit a refund before the return is physically received', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'order-1', customerId: 'user-1', status: 'RETURN_REQUESTED' } }),
      });

      await expect(service.requestRefund('order-1', 115000, 'Return approved', idempotencyKey))
        .rejects.toThrow('physical return is received');
      expect(mockPrisma.refund.create).not.toHaveBeenCalled();
    });

    it('refuses an approved return that has no physical receipt confirmation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'order-1', customerId: 'user-1', status: 'RETURN_APPROVED', returnReceivedAt: null } }),
      });

      await expect(service.requestRefund('order-1', 115000, 'Return approved', idempotencyKey))
        .rejects.toThrow('physical return is received');
      expect(mockPrisma.refund.create).not.toHaveBeenCalled();
    });

    it('does not exceed the payment amount after existing refunds', async () => {
      mockPrisma.refund.aggregate.mockResolvedValue({ _sum: { amount: 50000 } });

      await expect(service.requestRefund('order-1', 70000, 'Return approved', idempotencyKey))
        .rejects.toThrow('remaining refundable');
      expect(mockPrisma.refund.create).not.toHaveBeenCalled();
    });

    it('requires a stable idempotency key and bounded reason', async () => {
      await expect(service.requestRefund('order-1', 115000, 'Return approved', ''))
        .rejects.toThrow('Idempotency-Key');
      await expect(service.requestRefund('order-1', 115000, 'x'.repeat(256), idempotencyKey))
        .rejects.toThrow('255 characters');
    });

    it('only completes a refund from a bank-confirmed Midtrans notification', async () => {
      const refundKey = 'b6810000-0000-4000-8000-000000000001';
      const grossAmount = '115000.00';
      const signature = require('crypto').createHash('sha512')
        .update(`order-1${'200'}${grossAmount}${config.midtransServerKey}`).digest('hex');
      mockPaymentRepo.findWebhookLogByEventKey.mockResolvedValue(null);
      mockPaymentRepo.createWebhookLog.mockResolvedValue({ id: 'webhook-refund', isProcessed: false } as any);
      mockPaymentRepo.updateWebhookLog.mockResolvedValue({} as any);
      mockPaymentRepo.findByOrderId.mockResolvedValue({ ...mockPayment, status: 'PAID' } as any);
      mockPrisma.refund.findUnique.mockResolvedValue({ id: refundKey, paymentId: 'pay-1', orderId: 'order-1', status: 'PENDING' });
      mockPrisma.refund.aggregate.mockResolvedValue({ _sum: { amount: 115000 } });
      (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({ ok: true });

      const result = await service.handleWebhook({
        order_id: 'order-1', transaction_status: 'refund', status_code: '200', gross_amount: grossAmount,
        signature_key: signature, transaction_id: 'transaction-1', merchant_id: 'test-merchant',
        refund_key: refundKey, refund_amount: grossAmount,
        refunds: [{ refund_key: refundKey, refund_amount: grossAmount, bank_confirmed_at: '2026-09-24T02:00:00Z' }],
      });

      expect(result).toEqual({ status: 'PROCESSED', paymentStatus: 'REFUNDED' });
      expect(mockPrisma.refund.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: refundKey }, data: expect.objectContaining({ status: 'PROCESSED' }),
      }));
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'REFUNDED' } }));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/refund-completed'), expect.objectContaining({ method: 'POST' }));
    });

    it('keeps a refund pending until the bank confirmation timestamp arrives', async () => {
      const refundKey = 'b6810000-0000-4000-8000-000000000002';
      const grossAmount = '115000.00';
      const signature = require('crypto').createHash('sha512')
        .update(`order-1${'200'}${grossAmount}${config.midtransServerKey}`).digest('hex');
      mockPaymentRepo.findWebhookLogByEventKey.mockResolvedValue(null);
      mockPaymentRepo.createWebhookLog.mockResolvedValue({ id: 'webhook-refund-pending', isProcessed: false } as any);
      mockPaymentRepo.updateWebhookLog.mockResolvedValue({} as any);
      mockPaymentRepo.findByOrderId.mockResolvedValue({ ...mockPayment, status: 'PAID' } as any);
      mockPrisma.refund.findUnique.mockResolvedValue({ id: refundKey, paymentId: 'pay-1', orderId: 'order-1', status: 'PENDING' });
      mockPrisma.refund.aggregate.mockResolvedValue({ _sum: { amount: null } });

      const result = await service.handleWebhook({
        order_id: 'order-1', transaction_status: 'refund', status_code: '200', gross_amount: grossAmount,
        signature_key: signature, transaction_id: 'transaction-1', merchant_id: 'test-merchant',
        refund_key: refundKey, refund_amount: grossAmount,
      });

      expect(result).toEqual({ status: 'REFUND_PENDING_PROVIDER_CONFIRMATION', paymentStatus: 'PAID' });
      expect(mockPrisma.refund.update).not.toHaveBeenCalled();
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    it('rejects a correctly signed notification for another merchant', async () => {
      const grossAmount = '115000.00';
      const signature = require('crypto')
        .createHash('sha512')
        .update(`order-1${'200'}${grossAmount}${config.midtransServerKey}`)
        .digest('hex');
      mockPaymentRepo.findWebhookLogByEventKey.mockResolvedValue(null);
      mockPaymentRepo.createWebhookLog.mockResolvedValue({ id: 'webhook-1' } as any);
      mockPaymentRepo.updateWebhookLog.mockResolvedValue({} as any);

      await expect(service.handleWebhook({
        order_id: 'order-1',
        transaction_status: 'settlement',
        status_code: '200',
        gross_amount: grossAmount,
        signature_key: signature,
        transaction_id: 'transaction-1',
        merchant_id: 'another-merchant',
      })).rejects.toThrow('merchant does not match');

      expect(mockPaymentRepo.findByOrderId).not.toHaveBeenCalled();
    });

    it('does not regress a terminal PAID payment to EXPIRED', async () => {
      const grossAmount = '115000.00';
      const signature = require('crypto')
        .createHash('sha512')
        .update(`order-1${'407'}${grossAmount}${config.midtransServerKey}`)
        .digest('hex');
      mockPaymentRepo.findWebhookLogByEventKey.mockResolvedValue(null);
      mockPaymentRepo.createWebhookLog.mockResolvedValue({ id: 'webhook-2' } as any);
      mockPaymentRepo.updateWebhookLog.mockResolvedValue({} as any);
      mockPaymentRepo.findByOrderId.mockResolvedValue({ ...mockPayment, status: 'PAID' } as any);

      const result = await service.handleWebhook({
        order_id: 'order-1',
        transaction_status: 'expire',
        status_code: '407',
        gross_amount: grossAmount,
        signature_key: signature,
        transaction_id: 'transaction-2',
        merchant_id: 'test-merchant',
      });

      expect(result).toEqual({ status: 'IGNORED', paymentStatus: 'PAID' });
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
    });

    it('stores a payment success event in the outbox in the status transaction', async () => {
      const grossAmount = '115000.00';
      const signature = require('crypto')
        .createHash('sha512')
        .update(`order-1${'200'}${grossAmount}${config.midtransServerKey}`)
        .digest('hex');
      mockPaymentRepo.findWebhookLogByEventKey.mockResolvedValue(null);
      mockPaymentRepo.createWebhookLog.mockResolvedValue({ id: 'webhook-paid' } as any);
      mockPaymentRepo.updateWebhookLog.mockResolvedValue({} as any);
      mockPaymentRepo.findByOrderId.mockResolvedValue(mockPayment as any);

      const result = await service.handleWebhook({
        order_id: 'order-1',
        transaction_status: 'settlement',
        status_code: '200',
        gross_amount: grossAmount,
        signature_key: signature,
        transaction_id: 'transaction-paid',
        merchant_id: 'test-merchant',
        settlement_time: '2026-09-24T03:00:00Z',
      });

      expect(result).toEqual({ status: 'PROCESSED', paymentStatus: 'PAID' });
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          aggregateType: 'Payment',
          aggregateId: 'pay-1',
          eventName: 'PaymentSuccess',
          routingKey: 'payment.success',
          eventPayload: expect.objectContaining({
            eventId: expect.any(String),
            eventName: 'PaymentSuccess',
            payload: expect.objectContaining({ orderId: 'order-1', amount: 115000 }),
          }),
        }),
      });
      expect(mockPrisma.paymentWebhookLog.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'webhook-paid' },
        data: expect.objectContaining({ isProcessed: true }),
      }));
    });

    it('does not let an invalid signature reserve the valid callback event key', async () => {
      mockPaymentRepo.findWebhookLogByEventKey.mockResolvedValue(null);
      mockPaymentRepo.createWebhookLog.mockResolvedValue({ id: 'webhook-invalid' } as any);
      mockPaymentRepo.updateWebhookLog.mockResolvedValue({} as any);

      const basePayload = {
        order_id: 'order-1',
        transaction_status: 'settlement',
        status_code: '200',
        gross_amount: '115000.00',
        transaction_id: 'transaction-3',
        merchant_id: 'test-merchant',
      };

      await expect(service.handleWebhook({ ...basePayload, signature_key: 'invalid-a' }))
        .rejects.toThrow('Invalid signature');
      const firstEventKey = mockPaymentRepo.createWebhookLog.mock.calls[0][0].eventKey;

      jest.clearAllMocks();
      mockPaymentRepo.findWebhookLogByEventKey.mockResolvedValue(null);
      mockPaymentRepo.createWebhookLog.mockResolvedValue({ id: 'webhook-invalid-2' } as any);
      mockPaymentRepo.updateWebhookLog.mockResolvedValue({} as any);
      await expect(service.handleWebhook({ ...basePayload, signature_key: 'invalid-b' }))
        .rejects.toThrow('Invalid signature');
      const secondEventKey = mockPaymentRepo.createWebhookLog.mock.calls[0][0].eventKey;

      expect(secondEventKey).not.toBe(firstEventKey);
    });
  });

  describe('getPaymentById', () => {
    it('returns payment for valid id', async () => {
      mockPaymentRepo.findById.mockResolvedValue(mockPayment as any);

      const result = await service.getPaymentById('pay-1');
      expect(result.id).toBe('pay-1');
    });

    it('throws NotFoundError for unknown id', async () => {
      mockPaymentRepo.findById.mockResolvedValue(null);

      await expect(service.getPaymentById('bad')).rejects.toThrow('Payment not found');
    });
  });
});
