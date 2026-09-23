import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

// ------- Types -------

export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  createdAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: ApiNotification[];
  };
}

// ------- Hooks -------

export function useNotifications() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiGet<NotificationsResponse>("/notifications", token ?? undefined),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}
