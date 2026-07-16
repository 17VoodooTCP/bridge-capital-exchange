'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, TrendingUp, TrendingDown, ShieldAlert, Search, Info, Copy as CopyIcon, StopCircle } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { AssetIcon } from '@/components/ui/AssetIcon';
import api from '@/lib/api';
import { useWalletData } from '@/hooks/useWalletData';
import { formatCurrency, formatPercent, getChangeColor, cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Trader {
  id: string;
  name: string;
  handle: string;
  avatarType: 'INITIALS' | 'ASSET' | 'PHOTO';
  avatarValue?: string;
  market: 'CRYPTO' | 'STOCKS' | 'MIXED';
  strategy: string;
  wins: number;
  losses: number;
  winRate: number;
  roi30d: number;
  profitSharePct: number;
  aum: number;
  copiers: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface CopyPosition {
  id: string;
  traderId: string;
  allocation: number;
  status: string;
  pnl: number;
  startedAt: string;
  trader: Trader;
}

function TraderAvatar({ trader, size = 56 }: { trader: Trader; size?: number }) {
  if (trader.avatarType === 'PHOTO' && trader.avatarValue) {
    return <img src={trader.avatarValue} alt={trader.name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  if (trader.avatarType === 'ASSET' && trader.avatarValue) {
    return <AssetIcon symbol={trader.avatarValue} size={size} />;
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-black shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `hsl(${(trader.handle.charCodeAt(0) * 12) % 360}, 65%, 60%)` }}
    >
      {getInitials(trader.name)}
    </div>
  );
}

export default function CopyTradingPage() {
  const [tab, setTab] = useState<'discover' | 'positions'>('discover');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [positions, setPositions] = useState<CopyPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState('ALL');
  const [sort, setSort] = useState<'roi30d' | 'winRate' | 'copiers'>('winRate');
  const [query, setQuery] = useState('');
  const [copyModal, setCopyModal] = useState<Trader | null>(null);
  const [allocation, setAllocation] = useState('');
  const [copyAsset, setCopyAsset] = useState('USDT');
  const [submitting, setSubmitting] = useState(false);
  const { balances } = useWalletData();

  const fundedBalances = balances.filter((b) => b.available > 0);
  const selectedBalance = balances.find((b) => b.symbol === copyAsset);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api.get<Trader[]>('/copy-trading/traders', { params: { market, sort } }),
        api.get<CopyPosition[]>('/copy-trading/positions').catch(() => ({ data: [] })),
      ]);
      setTraders(Array.isArray(tRes.data) ? tRes.data : []);
      setPositions(Array.isArray(pRes.data) ? pRes.data : []);
    } catch {
      toast.error('Could not load copy trading data.');
    } finally {
      setLoading(false);
    }
  }, [market, sort]);

  useEffect(() => { load(); }, [load]);

  const activePositions = positions.filter((p) => p.status === 'ACTIVE');
  const activeTraderIds = new Set(activePositions.map((p) => p.traderId));

  const filteredTraders = traders.filter(
    (t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.strategy.toLowerCase().includes(query.toLowerCase())
  );

  const copy = async () => {
    if (!copyModal) return;
    const amt = Number(allocation) || 0;
    if (amt <= 0) return toast.error('Enter an allocation amount');
    if (!selectedBalance || selectedBalance.available < amt) {
      return toast.error(`Insufficient ${copyAsset} balance. Available: ${selectedBalance?.available.toFixed(4) || 0} ${copyAsset}`);
    }
    setSubmitting(true);
    try {
      const res = await api.post<CopyPosition>('/copy-trading/copy', { traderId: copyModal.id, allocation: amt, asset: copyAsset });
      setPositions((p) => [{ ...res.data, trader: copyModal }, ...p]);
      toast.success(`Copy trade connected — you are now copying ${copyModal.name}`);
      setCopyModal(null);
      setAllocation('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Could not start copying.');
    } finally {
      setSubmitting(false);
    }
  };

  const stop = async (id: string, traderName: string) => {
    try {
      await api.delete(`/copy-trading/positions/${id}`);
      setPositions((list) => list.map((p) => (p.id === id ? { ...p, status: 'STOPPED' } : p)));
      toast.success(`Copy trade disconnected — no longer copying ${traderName}`);
    } catch {
      toast.error('Could not stop copying.');
    }
  };

  const riskBadge = (r: string) => (r === 'LOW' ? 'success' : r === 'HIGH' ? 'danger' : 'warning');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Copy Trading</h1>
        <p className="text-sm text-[#8B949E]">Follow strategies from experienced traders — allocate capital and mirror their trades automatically</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Available Strategies" value={traders.length} icon={<Users size={18} className="text-amber-400" />} />
        <StatCard label="Actively Copying" value={activePositions.length} icon={<CopyIcon size={18} className="text-blue-400" />} iconBg="bg-blue-500/10" />
        <StatCard label="Allocated Capital" value={formatCurrency(activePositions.reduce((s, p) => s + p.allocation, 0))} />
        <StatCard label="Copy P&L" value={formatCurrency(activePositions.reduce((s, p) => s + p.pnl, 0))} subValueColor="text-green-400" />
      </div>

      <Tabs
        tabs={[
          { id: 'discover', label: 'Discover' },
          { id: 'positions', label: 'My Copied Traders', count: activePositions.length },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as 'discover' | 'positions')}
        variant="underline"
      />

      {tab === 'discover' && (
        <>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex gap-2">
              {['ALL', 'CRYPTO', 'STOCKS', 'MIXED'].map((m) => (
                <button key={m} onClick={() => setMarket(m)} className={cn('px-3 py-1.5 text-xs rounded-full border transition-all', market === m ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#21262D] text-[#8B949E]')}>
                  {m}
                </button>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as 'roi30d' | 'winRate' | 'copiers')} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 text-sm outline-none">
              <option value="winRate">Sort: Win Rate</option>
              <option value="roi30d">Sort: 30d ROI</option>
              <option value="copiers">Sort: Popularity</option>
            </select>
            <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 md:ml-auto md:w-72">
              <Search size={14} className="text-[#8B949E]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search strategies..." className="flex-1 bg-transparent text-sm outline-none text-[#E6EDF3]" />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTraders.map((t) => {
                const isCopying = activeTraderIds.has(t.id);
                return (
                  <Card key={t.id} hover className="p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <TraderAvatar trader={t} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{t.name}</div>
                        <div className="text-xs text-[#8B949E] truncate">@{t.handle} · {t.strategy}</div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge variant={riskBadge(t.riskLevel)} size="sm">{t.riskLevel} RISK</Badge>
                          <Badge variant="ghost" size="sm">{t.market}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
                      <div>
                        <div className="text-[10px] text-[#8B949E] uppercase">Win Rate</div>
                        <div className="font-semibold text-green-400 flex items-center gap-1">
                          <TrendingUp size={13} />{t.winRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8B949E] uppercase">30d ROI (sim.)</div>
                        <div className={cn('font-semibold', getChangeColor(t.roi30d))}>
                          {formatPercent(t.roi30d)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8B949E] uppercase">Wins / Losses</div>
                        <div className="text-xs"><span className="text-green-400">{t.wins.toLocaleString()}</span> / <span className="text-red-400">{t.losses.toLocaleString()}</span></div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8B949E] uppercase">Copiers</div>
                        <div className="text-xs flex items-center gap-1"><Users size={11} />{t.copiers.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="text-xs text-[#8B949E] pt-1 border-t border-[#21262D]">
                      Profit share: <span className="text-amber-400">{t.profitSharePct}%</span> of gains
                    </div>

                    {isCopying ? (
                      <Button variant="danger" fullWidth leftIcon={<StopCircle size={15} />} onClick={() => {
                        const pos = activePositions.find((p) => p.traderId === t.id);
                        if (pos) stop(pos.id, t.name);
                      }}>Disconnect</Button>
                    ) : (
                      <Button fullWidth leftIcon={<CopyIcon size={15} />} onClick={() => setCopyModal(t)}>Copy Trader</Button>
                    )}
                  </Card>
                );
              })}
              {filteredTraders.length === 0 && !loading && (
                <div className="col-span-full py-16 text-center text-sm text-[#8B949E]">No strategies match your filters.</div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'positions' && (
        <Card>
          <CardHeader><h3 className="font-semibold">Active Copy Positions</h3></CardHeader>
          <CardBody className="p-0">
            {activePositions.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4"><ShieldAlert size={22} className="text-amber-400" /></div>
                <div className="font-medium mb-1">You&apos;re not copying any traders yet</div>
                <p className="text-sm text-[#8B949E] mb-4">Discover top strategies and start following one.</p>
                <Button onClick={() => setTab('discover')}>Explore Strategies</Button>
              </div>
            ) : (
              activePositions.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#21262D]/50 last:border-0">
                  <TraderAvatar trader={p.trader} size={42} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.trader.name}</div>
                    <div className="text-xs text-[#8B949E]">{p.trader.strategy} · {p.trader.riskLevel} risk</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-[#8B949E]">Allocation</div>
                    <div className="text-sm font-medium">{formatCurrency(p.allocation)}</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-[10px] text-[#8B949E]">Copy P&L</div>
                    <div className={cn('text-sm font-medium', getChangeColor(p.pnl))}>{formatCurrency(p.pnl)}</div>
                  </div>
                  <Badge variant="success" dot size="sm">COPYING</Badge>
                  <Button size="sm" variant="danger" leftIcon={<StopCircle size={13} />} onClick={() => stop(p.id, p.trader.name)}>Stop</Button>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}

      {/* Copy trader modal */}
      <Modal isOpen={copyModal !== null} onClose={() => setCopyModal(null)} title={copyModal ? `Copy ${copyModal.name}` : ''} size="sm">
        {copyModal && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <TraderAvatar trader={copyModal} size={48} />
              <div>
                <div className="font-semibold">{copyModal.name}</div>
                <div className="text-xs text-[#8B949E]">{copyModal.strategy} · {copyModal.riskLevel} risk</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-[#0D1117] rounded-lg p-3"><div className="text-[10px] text-[#8B949E]">30d ROI</div><div className={cn('font-semibold', getChangeColor(copyModal.roi30d))}>{formatPercent(copyModal.roi30d)}</div></div>
              <div className="bg-[#0D1117] rounded-lg p-3"><div className="text-[10px] text-[#8B949E]">Win Rate</div><div className="font-semibold">{copyModal.winRate}%</div></div>
              <div className="bg-[#0D1117] rounded-lg p-3"><div className="text-[10px] text-[#8B949E]">Profit Share</div><div className="font-semibold text-amber-400">{copyModal.profitSharePct}%</div></div>
            </div>
            {fundedBalances.length === 0 ? (
              <div className="rounded-lg bg-[#0D1117] border border-[#21262D] p-4 text-center">
                <p className="text-sm text-[#E6EDF3] mb-1">No funds available to allocate</p>
                <p className="text-xs text-[#8B949E] mb-3">Deposit into your wallet first, then choose which asset to copy with.</p>
                <a href="/wallet"><Button size="sm" variant="outline">Go to Wallet</Button></a>
              </div>
            ) : (
              <>
                {/* Choose which funded asset to allocate from */}
                <div>
                  <label className="text-xs text-[#8B949E] font-medium mb-1.5 block">Allocate From</label>
                  <div className="flex flex-wrap gap-2">
                    {fundedBalances.map((b) => (
                      <button
                        key={b.symbol}
                        onClick={() => setCopyAsset(b.symbol)}
                        className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all',
                          copyAsset === b.symbol ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#21262D] text-[#8B949E] hover:border-[#30363D]')}
                      >
                        <AssetIcon symbol={b.symbol} fallback={b.icon} size={20} />
                        {b.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-[#8B949E]">Allocated Amount</label>
                    <button className="text-xs text-amber-400" onClick={() => setAllocation(String(selectedBalance?.available ?? 0))}>
                      Available: {selectedBalance?.available.toFixed(4) ?? 0} {copyAsset} · Max
                    </button>
                  </div>
                  <Input type="number" value={allocation} onChange={(e) => setAllocation(e.target.value)} placeholder="0.00" suffix={copyAsset} />
                </div>

                <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  Simulated performance shown does not guarantee future results. Copy trading carries risk of loss.
                </div>
                <Button fullWidth size="lg" isLoading={submitting} onClick={copy}>Confirm &amp; Start Copying</Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
