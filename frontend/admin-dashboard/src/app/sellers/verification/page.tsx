"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiPatch } from "@/lib/api/client";

interface Seller {
  id: string;
  userId: string;
  storeName: string;
  isVerified: boolean;
  shopName?: string;
  name: string;
  email: string;
  category?: string;
  createdAt: string;
  status: string;
}

interface SellersResponse {
  success: boolean;
  data: { items: Seller[]; total: number };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function VerificationPage() {
  const token = useAdminStore((s) => s.token);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ id: string; type: "success" | "error"; message: string } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<SellersResponse>({
    queryKey: ["pending-sellers"],
    queryFn: () => apiGet<SellersResponse>("/users/seller-profiles?limit=100", token ?? undefined),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "REJECTED" }) =>
      apiPatch<unknown>(`/users/seller-profiles/${id}/status`, { status }, token ?? undefined),
    onSuccess: (_, { id, status }) => {
      qc.invalidateQueries({ queryKey: ["pending-sellers"] });
      setFeedback({
        id,
        type: "success",
        message: status === "ACTIVE" ? "Toko berhasil diverifikasi." : "Pendaftaran toko ditolak.",
      });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (_, { id }) => {
      setFeedback({ id, type: "error", message: "Gagal memproses. Coba lagi." });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  function getSellers(): Seller[] {
    return data?.data?.items ?? [];
  }

  const sellers = getSellers().filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.storeName.toLowerCase().includes(q) || s.userId.toLowerCase().includes(q)
    );
  }).filter((s) => s.status === "PENDING");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">Verifikasi Toko</h1>
          <p className="text-sm text-ink-secondary">Tinjau dan setujui pendaftaran mitra penjual baru.</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-sm text-sm hairline ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {feedback.type === "success" ? "check_circle" : "error"}
          </span>
          {feedback.message}
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex items-center justify-between gap-4">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-ink-secondary text-sm">search</span>
            <input
              type="text"
              placeholder="Cari nama toko atau pemilik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface hairline rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <span className="text-xs text-ink-secondary">
            {isLoading ? "Memuat..." : `${sellers.length} menunggu verifikasi`}
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
            <span className="text-sm text-ink-secondary">Memuat data penjual...</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat data.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-ink-primary/90 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && sellers.length === 0 && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-green-500">verified_user</span>
            <p className="text-sm text-ink-secondary">Tidak ada toko yang menunggu verifikasi.</p>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && sellers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface text-[10px] uppercase tracking-widest text-ink-secondary border-b border-hairline">
                  <th className="px-4 py-3 font-bold w-12">No</th>
                  <th className="px-4 py-3 font-bold">Nama Toko</th>
                  <th className="px-4 py-3 font-bold">Pemilik</th>
                  <th className="px-4 py-3 font-bold">Email</th>
                  <th className="px-4 py-3 font-bold">Kategori</th>
                  <th className="px-4 py-3 font-bold">Tanggal</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sellers.map((seller, idx) => {
                  const isProcessing = mutation.isPending && mutation.variables?.id === seller.id;
                  return (
                    <tr
                      key={seller.id}
                      className="border-b border-hairline last:border-b-0 hover:bg-surface/50 transition-colors group"
                    >
                      <td className="px-4 py-3 text-ink-secondary">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-ink-primary">
                          {seller.storeName}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">{seller.userId}</td>
                      <td className="px-4 py-3 text-ink-secondary text-xs">—</td>
                      <td className="px-4 py-3 text-ink-secondary">{seller.category ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-secondary">{formatDate(seller.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold bg-yellow-50 text-yellow-700">
                          Menunggu
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isProcessing ? (
                            <span className="text-[10px] text-ink-secondary">Memproses...</span>
                          ) : (
                            <>
                              <button
                                onClick={() => mutation.mutate({ id: seller.id, status: "ACTIVE" })}
                                disabled={mutation.isPending}
                                className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 transition-colors rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                              >
                                Terima
                              </button>
                              <button
                                onClick={() => mutation.mutate({ id: seller.id, status: "REJECTED" })}
                                disabled={mutation.isPending}
                                className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 transition-colors rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                        </div>
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
