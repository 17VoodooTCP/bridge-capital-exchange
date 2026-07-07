'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  _setHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken: refreshToken ?? null, isAuthenticated: true }),

      updateUser: (data) =>
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),

      _setHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Mark hydration complete so route guards know they can trust the state
      onRehydrateStorage: () => (state) => state?._setHydrated(true),
    },
  ),
);
