import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserAddress {
  id: string;
  label: string; // e.g. "Home", "Office"
  receiverName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserStore {
  user: UserProfile | null;
  token: string | null;
  addresses: UserAddress[];
  selectedAddressId: string | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  setAddresses: (addresses: UserAddress[]) => void;
  addAddress: (address: Omit<UserAddress, "id">) => void;
  selectAddress: (id: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      addresses: [],
      selectedAddressId: null,

      login: (user) => {
        set({
          user,
          // Non-sensitive marker only. The actual token lives in an HttpOnly cookie.
          token: "cookie-session",
          addresses: [],
          selectedAddressId: null,
        });
      },

      logout: () => {
        void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api/v1/auth/logout`, {
          method: "POST",
          credentials: "include",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        set({ user: null, token: null, addresses: [], selectedAddressId: null });
      },

      setAddresses: (addresses) => {
        set({ addresses });
        if (addresses.length > 0 && !get().selectedAddressId) {
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          set({ selectedAddressId: defaultAddr.id });
        }
      },

      addAddress: (addr) => {
        const id = `addr-${Date.now()}`;
        const newAddress: UserAddress = { ...addr, id };
        const updated = [...get().addresses];
        
        if (addr.isDefault) {
          // Unset other defaults
          updated.forEach((a) => {
            a.isDefault = false;
          });
        }
        
        updated.push(newAddress);
        
        set({
          addresses: updated,
          selectedAddressId: addr.isDefault ? id : get().selectedAddressId || id,
        });
      },

      selectAddress: (id) => {
        set({ selectedAddressId: id });
      },
    }),
    {
      name: "nexa-user-storage",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<UserStore>;
        return {
          ...state,
          token: state.user ? "cookie-session" : null,
        } as UserStore;
      },
    }
  )
);
