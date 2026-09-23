import { Request, Response } from 'express';
import { shippingService } from '../services/shipping.service';
import { successResponse, ValidationError } from '@nexacommerce/common';

export class ShippingController {
  getCouriers = async (req: Request, res: Response) => {
    const result = await shippingService.getCouriers();
    res.status(200).json(successResponse(result, 'Couriers retrieved successfully'));
  };

  getRates = async (req: Request, res: Response) => {
    const { originCity, destinationCity, weight, courierCode } = req.query;
    if (!originCity || !destinationCity || !weight) {
      throw new ValidationError('originCity, destinationCity, and weight are required query params');
    }

    const result = await shippingService.getRates({
      originCity: originCity as string,
      destinationCity: destinationCity as string,
      weight: parseInt(weight as string, 10),
      courierCode: courierCode ? (courierCode as string) : undefined,
    });

    res.status(200).json(successResponse(result, 'Shipping rates retrieved successfully'));
  };

  createShippingOrder = async (req: Request, res: Response) => {
    const { orderId, courierId, serviceCode, weight, originCity, destinationAddress, notes } = req.body;
    if (!orderId || !courierId || !serviceCode || !weight || !originCity || !destinationAddress) {
      throw new ValidationError('Missing required fields for shipping order creation');
    }

    const result = await shippingService.createShippingOrder({
      orderId,
      courierId,
      serviceCode,
      weight,
      originCity,
      destinationAddress,
      notes,
    });

    res.status(201).json(successResponse(result, 'Shipping order created successfully'));
  };

  getShippingOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    const result = await shippingService.getShippingOrder(orderId, { userId, role: userRole });
    res.status(200).json(successResponse(result, 'Shipping order retrieved successfully'));
  };

  updateShippingStatus = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status, location, note } = req.body;
    if (!status) {
      throw new ValidationError('status is required');
    }

    const userId = req.headers['x-user-id'] as string || 'SYSTEM';
    const userRole = req.headers['x-user-role'] as string || 'SYSTEM';

    const result = await shippingService.updateShippingStatus(orderId, { userId, role: userRole }, {
      status,
      location,
      note,
    });

    res.status(200).json(successResponse(result, 'Shipping status updated successfully'));
  };

  getSellerShippingOrders = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await shippingService.getSellerShippingOrders(userId, page, limit);
    res.status(200).json(successResponse(result, 'Seller shipping orders retrieved successfully'));
  };

  getAdminShippingOrders = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string;
    const courierId = req.query.courierId as string;

    const result = await shippingService.getAdminShippingOrders({
      page,
      limit,
      status,
      courierId,
    });

    res.status(200).json(successResponse(result, 'Admin shipping orders retrieved successfully'));
  };

  // --- Internal microservice endpoints ---
  internalGetShipping = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const result = await shippingService.getShippingOrder(orderId);
    res.status(200).json(successResponse(result, 'Shipping order data retrieved'));
  };

  internalCreateShipping = async (req: Request, res: Response) => {
    const { orderId, courierId, serviceCode, weight, originCity, destinationAddress, notes } = req.body;
    const result = await shippingService.createShippingOrder({
      orderId,
      courierId,
      serviceCode,
      weight,
      originCity,
      destinationAddress,
      notes,
    });
    res.status(201).json(successResponse(result, 'Shipping order created internally'));
  };

  trackByTrackingNumber = async (req: Request, res: Response) => {
    const { trackingNumber } = req.params;
    const result = await shippingService.trackByTrackingNumber(trackingNumber);
    res.status(200).json(successResponse(result, 'Shipment tracking retrieved successfully'));
  };

  updateTrackingNumber = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
      throw new ValidationError('trackingNumber is required');
    }

    const userId = req.headers['x-user-id'] as string || 'SYSTEM';
    const userRole = req.headers['x-user-role'] as string || 'SYSTEM';

    const result = await shippingService.updateTrackingNumber(orderId, { userId, role: userRole }, trackingNumber);
    res.status(200).json(successResponse(result, 'Tracking number updated successfully'));
  };
}

export const shippingController = new ShippingController();
export default shippingController;
