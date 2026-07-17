'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useMarketData } from './useMarketData';
import { SUPPORTED_CRYPTOS } from '@/lib/constants';
import type { Balance, Transaction } from '@/types';

interface RawWallet {
  id: string;
  asset: string;
  balance: string | number;
  lockedBalance: string | number;
}

interface RawTransaction {
  id: string;
  type: Transaction['type'];
  asset: string;
  amount: string | number;
  fee: string | number;
  status: Transaction['status'];
  txHash?: string;
  network?: string;
  toAddress?: string;
  note?: string;
  usdValue: string | number;
  createdAt: string;
}

/**
 * Real user wallet data from the backend — no mock fallbacks.
 * Returns empty balances/transactions for brand-new accounts.
 */
export function useWalletData() {
  const { getPrice, assets } = useMarketData();
  const [rawBalances, setRawBalances] = useState<RawWallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        api.get<RawWallet[]>('/wallet/balances'),
        api.get<RawTransaction[]>('/wallet/transactions'),
      ]);

      setRawBalances(Array.isArray(balRes.data) ? balRes.data : []);
      const txs = Array.isArray(txRes.data) ? txRes.data : [];
      setTransactions(
        txs.map((t) => ({
          id: t.id,
          userId: '',
          // Present internal adjustments as ordinary deposits, exchange-style
          type: (t.type === 'ADMIN_ADJUSTMENT' ? 'DEPOSIT' : t.type) as Transaction['type'],
          asset: t.asset,
          symbol: t.asset,
          amount: Number(t.amount),
          fee: Number(t.fee),
          status: t.status,
          txHash: t.txHash,
          network: t.network,
          toAddress: t.toAddress,
          note: t.note,
          usdValue: Number(t.usdValue),
          createdAt: t.createdAt,
        }))
      );
      setError(null);
    } catch {
      setError('Could not reach the server. Balances will appear when the connection is restored.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Poll so admin balance changes appear without a manual refresh, and
    // refetch whenever the tab regains focus.
    const t = setInterval(refresh, 15000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, [refresh]);

  // Merge raw balances with live market prices for USD values
  const balances: Balance[] = rawBalances
    .filter((w) => Number(w.balance) > 0 || Number(w.lockedBalance) > 0)
    .map((w) => {
      const symbol = w.asset.toUpperCase();
      const meta = SUPPORTED_CRYPTOS.find((c) => c.symbol === symbol);
      const marketAsset = assets.find((a) => a.symbol === symbol);
      const price = symbol === 'USDT' || symbol === 'USDC' ? 1 : getPrice(symbol) || marketAsset?.price || 0;
      const available = Number(w.balance);
      const locked = Number(w.lockedBalance);
      return {
        asset: w.asset,
        symbol,
        name: meta?.name || marketAsset?.name || symbol,
        icon: meta?.icon || marketAsset?.icon || symbol.slice(0, 1),
        available,
        locked,
        total: available + locked,
        usdValue: (available + locked) * price,
        price,
      };
    })
    .sort((a, b) => b.usdValue - a.usdValue);

  const totalUsdValue = balances.reduce((sum, b) => sum + b.usdValue, 0);

  // Fill in USD values from live prices for entries recorded without one
  const displayTransactions = transactions.map((t) => {
    if (t.usdValue > 0) return t;
    const symbol = t.symbol.toUpperCase();
    const price = symbol === 'USDT' || symbol === 'USDC' ? 1 : getPrice(symbol) || assets.find((a) => a.symbol === symbol)?.price || 0;
    return { ...t, usdValue: t.amount * price };
  });

  return { balances, transactions: displayTransactions, totalUsdValue, isLoading, error, refresh };
}
