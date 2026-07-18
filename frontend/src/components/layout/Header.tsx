'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, Settings, LogOut, Menu, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Badge } from '@/components/ui/badge';
import { cn, getInitials, formatDate } from '@/lib/utils';
import api from '@/lib/api';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface HeaderProps {
  onMenuToggle?: () => void;
  className?: string;
}

export function Header({ onMenuToggle, className }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Real notifications from the backend, refreshed every 60s
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const load = () =>
      api.get<AppNotification[]>('/notifications')
        .then((r) => setNotifications(Array.isArray(r.data) ? r.data : []))
        .catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = (id: string) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    api.patch(`/notifications/${id}/read`).catch(() => {});
  };

  const markAllRead = () => {
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    api.patch('/notifications/read-all').catch(() => {});
  };

  return (
    <header
      className={cn(
        'h-16 bg-[#0A0B0D]/95 backdrop-blur-sm border-b border-[#21262D]',
        'flex items-center gap-4 px-4 lg:px-6',
        'sticky top-0 z-40',
        className
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-[#8B949E] hover:bg-[#21262D]"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 focus-within:border-amber-500/50 transition-colors">
        <Search size={14} className="text-[#8B949E] shrink-0" />
        <input
          type="text"
          placeholder="Search assets, markets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[#E6EDF3] placeholder-[#6E7681] outline-none"
        />
        <kbd className="hidden sm:inline-block text-xs text-[#6E7681] bg-[#21262D] px-1.5 py-0.5 rounded">
          /
        </kbd>
      </div>

      <div className="flex-1 md:flex-none" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full text-xs text-black font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#161B22] border border-[#21262D] rounded-xl shadow-modal z-50 animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D]">
                <span className="text-sm font-semibold text-[#E6EDF3]">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-amber-400 hover:text-amber-300">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-[#8B949E]">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markRead(n.id)}
                      className={cn(
                        'px-4 py-3 border-b border-[#21262D]/50 cursor-pointer hover:bg-[#1C2128] transition-colors',
                        !n.isRead && 'bg-amber-500/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        )}
                        <div className={cn(n.isRead && 'pl-5', 'min-w-0')}>
                          <p className="text-sm text-[#E6EDF3] font-medium">{n.title}</p>
                          <p className="text-xs text-[#8B949E] mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-xs text-[#6E7681] mt-1">{formatDate(n.createdAt, 'relative')}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#21262D] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-black">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-[#E6EDF3] leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-[#8B949E] leading-tight">{user?.email || ''}</p>
            </div>
            <ChevronDown size={14} className="text-[#8B949E] hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#161B22] border border-[#21262D] rounded-xl shadow-modal z-50 animate-slide-in">
              <div className="px-4 py-3 border-b border-[#21262D]">
                <p className="text-sm font-medium text-[#E6EDF3]">{user?.name}</p>
                <p className="text-xs text-[#8B949E] truncate">{user?.email}</p>
                {user?.kycStatus === 'APPROVED' && (
                  <Badge variant="success" size="sm" className="mt-1">Verified</Badge>
                )}
              </div>
              <div className="p-1">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded-lg transition-colors"
                >
                  <User size={15} />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded-lg transition-colors"
                >
                  <Settings size={15} />
                  Settings
                </Link>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    <Shield size={15} />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
