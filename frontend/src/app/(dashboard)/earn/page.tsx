'use client';
import { useState } from 'react';
import { Wallet, TrendingUp, Layers, ShieldCheck, Clock, Coins } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StakingCard } from '@/components/earn/StakingCard';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { ROICalculator } from '@/components/earn/ROICalculator';
import { mockStakingPlans, mockStakingPositions } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';

const HOW_IT_WORKS = [
  { icon: Coins, title: 'Choose a plan', desc: 'Pick flexible or fixed-term staking on BTC, ETH, USDT and more.' },
  { icon: Wallet, title: 'Deposit assets', desc: 'Stake your crypto with a single click — no lock-up on flexible plans.' },
  { icon: TrendingUp, title: 'Earn daily', desc: 'Rewards accrue daily and compound automatically at the advertised APR.' },
];

export default function EarnPage() {
  const [tab, setTab] = useState('products');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earn</h1>
        <p className="text-sm text-[#8B949E]">Put your assets to work with up to 8% APR</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Staked" value={formatCurrency(3541.2)} icon={<Layers size={18} className="text-amber-400" />} />
        <StatCard label="Total Earned" value={formatCurrency(4.43)} subValue="All time" subValueColor="text-green-400" icon={<TrendingUp size={18} className="text-green-400" />} iconBg="bg-green-500/10" />
        <StatCard label="Active Positions" value={mockStakingPositions.length} icon={<ShieldCheck size={18} className="text-blue-400" />} iconBg="bg-blue-500/10" />
        <StatCard label="Avg. APR" value="5.8%" icon={<Clock size={18} className="text-amber-400" />} />
      </div>

      <Tabs
        tabs={[{ id: 'products', label: 'Crypto Earn' }, { id: 'positions', label: 'My Positions', count: mockStakingPositions.length }]}
        activeTab={tab}
        onChange={setTab}
        variant="underline"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tab === 'products' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockStakingPlans.map((p) => <StakingCard key={p.id} plan={p} />)}
            </div>
          ) : (
            <Card>
              <CardHeader><h3 className="font-semibold">Active Positions</h3></CardHeader>
              <CardBody className="p-0">
                {mockStakingPositions.map((pos) => (
                  <div key={pos.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#21262D]/50 last:border-0">
                    <AssetIcon symbol={pos.plan.symbol} fallback={pos.plan.icon} size={40} />
                    <div className="flex-1">
                      <div className="font-medium">{pos.plan.name}</div>
                      <div className="text-xs text-[#8B949E]">{pos.plan.isFlexible ? 'Flexible' : `${pos.plan.duration}d`} · {pos.plan.apr}% APR</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{pos.amount} {pos.plan.symbol}</div>
                      <div className="text-xs text-green-400">+{pos.earned} earned</div>
                    </div>
                    <Badge variant="success" dot>{pos.status}</Badge>
                    <Button size="sm" variant="outline">Unstake</Button>
                  </div>
                ))}
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
