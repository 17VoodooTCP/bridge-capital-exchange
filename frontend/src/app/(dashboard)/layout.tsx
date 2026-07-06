'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Demo auth guard: auto-provision a demo session if none exists
    if (!isAuthenticated) {
      setAuth(
        {
          id: 'user-001',
          email: 'demo@bridgecapital.com',
          name: 'John Smith',
          role: 'USER',
          kycStatus: 'APPROVED',
          isHeld: false,
          twoFactorEnabled: false,
          country: 'US',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
        'demo-token-123'
      );
    }
    setReady(true);
  }, [isAuthenticated, setAuth]);

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
