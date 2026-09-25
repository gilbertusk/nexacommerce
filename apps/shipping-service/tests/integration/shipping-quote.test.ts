/**
 * Shipping quote consumption against a live PostgreSQL database.
 *
 * The guarantee under test is that one issued quote can price at most one
 * order. That is a property of a conditional UPDATE, not of TypeScript, so it
 * is exercised against a real database with real concurrent callers.
 *
 * Requires DATABASE_URL to point at a migrated shipping schema. The suite fails
 * rather than skips when the database is unreachable.
 */
import { computeCartHash } from '@nexacommerce/common';
import { randomUUID } from 'crypto';
import { prisma } from '../../src/prisma/client';
import { shippingQuoteService, QUOTE_TTL_MS } from '../../src/services/shipping-quote.service';

const CUSTOMER = 'quote-test-customer';
const OTHER_CUSTOMER = 'quote-test-other-customer';

const DESTINATION = {
  addressId: 'addr-1',
  city: 'Surabaya',
  province: 'Jawa Timur',
  postalCode: '60111',
};

const LINES = [{ productId: 'p1', quantity: 2 }];
const CART_HASH = computeCartHash(LINES, DESTINATION);

const SHIPMENTS = [
  {
    sellerId: 'seller-a',
    storeName: 'Store A',
    originCity: 'Bandung',
    originProvince: 'Jawa Barat',
    courierCode: 'jne',
    courierName: 'JNE',
    serviceCode: 'REG',
    serviceName: 'Regular',
    weightGrams: 1000,
    cost: 18000,
    estimatedDays: '2-3',
    lines: LINES,
  },
];

async function issueStoredQuote(overrides: Partial<{ expiresAt: Date; customerId: string }> = {}) {
  return prisma.shippingQuote.create({
    data: {
      customerId: overrides.customerId ?? CUSTOMER,
      destination: DESTINATION as any,
      shipments: SHIPMENTS as any,
      totalCost: 18000,
      cartHash: CART_HASH,
      expiresAt: overrides.expiresAt ?? new Date(Date.now() + QUOTE_TTL_MS),
    },
  });
}

async function cleanup() {
  await prisma.shippingQuote.deleteMany({
    where: { customerId: { in: [CUSTOMER, OTHER_CUSTOMER] } },
  });
}

