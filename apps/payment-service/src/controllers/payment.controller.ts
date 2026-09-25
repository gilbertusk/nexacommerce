import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { successResponse, ValidationError } from '@nexacommerce/common';

export class PaymentController {
  createPaymentInternal = async (req: Request, res: Response) => {
    const { orderId, customerId, amount } = req.body;
    if (!orderId || !customerId || amount === undefined) {
      throw new ValidationError('Missing required fields: orderId, customerId, amount');
    }

    const payment = await paymentService.createPayment(orderId, customerId, Number(amount));
    res.status(201).json(successResponse(payment, 'Payment transaction created internally'));
  };

  requestRefund = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { amount, reason } = req.body;
    const idempotencyKey = req.header('Idempotency-Key') || '';
    const refund = await paymentService.requestRefund(orderId, Number(amount), reason, idempotencyKey);
    res.status(202).json(successResponse(refund, 'Refund request accepted; final completion awaits Midtrans/bank confirmation'));
  };

  getPaymentByOrderId = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    const payment = await paymentService.getPaymentByOrderId(orderId, { userId, role });
    res.status(200).json(successResponse(payment, 'Payment details retrieved successfully'));
  };

  webhookMidtrans = async (req: Request, res: Response) => {
    const payload = req.body;
    
    // Process webhook async or sync?
    // Midtrans expects standard status response, so we process it and respond 200 OK.
    const result = await paymentService.handleWebhook(payload);
    
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result,
    });
  };

  listAllPayments = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const status = req.query.status as string | undefined;
    const result = await paymentService.listAllPayments({ page, limit, status });
    res.status(200).json(successResponse(result, 'Payments retrieved successfully'));
  };

  getPaymentStats = async (req: Request, res: Response) => {
    const result = await paymentService.getPaymentStats();
    res.status(200).json(successResponse(result, 'Payment stats retrieved successfully'));
  };
}

export const paymentController = new PaymentController();
