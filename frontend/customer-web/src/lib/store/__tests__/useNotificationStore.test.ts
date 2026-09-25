import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeNotificationType, useNotificationStore } from "../useNotificationStore";

const { apiGetMock, apiPostMock, apiPatchMock, apiDeleteMock } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
  apiPostMock: vi.fn(),
  apiPatchMock: vi.fn(),
  apiDeleteMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  apiGet: apiGetMock,
  apiPost: apiPostMock,
  apiPatch: apiPatchMock,
  apiDelete: apiDeleteMock,
}));

const initialNotification = {
  id: "note/1", type: "ORDER" as const, title: "Pesanan", message: "Dikirim",
  isRead: false, createdAt: "2026-09-24T00:00:00.000Z",
};

describe("useNotificationStore API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationStore.setState({
      notifications: [initialNotification], unreadCount: 1, isLoading: false,
      total: 1, page: 1, limit: 20, ownerId: "user-1",
    });
  });

  it.each([
    ["ORDER_CREATED", "ORDER"],
    ["ORDER_SHIPPED", "ORDER"],
    ["PAYMENT_SUCCESS", "PAYMENT"],
    ["PAYMENT_FAILED", "PAYMENT"],
    ["REVIEW_RECEIVED", "REVIEW"],
    ["LOW_STOCK", "SYSTEM"],
  ] as const)("normalizes backend event type %s for UI categories", (apiType, category) => {
    expect(normalizeNotificationType(apiType)).toBe(category);
  });

  it("normalizes backend event types when fetching notifications", async () => {
    apiGetMock.mockResolvedValue({
      success: true,
      data: {
        notifications: [{ ...initialNotification, type: "ORDER_CREATED" }],
        unreadCount: 1, total: 1, page: 1, limit: 20,
      },
    });

    await useNotificationStore.getState().fetchNotifications("token", "user-1");

    expect(useNotificationStore.getState().notifications[0].type).toBe("ORDER");
  });

  it("marks one notification read with the backend PATCH route", async () => {
    apiPatchMock.mockResolvedValue({ success: true });

    await useNotificationStore.getState().markAsRead("note/1", "token", "user-1");

    expect(apiPatchMock).toHaveBeenCalledWith("/notifications/note%2F1/read", {}, "token");
    expect(useNotificationStore.getState().notifications[0].isRead).toBe(true);
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  it("deletes a notification using the owner-scoped backend resource route", async () => {
    apiDeleteMock.mockResolvedValue({ success: true });

    await useNotificationStore.getState().deleteNotification("note/1", "token", "user-1");

    expect(apiDeleteMock).toHaveBeenCalledWith("/notifications/note%2F1", "token");
    expect(useNotificationStore.getState().notifications).toEqual([]);
    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().total).toBe(0);
  });

  it("clears the previous account immediately and ignores a late response from that account", async () => {
    let resolveOldRequest!: (value: unknown) => void;
    apiGetMock.mockImplementation((_path: string, token: string) => {
      if (token === "old-token") {
        return new Promise((resolve) => { resolveOldRequest = resolve; });
      }
      return Promise.resolve({
        success: true,
        data: {
          notifications: [{ ...initialNotification, id: "new-account-note" }],
          unreadCount: 1, total: 1, page: 1, limit: 20,
        },
      });
    });

    const oldRequest = useNotificationStore.getState().fetchNotifications("old-token", "old-user");
    expect(useNotificationStore.getState().notifications).toEqual([]);
    await useNotificationStore.getState().fetchNotifications("new-token", "new-user");
    resolveOldRequest({
      success: true,
      data: { notifications: [initialNotification], unreadCount: 1, total: 1, page: 1, limit: 20 },
    });
    await oldRequest;

    expect(useNotificationStore.getState().ownerId).toBe("new-user");
    expect(useNotificationStore.getState().notifications.map(({ id }) => id)).toEqual(["new-account-note"]);
  });
});
