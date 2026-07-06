'use client';
import { useState } from 'react';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon, WifiOff } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawModal } from '@/components/wallet/WithdrawModal';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { useWalletData } from '@/hooks/useWalletData';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate, truncateAddress, cn } from '@/lib/utils';

export default function WalletPage() {
  const { balances, transactions, totalUsdValue, isLoading, error, refresh } = useWalletData();
  const [hide, setHide] = useState(false);
  const [tab, setTab] = useState('balances');
  const [deposit, setDeposit] = useState<{ open: boolean; symbol: string }>({ open: false, symbol: 'USDT' });
  const [withdraw, setWithdraw] = useState<{ open: boolean; symbol: string }>({ open: false, symbol: 'USDT' });
  const mask = (v: string) => (hide ? '••••••' : v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-sm text-[#8B949E]">Manage your assets and transactions</p>
        </div>
        <WalletConnectButton />
      </div>

      {/* Total balance */}
      <Card glow="gold" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#8B949E]">
              Total Balance <button onClick={() => setHide(!hide)}>{hide ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
            <div className="text-4xl font-bold mt-1">
              {isLoading ? <span className="skeleton inline-block w-40 h-9 rounded" /> : mask(formatCurrency(totalUsdValue))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="lg" leftIcon={<ArrowDownLeft size={18} />} onClick={() => setDeposit({ open: true, symbol: balances[0]?.symbol || 'USDT' })}>Deposit</Button>
            <Button size="lg" variant="outline" leftIcon={<ArrowUpRight size={18} />} onClick={() => setWithdraw({ open: true, symbol: balances[0]?.symbol || 'USDT' })}>Withdraw</Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-amber-500/30">
          <div className="flex items-center gap-3 text-sm text-amber-400">
            <WifiOff size={16} /> {error}
            <Button size="xs" variant="outline" className="ml-auto" onClick={refresh}>Retry</Button>
          </div>
        </Card>
      )}

      <Tabs tabs={[{ id: 'balances', label: 'Balances' }, { id: 'history', label: 'Transaction History' }]} activeTab={tab} onChange={setTab} variant="underline" />

      {tab === 'balances' ? (
        <Card>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
            ) : balances.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <WalletIcon size={24} className="text-amber-400" />
                </div>
                <div className="font-medium mb-1">No assets yet</div>
                <p className="text-sm text-[#8B949E] mb-5">Make your first deposit to start trading and earning.</p>
                <Button leftIcon={<ArrowDownLeft size={16} />} onClick={() => setDeposit({ open: true, symbol: 'USDT' })}>Deposit Funds</Button>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="text-xs text-[#8B949E] uppercase border-b border-[#21262D]">
                  <th className="text-left px-5 py-3 font-semibold">Asset</th>
                  <th className="text-right px-5 py-3 font-semibold">Available</th>
                  <th className="text-right px-5 py-3 font-semibold hidden sm:table-cell">In Order</th>
                  <th className="text-right px-5 py-3 font-semibold">Value</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr></thead>
                <tbody>
                  {balances.map((b) => (
                    <tr key={b.asset} className="border-b border-[#21262D]/50 last:border-0 hover:bg-[#1C2128] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <AssetIcon symbol={b.symbol} fallback={b.icon} size={36} />
                          <div><div className="font-medium">{b.symbol}</div><div className="text-xs text-[#8B949E]">{b.name}</div></div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">{mask(b.available.toFixed(6))}</td>
                      <td className="px-5 py-3 text-right text-[#8B949E] hidden sm:table-cell">{mask(b.locked.toFixed(6))}</td>
                      <td className="px-5 py-3 text-right font-medium">{mask(formatCurrency(b.usdValue))}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 justify-end">
                          <Button size="xs" variant="outline" onClick={() => setDeposit({ open: true, symbol: b.symbol })}>Deposit</Button>
                          <Button size="xs" variant="ghost" onClick={() => setWithdraw({ open: true, symbol: b.symbol })}>Withdraw</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#8B949E]">No transactions yet. Your deposit, withdrawal, and trade history will appear here.</div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#21262D]/50 last:border-0">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', ['DEPOSIT', 'BUY', 'REWARD', 'ADMIN_ADJUSTMENT'].includes(t.type) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                    {['DEPOSIT', 'BUY', 'REWARD', 'ADMIN_ADJUSTMENT'].includes(t.type) ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{TRANSACTION_TYPE_LABELS[t.type] || t.type} {t.symbol}</div>
                    <div className="text-xs text-[#8B949E]">{formatDate(t.createdAt, 'full')}{t.network && ` · ${t.network}`}{t.txHash && ` · ${truncateAddress(t.txHash)}`}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{t.amount} {t.symbol}</div>
                    <div className="text-xs text-[#8B949E]">{formatCurrency(t.usdValue)}</div>
                  </div>
                  <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'} size="sm">{t.status}</Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}

      <DepositModal isOpen={deposit.open} onClose={() => setDeposit({ ...deposit, open: false })} symbol={deposit.symbol} asset={deposit.symbol} />
      <WithdrawModal isOpen={withdraw.open} onClose={() => setWithdraw({ ...withdraw, open: false })} symbol={withdraw.symbol} />
    </div>
  );
}
