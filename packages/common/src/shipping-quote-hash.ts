import crypto from 'crypto';

/**
 * Fingerprint of what a shipping quote was priced for.
 *
 * Shipping Service computes this when it issues a quote; Order Service
 * recomputes it from the cart it is about to convert into an order. A mismatch
 * means the cart or the destination changed after the price was calculated, so
 * the stored price no longer describes the shipment being paid for.
 *
 * Both services must produce byte-identical output, which is why this lives
 * here rather than being implemented twice.
 */

export interface QuoteCartLine {
  productId: string;
  quantity: number;
}

export interface QuoteDestination {
  addressId: string;
  city: string;
  province: string;
  postalCode: string;
}

export function computeCartHash(lines: QuoteCartLine[], destination: QuoteDestination): string {
  const normalizedLines = lines
    .map((line) => ({ productId: String(line.productId), quantity: Number(line.quantity) }))
    .sort((a, b) => a.productId.localeCompare(b.productId));

  const canonical = JSON.stringify({
    lines: normalizedLines,
    destination: {
      addressId: destination.addressId,
      city: destination.city.trim().toLowerCase(),
      province: destination.province.trim().toLowerCase(),
      postalCode: destination.postalCode.trim(),
    },
  });

  return crypto.createHash('sha256').update(canonical).digest('hex');
}
