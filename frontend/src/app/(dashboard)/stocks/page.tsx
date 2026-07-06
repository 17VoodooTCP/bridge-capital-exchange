'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, Calendar } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { mockStockAssets, mockMarketIndices } from '@/lib/mockData';
import { formatCurrency, formatPercent, getChangeColor, formatVolume, formatNumber, cn } from '@/lib/utils';

const EARNINGS = [
  { symbol: 'AAPL', date: 'Jul 31', time: 'After close', est: '$1.34' },
  { symbol: 'MSFT', date: 'Jul 30', time: 'After close', est: '$2.93' },
  { symbol: 'AMZN', date: 'Aug 01', time: 'After close', est: '$1.03' },
  { symbol: 'NVDA', date: 'Aug 28', time: 'After close', est: '$0.64' },
];

export default function StocksPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'NVDA']);

  const toggleWatch = (s: string) => setWatchlist((w) => w.includes(s) ? w.filter((x) => x !== s) : [...w, s]);
  const filtered = mockStockAssets.filter((s) => s.symbol.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stocks</h1>
        <p className="text-sm text-[#8B949E]">Trade US equities with real-time market data</p>
      </div>

      {/* Indices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mockMarketIndices.map((idx) => (
          <Card key={idx.symbol} className="p-4">
            <div className="text-xs text-[#8B949E]">{idx.name}</div>
            <div className="text-xl font-bold mt-1">{formatNumber(idx.value, 2)}</div>
            <div className={cn('text-sm', getChangeColor(idx.change))}>{formatPercent(idx.changePercent)}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-4 flex items-center justify-between border-b border-[#21262D]">
              <h3 className="font-semibold">Stock Screener</h3>
              <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2 w-64">
                <Search size={14} className="text-[#8B949E]" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stocks..." className="flex-1 bg-transparent text-sm outline-none text-[#E6EDF3]" />
              </div>
            </div>
            <CardBody className="p-0">
              {filtered.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#21262D]/50 last:border-0 hover:bg-[#1C2128] transition-colors">
                  <button onClick={() => toggleWatch(s.symbol)}><Star size={16} className={watchlist.includes(s.symbol) ? 'text-amber-400 fill-amber-400' : 'text-[#8B949E]'} /></button>
                  <AssetIcon symbol={s.symbol} fallback={s.icon} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{s.symbol}</div>
                    <div className="text-xs text-[#8B949E] truncate">{s.name}</div>
                  </div>
                  <div className="w-20 hidden sm:block"><MiniSparkline data={s.sparkline || []} positive={s.changePercent24h >= 0} /></div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(s.price)}</div>
                    <div className={cn('text-xs', getChangeColor(s.changePercent24h))}>{formatPercent(s.changePercent24h)}</div>
                  </div>
                  <Button size="sm" onClick={() => router.push('/trade')}>Trade</Button>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h3 className="font-semibold flex items-center gap-2"><Star size={15} className="text-amber-400" /> Watchlist</h3></CardHeader>
            <CardBody className="p-0">
              {mockStockAssets.filter((s) => watchlist.includes(s.symbol)).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3 border-b border-[#21262D]/50 last:border-0">
                  <span className="flex items-center gap-2 text-sm"><AssetIcon symbol={s.symbol} fallback={s.icon} size={24} />{s.symbol}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(s.price)}</div>
                    <div className={cn('text-xs', getChangeColor(s.changePercent24h))}>{formatPercent(s.changePercent24h)}</div>
                  </div>
                </div>
              ))}
              {watchlist.length === 0 && <div className="py-8 text-center text-sm text-[#8B949E]">Star stocks to add them here</div>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold flex items-center gap-2"><Calendar size={15} className="text-amber-400" /> Earnings Calendar</h3></CardHeader>
            <CardBody className="p-0">
              {EARNINGS.map((e) => (
                <div key={e.symbol} className="flex items-center justify-between px-5 py-3 border-b border-[#21262D]/50 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{e.symbol}</div>
                    <div className="text-xs text-[#8B949E]">{e.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{e.date}</div>
                    <div className="text-xs text-[#8B949E]">Est. {e.est}</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
