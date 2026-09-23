"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useUserStore } from "@/lib/store/useUserStore";
import { useNotificationStore, Notification, NotificationType } from "@/lib/store/useNotificationStore";
import EmptyState from "@/components/ui/EmptyState";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "ORDER":
      return "shopping_bag";
    case "PAYMENT":
      return "credit_card";
    case "REVIEW":
      return "star";
    case "SYSTEM":
    default:
      return "notifications";
  }
}

function getNotificationColor(type: NotificationType) {
  switch (type) {
    case "ORDER":
      return "text-blue-600 bg-blue-50 border-blue-100";
    case "PAYMENT":
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    case "REVIEW":
      return "text-amber-600 bg-amber-50 border-amber-100";
    case "SYSTEM":
    default:
      return "text-primary bg-primary/5 border-primary/10";
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function NotificationItem({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const iconClass = getNotificationColor(notif.type);
  const icon = getNotificationIcon(notif.type);

  return (
    <div
      className={`group relative flex gap-4 p-4 rounded-xs border transition-all duration-200 cursor-pointer hover:shadow-sm ${
        notif.isRead
          ? "bg-surface border-hairline"
          : "bg-white border-primary/20 shadow-xs"
      }`}
      onClick={() => !notif.isRead && onRead(notif.id)}
    >
      {/* Unread indicator */}
      {!notif.isRead && (
        <div className="absolute top-4 left-0 w-0.5 h-8 bg-primary rounded-r-full" />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${iconClass}`}>
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug ${notif.isRead ? "text-ink-secondary" : "text-ink-primary"}`}>
            {notif.title}
          </p>
          <span className="text-[10px] text-ink-secondary whitespace-nowrap flex-shrink-0">
            {formatRelativeTime(notif.createdAt)}
          </span>
        </div>
        <p className="text-[11px] text-ink-secondary mt-1 leading-relaxed line-clamp-2">
          {notif.message}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border ${iconClass}`}>
            {notif.type}
          </span>
          {!notif.isRead && (
            <span className="text-[9px] uppercase font-bold tracking-wider text-primary">● Belum dibaca</span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notif.id);
        }}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-ink-secondary hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
        aria-label="Hapus notifikasi"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xs border border-hairline bg-surface animate-pulse">
      <div className="w-10 h-10 rounded-full bg-paper flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 w-2/3 bg-paper rounded-xs" />
        <div className="h-2.5 w-full bg-paper rounded-xs" />
        <div className="h-2.5 w-1/2 bg-paper rounded-xs" />
      </div>
    </div>
  );
}

function NotificationsContent() {
  const { user, token } = useUserStore();
  const { notifications, unreadCount, isLoading, total, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (token) {
      fetchNotifications(token, page, activeTab === "unread");
    }
  }, [token, page, activeTab, fetchNotifications]);

  if (!user) {
    return (
      <div className="py-20">
        <EmptyState
          icon="lock"
          title="Login Diperlukan"
          description="Anda harus masuk ke akun Anda untuk melihat notifikasi."
          actionLabel="Login Sekarang"
          actionHref="/auth/login?redirect=/notifications"
        />
      </div>
    );
  }

  const handleMarkAsRead = (id: string) => {
    if (token) markAsRead(id, token);
  };

  const handleMarkAllAsRead = () => {
    if (token) markAllAsRead(token);
  };

  const handleDelete = (id: string) => {
    if (token) deleteNotification(id, token);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Page Header */}
      <div className="border-b border-hairline pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-1">Notifikasi</h1>
            <p className="text-xs text-ink-secondary">
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : "Semua notifikasi telah dibaca"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs uppercase font-bold tracking-widest text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-paper p-1 rounded-xs mb-6 w-fit">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-xs transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-surface text-ink-primary shadow-xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {tab === "all" ? "Semua" : (
              <span className="flex items-center gap-1.5">
                Belum Dibaca
                {unreadCount > 0 && (
                  <span className="min-w-4 h-4 bg-primary text-white text-[9px] font-mono font-bold flex items-center justify-center px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-paper border border-hairline flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-ink-secondary">notifications_off</span>
            </div>
            <p className="font-serif text-xl text-ink-primary mb-1">
              {activeTab === "unread" ? "Tidak Ada Notifikasi Baru" : "Belum Ada Notifikasi"}
            </p>
            <p className="text-xs text-ink-secondary">
              {activeTab === "unread"
                ? "Semua notifikasi sudah dibaca."
                : "Notifikasi pesanan, pembayaran, dan sistem akan muncul di sini."}
            </p>
            {activeTab === "unread" && (
              <button
                onClick={() => setActiveTab("all")}
                className="mt-4 text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                Lihat Semua Notifikasi
              </button>
            )}
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              onRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-xs border border-hairline flex items-center justify-center text-ink-secondary hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-xs text-ink-secondary px-1">...</span>
                )}
                <button
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-xs text-xs font-bold transition-colors cursor-pointer ${
                    p === page
                      ? "bg-primary text-white"
                      : "border border-hairline text-ink-secondary hover:text-primary hover:border-primary"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-xs border border-hairline flex items-center justify-center text-ink-secondary hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      )}

      {/* Quick nav back */}
      <div className="mt-8 pt-6 border-t border-hairline text-center">
        <Link href="/" className="text-xs text-ink-secondary hover:text-ink-primary transition-colors flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="py-20 flex justify-center"><span className="font-serif text-2xl animate-pulse">Loading...</span></div>}>
      <NotificationsContent />
    </Suspense>
  );
}
