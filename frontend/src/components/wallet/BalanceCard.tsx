'use client';
import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { Balance } from '@/types';

interface BalanceCardProps {
  balance: Balance;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  className?: string;
}

export function BalanceCard({ balance, onDeposit, onWithdraw, className }: BalanceCardProps) {
  return (
    <Card className={className}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#21262D] flex items-center justify-center text-xl">
            {balance.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#E6EDF3]">{balance.name}</div>
            <div className="text-xs text-[#8B949E]">{balance.symbol}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm font-mono font-semibold text-[#E6EDF3]">
              {formatNumber(balance.total, 4)}
            </div>
            <div className="text-xs text-[#8B949E]">{formatCurrency(balance.usdValue)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-[#111318] rounded-lg p-2">
            <div className="text-[#8B949E]">Available</div>
            <div className="text-[#E6EDF3] font-mono mt-0.5">{formatNumber(balance.available, 4)}</div>
          </div>
          <div className="bg-[#111318] rounded-lg p-2">
            <div className="text-[#8B949E]">In Order</div>
            <div className="text-[#E6EDF3] font-mono mt-0.5">{formatNumber(balance.locked, 4)}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<ArrowDownLeft size={13} />}
            onClick={onDeposit}
          >
            Deposit
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<ArrowUpRight size={13} />}
            onClick={onWithdraw}
          >
            Withdraw
          </Button>
        </div>
      </div>
    </Card>
  );
}
