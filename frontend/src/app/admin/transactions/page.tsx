'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import { Card, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import api from '@/lib/api';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate, truncateAddress, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Tx {
  id: string;
  userId: string;
  type: string;
  asset: string;
  amount: string | number;
  fee: string | number;
  status: string;
  txHash?: string;
  network?: string;
  usdValue: string | number;
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/transactions');
      setTxs(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Could not load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = txs.filter((t) => filter === 'ALL' || t.type === filter || t.status === filter);
  const pendingCount = txs.filter((t) => t.status === 'PENDING').length;

  const decide = async (id: string, approve: boolean) => {
    try {
      await api.patch(`/admin/transactions/${id}/review`, { approve });
      setTxs((list) => list.map((t) => (t.id === id ? { ...t, status: approve ? 'COMPLETED' : 'FAILED' } : t)));
      toast.success(`Transaction ${approve ? 'approved' : 'rejected'}. Logged to audit trail.`);
    } catch {
      toast.error('Review failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Transactions</h1><p className="text-sm text-[#8B949E]">All platform transactions</p></div>
        <Button variant="outline" leftIcon={<RefreshCw size={15} />} onClick={load}>Refresh</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Transactions" value={txs.length} />
        <StatCard label="Deposits" value={txs.filter((t) => t.type === 'DEPOSIT').length} />
        <StatCard label="Withdrawals" value={txs.filter((t) => t.type === 'WITHDRAWAL').length} />
        <StatCard label="Pending Approval" value={pendingCount} subValue={pendingCount > 0 ? 'Action needed' : 'All clear'} subValueColor={pendingCount > 0 ? 'text-amber-400' : 'text-green-400'} />
      </div>

      <Card>
        <div className="p-4 border-b border-[#21262D]">
          <Tabs
            tabs={[
              { id: 'ALL', label: 'All' },
              { id: 'PENDING', label: 'Pending', count: pendingCount },
              { id: 'DEPOSIT', label: 'Deposits' },
              { id: 'WITHDRAWAL', label: 'Withdrawals' },
            ]}
            activeTab={filter}
            onChange={setFilter}
            variant="pills"
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-sm text-[#8B949E]">No transactions yet. Platform activity will appear here.</div>
          ) : (
            <table className="w-full">
              <thead><tr className="text-xs text-[#8B949E] uppercase border-b border-[#21262D]">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold">Type</th>
                <th className="text-right px-5 py-3 font-semibold">Amount</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Hash / Network</th>
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-[#21262D]/50 hover:bg-[#1C2128] transition-colors">
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#21262D] flex items-center justify-center text-xs">{getInitials(t.userId)}</div><span className="text-xs text-[#8B949E]">{truncateAddress(t.userId, 8, 4)}</span></div></td>
                    <td className="px-5 py-3"><Badge variant="ghost" size="sm">{TRANSACTION_TYPE_LABELS[t.type] || t.type}</Badge></td>
                    <td className="px-5 py-3 text-right font-medium">{Number(t.amount)} {t.asset}<div className="text-xs text-[#8B949E]">{formatCurrency(Number(t.usdValue))}</div></td>
                    <td className="px-5 py-3 text-xs text-[#8B949E] hidden md:table-cell">{t.txHash ? truncateAddress(t.txHash) : '—'}{t.network && <span className="ml-1">· {t.network}</span>}</td>
                    <td className="px-5 py-3 text-xs text-[#8B949E]">{formatDate(t.createdAt, 'short')}</td>
                    <td className="px-5 py-3 text-center"><Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'} size="sm">{t.status}</Badge></td>
                    <td className="px-5 py-3">
                      {t.status === 'PENDING' ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="xs" variant="success" leftIcon={<Check size={12} />} onClick={() => decide(t.id, true)}>Approve</Button>
                          <Button size="xs" variant="danger" leftIcon={<X size={12} />} onClick={() => decide(t.id, false)}>Reject</Button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#6E7681] block text-right">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
