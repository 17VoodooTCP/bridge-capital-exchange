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
      // Staff land in the admin panel, not the customer dashboard
      const isStaff = data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN';
      router.push(isStaff ? '/admin' : '/dashboard');
      return data;
    },
    [setAuth, router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await authApi.register(payload);
      // Account exists but is inert until the emailed OTP is confirmed
      toast.success('Account created — check your email for the verification code.');
      router.push(`/verify-email?email=${encodeURIComponent(payload.email)}`);
      return data;
    },
    [router]
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const data = await authApi.verifyEmail(email, code);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Email verified — welcome to Bridge Capital!');
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
    verifyEmail,
    logout,
    updateUser,
  };
}
