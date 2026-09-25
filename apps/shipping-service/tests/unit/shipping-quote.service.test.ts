jest.mock('../../src/services/shipping.service', () => ({
  shippingService: { getRates: jest.fn() },
}));

import { shippingService } from '../../src/services/shipping.service';
import {
  groupBySeller,
  QuoteBlockedError,
  shippingQuoteService,
  type CatalogProduct,
  type SellerOrigin,
} from '../../src/services/shipping-quote.service';

const mockGetRates = shippingService.getRates as jest.MockedFunction<typeof shippingService.getRates>;

const DESTINATION = {
  addressId: 'addr-1',
  city: 'Surabaya',
  province: 'Jawa Timur',
  postalCode: '60111',
};

function product(id: string, sellerId: string, weight = 500): CatalogProduct {
  return { id, sellerId, weight, status: 'ACTIVE' };
}

function origin(sellerId: string, city: string, ready = true): SellerOrigin {
  return {
    sellerId,
    storeName: `Store ${sellerId}`,
    originCity: ready ? city : null,
    originProvince: ready ? 'Jawa Barat' : null,
    dispatchReady: ready,
  };
}

const RATE = {
  courierName: 'JNE',
  serviceCode: 'REG',
  serviceName: 'Regular',
  cost: 18000,
  estimatedDays: '2-3',
};

describe('groupBySeller', () => {
  it('sums weight per seller across quantities', () => {
    // Arrange
    const products = new Map([
      ['p1', product('p1', 'seller-a', 300)],
      ['p2', product('p2', 'seller-a', 200)],
      ['p3', product('p3', 'seller-b', 1000)],
    ]);

    // Act
    const groups = groupBySeller(
      [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 1 },
        { productId: 'p3', quantity: 3 },
      ],
      products,
    );

    // Assert
    expect(groups.get('seller-a')!.weightGrams).toBe(800);
    expect(groups.get('seller-b')!.weightGrams).toBe(3000);
  });

  it('refuses a cart line whose product left the catalog', () => {
    // Act + Assert
    expect(() => groupBySeller([{ productId: 'gone', quantity: 1 }], new Map())).toThrow(
      QuoteBlockedError,
    );
  });

  it('refuses a product that is no longer active', () => {
    // Arrange
    const products = new Map([['p1', { ...product('p1', 'seller-a'), status: 'INACTIVE' }]]);

    // Act + Assert
    try {
      groupBySeller([{ productId: 'p1', quantity: 1 }], products);
      throw new Error('expected a refusal');
    } catch (err) {
      expect((err as QuoteBlockedError).reason).toBe('PRODUCT_INACTIVE');
    }
  });

  it('refuses a cart line with a quantity that cannot be shipped', () => {
    // Arrange
    const products = new Map([['p1', product('p1', 'seller-a')]]);

    // Act + Assert
    for (const quantity of [0, -1, 1.5]) {
      try {
        groupBySeller([{ productId: 'p1', quantity }], products);
        throw new Error(`expected a refusal for quantity ${quantity}`);
      } catch (err) {
        expect((err as QuoteBlockedError).reason).toBe('INVALID_QUANTITY');
      }
    }
  });

  it('refuses a product with no usable shipping weight rather than assuming one', () => {
    // Arrange
    const products = new Map([['p1', product('p1', 'seller-a', 0)]]);

    // Act + Assert
    try {
      groupBySeller([{ productId: 'p1', quantity: 1 }], products);
      throw new Error('expected a refusal');
    } catch (err) {
      expect(err).toBeInstanceOf(QuoteBlockedError);
      expect((err as QuoteBlockedError).reason).toBe('PRODUCT_WEIGHT_MISSING');
    }
  });
});

