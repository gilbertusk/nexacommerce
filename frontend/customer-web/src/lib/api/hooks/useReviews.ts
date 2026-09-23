import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

// ------- Types -------

export interface ApiReview {
  id: string;
  productId: string;
  userId?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
  date?: string;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: {
    reviews: ApiReview[];
  };
}

export interface SubmitReviewPayload {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
}

export interface SubmitReviewResponse {
  success: boolean;
  data: {
    review: ApiReview;
  };
}

// ------- Hooks -------

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: () =>
      apiGet<ProductReviewsResponse>(`/reviews/products/${productId}`),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubmitReview() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) =>
      apiPost<SubmitReviewResponse>("/reviews", payload, token ?? undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
    },
  });
}
