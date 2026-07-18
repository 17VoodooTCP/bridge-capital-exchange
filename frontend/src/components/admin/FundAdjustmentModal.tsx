'use client';
import { useState } from 'react';
import { Plus, Minus, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SUPPORTED_CRYPTOS } from '@/lib/constants';
import { cn, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface WalletRow {
  asset: string;
  balance: string | number;
  lockedBalance: string | number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userId?: string;
  currentBalance?: number;
  wallets?: WalletRow[];
}

export function FundAdjustmentModal({ isOpen, onClose, userName = 'User', userId, currentBalance = 0, wallets = [] }: Props) {
  const [type, setType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [asset, setAsset] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');
    if (!reason.trim()) return toast.error('A reason is required for audit logging');
    if (!userId) return toast.error('No user selected');
    setSubmitting(true);
    try {
      await api.post('/admin/users/adjust-funds', {
        userId,
        asset,
        amount: Number(amount),
        type,
        reason,
        notify,
        recordTransaction: notify,
      });
      toast.success(`${type === 'ADD' ? 'Added' : 'Deducted'} ${amount} ${asset} ${type === 'ADD' ? 'to' : 'from'} ${userName}${notify ? ' (user notified)' : ' silently'}. Action logged.`);
      setAmount('');
      setReason('');
      setNotify(false);
      onClose();
    } catch {
      toast.error('Adjustment failed — action not applied.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Funds — ${userName}`} size="md">
      <div className="p-6 space-y-5">
        <div className="rounded-lg bg-[#111318] border border-[#21262D] p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8B949E]">Total balance (all assets)</span>
            <span className="font-semibold">{formatCurrency(currentBalance)}</span>
          </div>
          {wallets.length > 0 && (
            <div className="pt-2 border-t border-[#21262D] space-y-1">
              <div className="text-xs text-[#8B949E] mb-1">All wallet balances</div>
              {wallets.filter((w) => Number(w.balance) > 0 || Number(w.lockedBalance) > 0).map((w) => (
                <div key={w.asset} className="flex justify-between text-xs">
                  <span className="text-[#8B949E]">{w.asset}</span>
                  <span className="font-mono">
                    {Number(w.balance).toFixed(6)}
                    {Number(w.lockedBalance) > 0 && <span className="text-[#6E7681]"> (+{Number(w.lockedBalance).toFixed(6)} locked)</span>}
                  </span>
                </div>
              ))}
              {wallets.every((w) => Number(w.balance) === 0 && Number(w.lockedBalance) === 0) && (
                <div className="text-xs text-[#6E7681]">No balances yet.</div>
              )}
            </div>
          )}
          {asset && (() => {
            const selected = wallets.find((w) => w.asset.toUpperCase() === asset.toUpperCase());
            const avail = selected ? Number(selected.balance) : 0;
            const locked = selected ? Number(selected.lockedBalance) : 0;
            const total = avail + locked;
            return (
              <div className="pt-2 border-t border-[#21262D] flex justify-between text-sm">
                <span className="text-[#8B949E]">
                  Current {asset} balance
                  {locked > 0 && <span className="block text-xs text-[#6E7681]">{avail.toFixed(6)} available + {locked.toFixed(6)} locked</span>}
                </span>
                {/* Total = available + locked — matches what the user sees on their dashboard */}
                <span className="font-semibold text-amber-400">{total.toFixed(6)} {asset}</span>
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setType('ADD')} className={cn('flex items-center justify-center gap-2 py-3 rounded-lg border transition-all', type === 'ADD' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#21262D] text-[#8B949E]')}>
            <Plus size={16} /> Add Funds
          </button>
          <button onClick={() => setType('DEDUCT')} className={cn('flex items-center justify-center gap-2 py-3 rounded-lg border transition-all', type === 'DEDUCT' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-[#21262D] text-[#8B949E]')}>
            <Minus size={16} /> Deduct Funds
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#8B949E]">Asset</label>
          <select value={asset} onChange={(e) => setAsset(e.target.value)} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm text-[#E6EDF3] outline-none focus:border-amber-500/50">
            {SUPPORTED_CRYPTOS.slice(0, 8).map((c) => <option key={c.symbol} value={c.symbol} className="bg-[#161B22]">{c.symbol} — {c.name}</option>)}
          </select>
        </div>

        <Input label="Amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} suffix={asset} />
        <Input label="Reason (required for audit)" placeholder="e.g. Manual deposit correction — ticket #1234" value={reason} onChange={(e) => setReason(e.target.value)} />

        <label className="flex items-start gap-2.5 cursor-pointer rounded-lg bg-[#111318] border border-[#21262D] p-3">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="mt-0.5 rounded border-[#21262D] bg-[#0D1117] text-amber-500 focus:ring-amber-500/30" />
          <span className="text-sm">
            <span className="font-medium">Notify the user</span>
            <span className="block text-xs text-[#8B949E] mt-0.5">
              {notify
                ? 'The user will get an in-app notification, an email, and a transaction-history entry.'
                : 'Silent adjustment — the balance changes with no notification, email, or transaction record shown to the user.'}
            </span>
          </span>
        </label>

        <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          This action is irreversible and will be recorded in the audit log with your admin ID, timestamp, and IP address.
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant={type === 'ADD' ? 'success' : 'danger'} fullWidth isLoading={submitting} onClick={submit}>
            {type === 'ADD' ? 'Add' : 'Deduct'} Funds
          </Button>
        </div>
      </div>
    </Modal>
  );
}
