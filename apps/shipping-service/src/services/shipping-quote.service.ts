import {
  buildInternalServiceHeaders,
  computeCartHash,
  NotFoundError,
  ValidationError,
} from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';
import { config } from '../config';
import { prisma } from '../prisma/client';
import { shippingService } from './shipping.service';

const logger = createLogger('shipping-quote');

/**
 * Server-issued shipping quotes.
 *
 * The rule this module exists to enforce: a shipping price is never taken from
 * the browser. The customer asks for a quote, the server computes it from the
 * authenticated cart, the catalog, the destination address, each seller's
 * verified origin, and the configured rate table, and stores the result. The
 * browser only ever carries an opaque quote id.
 *
 * Fulfillment model: per-seller origin with split shipment. A cart containing
 * items from three sellers produces three shipments and three fees, summed into
 * one total. There is no merged or averaged fee, and no fallback origin.
 */

/** How long an issued quote may be used. */
export const QUOTE_TTL_MS = 30 * 60 * 1000;

/** Reasons a quote cannot be issued. Each names what a human must fix. */
export type QuoteBlockReason =
  | 'CART_EMPTY'
  | 'PRODUCT_MISSING'
  | 'PRODUCT_INACTIVE'
  | 'PRODUCT_WEIGHT_MISSING'
  | 'INVALID_QUANTITY'
  | 'SELLER_ORIGIN_UNVERIFIED'
  | 'DESTINATION_INCOMPLETE'
  | 'NO_RATE_AVAILABLE';

export class QuoteBlockedError extends ValidationError {
  readonly reason: QuoteBlockReason;
  readonly details: Record<string, unknown>;