describe('shipping quote consumption (live PostgreSQL)', () => {
  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
  });

  beforeEach(cleanup);

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns the stored price and marks the quote consumed', async () => {
    // Arrange
    const quote = await issueStoredQuote();

    // Act
    const consumed = await shippingQuoteService.consumeQuote({
      quoteId: quote.id,
      customerId: CUSTOMER,
      orderId: randomUUID(),
      cartHash: CART_HASH,
    });

    // Assert
    expect(Number(consumed.totalCost)).toBe(18000);
    expect(consumed.status).toBe('CONSUMED');
    expect(consumed.consumedAt).not.toBeNull();
  });

  it('lets exactly one of many concurrent orders claim a quote', async () => {
    // Arrange
    const quote = await issueStoredQuote();

    // Act: ten checkouts race for the same quote.
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        shippingQuoteService.consumeQuote({
          quoteId: quote.id,
          customerId: CUSTOMER,
          orderId: randomUUID(),
          cartHash: CART_HASH,
        }),
      ),
    );

    // Assert: a quote prices one order, never two.
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const stored = await prisma.shippingQuote.findUnique({ where: { id: quote.id } });
    expect(stored!.status).toBe('CONSUMED');
  });

  it('is idempotent for a retried checkout of the same order', async () => {
    // Arrange
    const quote = await issueStoredQuote();
    const orderId = randomUUID();
    await shippingQuoteService.consumeQuote({
      quoteId: quote.id,
      customerId: CUSTOMER,
      orderId,
      cartHash: CART_HASH,
    });

    // Act: the same order retries after a transient failure downstream.
    const again = await shippingQuoteService.consumeQuote({
      quoteId: quote.id,
      customerId: CUSTOMER,
      orderId,
      cartHash: CART_HASH,
    });

    // Assert
    expect(Number(again.totalCost)).toBe(18000);
    expect(again.consumedBy).toBe(orderId);
  });

  it('refuses a second order that tries to reuse a consumed quote', async () => {
    // Arrange
    const quote = await issueStoredQuote();
    await shippingQuoteService.consumeQuote({
      quoteId: quote.id,
      customerId: CUSTOMER,
      orderId: randomUUID(),
      cartHash: CART_HASH,
    });

    // Act + Assert
    await expect(
      shippingQuoteService.consumeQuote({
        quoteId: quote.id,
        customerId: CUSTOMER,
        orderId: randomUUID(),
        cartHash: CART_HASH,
      }),
    ).rejects.toThrow(/already been used/);
  });

  it('refuses an expired quote', async () => {
    // Arrange
    const quote = await issueStoredQuote({ expiresAt: new Date(Date.now() - 1000) });

    // Act + Assert
    await expect(
      shippingQuoteService.consumeQuote({
        quoteId: quote.id,
        customerId: CUSTOMER,
        orderId: randomUUID(),
        cartHash: CART_HASH,
      }),
    ).rejects.toThrow(/expired/);
  });

  it('refuses a quote belonging to another customer, without revealing it exists', async () => {
    // Arrange
    const quote = await issueStoredQuote({ customerId: OTHER_CUSTOMER });

    // Act + Assert: the same message as a missing quote, so an id cannot be
    // probed for existence.
    await expect(
      shippingQuoteService.consumeQuote({
        quoteId: quote.id,
        customerId: CUSTOMER,
        orderId: randomUUID(),
        cartHash: CART_HASH,
      }),
    ).rejects.toThrow(/not found/);

    const stored = await prisma.shippingQuote.findUnique({ where: { id: quote.id } });
    expect(stored!.status).toBe('ACTIVE');
  });

  it('refuses a quote whose cart changed after it was issued', async () => {
    // Arrange: the customer added an item after quoting.
    const quote = await issueStoredQuote();
    const tamperedHash = computeCartHash(
      [{ productId: 'p1', quantity: 5 }],
      DESTINATION,
    );

    // Act + Assert
    await expect(
      shippingQuoteService.consumeQuote({
        quoteId: quote.id,
        customerId: CUSTOMER,
        orderId: randomUUID(),
        cartHash: tamperedHash,
      }),
    ).rejects.toThrow(/changed after the shipping quote/);
  });

  it('refuses a quote whose destination changed after it was issued', async () => {
    // Arrange: a different city is a different route and a different price.
    const quote = await issueStoredQuote();
    const movedHash = computeCartHash(LINES, { ...DESTINATION, city: 'Medan' });

    // Act + Assert
    await expect(
      shippingQuoteService.consumeQuote({
        quoteId: quote.id,
        customerId: CUSTOMER,
        orderId: randomUUID(),
        cartHash: movedHash,
      }),
    ).rejects.toThrow(/changed after the shipping quote/);
  });

  it('refuses an unknown quote id', async () => {
    // Act + Assert
    await expect(
      shippingQuoteService.consumeQuote({
        quoteId: randomUUID(),
        customerId: CUSTOMER,
        orderId: randomUUID(),
        cartHash: CART_HASH,
      }),
    ).rejects.toThrow(/not found/);
  });

  it('computes the same cart hash regardless of cart line order', () => {
    // Assert: line ordering is a client detail and must not invalidate a quote.
    expect(
      computeCartHash(
        [
          { productId: 'b', quantity: 1 },
          { productId: 'a', quantity: 2 },
        ],
        DESTINATION,
      ),
    ).toBe(
      computeCartHash(
        [
          { productId: 'a', quantity: 2 },
          { productId: 'b', quantity: 1 },
        ],
        DESTINATION,
      ),
    );
  });
});
