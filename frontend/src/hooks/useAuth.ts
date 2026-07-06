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

  // Demo login — bypasses API for development
  const demoLogin = useCallback(() => {
    const demoUser = {
      id: 'user-001',
      email: 'demo@bridgecapital.com',
      name: 'John Smith',
      role: 'USER' as const,
      kycStatus: 'APPROVED' as const,
      isHeld: false,
      twoFactorEnabled: false,
      country: 'US',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    };
    setAuth(demoUser, 'demo-token-123');
    toast.success('Welcome back, John!');
    router.push('/dashboard');
  }, [setAuth, router]);

  const demoAdminLogin = useCallback(() => {
    const adminUser = {
      id: 'admin-001',
      email: 'admin@bridgecapital.com',
      name: 'Admin User',
      role: 'ADMIN' as const,
      kycStatus: 'APPROVED' as const,
      isHeld: false,
      twoFactorEnabled: true,
      createdAt: new Date().toISOString(),
    };
    setAuth(adminUser, 'admin-token-456');
    toast.success('Admin access granted');
    router.push('/admin');
  }, [setAuth, router]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    demoLogin,
    demoAdminLogin,
  };
}