describe('shippingQuoteService.buildShipments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRates.mockResolvedValue([RATE] as any);
  });

  const baseInput = {
    lines: [{ productId: 'p1', quantity: 2 }],
    products: new Map([['p1', product('p1', 'seller-a')]]),
    origins: new Map([['seller-a', origin('seller-a', 'Bandung')]]),
    destination: DESTINATION,
    selections: [{ sellerId: 'seller-a', courierCode: 'jne', serviceCode: 'REG' }],
  };

  it('prices one shipment per seller from that seller\'s own origin', async () => {
    // Arrange: two sellers means two shipments, not one merged fee.
    const input = {
      ...baseInput,
      lines: [
        { productId: 'p1', quantity: 1 },
        { productId: 'p2', quantity: 1 },
      ],
      products: new Map([
        ['p1', product('p1', 'seller-a', 500)],
        ['p2', product('p2', 'seller-b', 700)],
      ]),
      origins: new Map([
        ['seller-a', origin('seller-a', 'Bandung')],
        ['seller-b', origin('seller-b', 'Semarang')],
      ]),
      selections: [
        { sellerId: 'seller-a', courierCode: 'jne', serviceCode: 'REG' },
        { sellerId: 'seller-b', courierCode: 'jne', serviceCode: 'REG' },
      ],
    };

    // Act
    const shipments = await shippingQuoteService.buildShipments(input);

    // Assert
    expect(shipments).toHaveLength(2);
    expect(shipments.map((s) => s.originCity).sort()).toEqual(['Bandung', 'Semarang']);
    expect(mockGetRates).toHaveBeenCalledWith(
      expect.objectContaining({ originCity: 'Bandung', destinationCity: 'Surabaya', weight: 500 }),
    );
    expect(mockGetRates).toHaveBeenCalledWith(
      expect.objectContaining({ originCity: 'Semarang', weight: 700 }),
    );
  });

  it('refuses to quote when a seller has no verified dispatch origin', async () => {
    // Arrange: substituting a default warehouse would price a route the goods
    // will never travel.
    const input = {
      ...baseInput,
      origins: new Map([['seller-a', origin('seller-a', 'Bandung', false)]]),
    };

    // Act + Assert
    await expect(shippingQuoteService.buildShipments(input)).rejects.toMatchObject({
      reason: 'SELLER_ORIGIN_UNVERIFIED',
      details: { sellerId: 'seller-a' },
    });
    expect(mockGetRates).not.toHaveBeenCalled();
  });

  it('refuses to quote when no configured rate covers the route', async () => {
    // Arrange
    mockGetRates.mockResolvedValue([]);

    // Act + Assert
    await expect(shippingQuoteService.buildShipments(baseInput)).rejects.toMatchObject({
      reason: 'NO_RATE_AVAILABLE',
    });
  });

  it('refuses to quote when the selected service is not among the configured rates', async () => {
    // Arrange
    mockGetRates.mockResolvedValue([{ ...RATE, serviceCode: 'YES' }] as any);

    // Act + Assert
    await expect(shippingQuoteService.buildShipments(baseInput)).rejects.toMatchObject({
      reason: 'NO_RATE_AVAILABLE',
    });
  });

  it('refuses to quote when a seller in the cart has no courier selection', async () => {
    // Arrange: picking a courier for the customer is not the server's call.
    const input = { ...baseInput, selections: [] };

    // Act + Assert
    await expect(shippingQuoteService.buildShipments(input)).rejects.toMatchObject({
      reason: 'NO_RATE_AVAILABLE',
    });
  });

  it('refuses to quote an empty cart', async () => {
    // Act + Assert
    await expect(
      shippingQuoteService.buildShipments({ ...baseInput, lines: [] }),
    ).rejects.toMatchObject({ reason: 'CART_EMPTY' });
  });

  it('refuses to quote to an incomplete destination', async () => {
    // Act + Assert
    await expect(
      shippingQuoteService.buildShipments({
        ...baseInput,
        destination: { ...DESTINATION, postalCode: '  ' },
      }),
    ).rejects.toMatchObject({ reason: 'DESTINATION_INCOMPLETE' });
  });

  it('uses the configured rate exactly and does not recompute it from weight', async () => {
    // Act
    const shipments = await shippingQuoteService.buildShipments(baseInput);

    // Assert: the stored table is the authority on price.
    expect(shipments[0].cost).toBe(18000);
    expect(shipments[0].weightGrams).toBe(1000);
  });
});
