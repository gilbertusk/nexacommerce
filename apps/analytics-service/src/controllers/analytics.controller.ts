import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { successResponse } from '@nexacommerce/common';

function parseDateParam(val: any): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? undefined : d;
}

class AnalyticsController {
  async adminDashboard(req: Request, res: Response) {
    const data = await analyticsService.getAdminDashboard();
    res.status(200).json(successResponse(data, 'Dashboard retrieved'));
  }

  async sellerDashboard(req: Request, res: Response) {
    const sellerId = req.headers['x-user-id'] as string;
    const data = await analyticsService.getSellerDashboard(sellerId);
    res.status(200).json(successResponse(data, 'Seller dashboard retrieved'));
  }

  async revenueReport(req: Request, res: Response) {
    const period = (req.query.period as string) === 'monthly' ? 'monthly' : 'daily';
    const startDate = parseDateParam(req.query.startDate);
    const endDate = parseDateParam(req.query.endDate);
    const data = await analyticsService.getRevenueReport(period, startDate, endDate);
    res.status(200).json(successResponse(data, 'Revenue report retrieved'));
  }

  async orderReport(req: Request, res: Response) {
    const period = (req.query.period as string) === 'monthly' ? 'monthly' : 'daily';
    const startDate = parseDateParam(req.query.startDate);
    const endDate = parseDateParam(req.query.endDate);
    const data = await analyticsService.getOrderReport(period, startDate, endDate);
    res.status(200).json(successResponse(data, 'Order report retrieved'));
  }

  async topProducts(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const period = (req.query.period as string) || 'all_time';
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;
    const sellerId = userRole === 'SELLER' ? userId : null;
    const data = await analyticsService.getTopProducts(limit, period, month, year, sellerId);
    res.status(200).json(successResponse(data, 'Top products retrieved'));
  }

  async topCategories(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const period = (req.query.period as string) || 'all_time';
    const data = await analyticsService.getTopCategories(limit, period);
    res.status(200).json(successResponse(data, 'Top categories retrieved'));
  }

  async sellerPerformance(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const period = (req.query.period as string) || 'all_time';
    const sortBy = (req.query.sortBy as string) || 'revenue';
    const data = await analyticsService.getSellerPerformance(limit, period, sortBy);
    res.status(200).json(successResponse(data, 'Seller performance retrieved'));
  }

  async paymentSuccessRate(req: Request, res: Response) {
    const period = (req.query.period as string) === 'monthly' ? 'monthly' : 'daily';
    const startDate = parseDateParam(req.query.startDate);
    const endDate = parseDateParam(req.query.endDate);
    const data = await analyticsService.getPaymentSuccessRate(period, startDate, endDate);
    res.status(200).json(successResponse(data, 'Payment success rate retrieved'));
  }

  async cancellationRate(req: Request, res: Response) {
    const period = (req.query.period as string) === 'monthly' ? 'monthly' : 'daily';
    const startDate = parseDateParam(req.query.startDate);
    const endDate = parseDateParam(req.query.endDate);
    const data = await analyticsService.getCancellationRate(period, startDate, endDate);
    res.status(200).json(successResponse(data, 'Cancellation rate retrieved'));
  }
}

export const analyticsController = new AnalyticsController();
