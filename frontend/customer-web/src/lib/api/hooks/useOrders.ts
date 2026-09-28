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
  sellerId?: string;
  storeName?: string;
  courier: string;
  service: string;
  cost: number;
  etd?: string;
  trackingNumber?: string;
  status?: string;
  originCity?: string;
  originProvince?: string;
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
  shipments?: OrderShippingInfo[];
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
  shipmentBreakdown?: Array<{
    sellerId: string;
    storeName?: string;
    originCity?: string;
    originProvince?: string;
    courierName: string;
    serviceCode: string;
    serviceName?: string;
    cost: number | string;
    estimatedDays?: string;
  }> | null;
  createdAt?: string;
  statusHistory?: { id: string; toStatus: string; note?: string | null; createdAt: string }[];
}

interface RawLiveShipment {
  sellerId?: string | null;
  courierName: string;
  serviceCode: string;
  serviceName?: string;
  cost: number | string;
  trackingNumber?: string | null;
  status: string;
}

export function normalizeOrder(order: RawOrder, liveShipments: RawLiveShipment[] = []): ApiOrder {
  const liveBySeller = new Map(liveShipments.map((shipment) => [shipment.sellerId, shipment]));
  const shipments: OrderShippingInfo[] = (order.shipmentBreakdown ?? []).map((snapshot) => {
    const live = liveBySeller.get(snapshot.sellerId);
    return {
      sellerId: snapshot.sellerId,
      storeName: snapshot.storeName,
      courier: live?.courierName ?? snapshot.courierName,
      service: live?.serviceName ?? snapshot.serviceName ?? snapshot.serviceCode,
      cost: Number(live?.cost ?? snapshot.cost),
      etd: snapshot.estimatedDays,
      trackingNumber: live?.trackingNumber ?? undefined,
      status: live?.status,
      originCity: snapshot.originCity,
      originProvince: snapshot.originProvince,
    };
  });
  if (shipments.length === 0 && (order.courierName || order.courierService)) {
    shipments.push({
      courier: order.courierName ?? "",
      service: order.courierService ?? "",
      cost: Number(order.shippingCost),
      trackingNumber: liveShipments[0]?.trackingNumber ?? undefined,
      status: liveShipments[0]?.status,
    });
  }

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
    shippingInfo: shipments[0],
    shipments,
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

interface RawShippingResponse {
  success: boolean;
  data: RawLiveShipment | { shipments: RawLiveShipment[] };
}

// ------- Hooks -------

export function useOrders() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<OrdersListResponse> => {
      const raw = await apiGet<RawOrdersResponse>("/orders", token ?? undefined);
      return { success: raw.success, data: { orders: raw.data.orders.map((order) => normalizeOrder(order)) } };
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
      let liveShipments: RawLiveShipment[] = [];
      try {
        const shipping = await apiGet<RawShippingResponse>(`/shipping/${id}`, token ?? undefined);
        liveShipments = "shipments" in shipping.data ? shipping.data.shipments : [shipping.data];
      } catch {
        // A paid order may be visible before the asynchronous label consumer runs.
      }
      return { success: raw.success, data: { order: normalizeOrder(raw.data, liveShipments) } };
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
