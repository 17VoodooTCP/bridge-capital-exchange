'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
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
  avatarType: 'INITIALS' | 'ASSET' | 'PHOTO';
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

interface CopyPos {
  id: string;
  asset: string;
  allocation: number;
  pnl: number;
  trader: { name: string; strategy: string };
  user?: { name: string; email: string };
}

const RISKS = ['LOW', 'MEDIUM', 'HIGH'];
const MARKETS = ['CRYPTO', 'STOCKS', 'MIXED'];
const AVATAR_ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'USDT', 'AVAX'];

const emptyTrader: Partial<Trader> = {
  name: '', handle: '', avatarType: 'INITIALS', avatarValue: null, market: 'CRYPTO',
  strategy: '', wins: 0, losses: 0, roi30d: 0, profitSharePct: 10, riskLevel: 'MEDIUM', isActive: true,
};

function Avatar({ t, size = 40 }: { t: Partial<Trader>; size?: number }) {
  if (t.avatarType === 'PHOTO' && t.avatarValue) {
    return <img src={t.avatarValue} alt={t.name || ''} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  if (t.avatarType === 'ASSET' && t.avatarValue) return <AssetIcon symbol={t.avatarValue} size={size} />;
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-black shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `hsl(${((t.handle || 'x').charCodeAt(0) * 12) % 360}, 65%, 60%)` }}>
      {getInitials(t.name || '?')}
    </div>
  );
}

/** Reads an image file and downsizes it to a small square JPEG data URL. */
function fileToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 160;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE; canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas'));
        // center-crop to square
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminCopyTradingPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Partial<Trader> | null>(null);
  const [saving, setSaving] = useState(false);
  const [positions, setPositions] = useState<CopyPos[]>([]);
  const [pnlDraft, setPnlDraft] = useState<Record<string, string>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('Image too large (max 8MB)'); return; }
    try {
      const dataUrl = await fileToAvatar(file);
      setEditing((ed) => (ed ? { ...ed, avatarType: 'PHOTO', avatarValue: dataUrl } : ed));
      toast.success('Photo uploaded');
    } catch {
      toast.error('Could not process image');
    }
    e.target.value = '';
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api.get('/copy-trading/admin/traders'),
        api.get('/copy-trading/admin/positions').catch(() => ({ data: [] })),
      ]);
      setTraders(Array.isArray(tRes.data) ? tRes.data : []);
      setPositions(Array.isArray(pRes.data) ? pRes.data : []);
    } catch {
      toast.error('Could not load traders.');
    } finally {
      setLoading(false);
    }
  }, []);

  const savePnl = async (posId: string) => {
    const val = Number(pnlDraft[posId]);
    if (Number.isNaN(val)) return toast.error('Enter a number');
    try {
      await api.patch(`/copy-trading/admin/positions/${posId}/pnl`, { pnl: val });
      setPositions((list) => list.map((p) => (p.id === posId ? { ...p, pnl: val } : p)));
      toast.success('Copy P&L updated — user notified');
    } catch {
      toast.error('Could not update P&L');
    }
  };

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

      {/* Active copy positions — adjust the Copy P&L shown to each user */}
      <Card>
        <div className="p-4 border-b border-[#21262D]">
          <h3 className="font-semibold">Copy Positions — P&amp;L Control</h3>
          <p className="text-xs text-[#8B949E] mt-0.5">Add or remove the Copy P&amp;L on any active position. Users are notified and the amount is returned with their allocation when they stop copying.</p>
        </div>
        <div className="overflow-x-auto">
          {positions.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8B949E]">No active copy positions yet.</div>
          ) : (
            <table className="w-full">
              <thead><tr className="text-xs text-[#8B949E] uppercase border-b border-[#21262D]">
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold">Copying</th>
                <th className="text-right px-5 py-3 font-semibold">Allocation</th>
                <th className="text-right px-5 py-3 font-semibold">Copy P&amp;L</th>
                <th className="text-right px-5 py-3 font-semibold">Set P&amp;L</th>
              </tr></thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.id} className="border-b border-[#21262D]/50">
                    <td className="px-5 py-3"><div className="text-sm font-medium">{p.user?.name || '—'}</div><div className="text-xs text-[#8B949E]">{p.user?.email}</div></td>
                    <td className="px-5 py-3 text-sm">{p.trader.name}<div className="text-xs text-[#8B949E]">{p.trader.strategy}</div></td>
                    <td className="px-5 py-3 text-right font-mono text-sm">{p.allocation} {p.asset}</td>
                    <td className={cn('px-5 py-3 text-right font-mono text-sm', p.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>{p.pnl >= 0 ? '+' : ''}{p.pnl} {p.asset}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end">
                        <input
                          type="number"
                          value={pnlDraft[p.id] ?? String(p.pnl)}
                          onChange={(e) => setPnlDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                          className="w-24 bg-[#111318] border border-[#21262D] rounded-lg px-2 py-1.5 text-sm text-right outline-none focus:border-amber-500/50"
                        />
                        <Button size="xs" onClick={() => savePnl(p.id)}>Save</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#8B949E]">Avatar Type</label>
                <select value={editing.avatarType} onChange={(e) => { const v = e.target.value; set('avatarType', v); if (v !== 'ASSET' && editing.avatarType === 'ASSET') set('avatarValue', null); }} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none">
                  <option value="INITIALS">Initials</option>
                  <option value="ASSET">Crypto logo</option>
                  <option value="PHOTO">Uploaded photo</option>
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
              {editing.avatarType === 'PHOTO' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#8B949E]">Photo</label>
                  <Button type="button" variant="outline" leftIcon={<Upload size={14} />} onClick={() => photoRef.current?.click()}>
                    {editing.avatarValue ? 'Replace Photo' : 'Upload Photo'}
                  </Button>
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
