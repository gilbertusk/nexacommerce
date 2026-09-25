jest.mock('../../src/services/order.service', () => ({
  orderService: { listOrders: jest.fn() },
}));

import { OrderController } from '../../src/controllers/order.controller';
import { orderService } from '../../src/services/order.service';

describe('Order review eligibility response', () => {
  const controller = new OrderController();
  const response = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  beforeEach(() => jest.clearAllMocks());

  it('returns the authoritative order ID for a matching completed order item', async () => {
    (orderService.listOrders as jest.Mock).mockResolvedValue({
      orders: [{ id: 'order-real', items: [{ id: 'item-1', productId: 'product-1' }] }],
    });
    const res = response();

    await controller.internalCheckReviewEligibility({
      query: { customerId: 'customer-1', productId: 'product-1', orderItemId: 'item-1' },
    } as any, res as any);

    expect(orderService.listOrders).toHaveBeenCalledWith(
      { userId: 'customer-1', role: 'CUSTOMER' },
      { page: 1, limit: 200, status: 'COMPLETED' },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data).toEqual({ eligible: true, reason: 'OK', orderId: 'order-real' });
  });

  it('returns no order ID when no eligible completed item exists', async () => {
    (orderService.listOrders as jest.Mock).mockResolvedValue({ orders: [] });
    const res = response();

    await controller.internalCheckReviewEligibility({
      query: { customerId: 'customer-1', productId: 'product-1', orderItemId: 'item-1' },
    } as any, res as any);

    expect(res.json.mock.calls[0][0].data).toEqual({
      eligible: false,
      reason: 'No completed order found for this item',
      orderId: null,
    });
  });
});
