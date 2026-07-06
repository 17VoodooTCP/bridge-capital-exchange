'use client';
import React from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { AssetIcon } from '@/components/ui/AssetIcon';

export function MarketTicker({ className }: { className?: string }) {
  const { assets, prices } = useMarketData();

  const items = assets.slice(0, 16);

  return (
    <div className={cn('bg-[#0D1117] border-b border-[#21262D] overflow-hidden h-9 flex items-center', className)}>
      <div className="ticker-wrapper flex-1">
        <div className="ticker-content gap-0">
          {[...items, ...items].map((asset, idx) => {
            const currentPrice = prices[asset.symbol] ?? asset.price;
            const isPositive = asset.changePercent24h >= 0;
            return (
              <span
                key={`${asset.symbol}-${idx}`}
                className="inline-flex items-center gap-2 px-5 text-xs border-r border-[#21262D]/50 h-9"
              >
                <AssetIcon symbol={asset.symbol} fallback={asset.icon} size={18} />
                <span className="font-medium text-[#E6EDF3]">{asset.symbol}</span>
                <span className="font-mono text-[#E6EDF3]">{formatCurrency(currentPrice)}</span>
                <span className={cn('font-medium', getChangeColor(asset.changePercent24h))}>
                  {formatPercent(asset.changePercent24h)}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
