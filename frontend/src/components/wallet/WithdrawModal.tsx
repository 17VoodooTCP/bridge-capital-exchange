'use client';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { useWalletData } from '@/hooks/useWalletData';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol?: string;
  availableBalance?: number;
}

const NETWORKS_BY_ASSET: Record<string, { value: string; label: string; fee: number }[]> = {
  USDT: [
    { value: 'TRC20', label: 'TRC20 (TRON)', fee: 1 },
    { value: 'ERC20', label: 'ERC20 (Ethereum)', fee: 5 },
    { value: 'BEP20', label: 'BEP20 (BSC)', fee: 0.5 },
  ],
  BTC: [{ value: 'BTC', label: 'Bitcoin Network', fee: 0.0001 }],
  ETH: [
    { value: 'ERC20', label: 'ERC20 (Ethereum)', fee: 0.002 },
    { value: 'BEP20', label: 'BEP20 (BSC)', fee: 0.001 },
  ],
  SOL: [{ value: 'SOL', label: 'Solana Network', fee: 0.01 }],
  BNB: [{ value: 'BEP20', label: 'BEP20 (BSC)', fee: 0.001 }],
};

export function WithdrawModal({ isOpen, onClose, symbol = 'USDT' }: WithdrawModalProps) {
  const { balances, refresh } = useWalletData();
  const [step, setStep] = useState<1 | 2>(1);
  const [asset, setAsset] = useState(symbol);
  const [networkIndex, setNetworkIndex] = useState(0);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Only assets the user actually holds are selectable
  const fundedBalances = balances.filter((b) => b.available > 0);
  const assetOptions = fundedBalances.map((b) => ({ value: b.symbol, label: `${b.symbol} — ${b.name}` }));

  // When opened, default to the requested asset if funded, else the first funded one
  useEffect(() => {
    if (!isOpen) return;
    const has = (s: string) => balances.some((b) => b.symbol === s && b.available > 0);
    if (has(symbol.toUpperCase())) setAsset(symbol.toUpperCase());
    else if (fundedBalances[0]) setAsset(fundedBalances[0].symbol);
    setNetworkIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, symbol, balances.length]);

  const networks = NETWORKS_BY_ASSET[asset] ?? [{ value: 'native', label: 'Native', fee: 0 }];
  const network = networks[networkIndex];
  const balance = balances.find((b) => b.symbol === asset)?.available ?? 0;
  const amountNum = parseFloat(amount) || 0;
  const receive = Math.max(0, amountNum - (network?.fee ?? 0));

  const handleNext = () => {
    if (fundedBalances.length === 0) return toast.error('No funds available to withdraw');
    if (!address) return toast.error('Enter recipient address');
    if (!amountNum || amountNum <= 0) return toast.error('Enter valid amount');
    if (amountNum > balance) return toast.error(`Insufficient balance. Available: ${formatNumber(balance, 6)} ${asset}`);
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await api.post('/wallet/withdraw', {
        asset,
        network: network?.value || 'native',
        toAddress: address,
        amount: amountNum,
        twoFactorCode: twoFaCode || undefined,
      });
      toast.success(`Withdrawal of ${formatNumber(amountNum)} ${asset} submitted for review.`);
      refresh();
      onClose();
      setStep(1);
      setAmount('');
      setAddress('');
      setTwoFaCode('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Withdrawal failed. Check your balance and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Crypto" size="md">
      <div className="p-6 space-y-5">
        {step === 1 ? (
          fundedBalances.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <AlertTriangle size={32} className="text-amber-400 mx-auto" />
              <p className="text-sm text-[#E6EDF3]">No funds available to withdraw</p>
              <p className="text-xs text-[#8B949E]">Deposit into your wallet first. Assets you hold will appear here.</p>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          ) : (
          <>
            <Select
              label="Asset"
              options={assetOptions}
              value={asset}
              onChange={(v) => { setAsset(v); setNetworkIndex(0); }}
            />
            <Select
              label="Network"
              options={networks.map((n, i) => ({ value: String(i), label: n.label }))}
              value={String(networkIndex)}
              onChange={(v) => setNetworkIndex(parseInt(v))}
            />
            <Input
              label="Recipient Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={asset === 'BTC' ? 'bc1q...' : '0x...'}
            />
            <div>
              <Input
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                suffix={asset}
                hint={`Available: ${formatNumber(balance, 4)} ${asset}`}
              />
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAmount(((balance * pct) / 100).toFixed(4))}
                    className="flex-1 py-1 text-xs text-[#8B949E] hover:text-amber-400 bg-[#111318] border border-[#21262D] hover:border-amber-500/30 rounded-md transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#111318] rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8B949E]">Amount</span>
                <span className="text-[#E6EDF3] font-mono">{formatNumber(amountNum, 4)} {asset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B949E]">Network Fee</span>
                <span className="text-[#E6EDF3] font-mono">- {network?.fee ?? 0} {asset}</span>
              </div>
              <div className="border-t border-[#21262D] pt-2 flex justify-between font-semibold">
                <span className="text-[#8B949E]">You Receive</span>
                <span className="text-green-400 font-mono">{formatNumber(receive, 4)} {asset}</span>
              </div>
            </div>

            <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200">
                Withdrawals are irreversible. Always double-check the address and network.
              </p>
            </div>

            <Button variant="default" fullWidth size="lg" onClick={handleNext}>
              Continue
            </Button>
          </>
          )
        ) : (
          <>
            <div className="bg-[#111318] border border-[#21262D] rounded-xl p-4 space-y-3 text-sm">
              <h3 className="text-sm font-semibold text-[#E6EDF3]">Confirm Withdrawal</h3>
              {[
                ['Asset', `${asset}`],
                ['Network', network?.label],
                ['Amount', `${formatNumber(amountNum, 4)} ${asset}`],
                ['Fee', `${network?.fee ?? 0} ${asset}`],
                ['Receive', `${formatNumber(receive, 4)} ${asset}`],
                ['To', address.slice(0, 12) + '...' + address.slice(-8)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#8B949E]">{label}</span>
                  <span className="text-[#E6EDF3] font-mono text-right break-all max-w-48">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#111318] rounded-xl border border-[#21262D]">
              <Shield size={16} className="text-amber-400 shrink-0" />
              <p className="text-xs text-[#8B949E]">2FA verification required for security</p>
            </div>

            <Input
              label="Google Authenticator Code"
              value={twoFaCode}
              onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
            />

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep(1)}>Back</Button>
              <Button
                variant="danger"
                fullWidth
                isLoading={isLoading}
                onClick={handleSubmit}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
