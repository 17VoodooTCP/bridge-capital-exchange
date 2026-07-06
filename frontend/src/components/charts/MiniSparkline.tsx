'use client';
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  positive?: boolean;
  width?: number | string;
  height?: number;
}

export function MiniSparkline({ data, positive, width = '100%', height = 36 }: MiniSparklineProps) {
  const isPositive =
    positive !== undefined ? positive : data[data.length - 1] >= data[0];
  const color = isPositive ? '#22C55E' : '#EF4444';

  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
