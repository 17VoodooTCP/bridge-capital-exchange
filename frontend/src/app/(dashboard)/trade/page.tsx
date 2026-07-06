'use client';
import { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TradingChart } from '@/components/charts/TradingChart';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { OrderBook } from '@/components/trading/OrderBook';
import { TradeForm } from '@/components/trading/TradeForm';
import { useMarketData } from '@/hooks/useMarketData';
import { mockCryptoAssets } from '@/lib/mockData';
import { formatCurrency, formatPercent, getChangeColor, cn } from '@/lib/utils';
import type { Asset } from '@/types';

export default function TradePage() {
  const { assets, prices } = useMarketData();
  const list = assets.length ? assets : mockCryptoAssets;
  const [selected, setSelected] = useState<Asset>(mockCryptoAssets[0]);
  const [bottomTab, setBottomTab] = useState('open');

  const livePrice = prices[selected.symbol] ?? selected.price;

  return (
    <div className="space-y-4">
      {/* Pair header */}
      <Card className="p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <AssetIcon symbol={selected.symbol} fallback={selected.icon} size={40} />
          <div>
            <div className="flex items-center gap-2 font-semibold text-lg">{selected.symbol}/USDT <ChevronDown size={16} className="text-[#8B949E]" /></div>
            <div className="text-xs text-[#8B949E]">{selected.name}</div>
          </div>
        </div>
        <div>
          <div className={cn('text-xl font-bold', getChangeColor(selected.changePercent24h))}>{formatCurrency(livePrice)}</div>
          <div className="text-xs text-[#8B949E]">≈ {formatCurrency(livePrice)}</div>
        </div>
        <div className="hidden sm:block"><div className="text-xs text-[#8B949E]">24h Change</div><div className={getChangeColor(selected.changePercent24h)}>{formatPercent(selected.changePercent24h)}</div></div>
        <div className="hidden md:block"><div className="text-xs text-[#8B949E]">24h High</div><div>{formatCurrency(selected.high24h)}</div></div>
        <div className="hidden md:block"><div className="text-xs text-[#8B949E]">24h Low</div><div>{formatCurrency(selected.low24h)}</div></div>
        <button className="ml-auto p-2 text-[#8B949E] hover:text-amber-400"><Star size={18} /></button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Asset selector */}
        <Card className="lg:col-span-2 p-0 max-h-[600px] overflow-y-auto">
          <div className="px-3 py-2 text-xs text-[#8B949E] uppercase sticky top-0 bg-[#161B22] border-b border-[#21262D]">Markets</div>
          {list.slice(0, 12).map((a) => (
            <button key={a.id} onClick={() => setSelected(a)} className={cn('w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-[#1C2128] transition-colors', selected.symbol === a.symbol && 'bg-amber-500/10')}>
              <span className="flex items-center gap-2"><AssetIcon symbol={a.symbol} fallback={a.icon} size={22} />{a.symbol}</span>
              <span className={cn('text-xs', getChangeColor(a.changePercent24h))}>{formatPercent(a.changePercent24h)}</span>
            </button>
          ))}
        </Card>

        {/* Chart */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-2"><TradingChart asset={selected} /></Card>
          <Card>
            <div className="px-4 pt-3">
              <Tabs
                tabs={[{ id: 'open', label: 'Open Orders' }, { id: 'history', label: 'Trade History' }, { id: 'positions', label: 'Positions' }]}
                activeTab={bottomTab}
                onChange={setBottomTab}
                variant="underline"
              />
            </div>
            <div className="p-8 text-center text-sm text-[#8B949E]">
              {bottomTab === 'open' ? 'No open orders. Place an order to get started.' : bottomTab === 'history' ? 'Your filled trades will appear here.' : 'No active positions.'}
            </div>
          </Card>
        </div>

        {/* Order book + form */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-3"><OrderBook asset={selected} /></Card>
          <TradeForm asset={selected} price={livePrice} />
        </div>
      </div>
    </div>
  );
}
