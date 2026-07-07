'use client';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus, Lock, Unlock } from 'lucide-react';
import { formatCurrency, getInitials } from '@/lib/utils';
import { KYC_STATUS_LABELS } from '@/lib/constants';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: string;
  isHeld: boolean;
  totalBalance: number;
  country: string;
  createdAt: string;
  [key: string]: unknown;
}

interface Props {
  users: AdminUser[];
  onAdjust?: (u: AdminUser) => void;
  onToggleHold?: (u: AdminUser) => void;
  onView?: (u: AdminUser) => void;
}

const kycVariant = (s: string) => (s === 'APPROVED' ? 'success' : s === 'PENDING' ? 'warning' : s === 'REJECTED' ? 'danger' : 'default');

export function UserTable({ users, onAdjust, onToggleHold, onView }: Props) {
  const columns: Column<AdminUser>[] = [
    {
      key: 'name', header: 'User', sortable: true,
      render: (_v, u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-black">{getInitials(u.name)}</div>
          <div>
            <div className="font-medium text-[#E6EDF3]">{u.name}</div>
            <div className="text-xs text-[#8B949E]">{u.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'country', header: 'Country', sortable: true, render: (v) => <span className="text-[#8B949E]">{String(v)}</span> },
    { key: 'kycStatus', header: 'KYC', sortable: true, render: (v) => <Badge variant={kycVariant(String(v))}>{KYC_STATUS_LABELS[v as keyof typeof KYC_STATUS_LABELS]}</Badge> },
    {
      key: 'totalBalance', header: 'Balance', sortable: true, align: 'right',
      render: (v, u) => {
        const wallets = (u.wallets as { asset: string; balance: string | number }[] | undefined) || [];
        const nonZero = wallets.filter((w) => Number(w.balance) > 0);
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(Number(v))}</div>
            {nonZero.length > 0 ? (
              <div className="text-xs text-[#8B949E] font-mono">
                {nonZero.slice(0, 3).map((w) => `${Number(w.balance).toFixed(4)} ${w.asset}`).join(' · ')}
                {nonZero.length > 3 && ` +${nonZero.length - 3}`}
              </div>
            ) : (
              <div className="text-xs text-[#6E7681]">no balances</div>
            )}
          </div>
        );
      },
    },
    { key: 'isHeld', header: 'Status', align: 'center', render: (v) => v ? <Badge variant="danger" dot>On Hold</Badge> : <Badge variant="success" dot>Active</Badge> },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (_v, u) => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="xs" variant="outline" leftIcon={<Plus size={12} />} onClick={() => onAdjust?.(u)}>Funds</Button>
          <Button size="xs" variant="ghost" onClick={() => onToggleHold?.(u)} title={u.isHeld ? 'Release hold' : 'Place hold'}>
            {u.isHeld ? <Unlock size={14} /> : <Lock size={14} />}
          </Button>
          <Button size="xs" variant="ghost" onClick={() => onView?.(u)}><MoreHorizontal size={14} /></Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={users} rowKey="id" />;
}
