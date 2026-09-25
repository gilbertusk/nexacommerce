import { calculateOrderWeight } from '../../src/messaging/order-weight';

describe('calculateOrderWeight', () => {
  it('sums the snapshotted gram weight for each quantity', () => {
    expect(calculateOrderWeight([
      { weight: 750, quantity: 2 },
      { weight: 1200, quantity: 1 },
    ])).toBe(2700);
  });

  it('rejects absent, zero, or invalid weight rather than guessing a default', () => {
    expect(() => calculateOrderWeight([{ quantity: 1 }])).toThrow('weight snapshot');
    expect(() => calculateOrderWeight([{ weight: 0, quantity: 1 }])).toThrow('weight snapshot');
    expect(() => calculateOrderWeight([{ weight: 500, quantity: 0 }])).toThrow('quantity');
  });

  it('rejects an empty order and unsafe aggregate weights', () => {
    expect(() => calculateOrderWeight([])).toThrow('no shippable items');
    expect(() => calculateOrderWeight([{ weight: Number.MAX_SAFE_INTEGER, quantity: 2 }]))
      .toThrow('total shipping weight');
  });
});
