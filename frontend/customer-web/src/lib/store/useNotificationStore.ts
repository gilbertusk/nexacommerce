import { create } from "zustand";
import { apiGet, apiPost, apiDelete } from "@/lib/api/client";

export type NotificationType = "ORDER" | "PAYMENT" | "REVIEW" | "SYSTEM";

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
    notifications: Notification[];
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

  fetchNotifications: (token: string, page?: number, unreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: string, token: string) => Promise<void>;
  markAllAsRead: (token: string) => Promise<void>;
  deleteNotification: (id: string, token: string) => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  total: 0,
  page: 1,
  limit: 20,

  fetchNotifications: async (token, page = 1, unreadOnly = false) => {
    set({ isLoading: true });
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
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
        total: res.data.total,
        page: res.data.page,
      });
    } catch (err) {
      console.error("[NotificationStore] fetchNotifications failed:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id, token) => {
    try {
      await apiPost(`/notifications/${id}/read`, {}, token);
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

  markAllAsRead: async (token) => {
    try {
      await apiPost("/notifications/read-all", {}, token);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("[NotificationStore] markAllAsRead failed:", err);
    }
  },

  deleteNotification: async (id, token) => {
    try {
      await apiDelete(`/notifications/${id}`, token);
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
    set({ notifications: [], unreadCount: 0, isLoading: false, total: 0, page: 1 });
  },
}));
