'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ArrowLeftRight, ShieldCheck, Wallet,
  Headphones, Settings, LogOut, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/layout/Logo';
import { useAuthStore } from '@/store/authStore';

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/admin/kyc', label: 'KYC Review', icon: ShieldCheck },
  { href: '/admin/wallets', label: 'Wallet Config', icon: Wallet },
  { href: '/admin/support', label: 'Support', icon: Headphones },
  { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-[#0D1117] border-r border-[#21262D]">
      <div className="h-16 flex items-center px-5 gap-3 border-b border-[#21262D]">
        <Logo size={32} />
        <div>
          <div className="text-sm font-bold">Admin Panel</div>
          <div className="text-[10px] text-[#8B949E] tracking-widest">CONTROL CENTER</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {adminNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active ? 'bg-red-500/10 text-red-400' : 'text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3]'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#21262D] p-3 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3] transition-colors">
          <ExternalLink size={16} /> User App
        </Link>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
