'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPost } from '@/lib/api/client';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  content?: string;
  createdAt: string;
  reviewer?: { name: string };
  customerName?: string;
  product?: { id: string; name: string };
  productName?: string;
  reply?: string;
  sellerReply?: string;
}

interface ReviewsResponse {
  success: boolean;
  data: Review[] | { reviews: Review[]; total: number };
  meta?: { total: number; page: number; limit: number };
}

const LIMIT = 20;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-stone-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ReviewsPage() {
  const { seller, token } = useSellerStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [expandedReply, setExpandedReply] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!seller || !token) return;
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        sellerId: seller.id,
        page: String(page),
        limit: String(LIMIT),
        ...(ratingFilter ? { rating: String(ratingFilter) } : {}),
      });
      const res = await apiGet<ReviewsResponse>(
        `/api/v1/reviews?${params.toString()}`,
        token,
      );
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as { reviews: Review[] }).reviews ?? [];
        setReviews(list);
        const t =
          res.meta?.total ??
          (Array.isArray(res.data)
            ? res.data.length
            : (res.data as { total: number }).total ?? list.length);
        setTotal(t);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat ulasan.');
    } finally {
      setIsLoading(false);
    }
  }, [seller, token, page, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleReply(reviewId: string) {
    const text = replyTexts[reviewId];
    if (!text?.trim() || !token) return;
    setReplyingId(reviewId);
    try {
      await apiPost(`/api/v1/reviews/${reviewId}/reply`, { reply: text }, token);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, reply: text, sellerReply: text } : r,
        ),
      );
      setReplyTexts((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
      setExpandedReply(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim balasan.');
    } finally {
      setReplyingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const startItem = (page - 1) * LIMIT + 1;
  const endItem = Math.min(page * LIMIT, total);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">
            Manajemen Ulasan
          </h1>
          <p className="text-sm text-ink-secondary">
            Pantau dan balas ulasan pelanggan untuk produk Anda.
          </p>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-secondary">Filter:</span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setRatingFilter(null);
                setPage(1);
              }}
              className={`px-3 py-1.5 hairline rounded-sm text-xs font-bold transition-colors ${
                ratingFilter === null
                  ? 'bg-primary text-white border-primary'
                  : 'text-ink-secondary hover:bg-surface'
              }`}
            >
              Semua
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRatingFilter(star);
                  setPage(1);
                }}
                className={`px-3 py-1.5 hairline rounded-sm text-xs font-bold transition-colors flex items-center gap-1 ${
                  ratingFilter === star
                    ? 'bg-primary text-white border-primary'
                    : 'text-ink-secondary hover:bg-surface'
                }`}
              >
                {star}
                <span className="text-yellow-400 text-[11px]">★</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
          <button
            onClick={fetchReviews}
            className="ml-auto text-xs underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-[10px] uppercase tracking-widest text-ink-secondary border-b border-hairline">
                <th className="px-4 py-3 font-bold">Produk</th>
                <th className="px-4 py-3 font-bold">Rating</th>
                <th className="px-4 py-3 font-bold">Pembeli</th>
                <th className="px-4 py-3 font-bold">Komentar</th>
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold">Balasan</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-hairline">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-full bg-paper animate-pulse rounded-xs" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-ink-secondary"
                  >
                    {ratingFilter
                      ? `Tidak ada ulasan dengan rating ${ratingFilter} bintang.`
                      : 'Belum ada ulasan untuk produk Anda.'}
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const productName =
                    review.product?.name ?? review.productName ?? '—';
                  const reviewerName =
                    review.reviewer?.name ?? review.customerName ?? 'Anonim';
                  const comment = review.comment ?? review.content ?? '';
                  const existingReply = review.reply ?? review.sellerReply;
                  const isExpanded = expandedReply === review.id;

                  return (
                    <tr
                      key={review.id}
                      className="border-b border-hairline last:border-b-0 hover:bg-surface/50 transition-colors align-top"
                    >
                      <td className="px-4 py-4 text-xs font-medium text-ink-primary max-w-[150px]">
                        <span className="line-clamp-2">{productName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StarRating rating={review.rating} />
                        <span className="text-[10px] text-ink-secondary mt-0.5 block">
                          {review.rating}/5
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-ink-primary">
                        {reviewerName}
                      </td>
                      <td className="px-4 py-4 text-xs text-ink-secondary max-w-[200px]">
                        <p className="line-clamp-3">{comment || '—'}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-ink-secondary whitespace-nowrap">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-4 py-4 min-w-[200px]">
                        {existingReply ? (
                          <div className="bg-surface rounded-sm p-2">
                            <p className="text-[10px] uppercase font-bold text-ink-secondary mb-1">
                              Balasan Anda
                            </p>
                            <p className="text-xs text-ink-primary line-clamp-2">
                              {existingReply}
                            </p>
                          </div>
                        ) : isExpanded ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={replyTexts[review.id] ?? ''}
                              onChange={(e) =>
                                setReplyTexts((prev) => ({
                                  ...prev,
                                  [review.id]: e.target.value,
                                }))
                              }
                              rows={3}
                              placeholder="Tulis balasan Anda..."
                              className="w-full px-3 py-2 bg-surface hairline rounded-sm text-xs text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReply(review.id)}
                                disabled={
                                  replyingId === review.id ||
                                  !replyTexts[review.id]?.trim()
                                }
                                className="px-3 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-[10px] font-bold uppercase rounded-sm transition-colors flex items-center gap-1"
                              >
                                {replyingId === review.id ? (
                                  <span className="material-symbols-outlined text-sm animate-spin">
                                    progress_activity
                                  </span>
                                ) : (
                                  'Balas'
                                )}
                              </button>
                              <button
                                onClick={() => setExpandedReply(null)}
                                className="px-3 py-1.5 hairline rounded-sm text-[10px] font-bold uppercase text-ink-secondary hover:bg-surface transition-colors"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setExpandedReply(review.id)}
                            className="px-3 py-1.5 hairline rounded-sm text-[10px] font-bold uppercase tracking-widest text-ink-secondary hover:text-primary hover:bg-surface transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">
                              reply
                            </span>
                            Balas
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 hairline-t flex items-center justify-between text-xs text-ink-secondary">
          <span>
            {isLoading
              ? 'Memuat...'
              : total === 0
                ? 'Tidak ada ulasan'
                : `Menampilkan ${startItem}–${endItem} dari ${total} ulasan`}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center hairline rounded-sm disabled:opacity-50 hover:bg-surface transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center hairline rounded-sm transition-colors ${
                  page === i + 1
                    ? 'bg-primary text-white border-primary'
                    : 'hover:bg-surface text-ink-primary'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="w-8 h-8 flex items-center justify-center hairline rounded-sm disabled:opacity-50 hover:bg-surface transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
