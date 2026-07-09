'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart2,
  TrendingUp,
  Percent,
  PieChart,
  LineChart,
  Wallet,
  Users as UsersIcon,
  Newspaper,
  HeadphonesIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from './Logo';
import { cn, getInitials } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: BarChart2 },
  { href: '/trade', label: 'Trade', icon: TrendingUp },
  { href: '/copy-trading', label: 'Copy Trading', icon: UsersIcon },
  { href: '/earn', label: 'Earn', icon: Percent },
  { href: '/etfs', label: 'ETFs', icon: PieChart },
  { href: '/stocks', label: 'Stocks', icon: LineChart },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/support', label: 'Support', icon: HeadphonesIcon },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex flex-col',
          'bg-[#0D1117] border-r border-[#21262D]',
          'transition-all duration-300 ease-in-out',
          // Mobile: show/hide
          'lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop collapse
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center border-b border-[#21262D] shrink-0',
          collapsed ? 'px-4 justify-center' : 'px-5 gap-3'
        )}>
          <Logo size={32} className="shrink-0" />
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-[#E6EDF3] leading-tight">Bridge Capital</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-150 group',
                  collapsed ? 'w-12 h-10 justify-center mx-auto' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3]'
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  size={18}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-amber-400' : 'group-hover:text-[#E6EDF3]'
                  )}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{label}</span>
                )}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User + Collapse */}
        <div className="border-t border-[#21262D] p-3 space-y-2 shrink-0">
          {/* User info */}
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-black shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#E6EDF3] truncate">{user.name}</p>
                <p className="text-xs text-[#8B949E] truncate">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-1 text-[#8B949E] hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 rounded-lg text-[#8B949E] hover:bg-[#21262D] hover:text-[#E6EDF3] transition-colors text-xs"
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
