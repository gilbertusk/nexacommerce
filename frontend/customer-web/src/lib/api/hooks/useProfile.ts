import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
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

// ------- Hooks -------

export function useUserProfile() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["user-profile"],
    queryFn: () => apiGet<UserProfileResponse>("/users/profile", token ?? undefined),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiPut<UserProfileResponse>("/users/profile", payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useAddresses() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => apiGet<AddressesResponse>("/users/addresses", token ?? undefined),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAddress() {
  const token = useUserStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      apiPost<AddressesResponse>("/users/addresses", payload, token ?? undefined),
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
      apiDelete<{ success: boolean }>(`/users/addresses/${addressId}`, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}