  constructor(reason: QuoteBlockReason, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'QuoteBlockedError';
    this.reason = reason;
    this.details = details;
  }
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CatalogProduct {
  id: string;
  sellerId: string;
  weight: number;
  status: string;
}

export interface SellerOrigin {
  sellerId: string;
  storeName: string | null;
  originCity: string | null;
  originProvince: string | null;
  dispatchReady: boolean;
}

export interface Destination {
  addressId: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface ShipmentSelection {
  sellerId: string;
  courierCode: string;
  serviceCode: string;
}

export interface ShipmentQuote {
  sellerId: string;
  storeName: string | null;
  originCity: string;
  originProvince: string;
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  weightGrams: number;
  cost: number;
  estimatedDays: string;
  lines: CartLine[];
}

/** Group cart lines by the seller that will dispatch them. */
export function groupBySeller(
  lines: CartLine[],
  products: Map<string, CatalogProduct>,
): Map<string, { lines: CartLine[]; weightGrams: number }> {
  const groups = new Map<string, { lines: CartLine[]; weightGrams: number }>();

  for (const line of lines) {
    const product = products.get(line.productId);
    if (!product) {
      throw new QuoteBlockedError(
        'PRODUCT_MISSING',
        'A product in the cart is no longer available in the catalog',
        { productId: line.productId },
      );
    }
    if (product.status !== 'ACTIVE') {
      // Pricing shipping for something that cannot be sold wastes the
      // customer's time; checkout would reject it moments later anyway.
      throw new QuoteBlockedError(
        'PRODUCT_INACTIVE',
        'A product in the cart is no longer active',
        { productId: line.productId },
      );
    }
    if (!Number.isSafeInteger(product.weight) || product.weight <= 0) {
      throw new QuoteBlockedError(
        'PRODUCT_WEIGHT_MISSING',
        'A product in the cart has no usable shipping weight',
        { productId: line.productId },
      );
    }
    if (!Number.isSafeInteger(line.quantity) || line.quantity <= 0) {
      throw new QuoteBlockedError(
        'INVALID_QUANTITY',
        'A cart line has a quantity that cannot be shipped',
        { productId: line.productId },
      );
    }

    const group = groups.get(product.sellerId) ?? { lines: [], weightGrams: 0 };
    group.lines.push(line);
    group.weightGrams += product.weight * line.quantity;
    groups.set(product.sellerId, group);
  }

  return groups;
}

async function internalRequest(url: string, method: 'GET' | 'POST', body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: {
      ...buildInternalServiceHeaders('shipping-service'),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    throw new ValidationError(`${url} returned ${response.status}`);
  }
  const payload = (await response.json()) as any;
  return payload.data;
}

export const shippingQuoteService = {
  /**
   * Price every seller's shipment for the authenticated customer's cart.
   *
   * `selections` names the courier and service the customer chose per seller.
   * Every seller in the cart must be covered; an unnamed seller is a missing
   * choice, not a cue to pick one on the customer's behalf.
   */
  async buildShipments(input: {
    lines: CartLine[];
    products: Map<string, CatalogProduct>;
    origins: Map<string, SellerOrigin>;
    destination: Destination;
    selections: ShipmentSelection[];
  }): Promise<ShipmentQuote[]> {
    const { lines, products, origins, destination, selections } = input;

    if (lines.length === 0) {
      throw new QuoteBlockedError('CART_EMPTY', 'Cannot quote shipping for an empty cart');
    }
    if (!destination.city?.trim() || !destination.province?.trim() || !destination.postalCode?.trim()) {
      throw new QuoteBlockedError(
        'DESTINATION_INCOMPLETE',
        'The destination address is missing city, province, or postal code',
      );
    }

    const groups = groupBySeller(lines, products);
    const selectionBySeller = new Map(selections.map((s) => [s.sellerId, s]));
    const shipments: ShipmentQuote[] = [];

    for (const [sellerId, group] of groups) {
      const origin = origins.get(sellerId);
      if (!origin?.dispatchReady || !origin.originCity || !origin.originProvince) {
        // Refusing here is the point. Substituting a default warehouse would
        // quote a route the goods will never travel.
        throw new QuoteBlockedError(
          'SELLER_ORIGIN_UNVERIFIED',
          'A seller in this cart has no verified dispatch origin, so shipping cannot be priced',
          { sellerId, storeName: origin?.storeName ?? null },
        );
      }

      const selection = selectionBySeller.get(sellerId);
      if (!selection) {
        throw new QuoteBlockedError(
          'NO_RATE_AVAILABLE',
          'No courier and service were selected for a seller in this cart',
          { sellerId, storeName: origin.storeName },
        );
      }

      const rates = await shippingService.getRates({
        originCity: origin.originCity,
        destinationCity: destination.city,
        weight: group.weightGrams,
        courierCode: selection.courierCode,
      });

      const rate = rates.find((r) => r.serviceCode === selection.serviceCode);
      if (!rate) {
        throw new QuoteBlockedError(
          'NO_RATE_AVAILABLE',
          'No configured rate covers this route, service, and weight',
          {
            sellerId,
            originCity: origin.originCity,
            destinationCity: destination.city,
            weightGrams: group.weightGrams,
            courierCode: selection.courierCode,
            serviceCode: selection.serviceCode,
          },
        );
      }

      shipments.push({
        sellerId,
        storeName: origin.storeName,
        originCity: origin.originCity,
        originProvince: origin.originProvince,
        courierCode: selection.courierCode,
        courierName: rate.courierName,
        serviceCode: rate.serviceCode,
        serviceName: rate.serviceName,
        weightGrams: group.weightGrams,
        cost: rate.cost,
        estimatedDays: rate.estimatedDays,
        lines: group.lines,
      });
    }

    return shipments;
  },

  /** Issue and persist a quote for the authenticated customer. */
  async issueQuote(input: {
    customerId: string;
    addressId: string;
    selections: ShipmentSelection[];
  }) {
    const { customerId, addressId, selections } = input;

    const cart = await internalRequest(
      `${config.cartServiceUrl}/cart/internal/cart/${customerId}`,
      'GET',
    );
    const lines: CartLine[] = (cart?.items ?? []).map((item: any) => ({
      productId: String(item.productId),
      quantity: Number(item.quantity),
    }));
    if (lines.length === 0) {
      throw new QuoteBlockedError('CART_EMPTY', 'Cannot quote shipping for an empty cart');
    }

    const address = await internalRequest(
      `${config.userServiceUrl}/users/internal/users/${customerId}/addresses/${addressId}`,
      'GET',
    );
    if (!address) {
      throw new NotFoundError('Shipping address not found');
    }
    const destination: Destination = {
      addressId,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
    };

    const catalog = await internalRequest(`${config.productServiceUrl}/internal/products/batch`, 'POST', {
      ids: lines.map((l) => l.productId),
    });
    const products = new Map<string, CatalogProduct>(
      (catalog ?? []).map((p: any) => [
        String(p.id),
        { id: String(p.id), sellerId: String(p.sellerId), weight: Number(p.weight), status: p.status },
      ]),
    );

    const sellerIds = [...new Set([...products.values()].map((p) => p.sellerId))];
    const originList: SellerOrigin[] = await internalRequest(
      `${config.userServiceUrl}/users/internal/sellers/dispatch-origins`,
      'POST',
      { sellerIds },
    );
    const origins = new Map(originList.map((o) => [o.sellerId, o]));

    const shipments = await this.buildShipments({
      lines,
      products,
      origins,
      destination,
      selections,
    });

    const totalCost = shipments.reduce((sum, s) => sum + s.cost, 0);
    const cartHash = computeCartHash(lines, destination);

    const quote = await prisma.shippingQuote.create({
      data: {
        customerId,
        destination: destination as any,
        shipments: shipments as any,
        totalCost,
        cartHash,
        expiresAt: new Date(Date.now() + QUOTE_TTL_MS),
      },
    });

    logger.info(`Issued shipping quote ${quote.id} for customer ${customerId} (${shipments.length} shipments)`);
    return quote;
  },

  /**
   * Resolve a quote for checkout and consume it in the same statement.
   *
   * The update is conditional on the quote still being ACTIVE, unexpired, owned
   * by this customer, and matching the cart hash. Because the condition lives
   * in the WHERE clause, two concurrent checkouts cannot both succeed: the
   * second updates zero rows.
   */
  async consumeQuote(input: {
    quoteId: string;
    customerId: string;
    orderId: string;
    cartHash: string;
  }) {
    const { quoteId, customerId, orderId, cartHash } = input;

    const existing = await prisma.shippingQuote.findUnique({ where: { id: quoteId } });
    if (!existing || existing.customerId !== customerId) {
      // Same response for "not found" and "someone else's", so a quote id
      // cannot be probed for existence.
      throw new NotFoundError('Shipping quote not found');
    }
    if (existing.consumedBy === orderId) {
      // Idempotent: a retried checkout for the same order gets the same quote.
      return existing;
    }
    if (existing.status !== 'ACTIVE') {
      throw new ValidationError('Shipping quote has already been used');
    }
    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new ValidationError('Shipping quote has expired; request a new quote');
    }
    if (existing.cartHash !== cartHash) {
      throw new ValidationError('Cart or address changed after the shipping quote was issued');
    }

    const claimed = await prisma.shippingQuote.updateMany({
      where: {
        id: quoteId,
        customerId,
        status: 'ACTIVE',
        cartHash,
        expiresAt: { gt: new Date() },
      },
      data: { status: 'CONSUMED', consumedAt: new Date(), consumedBy: orderId },
    });

    if (claimed.count === 0) {
      throw new ValidationError('Shipping quote is no longer valid');
    }

    return prisma.shippingQuote.findUniqueOrThrow({ where: { id: quoteId } });
  },

  /** Read a quote without consuming it. Used for display and revalidation. */
  async getQuoteForCustomer(quoteId: string, customerId: string) {
    const quote = await prisma.shippingQuote.findUnique({ where: { id: quoteId } });
    if (!quote || quote.customerId !== customerId) {
      throw new NotFoundError('Shipping quote not found');
    }
    return quote;
  },
};
