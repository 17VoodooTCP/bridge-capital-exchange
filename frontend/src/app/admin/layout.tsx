'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Shield } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
    if (!isAdmin) {
      router.replace('/admin-login');
      return;
    }
    setReady(true);
  }, [isAuthenticated, user, router]);

  if (!ready) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B0D]"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-[#0A0B0D]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#21262D] bg-[#0A0B0D]/95 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-red-400" />
            <span className="font-semibold">Admin Control Center</span>
            <Badge variant="danger" size="sm">RESTRICTED</Badge>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative p-2 rounded-lg text-[#8B949E] hover:bg-[#21262D]"><Bell size={18} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-xs font-bold text-white">AD</div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto"><div className="max-w-[1500px] mx-auto">{children}</div></main>
      </div>
    </div>
  );
}
