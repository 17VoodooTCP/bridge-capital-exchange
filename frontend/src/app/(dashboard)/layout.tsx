'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/lib/constants';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, logout, token } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Wait for zustand to finish reading localStorage before judging auth.
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace('/register');
      return;
    }
    // Validate the session against the server with a RAW axios call (bypassing
    // the global interceptor so we control the outcome). A stale/deleted account
    // can still carry a syntactically-valid token; verify it really exists so
    // old demo sessions can't linger in an empty logged-in state.
    let cancelled = false;
    axios
      .get(`${API_BASE_URL}/users/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(() => { if (!cancelled) setReady(true); })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          logout();
          router.replace('/register');
        } else {
          // Network hiccup / cold start — trust the local session for now
          setReady(true);
        }
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, hasHydrated, router, logout]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0B0D]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0B0D]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
