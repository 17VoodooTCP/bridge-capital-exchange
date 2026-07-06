'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { generateOrderBook } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Asset } from '@/types';

interface OrderBookProps {
  asset: Asset | null;
  className?: string;
}

type DisplayMode = 'both' | 'bids' | 'asks';

export function OrderBook({ asset, className }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<{ bids: [number, number][]; asks: [number, number][]; spread: number; spreadPercent: number } | null>(null);
  const [mode, setMode] = useState<DisplayMode>('both');

  const refresh = useCallback(() => {
    if (!asset) return;
    setOrderBook(generateOrderBook(asset.price));
  }, [asset]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  const maxTotal = orderBook
    ? Math.max(
        ...orderBook.asks.map((_, i) =>
          orderBook.asks.slice(0, i + 1).reduce((s, a) => s + a[1], 0)
        ),
        ...orderBook.bids.map((_, i) =>
          orderBook.bids.slice(0, i + 1).reduce((s, b) => s + b[1], 0)
        )
      )
    : 1;

  const displayAsks = orderBook?.asks.slice(0, mode === 'both' ? 8 : 15) ?? [];
  const displayBids = orderBook?.bids.slice(0, mode === 'both' ? 8 : 15) ?? [];

  return (
    <div className={cn('flex flex-col bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D]">
        <span className="text-sm font-semibold text-[#E6EDF3]">Order Book</span>
        <div className="flex gap-1">
          {(['both', 'bids', 'asks'] as DisplayMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-2 py-1 text-xs rounded font-medium transition-colors capitalize',
                mode === m ? 'bg-[#21262D] text-[#E6EDF3]' : 'text-[#8B949E] hover:text-[#E6EDF3]'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-4 py-1.5 text-xs text-[#8B949E] font-medium border-b border-[#21262D]/50">
        <span>Price (USDT)</span>
        <span className="text-center">Amount</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks */}
      {(mode === 'both' || mode === 'asks') && (
        <div className="flex flex-col-reverse">
          {displayAsks.map(([price, size], i) => {
            const total = displayAsks.slice(0, i + 1).reduce((s, a) => s + a[1], 0);
            const pct = (total / maxTotal) * 100;
            return (
              <div key={`ask-${i}`} className="relative grid grid-cols-3 px-4 py-0.5 text-xs hover:bg-red-500/5 cursor-pointer group">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-500/10"
                  style={{ width: `${pct}%` }}
                />
                <span className="text-red-400 font-mono relative z-10">{formatNumber(price, 2)}</span>
                <span className="text-[#E6EDF3] font-mono text-center relative z-10">{size.toFixed(4)}</span>
                <span className="text-[#8B949E] font-mono text-right relative z-10">{total.toFixed(4)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Spread */}
      {mode === 'both' && orderBook && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#111318] border-y border-[#21262D]">
          <span className="text-xs text-[#8B949E]">Spread</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#E6EDF3]">
              {formatNumber(asset?.price ?? 0, 2)}
            </span>
            <span className="text-xs text-[#8B949E]">
              {orderBook.spread.toFixed(2)} ({orderBook.spreadPercent.toFixed(3)}%)
            </span>
          </div>
        </div>
      )}

      {/* Bids */}
      {(mode === 'both' || mode === 'bids') && (
        <div>
          {displayBids.map(([price, size], i) => {
            const total = displayBids.slice(0, i + 1).reduce((s, b) => s + b[1], 0);
            const pct = (total / maxTotal) * 100;
            return (
              <div key={`bid-${i}`} className="relative grid grid-cols-3 px-4 py-0.5 text-xs hover:bg-green-500/5 cursor-pointer">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-green-500/10"
                  style={{ width: `${pct}%` }}
                />
                <span className="text-green-400 font-mono relative z-10">{formatNumber(price, 2)}</span>
                <span className="text-[#E6EDF3] font-mono text-center relative z-10">{size.toFixed(4)}</span>
                <span className="text-[#8B949E] font-mono text-right relative z-10">{total.toFixed(4)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
