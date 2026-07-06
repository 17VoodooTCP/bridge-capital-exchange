'use client';
import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { useMarketData } from '@/hooks/useMarketData';
import { useMarketStore } from '@/store/marketStore';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { formatCurrency, formatPercent, getChangeColor, cn } from '@/lib/utils';
import type { Asset, AssetType } from '@/types';

interface AssetListProps {
  className?: string;
  type?: AssetType | 'ALL';
  onSelect?: (asset: Asset) => void;
  height?: number | string;
}

export function AssetList({ className, type = 'ALL', onSelect, height }: AssetListProps) {
  const { assets, prices } = useMarketData();
  const { selectedAsset, setSelectedAsset } = useMarketStore();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<AssetType | 'ALL'>(type);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTC', 'ETH']));

  const filtered = assets.filter((a) => {
    const matchType = activeType === 'ALL' || a.type === activeType;
    const matchSearch =
      search === '' ||
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const toggleFav = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  };

  const handleSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    onSelect?.(asset);
  };

  return (
    <div className={cn('flex flex-col bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden', className)} style={height ? { height } : {}}>
      {/* Search */}
      <div className="p-3 border-b border-[#21262D]">
        <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2">
          <Search size={13} className="text-[#8B949E] shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#E6EDF3] placeholder-[#6E7681] outline-none"
          />
        </div>
        <div className="flex gap-1 mt-2">
          {(['ALL', 'CRYPTO', 'STOCK', 'ETF'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                'flex-1 py-1 text-xs rounded-md font-medium transition-all',
                activeType === t ? 'bg-amber-500 text-black' : 'text-[#8B949E] hover:text-[#E6EDF3]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1.5fr_1fr_80px] px-3 py-2 text-xs text-[#8B949E] border-b border-[#21262D]/50">
        <span>Asset</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((asset) => {
          const currentPrice = prices[asset.symbol] ?? asset.price;
          const isSelected = selectedAsset?.symbol === asset.symbol;
          const isPositive = asset.changePercent24h >= 0;

          return (
            <div
              key={asset.id}
              onClick={() => handleSelect(asset)}
              className={cn(
                'grid grid-cols-[1.5fr_1fr_80px] items-center px-3 py-2.5 cursor-pointer transition-all',
                'border-b border-[#21262D]/30',
                isSelected ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : 'hover:bg-[#1C2128]'
              )}
            >
              {/* Asset info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={(e) => toggleFav(asset.symbol, e)}
                  className="shrink-0 text-[#6E7681] hover:text-amber-400 transition-colors"
                >
                  <Star
                    size={11}
                    className={favorites.has(asset.symbol) ? 'fill-amber-400 text-amber-400' : ''}
                  />
                </button>
                <AssetIcon symbol={asset.symbol} fallback={asset.icon} size={22} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#E6EDF3]">{asset.symbol}</div>
                  <div className="text-xs text-[#6E7681] truncate">{asset.name.split(' ')[0]}</div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-xs font-mono text-[#E6EDF3]">
                  {formatCurrency(currentPrice)}
                </div>
              </div>

              {/* 24h change + sparkline */}
              <div className="text-right flex flex-col items-end gap-0.5">
                <span className={cn('text-xs font-medium', getChangeColor(asset.changePercent24h))}>
                  {formatPercent(asset.changePercent24h)}
                </span>
                {asset.sparkline && (
                  <MiniSparkline
                    data={asset.sparkline}
                    positive={isPositive}
                    width={60}
                    height={20}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
