'use client';
import { useState } from 'react';
import { Plus, Minus, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SUPPORTED_CRYPTOS } from '@/lib/constants';
import { cn, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  currentBalance?: number;
}

export function FundAdjustmentModal({ isOpen, onClose, userName = 'User', currentBalance = 0 }: Props) {
  const [type, setType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [asset, setAsset] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const submit = () => {
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');
    if (!reason.trim()) return toast.error('A reason is required for audit logging');
    toast.success(`${type === 'ADD' ? 'Added' : 'Deducted'} ${amount} ${asset} ${type === 'ADD' ? 'to' : 'from'} ${userName}. Action logged.`);
    setAmount('');
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Funds — ${userName}`} size="md">
      <div className="p-6 space-y-5">
        <div className="rounded-lg bg-[#111318] border border-[#21262D] p-3 flex justify-between text-sm">
          <span className="text-[#8B949E]">Current Balance</span>
          <span className="font-semibold">{formatCurrency(currentBalance)}</span>
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

        <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          This action is irreversible and will be recorded in the audit log with your admin ID, timestamp, and IP address.
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant={type === 'ADD' ? 'success' : 'danger'} fullWidth onClick={submit}>
            {type === 'ADD' ? 'Add' : 'Deduct'} Funds
          </Button>
        </div>
      </div>
    </Modal>
  );
}
