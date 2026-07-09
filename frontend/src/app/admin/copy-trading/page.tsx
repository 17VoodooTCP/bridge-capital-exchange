'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AssetIcon } from '@/components/ui/AssetIcon';
import api from '@/lib/api';
import { getInitials, formatPercent, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Trader {
  id: string;
  name: string;
  handle: string;
  avatarType: 'INITIALS' | 'ASSET';
  avatarValue?: string | null;
  market: string;
  strategy: string;
  wins: number;
  losses: number;
  winRate: number;
  roi30d: number;
  profitSharePct: number;
  copiers: number;
  riskLevel: string;
  isActive: boolean;
}

const RISKS = ['LOW', 'MEDIUM', 'HIGH'];
const MARKETS = ['CRYPTO', 'STOCKS', 'MIXED'];
const AVATAR_ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'USDT', 'AVAX'];

const emptyTrader: Partial<Trader> = {
  name: '', handle: '', avatarType: 'INITIALS', avatarValue: null, market: 'CRYPTO',
  strategy: '', wins: 0, losses: 0, roi30d: 0, profitSharePct: 10, riskLevel: 'MEDIUM', isActive: true,
};

function Avatar({ t, size = 40 }: { t: Partial<Trader>; size?: number }) {
  if (t.avatarType === 'ASSET' && t.avatarValue) return <AssetIcon symbol={t.avatarValue} size={size} />;
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-black shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `hsl(${((t.handle || 'x').charCodeAt(0) * 12) % 360}, 65%, 60%)` }}>
      {getInitials(t.name || '?')}
    </div>
  );
}

