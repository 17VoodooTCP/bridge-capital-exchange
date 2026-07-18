'use client';
import { useMarketData } from '@/hooks/useMarketData';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { formatCurrency, cn } from '@/lib/utils';

/**
 * Live, auto-scrolling price strip — current price + 24h change for a mix of
 * crypto, stocks and ETFs. Prices come from the shared market store, which is
 * kept live by useMarketData (CoinGecko + Finnhub).
 */
export function PriceTicker() {
  const { assets } = useMarketData();
  if (!assets || assets.length === 0) return null;

  // A representative spread across asset classes
  const items = assets.slice(0, 20);
  const loop = [...items, ...items]; // duplicate for a seamless marquee

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#21262D] bg-[#0D1117] py-2.5 group" translate="no">
      <div className="flex gap-6 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]">
        {loop.map((a, i) => {
          const change = a.changePercent24h ?? 0;
          const up = change >= 0;
          return (
            <div key={`${a.symbol}-${i}`} className="flex items-center gap-2 shrink-0">
              <AssetIcon symbol={a.symbol} fallback={a.icon} size={18} />
              <span className="text-sm font-medium">{a.symbol}</span>
              <span className="text-sm text-[#E6EDF3]">{formatCurrency(a.price)}</span>
              <span className={cn('text-xs font-medium', up ? 'text-green-400' : 'text-red-400')}>
                {up ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
