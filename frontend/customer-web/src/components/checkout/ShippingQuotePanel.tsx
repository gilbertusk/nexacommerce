"use client";

import { useMemo, useState } from "react";
import { formatIDR } from "@/lib/utils/format";
import { useShippingCouriers } from "@/lib/api/hooks/useShipping";
import {
  describeQuoteBlock,
  useRequestShippingQuote,
  type ShipmentSelection,
  type ShippingQuote,
} from "@/lib/api/hooks/useShippingQuote";

/**
 * Courier selection and quote request for a split shipment.
 *
 * A cart with items from several sellers ships separately from each seller's
 * own origin, so the customer picks a courier per seller and the server prices
 * each leg. No price is calculated here; this panel only collects choices and
 * displays what the server returned.
 */

export interface SellerGroup {
  sellerId: string;
  sellerName: string;
  itemCount: number;
}

interface Props {
  groups: SellerGroup[];
  addressId: string;
  quote: ShippingQuote | null;
  onQuote: (quote: ShippingQuote | null) => void;
}

/** A courier option offered for selection, flattened from the courier catalog. */
interface CourierOption {
  value: string;
  label: string;
  courierCode: string;
  serviceCode: string;
}

export default function ShippingQuotePanel({ groups, addressId, quote, onQuote }: Props) {
  const couriersQuery = useShippingCouriers();
  const requestQuote = useRequestShippingQuote();
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const options: CourierOption[] = useMemo(() => {
    const couriers = couriersQuery.data?.data.couriers ?? [];
    return couriers.flatMap((courier) =>
      (courier.services ?? []).map((service) => ({
        value: `${courier.id}::${service.service}`,
        label: `${courier.name} — ${service.service}`,
        courierCode: courier.id,
        serviceCode: service.service,
      })),
    );
  }, [couriersQuery.data]);

  const allSellersChosen = groups.length > 0 && groups.every((group) => choices[group.sellerId]);

  const handleSelect = (sellerId: string, value: string) => {
    setChoices((current) => ({ ...current, [sellerId]: value }));
    // Any change invalidates the price the server quoted for the old choice.
    onQuote(null);
    setError("");
  };

  const handleRequestQuote = async () => {
    setError("");
    onQuote(null);

    const selections: ShipmentSelection[] = groups.map((group) => {
      const option = options.find((o) => o.value === choices[group.sellerId])!;
      return {
        sellerId: group.sellerId,
        courierCode: option.courierCode,
        serviceCode: option.serviceCode,
      };
    });

    try {
      onQuote(await requestQuote.mutateAsync({ addressId, selections }));
    } catch (err) {
      const reason = (err as { reason?: string })?.reason;
      setError(
        describeQuoteBlock(
          reason,
          err instanceof Error ? err.message : "Ongkos kirim gagal dihitung.",
        ),
      );
    }
  };

  if (couriersQuery.isError) {
    return (
      <p role="alert" className="text-xs text-rose-800">
        Daftar kurir gagal dimuat dari server. Muat ulang halaman untuk mencoba lagi.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-secondary">
        Barang dikirim terpisah dari lokasi masing-masing penjual. Pilih kurir untuk setiap
        penjual, lalu hitung ongkos kirim.
      </p>

      {groups.map((group) => (
        <label key={group.sellerId} className="text-xs">
          <span className="block mb-1 font-semibold">
            {group.sellerName} · {group.itemCount} barang
          </span>
          <select
            value={choices[group.sellerId] ?? ""}
            onChange={(event) => handleSelect(group.sellerId, event.target.value)}
            disabled={couriersQuery.isLoading}
            className="w-full border border-hairline bg-white px-3 py-2"
          >
            <option value="">Pilih kurir</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      <button
        type="button"
        onClick={handleRequestQuote}
        disabled={!allSellersChosen || !addressId || requestQuote.isPending}
        className="border border-primary px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50"
      >
        {requestQuote.isPending ? "Menghitung..." : "Hitung ongkos kirim"}
      </button>

      {error && (
        <p role="alert" className="text-xs text-rose-800">
          {error}
        </p>
      )}

      {quote && (
        <div role="status" className="border border-hairline p-3 text-xs">
          <p className="font-semibold mb-2">Rincian pengiriman</p>
          <ul className="flex flex-col gap-1">
            {quote.shipments.map((shipment) => (
              <li key={shipment.sellerId} className="flex justify-between gap-3">
                <span>
                  {shipment.storeName ?? shipment.sellerId} · {shipment.courierName}{" "}
                  {shipment.serviceName} · {shipment.originCity} → tujuan
                </span>
                <span className="font-mono">{formatIDR(shipment.cost)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