export default function AdminCopyTradingPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Partial<Trader> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/copy-trading/admin/traders');
      setTraders(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Could not load traders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = traders.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) || t.strategy.toLowerCase().includes(query.toLowerCase()));

  const set = (k: keyof Trader, v: unknown) => setEditing((e) => (e ? { ...e, [k]: v } : e));

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.handle?.trim()) return toast.error('Name and handle are required');
    setSaving(true);
    try {
      if (editing.id) {
        const res = await api.patch(`/copy-trading/admin/traders/${editing.id}`, editing);
        setTraders((list) => list.map((t) => (t.id === editing.id ? res.data : t)));
        toast.success('Trader updated');
      } else {
        const res = await api.post('/copy-trading/admin/traders', editing);
        setTraders((list) => [res.data, ...list]);
        toast.success('Trader created');
      }
      setEditing(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t: Trader) => {
    if (!confirm(`Delete ${t.name}? This removes the strategy and any copy positions.`)) return;
    try {
      await api.delete(`/copy-trading/admin/traders/${t.id}`);
      setTraders((list) => list.filter((x) => x.id !== t.id));
      toast.success('Trader deleted');
    } catch {
      toast.error('Delete failed.');
    }
  };

  const riskBadge = (r: string) => (r === 'LOW' ? 'success' : r === 'HIGH' ? 'danger' : 'warning');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Copy Trading</h1><p className="text-sm text-[#8B949E]">{traders.length} strategy profiles</p></div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<RefreshCw size={15} />} onClick={load}>Refresh</Button>
          <Button leftIcon={<Plus size={15} />} onClick={() => setEditing({ ...emptyTrader })}>New Trader</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-[#21262D]">
          <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 max-w-md">
            <Search size={14} className="text-[#8B949E]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or strategy..." className="flex-1 bg-transparent text-sm outline-none text-[#E6EDF3]" />
          </div>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-xs text-[#8B949E] uppercase border-b border-[#21262D]">
                <th className="text-left px-5 py-3 font-semibold">Trader</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Market</th>
                <th className="text-center px-5 py-3 font-semibold">Risk</th>
                <th className="text-right px-5 py-3 font-semibold">Win Rate</th>
                <th className="text-right px-5 py-3 font-semibold hidden sm:table-cell">30d ROI</th>
                <th className="text-right px-5 py-3 font-semibold hidden lg:table-cell">Profit Share</th>
                <th className="text-center px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-[#21262D]/50 hover:bg-[#1C2128] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar t={t} size={34} />
                        <div><div className="font-medium">{t.name}</div><div className="text-xs text-[#8B949E]">@{t.handle} · {t.strategy}</div></div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell"><Badge variant="ghost" size="sm">{t.market}</Badge></td>
                    <td className="px-5 py-3 text-center"><Badge variant={riskBadge(t.riskLevel)} size="sm">{t.riskLevel}</Badge></td>
                    <td className="px-5 py-3 text-right font-medium text-green-400">{t.winRate}%</td>
                    <td className={cn('px-5 py-3 text-right hidden sm:table-cell', t.roi30d >= 0 ? 'text-green-400' : 'text-red-400')}>{formatPercent(t.roi30d)}</td>
                    <td className="px-5 py-3 text-right text-amber-400 hidden lg:table-cell">{t.profitSharePct}%</td>
                    <td className="px-5 py-3 text-center">{t.isActive ? <Badge variant="success" dot size="sm">Live</Badge> : <Badge variant="default" size="sm">Hidden</Badge>}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button size="xs" variant="outline" leftIcon={<Pencil size={12} />} onClick={() => setEditing({ ...t })}>Edit</Button>
                        <Button size="xs" variant="ghost" className="text-red-400" onClick={() => remove(t)}><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-sm text-[#8B949E]">No traders found.</div>}
          </div>
        )}
      </Card>

      {/* Edit / create modal */}
      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? `Edit ${editing.name}` : 'New Trader Profile'} size="lg">
        {editing && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar t={editing} size={56} />
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input label="Display Name" value={editing.name || ''} onChange={(e) => set('name', e.target.value)} />
                <Input label="Handle" value={editing.handle || ''} onChange={(e) => set('handle', e.target.value.replace(/\s/g, '').toLowerCase())} />
              </div>
            </div>

            {/* Avatar controls */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#8B949E]">Avatar Type</label>
                <select value={editing.avatarType} onChange={(e) => set('avatarType', e.target.value)} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none">
                  <option value="INITIALS">Initials</option>
                  <option value="ASSET">Crypto logo</option>
                </select>
              </div>
              {editing.avatarType === 'ASSET' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#8B949E]">Logo Asset</label>
                  <select value={editing.avatarValue || 'BTC'} onChange={(e) => set('avatarValue', e.target.value)} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none">
                    {AVATAR_ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              )}
            </div>

            <Input label="Strategy" value={editing.strategy || ''} onChange={(e) => set('strategy', e.target.value)} placeholder="e.g. BTC Momentum" />

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#8B949E]">Market</label>
                <select value={editing.market} onChange={(e) => set('market', e.target.value)} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none">
                  {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#8B949E]">Risk Level</label>
                <select value={editing.riskLevel} onChange={(e) => set('riskLevel', e.target.value)} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none">
                  {RISKS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Input label="Profit Share %" type="number" value={String(editing.profitSharePct ?? 10)} onChange={(e) => set('profitSharePct', Number(e.target.value))} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input label="Wins" type="number" value={String(editing.wins ?? 0)} onChange={(e) => set('wins', Number(e.target.value))} hint="Win rate auto-computed" />
              <Input label="Losses" type="number" value={String(editing.losses ?? 0)} onChange={(e) => set('losses', Number(e.target.value))} />
              <Input label="30d ROI %" type="number" value={String(editing.roi30d ?? 0)} onChange={(e) => set('roi30d', Number(e.target.value))} />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={!!editing.isActive} onChange={(e) => set('isActive', e.target.checked)} className="rounded border-[#21262D] bg-[#111318] text-amber-500 focus:ring-amber-500/30" />
              Visible to users (Live)
            </label>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" fullWidth onClick={() => setEditing(null)}>Cancel</Button>
              <Button fullWidth isLoading={saving} onClick={save}>{editing.id ? 'Save Changes' : 'Create Trader'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
