'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { mockETFAssets } from '@/lib/mockData';
import { formatCurrency, formatPercent, getChangeColor, formatVolume, cn } from '@/lib/utils';

const CATEGORIES = ['All', 'US Equity', 'International', 'Sector', 'Bond', 'Commodity'];
const HOLDINGS: Record<string, { name: string; weight: number }[]> = {
  SPY: [{ name: 'Apple', weight: 7.1 }, { name: 'Microsoft', weight: 6.8 }, { name: 'NVIDIA', weight: 6.2 }, { name: 'Amazon', weight: 3.6 }],
  QQQ: [{ name: 'Apple', weight: 8.9 }, { name: 'Microsoft', weight: 8.2 }, { name: 'NVIDIA', weight: 7.8 }, { name: 'Broadcom', weight: 4.9 }],
};

export default function ETFsPage() {
  const router = useRouter();
  const [cat, setCat] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ETFs</h1>
        <p className="text-sm text-[#8B949E]">Diversified exchange-traded funds across global markets</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="ETFs Available" value="120+" />
        <StatCard label="Avg. Expense Ratio" value="0.09%" />
        <StatCard label="Total AUM" value="$2.4T" subValue="+1.2%" subValueColor="text-green-400" />
        <StatCard label="Top Performer" value="QQQ" subValue="+1.13%" subValueColor="text-green-400" />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn('px-4 py-2 text-sm rounded-full border transition-all', cat === c ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#21262D] text-[#8B949E] hover:border-[#30363D]')}>{c}</button>
        ))}
      </div>

      <Card>
        <CardHeader><h3 className="font-semibold">Popular ETFs</h3></CardHeader>
        <CardBody className="p-0">
          {mockETFAssets.map((e) => (
            <div key={e.id} className="border-b border-[#21262D]/50 last:border-0">
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-[#1C2128] transition-colors cursor-pointer" onClick={() => setExpanded(expanded === e.symbol ? null : e.symbol)}>
                <AssetIcon symbol={e.symbol} fallback={e.icon} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{e.symbol}</div>
                  <div className="text-xs text-[#8B949E] truncate">{e.name}</div>
                </div>
                <div className="w-24 hidden sm:block"><MiniSparkline data={e.sparkline || []} positive={e.changePercent24h >= 0} /></div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(e.price)}</div>
                  <div className={cn('text-xs', getChangeColor(e.changePercent24h))}>{formatPercent(e.changePercent24h)}</div>
                </div>
                <div className="hidden md:block text-right w-24"><div className="text-xs text-[#8B949E]">Volume</div><div className="text-sm">{formatVolume(e.volume24h)}</div></div>
                <Button size="sm" onClick={(ev) => { ev.stopPropagation(); router.push('/trade'); }}>Trade</Button>
                {HOLDINGS[e.symbol] ? (expanded === e.symbol ? <ChevronDown size={16} className="text-[#8B949E]" /> : <ChevronRight size={16} className="text-[#8B949E]" />) : <span className="w-4" />}
              </div>
              {expanded === e.symbol && HOLDINGS[e.symbol] && (
                <div className="px-5 pb-4 bg-[#0D1117]">
                  <div className="text-xs text-[#8B949E] uppercase py-2">Top Holdings</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {HOLDINGS[e.symbol].map((h) => (
                      <div key={h.name} className="rounded-lg bg-[#161B22] border border-[#21262D] p-3">
                        <div className="text-sm font-medium">{h.name}</div>
                        <div className="text-xs text-amber-400">{h.weight}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
