"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiPut } from "@/lib/api/client";

interface Review {
  id: string;
  productName?: string;
  product?: { name?: string };
  reviewer?: { name?: string };
  reviewerName?: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
  };
}

const STATUSES = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-[14px] ${star <= rating ? "text-yellow-500 fill-1" : "text-ink-secondary/30"}`}
          style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function ReviewsPage() {
  const token = useAdminStore((s) => s.token);
  const qc = useQueryClient();

  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const limit = 20;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status ? { status } : {}),
  });

  const { data, isLoading, isError, refetch } = useQuery<ReviewsResponse>({
    queryKey: ["reviews", page, status],
    queryFn: () => apiGet<ReviewsResponse>(`/reviews?${params.toString()}`, token ?? undefined),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "APPROVED" | "REJECTED" }) =>
      apiPut<unknown>(`/reviews/${id}/moderate`, { status: action }, token ?? undefined),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      setFeedback({
        type: "success",
        message: action === "APPROVED" ? "Ulasan disetujui." : "Ulasan ditolak.",
      });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Gagal memproses ulasan." });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const reviews = data?.data?.reviews ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Moderasi Ulasan</h1>
        <p className="text-sm text-ink-secondary">Tinjau dan moderasi ulasan produk dari pelanggan.</p>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-sm text-sm hairline ${feedback.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          <span className="material-symbols-outlined text-[18px]">{feedback.type === "success" ? "check_circle" : "error"}</span>
          {feedback.message}
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex flex-wrap items-center gap-3">
          <div className="flex items-center hairline rounded-sm overflow-hidden">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatus(s.value); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${status === s.value ? "bg-ink-primary text-white" : "text-ink-secondary hover:bg-surface"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-ink-secondary ml-auto">{total} ulasan</span>
        </div>

        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat ulasan.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-ink-primary/90 transition-colors">
              Coba Lagi
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface hairline-b">
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Produk</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Peresensi</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Rating</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4 max-w-xs">Komentar</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Tanggal</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Status</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-secondary">
                      Tidak ada ulasan ditemukan.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => {
                    const isProcessing = mutation.isPending && (mutation.variables as { id: string })?.id === review.id;
                    return (
                      <tr key={review.id} className="hover:bg-surface transition-colors">
                        <td className="py-3 px-4 text-xs font-medium text-ink-primary">
                          {review.productName ?? review.product?.name ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-secondary">
                          {review.reviewer?.name ?? review.reviewerName ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <StarRating rating={review.rating} />
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-secondary max-w-xs">
                          <p className="line-clamp-2">{review.comment}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-secondary whitespace-nowrap">{formatDate(review.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${STATUS_STYLES[review.status] ?? "bg-surface text-ink-secondary"}`}>
                            {STATUS_LABELS[review.status] ?? review.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isProcessing ? (
                            <span className="text-[10px] text-ink-secondary">Memproses...</span>
                          ) : review.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => mutation.mutate({ id: review.id, action: "APPROVED" })}
                                disabled={mutation.isPending}
                                className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 transition-colors rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => mutation.mutate({ id: review.id, action: "REJECTED" })}
                                disabled={mutation.isPending}
                                className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 transition-colors rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-ink-secondary">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 hairline-t flex items-center justify-between">
            <span className="text-xs text-ink-secondary">Halaman {page} dari {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-40 transition-colors">
                Sebelumnya
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-40 transition-colors">
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
