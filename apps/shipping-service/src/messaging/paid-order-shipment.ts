import { ValidationError } from '@nexacommerce/common';

export type PaidOrderShipment = {
  sellerId: string;
  originCity: string;
  originProvince: string;
  courierCode: string;
  serviceCode: string;
  weightGrams: number;
  cost: number;
};

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`Paid order shipment is missing ${field}`);
  }
  return value.trim();
}

/**
 * Translate every immutable per-seller quote snapshot stored on an order.
 * Never infer an origin, merge parcels, or re-price a paid order.
 */
export function parsePaidOrderShipments(order: any): PaidOrderShipment[] {
  if (!Array.isArray(order?.shipmentBreakdown) || order.shipmentBreakdown.length === 0) {
    throw new ValidationError('Paid order has no trusted shipment quote snapshot');
  }

  const sellerIds = new Set<string>();
  return order.shipmentBreakdown.map((snapshot: any, index: number) => {
    const weightGrams = Number(snapshot?.weightGrams);
    const cost = Number(snapshot?.cost);
    if (!Number.isSafeInteger(weightGrams) || weightGrams <= 0) {
      throw new ValidationError(`Paid order shipment ${index} has an invalid weight snapshot`);
    }
    if (!Number.isSafeInteger(cost) || cost <= 0) {
      throw new ValidationError(`Paid order shipment ${index} has an invalid cost snapshot`);
    }

    const sellerId = requiredText(snapshot?.sellerId, `shipmentBreakdown[${index}].sellerId`);
    if (sellerIds.has(sellerId)) {
      throw new ValidationError(`Paid order has duplicate shipment snapshot for seller ${sellerId}`);
    }
    sellerIds.add(sellerId);

    return {
      sellerId,
      originCity: requiredText(snapshot?.originCity, `shipmentBreakdown[${index}].originCity`),
      originProvince: requiredText(snapshot?.originProvince, `shipmentBreakdown[${index}].originProvince`),
      courierCode: requiredText(snapshot?.courierCode, `shipmentBreakdown[${index}].courierCode`).toLowerCase(),
      serviceCode: requiredText(snapshot?.serviceCode, `shipmentBreakdown[${index}].serviceCode`).toUpperCase(),
      weightGrams,
      cost,
    };
  });
}
