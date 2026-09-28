import { Request, Response } from 'express';
import { shippingService } from '../services/shipping.service';
import { shippingQuoteService, QuoteBlockedError } from '../services/shipping-quote.service';
import { successResponse, ValidationError } from '@nexacommerce/common';

/** Shape of a per-seller courier choice submitted with a quote request. */
function parseSelections(raw: unknown) {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new ValidationError('selections must be a non-empty array');
  }
  if (raw.length > 50) {
    throw new ValidationError('selections may contain at most 50 entries');
  }
  return raw.map((entry: any) => {
    const { sellerId, courierCode, serviceCode } = entry ?? {};
    for (const [field, value] of Object.entries({ sellerId, courierCode, serviceCode })) {
      if (typeof value !== 'string' || value.trim().length === 0 || value.length > 100) {
        throw new ValidationError(`selections[].${field} must be a non-empty string`);
      }
    }
    return { sellerId, courierCode, serviceCode };
  });
}

/** Serialise a fail-closed quote refusal with the reason a human can act on. */
function quoteBlockedResponse(res: Response, err: QuoteBlockedError) {
  res.status(422).json({
    success: false,
    message: err.message,
    reason: err.reason,
    details: err.details,
  });
}

export class ShippingController {
  adminListCouriers = async (_req: Request, res: Response) => {
    const couriers = await shippingService.adminListCouriers();
    res.status(200).json(successResponse(couriers, 'Managed couriers retrieved'));
  };

  adminCreateCourier = async (req: Request, res: Response) => {
    const adminId = req.headers['x-user-id'] as string;
    if (!adminId) throw new ValidationError('Authentication required: user ID missing');
    const courier = await shippingService.adminCreateCourier(adminId, req.body ?? {});
    res.status(201).json(successResponse(courier, 'Courier created successfully'));
  };

