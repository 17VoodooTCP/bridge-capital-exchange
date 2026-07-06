'use client';
import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { copyToClipboard, cn } from '@/lib/utils';
import { useWalletConfigStore } from '@/store/walletConfigStore';
import { AssetIcon } from '@/components/ui/AssetIcon';
import toast from 'react-hot-toast';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: string;
  symbol?: string;
}

export function DepositModal({ isOpen, onClose, asset = 'USDT', symbol = 'USDT' }: DepositModalProps) {
  const configs = useWalletConfigStore((s) => s.configs);

  // Every asset the admin has an active config for is selectable
  const availableAssets = Array.from(
    new Set(configs.filter((c) => c.active).map((c) => c.asset.toUpperCase()))
  );

  const [selectedAsset, setSelectedAsset] = useState(symbol.toUpperCase());
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const assetConfigs = configs.filter(
    (c) => c.asset.toUpperCase() === selectedAsset && c.active
  );

  // Sync asset with the launcher prop each time the modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = availableAssets.includes(symbol.toUpperCase())
        ? symbol.toUpperCase()
        : availableAssets[0] ?? symbol.toUpperCase();
      setSelectedAsset(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, symbol]);

  // Reset network to the first available whenever the asset changes
  useEffect(() => {
    setNetworkId(assetConfigs[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset, isOpen]);

  const selected = assetConfigs.find((c) => c.id === networkId) ?? assetConfigs[0];

  const handleCopy = async () => {
    if (!selected) return;
    await copyToClipboard(selected.address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Deposit ${selectedAsset}`} size="md">
      <div className="p-6 space-y-5">
        {/* Asset selector — every chain configured by the admin */}
        <div>
          <label className="text-xs text-[#8B949E] font-medium mb-1.5 block">Select Asset</label>
          <div className="flex flex-wrap gap-2">
            {availableAssets.map((a) => (
              <button
                key={a}
                onClick={() => setSelectedAsset(a)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all',
                  selectedAsset === a
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-[#21262D] text-[#8B949E] hover:border-[#30363D]'
                )}
              >
                <AssetIcon symbol={a} size={20} />
                {a}
              </button>
            ))}
          </div>
        </div>

        {assetConfigs.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <AlertCircle size={32} className="text-amber-400 mx-auto" />
            <p className="text-sm text-[#E6EDF3]">Deposits for {selectedAsset} are not configured yet.</p>
            <p className="text-xs text-[#8B949E]">
              The platform administrator has not added a deposit address for this asset. Please
              contact support or try another asset.
            </p>
          </div>
        ) : (
          <>
            {/* Network selector */}
            <div>
              <label className="text-xs text-[#8B949E] font-medium mb-1.5 block">Select Network</label>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(assetConfigs.length, 3)}, 1fr)` }}>
                {assetConfigs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setNetworkId(c.id)}
                    className={cn(
                      'px-3 py-2.5 rounded-xl border text-sm transition-all',
                      selected?.id === c.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-[#21262D] text-[#8B949E] hover:border-[#30363D]'
                    )}
                  >
                    {c.network}
                    {c.fee && <div className="text-[10px] mt-0.5 opacity-70">Fee: {c.fee}</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200">
                Only send <strong>{selectedAsset}</strong> ({selected?.network}) to this address. Sending any
                other asset may result in permanent loss.
              </p>
            </div>

            {/* QR code — uploaded by the admin for this chain */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-44 h-44 bg-white rounded-2xl p-2 flex items-center justify-center overflow-hidden">
                {selected?.qrUrl ? (
                  <img
                    src={selected.qrUrl}
                    alt={`${selectedAsset} ${selected.network} deposit QR`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-[#111]">
                    <QrCode size={90} className="mx-auto" />
                    <span className="text-[10px] block mt-1">Scan address QR</span>
                  </div>
                )}
              </div>
              <Badge variant="success" size="sm" dot>
                Official {selected?.network} deposit address
              </Badge>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs text-[#8B949E] font-medium mb-1.5 block">Deposit Address</label>
              <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-xl p-3">
                <span className="flex-1 text-xs font-mono text-[#E6EDF3] break-all">
                  {selected?.address}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-1.5 rounded-lg text-[#8B949E] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Min. Deposit', value: `${selected?.minDeposit} ${selectedAsset}` },
                { label: 'Confirmations', value: String(selected?.confirmations ?? 12) },
                { label: 'Network Fee', value: selected?.fee ?? '—' },
                { label: 'Credit After', value: (selected?.confirmations ?? 12) <= 2 ? '~1 min' : '~5-15 min' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#111318] rounded-xl p-3">
                  <p className="text-xs text-[#8B949E]">{label}</p>
                  <p className="text-sm font-semibold text-[#E6EDF3] mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 bg-[#111318] rounded-xl border border-[#21262D]">
              <CheckCircle2 size={14} className="text-green-400 shrink-0" />
              <p className="text-xs text-[#8B949E]">
                Funds will be credited automatically after network confirmation. No action needed.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
