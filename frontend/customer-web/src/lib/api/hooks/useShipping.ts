import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

// ------- Types -------

export interface ShippingService {
  service: string;
  cost: number;
  eta?: string;
}

export interface ShippingCourier {
  id: string;
  name: string;
  services?: ShippingService[];
}

export interface ShippingRate {
  courierId: string;
  courierName: string;
  service: string;
  cost: number;
  eta?: string;
}

// Shape consumed by UI code
export interface CouriersResponse {
  success: boolean;
  data: {
    couriers: ShippingCourier[];
  };
}

export interface ShippingRatesResponse {
  success: boolean;
  data: {
    rates: ShippingRate[];
  };
}

// Unified option type used in UI
export interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  cost: number;
  etd: string;
}

interface RawCourier {
  id: string;
  name: string;
  code: string;
  services: string | ShippingService[] | null;
  isActive: boolean;
}

function normalizeCourier(raw: RawCourier): ShippingCourier {
  const services: ShippingService[] = Array.isArray(raw.services) ? raw.services : [];
  return { id: raw.id, name: raw.name, services };
}

// ------- Hooks -------

export function useShippingCouriers() {
  return useQuery({
    queryKey: ["shipping-couriers"],
    queryFn: async (): Promise<CouriersResponse> => {
      const raw = await apiGet<{ success: boolean; data: RawCourier[] }>(
        "/shipping/couriers"
      );
      return {
        success: raw.success,
        data: {
          couriers: (Array.isArray(raw.data) ? raw.data : []).map(normalizeCourier),
        },
      };
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useShippingRates(
  originCity: string,
  destinationCity: string,
  weight: number = 500,
  courierId?: string
) {
  return useQuery({
    queryKey: ["shipping-rates", originCity, destinationCity, weight, courierId],
    queryFn: async (): Promise<ShippingRatesResponse> => {
      const params = new URLSearchParams({
        originCity,
        destinationCity,
        weight: String(weight),
      });
      if (courierId) params.set("courierId", courierId);
      const raw = await apiGet<{ success: boolean; data: ShippingRate[] }>(
        `/shipping/rates?${params.toString()}`
      );
      return {
        success: raw.success,
        data: {
          rates: Array.isArray(raw.data) ? raw.data : [],
        },
      };
    },
    enabled: Boolean(originCity) && Boolean(destinationCity),
    staleTime: 1000 * 60 * 5,
  });
}
