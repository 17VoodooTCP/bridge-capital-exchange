'use client';
import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { generatePortfolioHistory } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

interface PortfolioChartProps {
  currentValue: number;
  days?: number;
  height?: number;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C2128] border border-[#21262D] rounded-xl px-4 py-3 shadow-modal">
      <p className="text-xs text-[#8B949E] mb-1">{label}</p>
      <p className="text-base font-bold text-[#E6EDF3]">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function PortfolioChart({ currentValue, days = 30, height = 200, className }: PortfolioChartProps) {
  const data = useMemo(() => generatePortfolioHistory(currentValue, days), [currentValue, days]);

  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const isPositive = data[data.length - 1].value >= data[0].value;

  const color = isPositive ? '#22C55E' : '#EF4444';

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#21262D" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6E7681', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            domain={[minVal * 0.98, maxVal * 1.02]}
            tick={{ fill: '#6E7681', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={70}
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#portfolioGrad)"
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
