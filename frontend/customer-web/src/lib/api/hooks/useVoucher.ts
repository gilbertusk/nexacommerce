import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

// ------- Types -------

export interface VoucherValidationResponse {
  success: boolean;
  data: {
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
    code?: string;
    description?: string;
  };
}

// ------- Hooks -------

export function useVoucherValidation(code: string, amount: number) {
  return useQuery({
    queryKey: ["voucher", code, amount],
    queryFn: () =>
      apiGet<VoucherValidationResponse>(
        `/vouchers/validate?code=${encodeURIComponent(code)}&amount=${amount}`
      ),
    enabled: code.length > 0 && amount > 0,
    retry: false,
    staleTime: 0,
  });
}
