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

/**
 * Checkout input.
 *
 * There is no shipping cost here on purpose. The browser requests a quote from
 * Shipping Service and passes back only its opaque id; the server resolves the
 * price from its own record. The backend rejects unknown fields, so re-adding a
 * client-side cost would fail the request rather than be ignored.
 */
export interface CreateOrderPayload {
  shippingAddressId: string;
  shippingQuoteId: string;
  voucherCode?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    order: ApiOrder;
    payment: { id: string; status: string; paymentUrl?: string | null; expiresAt?: string };
  };
}

export interface RawOrderItem {
  productId: string;
  productName: string;
  productPrice: number | string;
  quantity: number;
  productImage?: string | null;
  sellerId?: string;
}

export interface RawOrder {
  id: string;
  status: string;
  grandTotal: number | string;
  subtotal: number | string;
  shippingCost: number | string;
  discount: number | string;
  items: RawOrderItem[];
  shippingAddress?: {
    recipientName?: string;
    receiverName?: string;
    phone?: string;
    phoneNumber?: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    label?: string;
  } | null;
  courierName?: string | null;
  courierService?: string | null;
  createdAt?: string;
  statusHistory?: { id: string; toStatus: string; note?: string | null; createdAt: string }[];
}

export function normalizeOrder(order: RawOrder): ApiOrder {
  return {
    id: order.id,
    status: order.status,
    total: Number(order.grandTotal),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      price: Number(item.productPrice),
      qty: item.quantity,
      image: item.productImage ?? "",
      sellerId: item.sellerId,
    })),
    address: order.shippingAddress ? {
      receiverName: order.shippingAddress.recipientName ?? order.shippingAddress.receiverName ?? "",
      phoneNumber: order.shippingAddress.phone ?? order.shippingAddress.phoneNumber ?? "",
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      province: order.shippingAddress.province,
      postalCode: order.shippingAddress.postalCode,
      label: order.shippingAddress.label,
    } : undefined,
    shippingInfo: order.courierName || order.courierService ? {
      courier: order.courierName ?? "",
      service: order.courierService ?? "",
      cost: Number(order.shippingCost),
    } : undefined,
    timeline: order.statusHistory?.map((event, index, events) => ({
      id: event.id,
      title: event.toStatus,
      description: event.note ?? undefined,
      date: event.createdAt,
      isActive: index === events.length - 1,
    })),
    createdAt: order.createdAt,
  };
}

interface RawOrdersResponse {
  success: boolean;
  data: { orders: RawOrder[] };
}

interface RawOrderResponse {
  success: boolean;
  data: RawOrder;
}

interface RawCheckoutResponse {
  success: boolean;
  data: {
    order: RawOrder;
    payment: { id: string; status: string; paymentUrl?: string | null; expiresAt?: string };
  };
}

// ------- Hooks -------

export function useOrders() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<OrdersListResponse> => {
      const raw = await apiGet<RawOrdersResponse>("/orders", token ?? undefined);
      return { success: raw.success, data: { orders: raw.data.orders.map(normalizeOrder) } };
    },
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });
}

export function useOrder(id: string) {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["order", id],
    queryFn: async (): Promise<SingleOrderResponse> => {
      const raw = await apiGet<RawOrderResponse>(`/orders/${id}`, token ?? undefined);
      return { success: raw.success, data: { order: normalizeOrder(raw.data) } };
    },
    enabled: Boolean(id) && Boolean(token),
    staleTime: 1000 * 30,
  });
}

export function useCreateOrder() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
      const raw = await apiPost<RawCheckoutResponse>("/orders/checkout", payload, token ?? undefined);
      return {
        success: raw.success,
        data: { order: normalizeOrder(raw.data.order), payment: raw.data.payment },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
