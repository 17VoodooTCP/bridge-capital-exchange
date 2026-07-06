'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, ColorType } from 'lightweight-charts';
import { Maximize2, RefreshCw } from 'lucide-react';
import { generateCandleData } from '@/lib/mockData';
import { TIMEFRAMES } from '@/lib/constants';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type { Asset, Timeframe } from '@/types';

interface TradingChartProps {
  asset: Asset | null;
  className?: string;
}

const timeframeVolatility: Record<string, number> = {
  '1m': 0.003,
  '5m': 0.006,
  '15m': 0.01,
  '30m': 0.012,
  '1H': 0.018,
  '4H': 0.025,
  '1D': 0.04,
  '1W': 0.07,
  '1M': 0.12,
};

export function TradingChart({ asset, className }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [ohlcv, setOhlcv] = useState<{ open: number; high: number; low: number; close: number; volume: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(() => {
    if (!asset || !candleSeriesRef.current || !volumeSeriesRef.current) return;
    setIsLoading(true);

    const candles = generateCandleData(asset.price, 200, timeframeVolatility[timeframe] ?? 0.02);

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as number,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as number,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    const last = candles[candles.length - 1];
    setOhlcv(last);
    setIsLoading(false);
  }, [asset, timeframe]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#161B22' },
        textColor: '#8B949E',
      },
      grid: {
        vertLines: { color: '#21262D' },
        horzLines: { color: '#21262D' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#F59E0B', labelBackgroundColor: '#F59E0B' },
        horzLine: { color: '#F59E0B', labelBackgroundColor: '#F59E0B' },
      },
      rightPriceScale: {
        borderColor: '#21262D',
        textColor: '#8B949E',
      },
      timeScale: {
        borderColor: '#21262D',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderUpColor: '#22C55E',
      borderDownColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Crosshair tooltip
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData.size > 0) {
        const data = param.seriesData.get(candleSeries) as CandlestickData | undefined;
        if (data) {
          setOhlcv({
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: 0,
          });
        }
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Load data when asset or timeframe changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className={cn('flex flex-col bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden', className)}>
      {/* Chart Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D] shrink-0">
        <div className="flex items-center gap-4">
          {asset && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{asset.icon}</span>
              <div>
                <span className="font-semibold text-[#E6EDF3]">{asset.symbol}/USDT</span>
                <span className="text-xs text-[#8B949E] ml-2">{asset.name}</span>
              </div>
            </div>
          )}

          {/* OHLCV display */}
          {ohlcv && (
            <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
              <span className="text-[#8B949E]">O <span className="text-[#E6EDF3]">{ohlcv.open.toFixed(2)}</span></span>
              <span className="text-[#8B949E]">H <span className="text-green-400">{ohlcv.high.toFixed(2)}</span></span>
              <span className="text-[#8B949E]">L <span className="text-red-400">{ohlcv.low.toFixed(2)}</span></span>
              <span className="text-[#8B949E]">C <span className={ohlcv.close >= ohlcv.open ? 'text-green-400' : 'text-red-400'}>{ohlcv.close.toFixed(2)}</span></span>
            </div>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5 bg-[#111318] rounded-lg p-1">
            {TIMEFRAMES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeframe(value)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                  timeframe === value
                    ? 'bg-[#21262D] text-amber-400'
                    : 'text-[#8B949E] hover:text-[#E6EDF3]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            className="p-1.5 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex-1 min-h-0">
        {!asset && (
          <div className="absolute inset-0 flex items-center justify-center text-[#8B949E]">
            Select an asset to view chart
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
