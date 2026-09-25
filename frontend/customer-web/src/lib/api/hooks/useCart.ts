import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

export interface ApiCartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  currentPrice: number;
  quantity: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  priceChanged: boolean;
  outOfStock: boolean;
  insufficientStock: boolean;
}

export interface ApiCart {
  userId: string;
  items: ApiCartItem[];
  subtotal: number;
  totalItems: number;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  data: ApiCart;
}

export const cartQueryKey = (userId?: string | null) => ["cart", userId ?? null] as const;

export function normalizeCartItem(item: ApiCartItem) {
  return {
    id: item.productId,
    cartItemId: item.id,
    name: item.productName,
    image: item.productImage,
    price: item.currentPrice,
    qty: item.quantity,
    stock: item.stock,
    sellerId: item.sellerId,
    sellerName: item.sellerName,
    priceChanged: item.priceChanged,
    outOfStock: item.outOfStock,
    insufficientStock: item.insufficientStock,
  };
}

export function useCart() {
  const token = useUserStore((state) => state.token);
  const userId = useUserStore((state) => state.user?.id);
  return useQuery({
    queryKey: cartQueryKey(userId),
    queryFn: () => apiGet<CartResponse>("/cart", token ?? undefined),
    enabled: Boolean(token),
    staleTime: 0,
  });
}

function useCartMutation<TPayload>(mutationFn: (payload: TPayload) => Promise<CartResponse>) {
  const userId = useUserStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TPayload) => mutationFn(payload),
    onSuccess: (cart) => queryClient.setQueryData(cartQueryKey(userId), cart),
  });
}

export function useAddCartItem() {
  const token = useUserStore((state) => state.token);
  return useCartMutation<{ productId: string; quantity: number }>((payload) =>
    apiPost<CartResponse>("/cart/items", payload, token ?? undefined)
  );
}

export function useUpdateCartItem() {
  const token = useUserStore((state) => state.token);
  return useCartMutation<{ itemId: string; quantity: number }>(({ itemId, quantity }) =>
    apiPatch<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, { quantity }, token ?? undefined)
  );
}

export function useRemoveCartItem() {
  const token = useUserStore((state) => state.token);
  return useCartMutation<string>((itemId) =>
    apiDelete<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, token ?? undefined)
  );
}

export function useClearCart() {
  const token = useUserStore((state) => state.token);
  return useCartMutation<void>(() => apiDelete<CartResponse>("/cart/clear", token ?? undefined));
}
