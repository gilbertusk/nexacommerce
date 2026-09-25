jest.mock('../../src/repositories/voucher.repository');
jest.mock('../../src/prisma/client', () => ({ prisma: {} }));

import { VoucherService } from '../../src/services/voucher.service';
import { voucherRepository } from '../../src/repositories/voucher.repository';
import { Prisma } from '../../src/generated/client';

const mockVoucherRepo = voucherRepository as jest.Mocked<typeof voucherRepository>;

const future = new Date(Date.now() + 86400000 * 30);
const past = new Date(Date.now() - 1000);

const mockVoucher = {
  id: 'v-1', code: 'SAVE10', type: 'PERCENTAGE' as any,
  value: new Prisma.Decimal(10), minPurchase: new Prisma.Decimal(50000),
  maxDiscount: new Prisma.Decimal(20000), usageLimit: 100, usageCount: 5,
  usageLimitPerUser: 1, scope: 'ALL' as any, scopeReferenceId: null,
  startsAt: past, endsAt: future, status: 'ACTIVE' as any,
  createdBy: 'admin-1', createdAt: new Date(), updatedAt: new Date(),
};

describe('VoucherService', () => {
  let service: VoucherService;

  beforeEach(() => {
    service = new VoucherService();
    jest.clearAllMocks();
  });

  describe('createVoucher', () => {
    it('creates voucher when code is unique', async () => {
      mockVoucherRepo.findByCode.mockResolvedValue(null);
      mockVoucherRepo.create.mockResolvedValue(mockVoucher as any);

      const result = await service.createVoucher({
        code: 'save10', type: 'PERCENTAGE', value: 10,
        minPurchase: 50000, usageLimit: 100,
        startsAt: past.toISOString(), endsAt: future.toISOString(),
        createdBy: 'admin-1',
      });
      expect(result.code).toBe('SAVE10');
    });

    it('throws ValidationError when code already exists', async () => {
      mockVoucherRepo.findByCode.mockResolvedValue(mockVoucher as any);

      await expect(service.createVoucher({ code: 'SAVE10', type: 'PERCENTAGE', value: 10, startsAt: past, endsAt: future, createdBy: 'a' }))
        .rejects.toThrow('already exists');
    });
  });

  describe('getVoucherById', () => {
    it('returns voucher for valid id', async () => {
      mockVoucherRepo.findById.mockResolvedValue(mockVoucher as any);

      const result = await service.getVoucherById('v-1');
      expect(result.code).toBe('SAVE10');
    });

    it('throws NotFoundError for unknown id', async () => {
      mockVoucherRepo.findById.mockResolvedValue(null);

      await expect(service.getVoucherById('bad')).rejects.toThrow('Voucher not found');
    });
  });

  describe('validateVoucher', () => {
    it('returns discount amount for valid PERCENTAGE voucher', async () => {
      mockVoucherRepo.findByCode.mockResolvedValue(mockVoucher as any);
      mockVoucherRepo.countUsageByUser.mockResolvedValue(0);

      const result = await service.validateVoucher(
        'SAVE10',
        'user-1',
        [{ price: 200000, quantity: 1, categoryId: 'c-1', sellerId: 'seller-1' }]
      );
      expect(result.discountAmount).toBeGreaterThan(0);
    });

    it('rejects when subtotal is below minPurchase', async () => {
      mockVoucherRepo.findByCode.mockResolvedValue(mockVoucher as any);
      mockVoucherRepo.countUsageByUser.mockResolvedValue(0);

      await expect(service.validateVoucher(
        'SAVE10',
        'user-1',
        [{ price: 10000, quantity: 1, categoryId: 'c-1', sellerId: 'seller-1' }]
      )).rejects.toThrow();
    });

    it('throws NotFoundError for unknown voucher code', async () => {
      mockVoucherRepo.findByCode.mockResolvedValue(null);

      await expect(service.validateVoucher('BAD', 'u', []))
        .rejects.toThrow();
    });

    it('caps a seller-scoped fixed discount at that seller eligible subtotal', async () => {
      mockVoucherRepo.findByCode.mockResolvedValue({
        ...mockVoucher,
        type: 'FIXED_AMOUNT',
        value: new Prisma.Decimal(400000),
        minPurchase: new Prisma.Decimal(0),
        maxDiscount: null,
        scope: 'SELLER',
        scopeReferenceId: 'seller-1',
      } as any);
      mockVoucherRepo.countUsageByUser.mockResolvedValue(0);

      const result = await service.validateVoucher('SAVE10', 'user-1', [
        { price: 100000, quantity: 1, categoryId: 'c-1', sellerId: 'seller-1' },
        { price: 900000, quantity: 1, categoryId: 'c-1', sellerId: 'seller-2' },
      ]);

      expect(result.discountAmount).toBe(100000);
    });
  });

  describe('validateCustomerVoucher', () => {
    it('loads cart quantity and current product price/scope from trusted services', async () => {
      mockVoucherRepo.findByCode.mockResolvedValue(mockVoucher as any);
      mockVoucherRepo.countUsageByUser.mockResolvedValue(0);
      const fetchMock = jest.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { items: [{ productId: 'p-1', quantity: 2 }] } }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [{ id: 'p-1', status: 'ACTIVE', price: '250000', categoryId: 'cat-live', sellerId: 'seller-live' }] }),
        } as Response);

      const result = await service.validateCustomerVoucher('SAVE10', 'user-1');

      expect(result.discountAmount).toBe(20000);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][0]).toContain('/cart/internal/cart/user-1');
      expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ ids: ['p-1'] });
    });

    it('rejects an empty server-side cart', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { items: [] } }),
      } as Response);

      await expect(service.validateCustomerVoucher('SAVE10', 'user-1')).rejects.toThrow('Cart is empty');
      expect(mockVoucherRepo.findByCode).not.toHaveBeenCalled();
    });
  });
});
