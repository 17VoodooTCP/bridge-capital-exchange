'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WalletConfigEntry {
  id: string;
  asset: string;
  network: string;
  address: string;
  minDeposit: number;
  active: boolean;
  /** Data-URL of the QR image uploaded by the admin */
  qrUrl?: string;
  fee?: string;
  confirmations?: number;
}

interface WalletConfigState {
  configs: WalletConfigEntry[];
  setConfigs: (configs: WalletConfigEntry[]) => void;
  upsertConfig: (config: WalletConfigEntry) => void;
  updateConfig: (id: string, patch: Partial<WalletConfigEntry>) => void;
  getForAsset: (symbol: string) => WalletConfigEntry[];
}

const DEFAULT_CONFIGS: WalletConfigEntry[] = [
  { id: '1', asset: 'USDT', network: 'TRC20', address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', minDeposit: 10, active: true, fee: '1 USDT', confirmations: 1 },
  { id: '2', asset: 'USDT', network: 'ERC20', address: '0x742d35Cc6634C0532925a3b8D4C1C9f8e4f8a8b', minDeposit: 20, active: true, fee: '5 USDT', confirmations: 12 },
  { id: '3', asset: 'BTC', network: 'Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', minDeposit: 0.0005, active: true, fee: '0.0001 BTC', confirmations: 6 },
  { id: '4', asset: 'ETH', network: 'ERC20', address: '0x8f4a8b2c1d9e3f6a5b0c8d7e2f4a1b9c3d5e7f0a', minDeposit: 0.01, active: true, fee: '0.002 ETH', confirmations: 12 },
];

export const useWalletConfigStore = create<WalletConfigState>()(
  persist(
    (set, get) => ({
      configs: DEFAULT_CONFIGS,
      setConfigs: (configs) => set({ configs }),
      upsertConfig: (config) =>
        set((s) => {
          const idx = s.configs.findIndex((c) => c.id === config.id);
          if (idx >= 0) {
            const next = [...s.configs];
            next[idx] = config;
            return { configs: next };
          }
          return { configs: [...s.configs, config] };
        }),
      updateConfig: (id, patch) =>
        set((s) => ({ configs: s.configs.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      getForAsset: (symbol) =>
        get().configs.filter((c) => c.asset.toUpperCase() === symbol.toUpperCase() && c.active),
    }),
    { name: 'bce-wallet-configs' }
  )
);
