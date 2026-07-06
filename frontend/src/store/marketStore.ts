'use client';
import { create } from 'zustand';
import type { Asset, OrderBook } from '@/types';

interface MarketState {
  assets: Asset[];
  selectedAsset: Asset | null;
  prices: Record<string, number>;
  orderBook: OrderBook | null;
  isLoading: boolean;
  setAssets: (assets: Asset[]) => void;
  setSelectedAsset: (asset: Asset | null) => void;
  updatePrice: (symbol: string, price: number) => void;
  updatePrices: (prices: Record<string, number>) => void;
  setOrderBook: (orderBook: OrderBook) => void;
  setLoading: (loading: boolean) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  assets: [],
  selectedAsset: null,
  prices: {},
  orderBook: null,
  isLoading: false,

  setAssets: (assets) => {
    const prices: Record<string, number> = {};
    assets.forEach((a) => {
      prices[a.symbol] = a.price;
    });
    set({ assets, prices });
  },

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  updatePrice: (symbol, price) =>
    set((state) => ({
      prices: { ...state.prices, [symbol]: price },
      assets: state.assets.map((a) =>
        a.symbol === symbol ? { ...a, price } : a
      ),
      selectedAsset:
        state.selectedAsset?.symbol === symbol
          ? { ...state.selectedAsset, price }
          : state.selectedAsset,
    })),

  updatePrices: (prices) =>
    set((state) => ({
      prices: { ...state.prices, ...prices },
      assets: state.assets.map((a) =>
        prices[a.symbol] !== undefined ? { ...a, price: prices[a.symbol] } : a
      ),
    })),

  setOrderBook: (orderBook) => set({ orderBook }),

  setLoading: (isLoading) => set({ isLoading }),
}));
