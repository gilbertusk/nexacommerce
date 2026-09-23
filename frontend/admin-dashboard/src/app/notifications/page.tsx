"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiPut } from "@/lib/api/client";

interface Notification {
  id: string;
  title?: string;
  message: string;
  type?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications?: Notification[];
    items?: Notification[];
    total?: number;
  } | Notification[];
}

const TYPE_ICON: Record<string, string> = {
  ORDER: "receipt_long",
  PAYMENT: "payments",
  SELLER: "storefront",
  SYSTEM: "settings",
  REVIEW: "star",
  USER: "group",
};

const TYPE_COLOR: Record<string, string> = {
  ORDER: "text-blue-500",
  PAYMENT: "text-green-500",
  SELLER: "text-purple-500",
  SYSTEM: "text-ink-secondary",
  REVIEW: "text-yellow-500",
  USER: "text-indigo-500",
};

function formatDate(d: string) {
  try {
    const now = new Date();
    const date = new Date(d);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function NotificationsPage() {
  const token = useAdminStore((s) => s.token);
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  const { data, isLoading, isError, refetch } = useQuery<NotificationsResponse>({
    queryKey: ["notifications", page],
    queryFn: () => apiGet<NotificationsResponse>(`/notifications?${params.toString()}`, token ?? undefined),
    enabled: !!token,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiPut<unknown>(`/notifications/${id}/read`, {}, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function getNotifications(): Notification[] {
    if (!data?.data) return [];
    if (Array.isArray(data.data)) return data.data;
    const d = data.data as { notifications?: Notification[]; items?: Notification[] };
    return d.notifications ?? d.items ?? [];
  }

  const allNotifications = getNotifications();
  const types = Array.from(new Set(allNotifications.map((n) => n.type).filter(Boolean)));

  const notifications = typeFilter
    ? allNotifications.filter((n) => n.type === typeFilter)
    : allNotifications;

  const unreadCount = allNotifications.filter((n) => !(n.isRead ?? n.read)).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">Notifikasi</h1>
          <p className="text-sm text-ink-secondary">
            Notifikasi sistem dan aktivitas platform.{" "}
            {unreadCount > 0 && (
              <span className="text-primary font-bold">{unreadCount} belum dibaca</span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex flex-wrap items-center gap-3">
          <button
            onClick={() => setTypeFilter("")}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors hairline ${typeFilter === "" ? "bg-ink-primary text-white border-ink-primary" : "text-ink-secondary hover:bg-surface"}`}
          >
            Semua
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type as string)}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors hairline ${typeFilter === type ? "bg-ink-primary text-white border-ink-primary" : "text-ink-secondary hover:bg-surface"}`}
            >
              {type}
            </button>
          ))}
          <span className="text-xs text-ink-secondary ml-auto">{notifications.length} notifikasi</span>
        </div>

        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat notifikasi.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-ink-primary/90 transition-colors">
              Coba Lagi
            </button>
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">notifications_none</span>
            <p className="text-sm text-ink-secondary">Tidak ada notifikasi.</p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <div className="divide-y divide-[#E7E3DC]">
            {notifications.map((notif) => {
              const isRead = notif.isRead ?? notif.read ?? false;
              const icon = TYPE_ICON[notif.type ?? ""] ?? "notifications";
              const iconColor = TYPE_COLOR[notif.type ?? ""] ?? "text-ink-secondary";
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-surface transition-colors ${!isRead ? "bg-blue-50/30" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-full bg-surface hairline flex items-center justify-center shrink-0 mt-0.5`}>
                    <span className={`material-symbols-outlined text-[18px] ${iconColor}`}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {notif.title && (
                      <p className={`text-xs font-bold text-ink-primary ${!isRead ? "" : "font-medium"}`}>
                        {notif.title}
                      </p>
                    )}
                    <p className={`text-sm text-ink-secondary mt-0.5 ${!isRead ? "text-ink-primary" : ""}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {notif.type && (
                        <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary bg-surface px-1.5 py-0.5 rounded-sm">
                          {notif.type}
                        </span>
                      )}
                      <span className="text-[10px] text-ink-secondary">{formatDate(notif.createdAt)}</span>
                    </div>
                  </div>
                  {!isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(notif.id)}
                      disabled={markReadMutation.isPending}
                      className="shrink-0 text-[10px] uppercase tracking-widest font-bold text-ink-secondary hover:text-primary transition-colors px-2 py-1"
                      title="Tandai sudah dibaca"
                    >
                      Baca
                    </button>
                  )}
                  {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination placeholder */}
        <div className="p-4 hairline-t flex items-center justify-between">
          <span className="text-xs text-ink-secondary">Halaman {page}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-40 transition-colors">
              Sebelumnya
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={notifications.length < limit} className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-40 transition-colors">
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
