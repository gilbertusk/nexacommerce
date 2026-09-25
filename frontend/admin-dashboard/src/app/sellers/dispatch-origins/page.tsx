"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiPatch } from "@/lib/api/client";

/**
 * Dispatch-origin verification queue.
 *
 * A seller's origin decides which rate-table row prices a customer's shipping,
 * so sellers may propose one but not approve it. Until an administrator
 * verifies the location here, shipping quotes for that seller's items fail
 * closed and their customers cannot check out.
 */

interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  status: string;
  originCity: string | null;
  originProvince: string | null;
  originVerifiedAt: string | null;
}

interface SellersResponse {
  success: boolean;
  data: { items: SellerProfile[]; total: number };
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function DispatchOriginsPage() {
  const token = useAdminStore((s) => s.token);
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");

  const { data, isLoading, isError, refetch } = useQuery<SellersResponse>({
    queryKey: ["seller-dispatch-origins"],
    queryFn: () =>
      apiGet<SellersResponse>("/users/seller-profiles?limit=100", token ?? undefined),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      apiPatch<unknown>(
        `/users/seller-profiles/${id}/dispatch-origin`,
        { verified },
        token ?? undefined,
      ),
    onSuccess: (_, { verified }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-dispatch-origins"] });
      setFeedback(
        verified
          ? "Lokasi pengiriman diverifikasi. Ongkos kirim penjual ini sekarang dapat dihitung."
          : "Verifikasi lokasi dicabut. Checkout untuk produk penjual ini kembali tertutup.",
      );
    },
    onError: () => setFeedback("Gagal memproses. Coba lagi."),
  });

  // Only sellers that actually submitted an origin can be acted on here.
  const sellers = (data?.data?.items ?? []).filter(
    (seller) => seller.originCity && seller.originProvince,
  );
  const awaiting = sellers.filter((seller) => !seller.originVerifiedAt);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Verifikasi Lokasi Pengiriman</h1>
        <p className="text-sm text-ink-secondary">
          Ongkos kirim dihitung dari lokasi ini. Selama belum diverifikasi, pembeli tidak dapat
          checkout untuk produk penjual tersebut.
        </p>
      </div>

      {feedback && (
        <div role="status" className="px-4 py-3 rounded-sm text-sm hairline bg-surface text-ink-primary">
          {feedback}
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        <div className="p-4 hairline-b flex items-center justify-between gap-4">
          <span className="text-xs text-ink-secondary">
            {isLoading ? "Memuat..." : `${awaiting.length} menunggu verifikasi`}
          </span>
        </div>

        {isLoading && (
          <div className="p-8 flex justify-center">
            <span className="text-sm text-ink-secondary">Memuat data penjual...</span>
          </div>
        )}

        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <p className="text-sm text-ink-secondary">Gagal memuat data.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!isLoading && !isError && sellers.length === 0 && (
          <div className="p-8 flex justify-center">
            <p className="text-sm text-ink-secondary">
              Belum ada penjual yang mengirimkan lokasi pengiriman.
            </p>
          </div>
        )}

        {!isLoading && sellers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface text-[10px] uppercase tracking-widest text-ink-secondary border-b border-hairline">
                  <th className="px-4 py-3 font-bold">Nama Toko</th>
                  <th className="px-4 py-3 font-bold">Kota Asal</th>
                  <th className="px-4 py-3 font-bold">Provinsi</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Diverifikasi</th>
                  <th className="px-4 py-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sellers.map((seller) => {
                  const verified = Boolean(seller.originVerifiedAt);
                  const isProcessing =
                    mutation.isPending && mutation.variables?.id === seller.id;
                  return (
                    <tr key={seller.id} className="border-b border-hairline last:border-b-0">
                      <td className="px-4 py-3 font-medium text-ink-primary">{seller.storeName}</td>
                      <td className="px-4 py-3 text-ink-secondary">{seller.originCity}</td>
                      <td className="px-4 py-3 text-ink-secondary">{seller.originProvince}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${
                            verified
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {verified ? "Terverifikasi" : "Menunggu"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {formatDate(seller.originVerifiedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isProcessing ? (
                          <span className="text-[10px] text-ink-secondary">Memproses...</span>
                        ) : (
                          <button
                            onClick={() =>
                              mutation.mutate({ id: seller.id, verified: !verified })
                            }
                            disabled={mutation.isPending}
                            className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-50 ${
                              verified
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {verified ? "Cabut" : "Verifikasi"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
