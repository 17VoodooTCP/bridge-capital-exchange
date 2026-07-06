'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart2,
  TrendingUp,
  Percent,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: BarChart2 },
  { href: '/trade', label: 'Trade', icon: TrendingUp },
  { href: '/earn', label: 'Earn', icon: Percent },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D1117] border-t border-[#21262D] lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 flex-1 py-2 transition-colors',
                isActive ? 'text-amber-400' : 'text-[#8B949E]'
              )}
            >
              {/* Trade button gets a special style */}
              {href === '/trade' ? (
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center -mt-5 shadow-gold">
                  <Icon size={20} className="text-black" />
                </div>
              ) : (
                <Icon size={20} />
              )}
              <span className={cn('text-xs font-medium', href === '/trade' && isActive ? 'mt-1' : '')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
