'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import type { AuthCredentials, RegisterPayload } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, logout: storeLogout, updateUser } = useAuthStore();

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      const data = await authApi.login(credentials);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/dashboard');
      return data;
    },
    [setAuth, router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await authApi.register(payload);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Account created successfully!');
      router.push('/dashboard');
      return data;
    },
    [setAuth, router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    storeLogout();
    toast.success('Logged out successfully');
    router.push('/login');
  }, [storeLogout, router]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };
}
