export interface WeightedOrderItem {
  weight?: unknown;
  quantity?: unknown;
}

export function calculateOrderWeight(items: unknown): number {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order has no shippable items');
  }

  return items.reduce((total: number, item: WeightedOrderItem) => {
    if (!Number.isSafeInteger(item?.weight) || (item.weight as number) <= 0) {
      throw new Error('Order is missing a valid item weight snapshot');
    }
    if (!Number.isSafeInteger(item?.quantity) || (item.quantity as number) <= 0) {
      throw new Error('Order contains an invalid item quantity');
    }
    const itemWeight = (item.weight as number) * (item.quantity as number);
    if (!Number.isSafeInteger(itemWeight) || !Number.isSafeInteger(total + itemWeight)) {
      throw new Error('Order total shipping weight is invalid');
    }
    return total + itemWeight;
  }, 0);
}
