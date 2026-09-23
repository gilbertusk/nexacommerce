'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SellerUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SellerStore {
  seller: SellerUser | null;
  token: string | null;
  login: (seller: SellerUser) => void;
  logout: () => void;
}

export const useSellerStore = create<SellerStore>()(
  persist(
    (set) => ({
      seller: null,
      token: null,

      login: (seller) => {
        set({ seller, token: 'cookie-session' });
      },

      logout: () => {
        void fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        set({ seller: null, token: null });
      },
    }),
    {
      name: 'nexa-seller-storage',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<SellerStore>;
        return { ...state, token: state.seller ? 'cookie-session' : null } as SellerStore;
      },
    },
  ),
);
