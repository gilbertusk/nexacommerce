jest.mock('../../src/services/voucher.service', () => ({
  voucherService: {
    validateCustomerVoucher: jest.fn(),
  },
}));

import { Request, Response } from 'express';
import { voucherService } from '../../src/services/voucher.service';
import { voucherController } from '../../src/controllers/voucher.controller';

const validateCustomerVoucher = voucherService.validateCustomerVoucher as jest.Mock;

describe('VoucherController customer validation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses authenticated identity and code only, ignoring client-supplied discount inputs', async () => {
    validateCustomerVoucher.mockResolvedValue({
      voucher: { code: 'SAVE10' },
      discountAmount: 25000,
    });
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = {
      headers: { 'x-user-id': 'customer-1' },
      body: {
        code: ' save10 ',
        items: [{ price: 1, quantity: 999, categoryId: 'forged', sellerId: 'forged' }],
      },
    } as unknown as Request;
    const res = { status } as unknown as Response;

    await voucherController.validateVoucher(req, res);

    expect(validateCustomerVoucher).toHaveBeenCalledWith('SAVE10', 'customer-1');
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: { voucher: { code: 'SAVE10' }, discountAmount: 25000 },
    }));
  });
});
