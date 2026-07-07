'use client';
import { useEffect, useState } from 'react';
import { Users, DollarSign, ShieldAlert, MessageSquare, ArrowDownLeft, Layers, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils';

interface RecentUser {
  id: string;
  name: string;
  email: string;
  kycStatus: string;
  createdAt: string;
}

interface RecentTx {
  id: string;
  userId: string;
  type: string;
  asset: string;
  amount: string | number;
  usdValue: string | number;
  status: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  newUsersThisWeek: number;
  volume24h: number;
  pendingKyc: number;
  openTickets: number;
  deposits24h: number;
  activeStakes: number;
  recentUsers: RecentUser[];
  recentTransactions: RecentTx[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const fmtVol = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : formatCurrency(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-[#8B949E]">Platform-wide metrics and recent activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Users"
          value={loading ? '—' : (stats?.totalUsers ?? 0).toLocaleString()}
          subValue={loading ? undefined : stats?.newUsersThisWeek ? `+${stats.newUsersThisWeek} this week` : undefined}
          subValueColor="text-green-400"
          icon={<Users size={18} className="text-amber-400" />}
        />
        <StatCard
          label="24h Volume"
          value={loading ? '—' : fmtVol(stats?.volume24h ?? 0)}
          icon={<TrendingUp size={18} className="text-green-400" />}
          iconBg="bg-green-500/10"
        />
        <StatCard
          label="Pending KYC"
          value={loading ? '—' : stats?.pendingKyc ?? 0}
          subValue={stats?.pendingKyc ? 'Needs review' : 'All clear'}
          subValueColor={stats?.pendingKyc ? 'text-amber-400' : 'text-green-400'}
          icon={<ShieldAlert size={18} className="text-amber-400" />}
        />
        <StatCard
          label="Open Tickets"
          value={loading ? '—' : stats?.openTickets ?? 0}
          icon={<MessageSquare size={18} className="text-blue-400" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Deposits (24h)"
          value={loading ? '—' : fmtVol(stats?.deposits24h ?? 0)}
          icon={<ArrowDownLeft size={18} className="text-green-400" />}
          iconBg="bg-green-500/10"
        />
        <StatCard
          label="Active Stakes"
          value={loading ? '—' : stats?.activeStakes ?? 0}
          icon={<Layers size={18} className="text-amber-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h3 className="font-semibold">Recent Registrations</h3></CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
            ) : stats?.recentUsers?.length ? (
              stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#21262D]/50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-black">{getInitials(u.name)}</div>
                  <div className="flex-1"><div className="text-sm font-medium">{u.name}</div><div className="text-xs text-[#8B949E]">{u.email}</div></div>
                  <Badge variant={u.kycStatus === 'APPROVED' ? 'success' : u.kycStatus === 'PENDING' ? 'warning' : 'default'} size="sm">{u.kycStatus}</Badge>
                  <span className="text-xs text-[#8B949E]">{formatDate(u.createdAt, 'relative')}</span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-[#8B949E]">No user registrations yet.</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">Recent Transactions</h3></CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
            ) : stats?.recentTransactions?.length ? (
              stats.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#21262D]/50 last:border-0">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs', ['DEPOSIT', 'BUY', 'REWARD', 'ADMIN_ADJUSTMENT'].includes(t.type) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>{t.asset.slice(0, 2)}</div>
                  <div className="flex-1"><div className="text-sm font-medium">{TRANSACTION_TYPE_LABELS[t.type] || t.type} {Number(t.amount)} {t.asset}</div><div className="text-xs text-[#8B949E]">{formatDate(t.createdAt, 'relative')}</div></div>
                  <div className="text-right"><div className="text-sm">{formatCurrency(Number(t.usdValue))}</div><Badge variant={t.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">{t.status}</Badge></div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-[#8B949E]">No transactions yet.</div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><h3 className="font-semibold">Platform Health</h3></CardHeader>
        <CardBody className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'API Uptime', value: '99.99%', color: 'text-green-400' },
            { label: 'Matching Engine', value: 'Operational', color: 'text-green-400' },
            { label: 'Avg Latency', value: '24ms', color: 'text-green-400' },
            { label: 'Hot Wallet', value: 'Healthy', color: 'text-green-400' },
          ].map((h) => (
            <div key={h.label} className="p-4 rounded-lg bg-[#0D1117] border border-[#21262D]">
              <div className="text-xs text-[#8B949E]">{h.label}</div>
              <div className={cn('text-lg font-semibold mt-1', h.color)}>{h.value}</div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
