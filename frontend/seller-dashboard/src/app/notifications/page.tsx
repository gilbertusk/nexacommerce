'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPatch, apiPost } from '@/lib/api/client';

interface Notification {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  isRead: boolean;
  read?: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  };
}

type FilterType = 'ALL' | 'UNREAD';

const TYPE_ICONS: Record<string, string> = {
  ORDER: 'receipt_long',
  ORDER_CREATED: 'receipt_long',
  ORDER_SHIPPED: 'local_shipping',
  ORDER_DELIVERED: 'inventory_2',
  ORDER_COMPLETED: 'task_alt',
  PAYMENT: 'payments',
  PAYMENT_SUCCESS: 'payments',
  PAYMENT_FAILED: 'error',
  REVIEW: 'star',
  REVIEW_RECEIVED: 'star',
  LOW_STOCK: 'inventory',
  SYSTEM: 'notifications',
  SHIPPING: 'local_shipping',
  VOUCHER: 'confirmation_number',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function NotificationsPage() {
  const { token, seller } = useSellerStore();
  const sellerId = seller?.id ?? null;
  const currentSellerId = useRef(sellerId);
  const latestRequestId = useRef(0);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOwnerId, setNotificationsOwnerId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    currentSellerId.current = sellerId;
  }, [sellerId]);

  const fetchNotifications = useCallback(async () => {
    if (!token || !sellerId) return;
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filter === 'UNREAD') params.set('isRead', 'false');
      const res = await apiGet<NotificationsResponse>(
        `/api/v1/notifications?${params.toString()}`,
        token,
      );
      if (res.success && latestRequestId.current === requestId && currentSellerId.current === sellerId) {
        setNotifications(res.data.notifications);
        setTotal(res.data.total);
        setUnreadCount(res.data.unreadCount);
        setNotificationsOwnerId(sellerId);
        const lastPage = Math.max(1, Math.ceil(res.data.total / limit));
        if (page > lastPage) setPage(lastPage);
      }
    } catch (err: unknown) {
      if (latestRequestId.current === requestId && currentSellerId.current === sellerId) {
        setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi.');
      }
    } finally {
      if (latestRequestId.current === requestId) setIsLoading(false);
    }
  }, [token, sellerId, page, filter]);

  useEffect(() => {
    // This effect starts an asynchronous API request; its callback owns loading/result state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkRead(id: string) {
    if (!token || !sellerId || markingId) return;
    const ownerId = sellerId;
    setMarkingId(id);
    try {
      await apiPatch(`/api/v1/notifications/${encodeURIComponent(id)}/read`, {}, token);
      if (currentSellerId.current !== ownerId) return;
      await fetchNotifications();
    } catch {
      // silent fail
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!token || !sellerId) return;
    const ownerId = sellerId;
    setMarkingAllRead(true);
    try {
      await apiPost('/api/v1/notifications/read-all', {}, token);
      if (currentSellerId.current !== ownerId) return;
      await fetchNotifications();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Gagal menandai semua dibaca.',
      );
    } finally {
      setMarkingAllRead(false);
    }
  }

  const displayed = notificationsOwnerId === sellerId ? notifications : [];
  const visibleUnreadCount = notificationsOwnerId === sellerId ? unreadCount : 0;
  const visibleTotal = notificationsOwnerId === sellerId ? total : 0;
  const totalPages = Math.max(1, Math.ceil(visibleTotal / limit));

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">
            Notifikasi
          </h1>
          <p className="text-sm text-ink-secondary">
            Pantau semua aktivitas dan pembaruan toko Anda.
          </p>
        </div>
        {visibleUnreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="px-5 py-2.5 hairline rounded-sm text-xs font-bold uppercase tracking-widest text-ink-secondary hover:text-ink-primary hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 w-fit"
          >
            {markingAllRead ? (
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-sm">
                done_all
              </span>
            )}
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
          <button
            onClick={fetchNotifications}
            className="ml-auto text-xs underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-white hairline rounded-sm p-1 w-fit">
        {(['ALL', 'UNREAD'] as FilterType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilter(tab);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${
              filter === tab
                ? 'bg-primary text-white'
                : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'
            }`}
          >
            {tab === 'ALL' ? 'Semua' : 'Belum Dibaca'}
            {tab === 'UNREAD' && visibleUnreadCount > 0 && (
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  filter === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {visibleUnreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white hairline rounded-sm flex flex-col divide-y divide-hairline">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-start gap-4">
              <div className="w-9 h-9 bg-paper animate-pulse rounded-full shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 w-48 bg-paper animate-pulse rounded-xs" />
                <div className="h-3 w-full bg-paper animate-pulse rounded-xs" />
                <div className="h-3 w-24 bg-paper animate-pulse rounded-xs" />
              </div>
            </div>
          ))
        ) : displayed.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-ink-secondary mb-3 block">
              notifications_none
            </span>
            <p className="text-sm text-ink-secondary">
              {filter === 'UNREAD'
                ? 'Tidak ada notifikasi yang belum dibaca.'
                : 'Tidak ada notifikasi.'}
            </p>
          </div>
        ) : (
          displayed.map((notif) => {
            const isRead = notif.isRead || notif.read;
            const icon =
              TYPE_ICONS[notif.type ?? ''] ?? 'notifications';
            const title = notif.title ?? notif.type ?? 'Notifikasi';
            const message = notif.message ?? notif.body ?? '';
            const isMarking = markingId === notif.id;

            return (
              <div
                key={notif.id}
                className={`group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-surface/50 ${
                  isRead ? '' : 'bg-primary/[0.02]'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isRead ? 'bg-surface' : 'bg-primary/10'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-sm ${
                      isRead ? 'text-ink-secondary' : 'text-primary'
                    }`}
                  >
                    {icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${
                        isRead
                          ? 'text-ink-secondary'
                          : 'text-ink-primary font-medium'
                      }`}
                    >
                      {title}
                    </p>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                  {message && (
                    <p className="text-xs text-ink-secondary mt-0.5 line-clamp-2">
                      {message}
                    </p>
                  )}
                  <p className="text-[10px] text-ink-secondary mt-1.5">
                    {formatDate(notif.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      disabled={isMarking}
                      title="Tandai sudah dibaca"
                      className="w-7 h-7 flex items-center justify-center text-ink-secondary hover:text-primary rounded-sm hover:bg-surface transition-colors disabled:opacity-50"
                    >
                      {isMarking ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          mark_email_read
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-ink-secondary">
        <span>Halaman {page} dari {totalPages} · {visibleTotal} notifikasi</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isLoading}
            className="px-3 py-2 hairline rounded-sm disabled:opacity-40"
          >Sebelumnya</button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || isLoading}
            className="px-3 py-2 hairline rounded-sm disabled:opacity-40"
          >Berikutnya</button>
        </div>
      </div>
    </div>
  );
}
