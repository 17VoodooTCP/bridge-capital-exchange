'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type { Asset, OrderSide, OrderType } from '@/types';

interface TradeFormProps {
  asset: Asset | null;
  price?: number;
  className?: string;
}

const PCT_BUTTONS = [25, 50, 75, 100];

export function TradeForm({ asset, price, className }: TradeFormProps) {
  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock balance
  const usdtBalance = 3445.82;
  const assetBalance = asset ? 0.4821 : 0;
  const currentPrice = price ?? asset?.price ?? 0;

  useEffect(() => {
    if (currentPrice && orderType === 'LIMIT' && !limitPrice) {
      setLimitPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, orderType, limitPrice]);

  const execPrice = orderType === 'MARKET' ? currentPrice : parseFloat(limitPrice) || currentPrice;
  const amountNum = parseFloat(amount) || 0;
  const total = amountNum * execPrice;
  const fee = total * 0.001;

  const handlePctClick = (pct: number) => {
    if (!asset) return;
    if (side === 'BUY') {
      const maxAmount = (usdtBalance * pct) / 100 / execPrice;
      setAmount(maxAmount.toFixed(asset.decimals > 4 ? 4 : 2));
    } else {
      const maxAmount = (assetBalance * pct) / 100;
      setAmount(maxAmount.toFixed(asset.decimals > 4 ? 4 : 2));
    }
  };

  const handleSubmit = async () => {
    if (!asset) return toast.error('Select an asset first');
    if (!amountNum || amountNum <= 0) return toast.error('Enter a valid amount');
    if (side === 'BUY' && total > usdtBalance) return toast.error('Insufficient USDT balance');
    if (side === 'SELL' && amountNum > assetBalance) return toast.error(`Insufficient ${asset.symbol} balance`);

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    toast.success(
      `${side === 'BUY' ? '🟢 Bought' : '🔴 Sold'} ${formatNumber(amountNum)} ${asset.symbol} at ${formatCurrency(execPrice)}`
    );
    setAmount('');
    setIsSubmitting(false);
  };

  return (
    <div className={cn('flex flex-col bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden', className)}>
      {/* Buy / Sell tabs */}
      <div className="grid grid-cols-2 border-b border-[#21262D]">
        <button
          onClick={() => setSide('BUY')}
          className={cn(
            'py-3.5 text-sm font-semibold transition-all',
            side === 'BUY'
              ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500'
              : 'text-[#8B949E] hover:text-[#E6EDF3]'
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('SELL')}
          className={cn(
            'py-3.5 text-sm font-semibold transition-all',
            side === 'SELL'
              ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500'
              : 'text-[#8B949E] hover:text-[#E6EDF3]'
          )}
        >
          Sell
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Order type */}
        <div className="flex gap-1 bg-[#111318] rounded-lg p-1">
          {(['MARKET', 'LIMIT', 'STOP_LIMIT'] as OrderType[]).map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={cn(
                'flex-1 py-1.5 text-xs font-medium rounded-md transition-all',
                orderType === t ? 'bg-[#21262D] text-[#E6EDF3]' : 'text-[#8B949E] hover:text-[#E6EDF3]'
              )}
            >
              {t === 'STOP_LIMIT' ? 'Stop' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Balance */}
        <div className="flex items-center justify-between text-xs text-[#8B949E]">
          <span>Available</span>
          <span className="text-[#E6EDF3] font-medium">
            {side === 'BUY'
              ? `${formatCurrency(usdtBalance)} USDT`
              : `${formatNumber(assetBalance, 4)} ${asset?.symbol ?? '—'}`}
          </span>
        </div>

        {/* Limit price */}
        {(orderType === 'LIMIT' || orderType === 'STOP_LIMIT') && (
          <Input
            label="Price (USDT)"
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder="0.00"
            suffix="USDT"
          />
        )}

        {/* Stop price */}
        {orderType === 'STOP_LIMIT' && (
          <Input
            label="Stop Price"
            type="number"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            placeholder="0.00"
            suffix="USDT"
          />
        )}

        {/* Market price display */}
        {orderType === 'MARKET' && (
          <div className="flex items-center justify-between bg-[#111318] rounded-lg px-3 py-2.5 text-sm">
            <span className="text-[#8B949E]">Market Price</span>
            <span className="text-[#E6EDF3] font-mono">{formatCurrency(currentPrice)}</span>
          </div>
        )}

        {/* Amount */}
        <div>
          <Input
            label={`Amount (${asset?.symbol ?? 'Asset'})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            suffix={asset?.symbol ?? ''}
          />
          {/* % buttons */}
          <div className="flex gap-2 mt-2">
            {PCT_BUTTONS.map((pct) => (
              <button
                key={pct}
                onClick={() => handlePctClick(pct)}
                className="flex-1 py-1 text-xs text-[#8B949E] hover:text-amber-400 bg-[#111318] hover:bg-amber-500/10 rounded-md border border-[#21262D] hover:border-amber-500/30 transition-all"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#111318] rounded-lg p-3 space-y-2 text-xs">
          <div className="flex justify-between text-[#8B949E]">
            <span>Est. Total</span>
            <span className="text-[#E6EDF3] font-mono">{formatCurrency(total)} USDT</span>
          </div>
          <div className="flex justify-between text-[#8B949E]">
            <span>Fee (0.1%)</span>
            <span className="font-mono">{formatCurrency(fee)} USDT</span>
          </div>
          <div className="border-t border-[#21262D] pt-2 flex justify-between font-semibold">
            <span className="text-[#8B949E]">Net Total</span>
            <span className="text-[#E6EDF3] font-mono">
              {formatCurrency(side === 'BUY' ? total + fee : total - fee)} USDT
            </span>
          </div>
        </div>

        {/* Submit */}
        <Button
          variant={side === 'BUY' ? 'success' : 'danger'}
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          onClick={handleSubmit}
          disabled={!asset}
        >
          {side === 'BUY' ? `Buy ${asset?.symbol ?? ''}` : `Sell ${asset?.symbol ?? ''}`}
        </Button>
      </div>
    </div>
  );
}
