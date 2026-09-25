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

interface ReviewRecord {
  id: string;
  productId: string;
  customerId?: string;
  customerName?: string;
  rating: number;
  content: string;
  createdAt?: string;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: {
    reviews: ApiReview[];
    summary?: { averageRating: number; totalReviews: number };
    page?: number;
    limit?: number;
  };
}

interface ProductReviewsApiResponse {
  success: boolean;
  data: {
    reviews: ReviewRecord[];
    summary?: { averageRating: number; totalReviews: number };
    page?: number;
    limit?: number;
  };
}

export function normalizeReview(record: ReviewRecord): ApiReview {
  return {
    id: record.id,
    productId: record.productId,
    userId: record.customerId,
    userName: record.customerName,
    rating: record.rating,
    comment: record.content,
    createdAt: record.createdAt,
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
    queryFn: async () => {
      const response = await apiGet<ProductReviewsApiResponse>(`/reviews/products/${productId}`);
      return {
        ...response,
        data: { ...response.data, reviews: response.data.reviews.map(normalizeReview) },
      };
    },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}

export type ReviewReportReason = "SPAM" | "INAPPROPRIATE" | "FAKE" | "OFFENSIVE" | "OTHER";

export function useReportReview(productId: string) {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { reviewId: string; reason: ReviewReportReason; description?: string }) =>
      apiPost(`/reviews/${encodeURIComponent(payload.reviewId)}/report`, {
        reason: payload.reason,
        description: payload.description?.trim() || undefined,
      }, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", productId] }),
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
