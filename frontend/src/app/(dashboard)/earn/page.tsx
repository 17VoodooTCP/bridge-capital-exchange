'use client';
import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Layers, ShieldCheck, Clock, Coins } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StakingCard } from '@/components/earn/StakingCard';
import { ROICalculator } from '@/components/earn/ROICalculator';
import { AssetIcon } from '@/components/ui/AssetIcon';
import api from '@/lib/api';
import { SUPPORTED_CRYPTOS } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { StakingPlan } from '@/types';
import toast from 'react-hot-toast';

interface RawPlan {
  id: string;
  asset: string;
  name: string;
  apr: number;
  duration: number;
  isFlexible: boolean;
  minAmount: string | number;
  maxAmount?: string | number | null;
}

interface RawPosition {
  id: string;
  amount: string | number;
  earned: string | number;
  status: string;
  startDate: string;
  plan: RawPlan;
}

const HOW_IT_WORKS = [
  { icon: Coins, title: 'Choose a plan', desc: 'Pick flexible or fixed-term staking on BTC, ETH, USDT and more.' },
  { icon: Wallet, title: 'Deposit assets', desc: 'Stake your crypto with a single click — no lock-up on flexible plans.' },
  { icon: TrendingUp, title: 'Earn daily', desc: 'Rewards accrue daily and compound automatically at the advertised APR.' },
];

function toUiPlan(p: RawPlan): StakingPlan {
  const symbol = p.asset.toUpperCase();
  const meta = SUPPORTED_CRYPTOS.find((c) => c.symbol === symbol);
  return {
    id: p.id,
    asset: p.asset,
    symbol,
    name: p.name,
    icon: meta?.icon || symbol.slice(0, 1),
    apr: p.apr,
    duration: p.duration,
    isFlexible: p.isFlexible,
    minAmount: Number(p.minAmount),
    maxAmount: p.maxAmount ? Number(p.maxAmount) : undefined,
    totalStaked: 0,
    availableQuota: 999999,
    description: p.isFlexible
      ? `Flexible ${symbol} staking at ${p.apr}% APR. Unstake anytime with no penalties.`
      : `Earn ${p.apr}% APR on ${symbol} with a ${p.duration}-day lock. Rewards paid daily.`,
  };
}

export default function EarnPage() {
  const [tab, setTab] = useState('products');
  const [plans, setPlans] = useState<StakingPlan[]>([]);
  const [positions, setPositions] = useState<RawPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [plansRes, posRes] = await Promise.all([
          api.get<RawPlan[]>('/earn/plans'),
          api.get<RawPosition[]>('/earn/positions'),
        ]);
        setPlans((Array.isArray(plansRes.data) ? plansRes.data : []).map(toUiPlan));
        setPositions(Array.isArray(posRes.data) ? posRes.data : []);
      } catch {
        toast.error('Could not load staking products.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activePositions = positions.filter((p) => p.status === 'ACTIVE');
  const totalStaked = activePositions.reduce((s, p) => s + Number(p.amount), 0);
  const totalEarned = positions.reduce((s, p) => s + Number(p.earned), 0);
  const avgApr = plans.length ? (plans.reduce((s, p) => s + p.apr, 0) / plans.length).toFixed(1) : '—';

  const unstake = async (id: string) => {
    try {
      await api.delete(`/earn/positions/${id}`);
      setPositions((list) => list.map((p) => (p.id === id ? { ...p, status: 'COMPLETED' } : p)));
      toast.success('Position unstaked — funds returned to your wallet.');
    } catch {
      toast.error('Unstake failed. Try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earn</h1>
        <p className="text-sm text-[#8B949E]">Put your assets to work with up to 8% APR</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Staked" value={formatNumber(totalStaked, 6)} icon={<Layers size={18} className="text-amber-400" />} />
        <StatCard label="Total Earned" value={formatNumber(totalEarned, 6)} subValue="All time" subValueColor="text-green-400" icon={<TrendingUp size={18} className="text-green-400" />} iconBg="bg-green-500/10" />
        <StatCard label="Active Positions" value={activePositions.length} icon={<ShieldCheck size={18} className="text-blue-400" />} iconBg="bg-blue-500/10" />
        <StatCard label="Avg. APR" value={`${avgApr}%`} icon={<Clock size={18} className="text-amber-400" />} />
      </div>

      <Tabs
        tabs={[{ id: 'products', label: 'Crypto Earn' }, { id: 'positions', label: 'My Positions', count: activePositions.length }]}
        activeTab={tab}
        onChange={setTab}
        variant="underline"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tab === 'products' ? (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-52 rounded-xl" />)}</div>
            ) : plans.length === 0 ? (
              <Card><CardBody className="py-14 text-center text-sm text-[#8B949E]">No staking products available right now. Check back soon.</CardBody></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.map((p) => <StakingCard key={p.id} plan={p} />)}
              </div>
            )
          ) : (
            <Card>
              <CardHeader><h3 className="font-semibold">Active Positions</h3></CardHeader>
              <CardBody className="p-0">
                {activePositions.length === 0 ? (
                  <div className="py-14 text-center text-sm text-[#8B949E]">No active positions. Stake an asset from Crypto Earn to start earning.</div>
                ) : (
                  activePositions.map((pos) => {
                    const ui = toUiPlan(pos.plan);
                    return (
                      <div key={pos.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#21262D]/50 last:border-0">
                        <AssetIcon symbol={ui.symbol} fallback={ui.icon} size={40} />
                        <div className="flex-1">
                          <div className="font-medium">{ui.name}</div>
                          <div className="text-xs text-[#8B949E]">{ui.isFlexible ? 'Flexible' : `${ui.duration}d`} · {ui.apr}% APR</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{Number(pos.amount)} {ui.symbol}</div>
                          <div className="text-xs text-green-400">+{Number(pos.earned)} earned</div>
                        </div>
                        <Badge variant="success" dot>ACTIVE</Badge>
                        <Button size="sm" variant="outline" onClick={() => unstake(pos.id)}>Unstake</Button>
                      </div>
                    );
                  })
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader><h3 className="font-semibold">How it works</h3></CardHeader>
            <CardBody className="grid sm:grid-cols-3 gap-4">
              {HOW_IT_WORKS.map((s, i) => (
                <div key={i} className="text-center p-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center mb-3"><s.icon size={22} className="text-amber-400" /></div>
                  <div className="font-medium mb-1">{i + 1}. {s.title}</div>
                  <div className="text-xs text-[#8B949E]">{s.desc}</div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div><ROICalculator /></div>
      </div>
    </div>
  );
}
