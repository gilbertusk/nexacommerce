import { create } from "zustand";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";

export type NotificationType = "ORDER" | "PAYMENT" | "REVIEW" | "SYSTEM";

export function normalizeNotificationType(type: string): NotificationType {
  if (type.startsWith("ORDER_")) return "ORDER";
  if (type.startsWith("PAYMENT_")) return "PAYMENT";
  if (type.startsWith("REVIEW_")) return "REVIEW";
  return "SYSTEM";
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface NotificationListResponse {
  success: boolean;
  data: {
    notifications: Array<Omit<Notification, "type"> & { type: string }>;
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  };
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  ownerId: string | null;

  fetchNotifications: (token: string, userId: string, page?: number, unreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: string, token: string, userId: string) => Promise<void>;
  markAllAsRead: (token: string, userId: string) => Promise<void>;
  deleteNotification: (id: string, token: string, userId: string) => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  total: 0,
  page: 1,
  limit: 20,
  ownerId: null,

  fetchNotifications: async (token, userId, page = 1, unreadOnly = false) => {
    set((state) => ({
      isLoading: true,
      ...(state.ownerId === userId ? {} : {
        ownerId: userId,
        notifications: [],
        unreadCount: 0,
        total: 0,
      }),
    }));
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(get().limit),
        ...(unreadOnly ? { isRead: "false" } : {}),
      });
      const res = await apiGet<NotificationListResponse>(
        `/notifications?${params.toString()}`,
        token
      );
      if (get().ownerId === userId) {
        set({
          notifications: res.data.notifications.map((notification) => ({
            ...notification,
            type: normalizeNotificationType(notification.type),
          })),
          unreadCount: res.data.unreadCount,
          total: res.data.total,
          page: res.data.page,
        });
      }
    } catch (err) {
      console.error("[NotificationStore] fetchNotifications failed:", err);
    } finally {
      if (get().ownerId === userId) set({ isLoading: false });
    }
  },

  markAsRead: async (id, token, userId) => {
    try {
      await apiPatch(`/notifications/${encodeURIComponent(id)}/read`, {}, token);
      if (get().ownerId !== userId) return;
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error("[NotificationStore] markAsRead failed:", err);
    }
  },

  markAllAsRead: async (token, userId) => {
    try {
      await apiPost("/notifications/read-all", {}, token);
      if (get().ownerId !== userId) return;
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("[NotificationStore] markAllAsRead failed:", err);
    }
  },

  deleteNotification: async (id, token, userId) => {
    try {
      await apiDelete(`/notifications/${encodeURIComponent(id)}`, token);
      if (get().ownerId !== userId) return;
      set((state) => {
        const deleted = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: deleted && !deleted.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
          total: Math.max(0, state.total - 1),
        };
      });
    } catch (err) {
      console.error("[NotificationStore] deleteNotification failed:", err);
    }
  },

  reset: () => {
    set({ notifications: [], unreadCount: 0, isLoading: false, total: 0, page: 1, ownerId: null });
  },
}));
