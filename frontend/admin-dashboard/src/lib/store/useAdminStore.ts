'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminStore {
  admin: AdminUser | null;
  token: string | null;
  login: (admin: AdminUser) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      login: (admin: AdminUser) => {
        set({ admin, token: 'cookie-session' });
      },
      logout: () => {
        void fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        set({ admin: null, token: null });
      },
    }),
    {
      name: 'nexa-admin-storage',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AdminStore>;
        return { ...state, token: state.admin ? 'cookie-session' : null } as AdminStore;
      },
    },
  ),
);
