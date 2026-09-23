import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

// ------- Types -------

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  sellerId?: string;
}

export interface OrderAddress {
  receiverName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  label?: string;
}

export interface OrderShippingInfo {
  courier: string;
  service: string;
  cost: number;
  etd?: string;
  trackingNumber?: string;
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  description?: string;
  date?: string;
  isActive: boolean;
}

export interface ApiOrder {
  id: string;
  status: string;
  total: number;
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  items: OrderItem[];
  address?: OrderAddress;
  shippingInfo?: OrderShippingInfo;
  timeline?: OrderTimelineEvent[];
  createdAt?: string;
  date?: string;
}

export interface OrdersListResponse {
  success: boolean;
  data: {
    orders: ApiOrder[];
  };
}

export interface SingleOrderResponse {
  success: boolean;
  data: {
    order: ApiOrder;
  };
}

export interface CreateOrderPayload {
  items: OrderItem[];
  addressId: string;
  shippingCourierId: string;
  voucherId?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    order: {
      id: string;
      status: string;
      total: number;
      items: OrderItem[];
    };
  };
}

// ------- Hooks -------

export function useOrders() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["orders"],
    queryFn: () => apiGet<OrdersListResponse>("/orders", token ?? undefined),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });
}

export function useOrder(id: string) {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["order", id],
    queryFn: () => apiGet<SingleOrderResponse>(`/orders/${id}`, token ?? undefined),
    enabled: Boolean(id) && Boolean(token),
    staleTime: 1000 * 30,
  });
}

export function useCreateOrder() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      apiPost<CreateOrderResponse>("/orders", payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
