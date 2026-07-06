'use client';
import { useState, useMemo } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { calculateROI, formatCurrency, cn } from '@/lib/utils';

const DURATIONS = [30, 60, 90, 180, 365];

export function ROICalculator({ className }: { className?: string }) {
  const [amount, setAmount] = useState(10000);
  const [apr, setApr] = useState(8);
  const [days, setDays] = useState(90);

  const result = useMemo(() => calculateROI(amount, apr, days, true), [amount, apr, days]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-amber-400" />
          <h3 className="font-semibold">ROI Calculator</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        <Input
          label="Investment Amount (USD)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          prefix="$"
        />

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-[#8B949E]">Expected APR</label>
            <span className="text-sm font-semibold text-amber-400">{apr.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            step={0.5}
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-[#6E7681] mt-1">
            <span>1%</span><span>50%</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#8B949E] mb-2 block">Duration</label>
          <div className="grid grid-cols-5 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'py-2 text-sm rounded-lg border transition-all',
                  days === d
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-[#21262D] text-[#8B949E] hover:border-[#30363D]'
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8B949E] flex items-center gap-1.5"><TrendingUp size={14} className="text-green-400" /> Projected Profit</span>
            <span className="text-lg font-bold text-green-400">+{formatCurrency(result.profit)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8B949E]">Total Value</span>
            <span className="text-lg font-bold">{formatCurrency(result.total)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/10">
            <div>
              <div className="text-xs text-[#8B949E]">Daily Earnings</div>
              <div className="text-sm font-semibold text-[#E6EDF3]">{formatCurrency(result.daily)}</div>
            </div>
            <div>
              <div className="text-xs text-[#8B949E]">Monthly Earnings</div>
              <div className="text-sm font-semibold text-[#E6EDF3]">{formatCurrency(result.monthly)}</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#6E7681]">Estimates assume daily compounding at a fixed APR. Actual returns may vary.</p>
      </CardBody>
    </Card>
  );
}
