'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { mockAllAssets } from '@/lib/mockData';
import { COINGECKO_IDS, FINNHUB_KEY, FINNHUB_SYMBOLS } from '@/lib/logos';
import type { Asset } from '@/types';

const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(
  COINGECKO_IDS
).join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;

// Reverse map: coingecko id -> symbol
const ID_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(COINGECKO_IDS).map(([sym, id]) => [id, sym])
);

export function useMarketData() {
  const { assets, prices, selectedAsset, isLoading, setAssets, updatePrices, setLoading } =
    useMarketStore();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load initial data
  useEffect(() => {
    if (assets.length === 0) {
      setLoading(true);
      setTimeout(() => {
        setAssets(mockAllAssets);
        setLoading(false);
      }, 400);
    }
  }, [assets.length, setAssets, setLoading]);

  // LIVE crypto prices from CoinGecko (free, no API key) — refreshed every 30s
  useEffect(() => {
    if (assets.length === 0) return;

    const fetchLive = async () => {
      try {
        const res = await fetch(COINGECKO_URL);
        if (!res.ok) return; // rate limited or offline — keep last prices
        const data: Record<string, { usd: number; usd_24h_change?: number; usd_24h_vol?: number }> =
          await res.json();

        const priceUpdates: Record<string, number> = {};
        const updatedAssets = useMarketStore.getState().assets.map((a) => {
          const cgId = COINGECKO_IDS[a.symbol];
          const live = cgId ? data[cgId] : undefined;
          if (!live) return a;
          priceUpdates[a.symbol] = live.usd;
          return {
            ...a,
            price: live.usd,
            changePercent24h: live.usd_24h_change ?? a.changePercent24h,
            change24h: live.usd_24h_change
              ? (live.usd * live.usd_24h_change) / 100
              : a.change24h,
            volume24h: live.usd_24h_vol ?? a.volume24h,
          };
        });

        if (Object.keys(priceUpdates).length > 0) {
          setAssets(updatedAssets);
          updatePrices(priceUpdates);
        }
      } catch {
        // network error — silently keep simulated prices
      }
    };

    fetchLive();
    liveRef.current = setInterval(fetchLive, 30000);
    return () => {
      if (liveRef.current) clearInterval(liveRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets.length > 0]);

  // LIVE stock & ETF quotes from Finnhub — refreshed every 60s (free-tier friendly)
  useEffect(() => {
    if (assets.length === 0 || !FINNHUB_KEY) return;

    const fetchStocks = async () => {
      try {
        const results = await Promise.allSettled(
          FINNHUB_SYMBOLS.map(async (sym) => {
            const res = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`
            );
            if (!res.ok) throw new Error(String(res.status));
            const q: { c: number; d: number; dp: number; h: number; l: number } = await res.json();
            return { sym, q };
          })
        );

        const priceUpdates: Record<string, number> = {};
        const quotes: Record<string, { c: number; d: number; dp: number; h: number; l: number }> = {};
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value.q.c > 0) {
            quotes[r.value.sym] = r.value.q;
            priceUpdates[r.value.sym] = r.value.q.c;
          }
        }
        if (Object.keys(priceUpdates).length === 0) return;

        const updatedAssets = useMarketStore.getState().assets.map((a) => {
          const q = quotes[a.symbol];
          if (!q) return a;
          return {
            ...a,
            price: q.c,
            change24h: q.d ?? a.change24h,
            changePercent24h: q.dp ?? a.changePercent24h,
            high24h: q.h || a.high24h,
            low24h: q.l || a.low24h,
          };
        });

        setAssets(updatedAssets);
        updatePrices(priceUpdates);
      } catch {
        // offline or rate-limited — keep last prices
      }
    };

    fetchStocks();
    stockRef.current = setInterval(fetchStocks, 60000);
    return () => {
      if (stockRef.current) clearInterval(stockRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets.length > 0]);

  // Micro-tick simulation between live fetches (smooth movement)
  useEffect(() => {
    if (assets.length === 0) return;

    const liveSymbols = new Set([...Object.keys(COINGECKO_IDS), ...FINNHUB_SYMBOLS]);

    const tick = () => {
      const current = useMarketStore.getState();
      const updates: Record<string, number> = {};
      current.assets.forEach((asset) => {
        // Symbols covered by a real feed keep their live price untouched
        if (liveSymbols.has(asset.symbol)) return;
        const base = current.prices[asset.symbol] ?? asset.price;
        const change = (Math.random() - 0.495) * 0.002;
        updates[asset.symbol] = parseFloat((base * (1 + change)).toFixed(asset.decimals > 4 ? 2 : 6));
      });
      if (Object.keys(updates).length > 0) updatePrices(updates);
    };

    tickRef.current = setInterval(tick, 2000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets.length > 0, updatePrices]);

  const getAsset = useCallback(
    (symbol: string): Asset | undefined => assets.find((a) => a.symbol === symbol),
    [assets]
  );

  const getPrice = useCallback((symbol: string): number => prices[symbol] ?? 0, [prices]);

  const getCryptos = useCallback(() => assets.filter((a) => a.type === 'CRYPTO'), [assets]);
  const getStocks = useCallback(() => assets.filter((a) => a.type === 'STOCK'), [assets]);
  const getETFs = useCallback(() => assets.filter((a) => a.type === 'ETF'), [assets]);

  const getTopGainers = useCallback(
    (n = 5) =>
      [...assets]
        .filter((a) => a.changePercent24h > 0)
        .sort((a, b) => b.changePercent24h - a.changePercent24h)
        .slice(0, n),
    [assets]
  );

  const getTopLosers = useCallback(
    (n = 5) =>
      [...assets]
        .filter((a) => a.changePercent24h < 0)
        .sort((a, b) => a.changePercent24h - b.changePercent24h)
        .slice(0, n),
    [assets]
  );

  return {
    assets,
    prices,
    selectedAsset,
    isLoading,
    getAsset,
    getPrice,
    getCryptos,
    getStocks,
    getETFs,
    getTopGainers,
    getTopLosers,
  };
}
