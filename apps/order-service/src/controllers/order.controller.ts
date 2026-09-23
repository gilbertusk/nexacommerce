import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { successResponse, ValidationError } from '@nexacommerce/common';
import { checkoutSchema, updateOrderStatusSchema } from '@nexacommerce/validation';

export class OrderController {
  checkout = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new ValidationError('Authentication required: user ID missing');
    }

    const validatedData = checkoutSchema.parse(req.body);
    const result = await orderService.checkout(userId, validatedData);
    
    res.status(201).json(successResponse(result, 'Checkout completed successfully'));
  };

  listOrders = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    if (!userId || !userRole) {
      throw new ValidationError('Authentication required: user ID or role missing');
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string;

    const result = await orderService.listOrders({ userId, role: userRole }, { page, limit, status });
    res.status(200).json(successResponse(result, 'Orders list retrieved successfully'));
  };

  getOrderById = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    if (!userId || !userRole) {
      throw new ValidationError('Authentication required: user ID or role missing');
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id, { userId, role: userRole });
    res.status(200).json(successResponse(order, 'Order details retrieved successfully'));
  };

  cancelOrder = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    if (!userId || !userRole) {
      throw new ValidationError('Authentication required: user ID or role missing');
    }

    const { id } = req.params;
    const { reason } = req.body;

    const order = await orderService.cancelOrder(id, { userId, role: userRole }, reason || undefined);
    res.status(200).json(successResponse(order, 'Order cancelled successfully'));
  };

  updateStatus = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    if (!userId || !userRole) {
      throw new ValidationError('Authentication required: user ID or role missing');
    }

    const { id } = req.params;
    const validatedData = updateOrderStatusSchema.parse(req.body);

    const order = await orderService.updateOrderStatus(
      id,
      { userId, role: userRole },
      validatedData.status,
      validatedData.note || undefined
    );

    res.status(200).json(successResponse(order, 'Order status updated successfully'));
  };

  completeOrder = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new ValidationError('Authentication required: user ID missing');
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id, { userId, role: 'CUSTOMER' });
    if (order.customerId !== userId) {
      throw new ValidationError('Access denied: You do not own this order');
    }

    const result = await orderService.handleOrderCompleted(id, userId);
    res.status(200).json(successResponse(result, 'Order completed successfully'));
  };

  internalGetOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId, { userId: 'internal', role: 'ADMIN' });
    res.status(200).json(successResponse(order, 'Order retrieved'));
  };

  internalGetSellerOrders = async (req: Request, res: Response) => {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 100;

    const result = await orderService.listOrders(
      { userId: sellerId, role: 'SELLER' },
      { page, limit }
    );
    res.status(200).json(successResponse(result.orders, 'Seller orders retrieved'));
  };

  internalGetRecentSellerOrders = async (req: Request, res: Response) => {
    const { sellerId } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 5;

    const result = await orderService.listOrders(
      { userId: sellerId, role: 'SELLER' },
      { page: 1, limit }
    );

    const orders = result.orders.map((o: any) => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      total: Number(o.grandTotal),
      status: o.status,
      date: o.createdAt,
    }));

    res.status(200).json(successResponse(orders, 'Recent seller orders retrieved'));
  };

  internalCheckReviewEligibility = async (req: Request, res: Response) => {
    const { customerId, productId, orderItemId } = req.query;
    if (!customerId || !productId || !orderItemId) {
      return res.status(400).json({ success: false, message: 'customerId, productId, orderItemId are required' });
    }

    const allOrders = await orderService.listOrders(
      { userId: customerId as string, role: 'CUSTOMER' },
      { page: 1, limit: 200, status: 'COMPLETED' }
    );

    let eligible = false;
    let reason = 'No completed order found for this item';

    for (const order of allOrders.orders) {
      const item = order.items?.find((i: any) => i.id === orderItemId && i.productId === productId);
      if (item) {
        eligible = true;
        reason = 'OK';
        break;
      }
    }

    res.status(200).json(successResponse({ eligible, reason }, 'Eligibility checked'));
  };

  adminListAllOrders = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string | undefined;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    const result = await orderService.adminListAllOrders({ page, limit, status, dateFrom, dateTo });
    res.status(200).json(successResponse(result, 'All orders retrieved successfully'));
  };

  requestReturn = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw new ValidationError('Authentication required: user ID missing');

    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) throw new ValidationError('reason is required');

    const order = await orderService.requestReturn(id, userId, reason);
    res.status(200).json(successResponse(order, 'Return request submitted successfully'));
  };

  updateReturnRequest = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    if (!userId || !userRole) throw new ValidationError('Authentication required: user ID or role missing');

    const { id } = req.params;
    const { action, note } = req.body;
    if (!action || !['approve', 'reject'].includes(action)) {
      throw new ValidationError('action must be "approve" or "reject"');
    }

    const order = await orderService.updateReturnRequest(id, { userId, role: userRole }, action, note);
    res.status(200).json(successResponse(order, `Return request ${action}d successfully`));
  };
}

export const orderController = new OrderController();