  adminListRates = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const result = await shippingService.adminListRates({
      page,
      limit,
      courierId: req.query.courierId as string | undefined,
      originCity: req.query.originCity as string | undefined,
      destinationCity: req.query.destinationCity as string | undefined,
    });
    res.status(200).json(successResponse(result, 'Managed shipping rates retrieved'));
  };

  adminCreateRate = async (req: Request, res: Response) => {
    const adminId = req.headers['x-user-id'] as string;
    if (!adminId) throw new ValidationError('Authentication required: user ID missing');
    const rate = await shippingService.adminCreateRate(adminId, req.body ?? {});
    res.status(201).json(successResponse(rate, 'Verified shipping rate created'));
  };

  adminUpdateRate = async (req: Request, res: Response) => {
    const adminId = req.headers['x-user-id'] as string;
    if (!adminId) throw new ValidationError('Authentication required: user ID missing');
    const rate = await shippingService.adminUpdateRate(req.params.rateId, adminId, req.body ?? {});
    res.status(200).json(successResponse(rate, 'Verified shipping rate updated'));
  };

  adminDeleteRate = async (req: Request, res: Response) => {
    await shippingService.adminDeleteRate(req.params.rateId);
    res.status(200).json(successResponse({ id: req.params.rateId }, 'Shipping rate deleted'));
  };

  /**
   * Issue a server-computed shipping quote for the authenticated customer.
   *
   * The response carries an opaque quote id and the per-seller breakdown. The
   * browser never sends a price in, and the id is the only thing checkout
   * accepts.
   */
  createQuote = async (req: Request, res: Response) => {
    const customerId = req.headers['x-user-id'] as string;
    if (!customerId) {
      throw new ValidationError('Authentication required: user ID missing');
    }

    const { addressId, selections } = req.body ?? {};
    if (typeof addressId !== 'string' || addressId.trim().length === 0) {
      throw new ValidationError('addressId is required');
    }

    try {
      const quote = await shippingQuoteService.issueQuote({
        customerId,
        addressId,
        selections: parseSelections(selections),
      });
      res.status(201).json(
        successResponse(
          {
            quoteId: quote.id,
            totalCost: Number(quote.totalCost),
            shipments: quote.shipments,
            destination: quote.destination,
            expiresAt: quote.expiresAt,
          },
          'Shipping quote issued',
        ),
      );
    } catch (err) {
      if (err instanceof QuoteBlockedError) {
        quoteBlockedResponse(res, err);
        return;
      }
      throw err;
    }
  };

  /** Read back a quote the caller owns, without consuming it. */
  getQuote = async (req: Request, res: Response) => {
    const customerId = req.headers['x-user-id'] as string;
    if (!customerId) {
      throw new ValidationError('Authentication required: user ID missing');
    }

    const quote = await shippingQuoteService.getQuoteForCustomer(req.params.quoteId, customerId);
    res.status(200).json(
      successResponse(
        {
          quoteId: quote.id,
          totalCost: Number(quote.totalCost),
          shipments: quote.shipments,
          destination: quote.destination,
          status: quote.status,
          expiresAt: quote.expiresAt,
        },
        'Shipping quote retrieved',
      ),
    );
  };

  /**
   * Resolve and consume a quote on behalf of checkout.
   *
   * Internal only. Order Service supplies the customer, the order id, and the
   * cart hash it independently computed; a mismatch means the cart changed
   * after the quote was issued and the stored price no longer applies.
   */
  internalConsumeQuote = async (req: Request, res: Response) => {
    const { quoteId } = req.params;
    const { customerId, orderId, cartHash } = req.body ?? {};

    for (const [field, value] of Object.entries({ customerId, orderId, cartHash })) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new ValidationError(`${field} is required`);
      }
    }

    const quote = await shippingQuoteService.consumeQuote({ quoteId, customerId, orderId, cartHash });
    res.status(200).json(
      successResponse(
        {
          quoteId: quote.id,
          totalCost: Number(quote.totalCost),
          shipments: quote.shipments,
          destination: quote.destination,
        },
        'Shipping quote consumed',
      ),
    );
  };

  getCouriers = async (req: Request, res: Response) => {
    const result = await shippingService.getCouriers();
    res.status(200).json(successResponse(result, 'Couriers retrieved successfully'));
  };

  getRates = async (req: Request, res: Response) => {
    const { originCity, destinationCity, weight, courierCode } = req.query;
    if (!originCity || !destinationCity || !weight) {
      throw new ValidationError('originCity, destinationCity, and weight are required query params');
    }

    if (typeof weight !== 'string' || !/^\d+$/.test(weight)) {
      throw new ValidationError('weight must be a positive integer in grams');
    }

    const result = await shippingService.getRates({
      originCity: originCity as string,
      destinationCity: destinationCity as string,
      weight: Number(weight),
      courierCode: courierCode ? (courierCode as string) : undefined,
    });

    res.status(200).json(successResponse(result, 'Shipping rates retrieved successfully'));
  };

  createShippingOrder = async (req: Request, res: Response) => {
    const { orderId, sellerId, courierId, serviceCode, weight, originCity, originProvince, destinationAddress, notes } = req.body;
    if (!orderId || !sellerId || !courierId || !serviceCode || !weight || !originCity || !originProvince || !destinationAddress) {
      throw new ValidationError('Missing required fields for shipping order creation');
    }

    const result = await shippingService.createShippingOrder({
      orderId,
      sellerId,
      courierId,
      serviceCode,
      weight,
      originCity,
      originProvince,
      destinationAddress,
      notes,
    });

    res.status(201).json(successResponse(result, 'Shipping order created successfully'));
  };

  getShippingOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    const result = await shippingService.getShippingOrder(
      orderId,
      { userId, role: userRole },
      req.query.sellerId as string | undefined,
    );
    res.status(200).json(successResponse(result, 'Shipping order retrieved successfully'));
  };

  updateShippingStatus = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status, location, note, sellerId } = req.body;
    if (!status) {
      throw new ValidationError('status is required');
    }

    const userId = req.headers['x-user-id'] as string || 'SYSTEM';
    const userRole = req.headers['x-user-role'] as string || 'SYSTEM';

    const result = await shippingService.updateShippingStatus(orderId, { userId, role: userRole }, {
      status,
      location,
      note,
      sellerId,
    });

    res.status(200).json(successResponse(result, 'Shipping status updated successfully'));
  };

  getSellerShippingOrders = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string | undefined;

    const result = await shippingService.getSellerShippingOrders(userId, page, limit, status);
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
    const { orderId, sellerId, courierId, serviceCode, weight, originCity, originProvince, destinationAddress, notes } = req.body;
    const result = await shippingService.createShippingOrder({
      orderId,
      sellerId,
      courierId,
      serviceCode,
      weight,
      originCity,
      originProvince,
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
    const { trackingNumber, sellerId } = req.body;
    if (!trackingNumber) {
      throw new ValidationError('trackingNumber is required');
    }

    const userId = req.headers['x-user-id'] as string || 'SYSTEM';
    const userRole = req.headers['x-user-role'] as string || 'SYSTEM';

    const result = await shippingService.updateTrackingNumber(
      orderId,
      { userId, role: userRole },
      trackingNumber,
      sellerId,
    );
    res.status(200).json(successResponse(result, 'Tracking number updated successfully'));
  };
}

export const shippingController = new ShippingController();
export default shippingController;
