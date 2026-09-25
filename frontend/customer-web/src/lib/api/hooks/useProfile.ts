import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

// ------- Types -------

export interface ApiAddress {
  id: string;
  label: string;
  receiverName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface ApiUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  addresses?: ApiAddress[];
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    user: ApiUserProfile;
  };
}

export interface AddressesResponse {
  success: boolean;
  data: {
    addresses: ApiAddress[];
  };
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export interface CreateAddressPayload {
  label: string;
  receiverName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

interface RawProfileResponse {
  success: boolean;
  data: {
    userId: string;
    displayName: string | null;
    phone?: string;
  };
}

interface RawAddressesResponse {
  success: boolean;
  data: RawAddress[];
}

interface AddressResponse {
  success: boolean;
  data: RawAddress;
}

interface RawAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

function normalizeAddress(address: RawAddress): ApiAddress {
  return {
    id: address.id,
    label: address.label,
    receiverName: address.recipientName,
    phoneNumber: address.phone,
    street: address.street,
    city: address.city,
    province: address.province,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  };
}

// ------- Hooks -------

export function useUserProfile() {
  const token = useUserStore((s) => s.token);
  const currentUser = useUserStore((s) => s.user);

  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async (): Promise<UserProfileResponse> => {
      const raw = await apiGet<RawProfileResponse>("/users/me", token ?? undefined);
      return {
        success: raw.success,
        data: {
          user: {
            id: raw.data.userId,
            name: raw.data.displayName ?? currentUser?.name ?? "",
            email: currentUser?.email ?? "",
            role: currentUser?.role,
            phone: raw.data.phone,
          },
        },
      };
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiPatch<RawProfileResponse>("/users/me", {
        displayName: payload.name,
        phone: payload.phone,
      }, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useAddresses() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["addresses"],
    queryFn: async (): Promise<AddressesResponse> => {
      const raw = await apiGet<RawAddressesResponse>("/users/me/addresses", token ?? undefined);
      return { success: raw.success, data: { addresses: raw.data.map(normalizeAddress) } };
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAddress() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      apiPost<AddressResponse>("/users/me/addresses", {
        label: payload.label,
        recipientName: payload.receiverName,
        phone: payload.phoneNumber,
        street: payload.street,
        city: payload.city,
        province: payload.province,
        postalCode: payload.postalCode,
        isDefault: payload.isDefault,
      }, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useDeleteAddress() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) =>
      apiDelete<{ success: boolean }>(`/users/me/addresses/${addressId}`, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}
