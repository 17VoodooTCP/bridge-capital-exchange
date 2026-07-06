'use client';
import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState({ maintenance: false, deposits: true, withdrawals: true, trading: true, staking: true, kycRequired: true });
  const [banner, setBanner] = useState('');
  const [fees, setFees] = useState({ trading: '0.1', withdrawal: '0.05', minWithdrawal: '10', maxDaily: '100000' });

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn('w-11 h-6 rounded-full transition-colors relative', on ? 'bg-amber-500' : 'bg-[#21262D]')}>
      <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', on ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold">Platform Settings</h1><p className="text-sm text-[#8B949E]">Control global platform configuration</p></div>

      <Card>
        <CardHeader><h3 className="font-semibold">Feature Flags</h3></CardHeader>
        <CardBody className="space-y-1">
          {[
            { key: 'maintenance', label: 'Maintenance Mode', desc: 'Take the platform offline for all users', danger: true },
            { key: 'deposits', label: 'Deposits Enabled', desc: 'Allow users to deposit funds' },
            { key: 'withdrawals', label: 'Withdrawals Enabled', desc: 'Allow users to withdraw funds' },
            { key: 'trading', label: 'Trading Enabled', desc: 'Allow spot trading' },
            { key: 'staking', label: 'Staking Enabled', desc: 'Allow earn/staking products' },
            { key: 'kycRequired', label: 'KYC Required', desc: 'Require KYC before withdrawals' },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between py-3 border-b border-[#21262D]/50 last:border-0">
              <div><div className={cn('font-medium text-sm', f.danger && 'text-red-400')}>{f.label}</div><div className="text-xs text-[#8B949E]">{f.desc}</div></div>
              <Toggle on={flags[f.key as keyof typeof flags]} onClick={() => { setFlags((p) => ({ ...p, [f.key]: !p[f.key as keyof typeof flags] })); toast.success(`${f.label} updated`); }} />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Announcement Banner</h3></CardHeader>
        <CardBody className="space-y-3">
          <Input placeholder="Enter a site-wide announcement (leave blank to hide)" value={banner} onChange={(e) => setBanner(e.target.value)} />
          {banner && <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">{banner}</div>}
          <Button onClick={() => toast.success('Banner published')}>Publish Banner</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Fee Settings</h3></CardHeader>
        <CardBody className="grid sm:grid-cols-2 gap-4">
          <Input label="Trading Fee (%)" value={fees.trading} onChange={(e) => setFees({ ...fees, trading: e.target.value })} />
          <Input label="Withdrawal Fee (%)" value={fees.withdrawal} onChange={(e) => setFees({ ...fees, withdrawal: e.target.value })} />
          <Input label="Min Withdrawal (USD)" value={fees.minWithdrawal} onChange={(e) => setFees({ ...fees, minWithdrawal: e.target.value })} />
          <Input label="Max Daily Withdrawal (USD)" value={fees.maxDaily} onChange={(e) => setFees({ ...fees, maxDaily: e.target.value })} />
          <div className="sm:col-span-2"><Button onClick={() => toast.success('Fee settings saved')}>Save Fees</Button></div>
        </CardBody>
      </Card>
    </div>
  );
}
