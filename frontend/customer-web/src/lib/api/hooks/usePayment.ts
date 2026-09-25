import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

export interface PaymentInfo {
  id: string;
  orderId: string;
  status: string;
  amount: number;
  paymentMethod?: string | null;
  paymentUrl?: string | null;
  snapToken?: string | null;
  expiresAt?: string | null;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: PaymentInfo;
}

interface RawPaymentResponse {
  success: boolean;
  data: Omit<PaymentInfo, "amount"> & { amount: number | string };
}

export function usePaymentStatus(orderId: string) {
  const token = useUserStore((state) => state.token);

  return useQuery({
    queryKey: ["payment", orderId],
    queryFn: async (): Promise<PaymentStatusResponse> => {
      const response = await apiGet<RawPaymentResponse>(`/payments/order/${orderId}`, token ?? undefined);
      return {
        success: response.success,
        data: { ...response.data, amount: Number(response.data.amount) },
      };
    },
    enabled: Boolean(orderId) && Boolean(token),
    staleTime: 1000 * 10,
    refetchInterval: (query) => query.state.data?.data.status === "PENDING" ? 15000 : false,
  });
}
