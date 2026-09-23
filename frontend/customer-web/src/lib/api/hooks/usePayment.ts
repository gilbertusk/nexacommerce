import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

// ------- Types -------

export interface PaymentInfo {
  orderId: string;
  status: string;
  amount?: number;
  paymentMethod?: string;
  paymentUrl?: string;
  snapToken?: string;
  expiresAt?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: PaymentInfo;
}

export interface InitiatePaymentResponse {
  success: boolean;
  data: {
    paymentUrl: string;
    snapToken?: string;
  };
}

// ------- Hooks -------

export function usePaymentStatus(orderId: string) {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["payment", orderId],
    queryFn: () =>
      apiGet<PaymentStatusResponse>(`/payments/${orderId}`, token ?? undefined),
    enabled: Boolean(orderId) && Boolean(token),
    staleTime: 1000 * 10,
  });
}

export function useInitiatePayment() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      apiPost<InitiatePaymentResponse>(
        `/payments/${orderId}`,
        {},
        token ?? undefined
      ),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["payment", orderId] });
    },
  });
}
