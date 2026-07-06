'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp } from 'lucide-react';
import { Card, StatCard } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { MarketTicker } from '@/components/trading/MarketTicker';
import { useMarketData } from '@/hooks/useMarketData';
import { mockMarketData } from '@/lib/mockData';
import { formatCurrency, formatPercent, getChangeColor, formatVolume, cn } from '@/lib/utils';
import type { AssetType } from '@/types';

export default function MarketsPage() {
  const router = useRouter();
  const { assets } = useMarketData();
  const [tab, setTab] = useState<'ALL' | AssetType>('ALL');
  const [query, setQuery] = useState('');

  const filtered = assets
    .filter((a) => tab === 'ALL' || a.type === tab)
    .filter((a) => a.symbol.toLowerCase().includes(query.toLowerCase()) || a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Markets</h1>
        <p className="text-sm text-[#8B949E]">Live prices across crypto, stocks and ETFs</p>
      </div>

      <MarketTicker />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Market Cap" value={formatVolume(mockMarketData.totalMarketCap)} subValue={formatPercent(mockMarketData.marketCapChange24h)} subValueColor="text-green-400" />
        <StatCard label="24h Volume" value={formatVolume(mockMarketData.total24hVolume)} />
        <StatCard label="BTC Dominance" value={`${mockMarketData.btcDominance}%`} />
        <StatCard label="Active Assets" value={mockMarketData.activeCryptocurrencies.toLocaleString()} />
      </div>

      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-[#21262D]">
          <Tabs
            tabs={[{ id: 'ALL', label: 'All' }, { id: 'CRYPTO', label: 'Crypto' }, { id: 'STOCK', label: 'Stocks' }, { id: 'ETF', label: 'ETFs' }]}
            activeTab={tab}
            onChange={(id) => setTab(id as 'ALL' | AssetType)}
            variant="pills"
          />
          <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 w-full sm:w-64">
            <Search size={14} className="text-[#8B949E]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets..." className="flex-1 bg-transparent text-sm outline-none text-[#E6EDF3]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[#8B949E] uppercase border-b border-[#21262D]">
                <th className="text-left px-5 py-3 font-semibold">Asset</th>
                <th className="text-right px-5 py-3 font-semibold">Price</th>
                <th className="text-right px-5 py-3 font-semibold">24h</th>
                <th className="text-right px-5 py-3 font-semibold hidden sm:table-cell">Volume</th>
                <th className="text-right px-5 py-3 font-semibold hidden md:table-cell">Market Cap</th>
                <th className="text-right px-5 py-3 font-semibold hidden lg:table-cell">7d</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} onClick={() => router.push('/trade')} className="border-b border-[#21262D]/50 hover:bg-[#1C2128] cursor-pointer transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <AssetIcon symbol={a.symbol} fallback={a.icon} size={36} />
                      <div>
                        <div className="font-medium flex items-center gap-2">{a.symbol} <Badge variant="ghost" size="sm">{a.type}</Badge></div>
                        <div className="text-xs text-[#8B949E]">{a.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(a.price)}</td>
                  <td className={cn('px-5 py-3 text-right font-medium', getChangeColor(a.changePercent24h))}>{formatPercent(a.changePercent24h)}</td>
                  <td className="px-5 py-3 text-right text-[#8B949E] hidden sm:table-cell">{formatVolume(a.volume24h)}</td>
                  <td className="px-5 py-3 text-right text-[#8B949E] hidden md:table-cell">{formatVolume(a.marketCap)}</td>
                  <td className="px-5 py-3 hidden lg:table-cell"><div className="w-24 ml-auto"><MiniSparkline data={a.sparkline || []} positive={a.changePercent24h >= 0} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-[#8B949E] text-sm">No assets found</div>}
        </div>
      </Card>
    </div>
  );
}
