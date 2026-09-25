import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

/**
 * Server-issued shipping quotes.
 *
 * The browser never computes or submits a shipping price. It asks the server to
 * price the authenticated cart, receives an opaque quote id plus a read-only
 * breakdown to display, and passes only that id to checkout.
 */

/** One seller's shipment within a split-shipment quote. */
export interface QuotedShipment {
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
}

export interface ShippingQuote {
  quoteId: string;
  totalCost: number;
  shipments: QuotedShipment[];
  expiresAt: string;
}

/** The customer's courier choice for one seller in the cart. */
export interface ShipmentSelection {
  sellerId: string;
  courierCode: string;
  serviceCode: string;
}

export interface ShippingQuoteRequest {
  addressId: string;
  selections: ShipmentSelection[];
}

/**
 * Why the server refused to price the cart. These are surfaced verbatim so the
 * customer is told what is actually wrong instead of seeing a generic failure.
 */
export type QuoteBlockReason =
  | "CART_EMPTY"
  | "PRODUCT_MISSING"
  | "PRODUCT_INACTIVE"
  | "PRODUCT_WEIGHT_MISSING"
  | "INVALID_QUANTITY"
  | "SELLER_ORIGIN_UNVERIFIED"
  | "DESTINATION_INCOMPLETE"
  | "NO_RATE_AVAILABLE";

const BLOCK_MESSAGES: Record<QuoteBlockReason, string> = {
  CART_EMPTY: "Keranjang kosong, ongkos kirim tidak dapat dihitung.",
  PRODUCT_MISSING:
    "Salah satu barang di keranjang sudah tidak tersedia. Hapus barang tersebut lalu coba lagi.",
  PRODUCT_INACTIVE:
    "Salah satu barang di keranjang sudah tidak aktif. Hapus barang tersebut lalu coba lagi.",
  PRODUCT_WEIGHT_MISSING:
    "Salah satu barang belum memiliki berat kirim, sehingga belum dapat dikirim.",
  INVALID_QUANTITY: "Jumlah barang pada keranjang tidak valid. Perbarui keranjang lalu coba lagi.",
  SELLER_ORIGIN_UNVERIFIED:
    "Penjual pada keranjang ini belum mengonfirmasi lokasi pengiriman, sehingga ongkos kirim belum dapat dihitung.",
  DESTINATION_INCOMPLETE:
    "Alamat pengiriman belum lengkap: kota, provinsi, atau kode pos kosong.",
  NO_RATE_AVAILABLE:
    "Belum ada tarif terverifikasi untuk rute dan berat ini. Coba kurir atau alamat lain.",
};

/** Human-readable text for a refusal, falling back to the server's message. */
export function describeQuoteBlock(reason: string | undefined, fallback: string): string {
  if (reason && reason in BLOCK_MESSAGES) {
    return BLOCK_MESSAGES[reason as QuoteBlockReason];
  }
  return fallback;
}

interface RawQuoteResponse {
  success: boolean;
  data: ShippingQuote;
}

/**
 * Request a priced quote. Returns the quote to display; checkout later submits
 * `quoteId` alone.
 */
export function useRequestShippingQuote() {
  const token = useUserStore((s) => s.token);

  return useMutation({
    mutationFn: async (request: ShippingQuoteRequest): Promise<ShippingQuote> => {
      const raw = await apiPost<RawQuoteResponse>(
        "/shipping/quotes",
        request,
        token ?? undefined
      );
      return raw.data;
    },
  });
}

/** True once a quote's expiry has passed and checkout would be refused. */
export function isQuoteExpired(quote: Pick<ShippingQuote, "expiresAt">, now = Date.now()): boolean {
  const expiry = Date.parse(quote.expiresAt);
  return Number.isNaN(expiry) || expiry <= now;
}
