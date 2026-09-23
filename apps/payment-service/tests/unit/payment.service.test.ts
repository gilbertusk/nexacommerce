jest.mock('../../src/repositories/payment.repository');
const mockPrisma: any = {
  $transaction: jest.fn((cb) => cb(mockPrisma)),
  payment: {
    create: jest.fn(),
    update: jest.fn(),
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
    (mockPrisma.payment.create as jest.Mock).mockResolvedValue(mockPayment);
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
