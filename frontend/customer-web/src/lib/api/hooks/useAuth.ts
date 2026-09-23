import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/useUserStore";

// ------- Types -------

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

export interface RegisterResponse {
  success: boolean;
  data: AuthUser;
}

// ------- Hooks -------

export function useLogin() {
  const login = useUserStore((s) => s.login);

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiPost<LoginResponse>("/auth/login", payload),
    onSuccess: (data) => {
      const { user } = data.data;
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      apiPost<RegisterResponse>("/auth/register", payload),
  });
}
