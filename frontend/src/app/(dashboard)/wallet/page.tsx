'use client';
import { useState } from 'react';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawModal } from '@/components/wallet/WithdrawModal';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { mockPortfolio, mockTotalPortfolioValue, mockTransactions } from '@/lib/mockData';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatDate, truncateAddress, cn } from '@/lib/utils';
import type { Balance } from '@/types';

const balances: Balance[] = mockPortfolio.map((p) => ({
  asset: p.asset, symbol: p.symbol, name: p.name, icon: p.icon,
  available: p.amount * 0.9, locked: p.amount * 0.1, total: p.amount,
  usdValue: p.currentValue, price: p.currentPrice,
}));

export default function WalletPage() {
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
            <div className="text-4xl font-bold mt-1">{mask(formatCurrency(mockTotalPortfolioValue))}</div>
            <div className="text-sm text-green-400 mt-1">{mask('+$1,842.15 (2.61%) today')}</div>
          </div>
          <div className="flex gap-3">
            <Button size="lg" leftIcon={<ArrowDownLeft size={18} />} onClick={() => setDeposit({ open: true, symbol: 'USDT' })}>Deposit</Button>
            <Button size="lg" variant="outline" leftIcon={<ArrowUpRight size={18} />} onClick={() => setWithdraw({ open: true, symbol: 'USDT' })}>Withdraw</Button>
          </div>
        </div>
      </Card>

      <Tabs tabs={[{ id: 'balances', label: 'Balances' }, { id: 'history', label: 'Transaction History' }]} activeTab={tab} onChange={setTab} variant="underline" />

      {tab === 'balances' ? (
        <Card>
          <CardBody className="p-0">
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
                    <td className="px-5 py-3 text-right">{mask(`${b.available.toFixed(4)}`)}</td>
                    <td className="px-5 py-3 text-right text-[#8B949E] hidden sm:table-cell">{mask(b.locked.toFixed(4))}</td>
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
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            {mockTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#21262D]/50 last:border-0">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', ['DEPOSIT', 'BUY', 'REWARD'].includes(t.type) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                  {['DEPOSIT', 'BUY', 'REWARD'].includes(t.type) ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{TRANSACTION_TYPE_LABELS[t.type]} {t.symbol}</div>
                  <div className="text-xs text-[#8B949E]">{formatDate(t.createdAt, 'full')}{t.network && ` · ${t.network}`}{t.txHash && ` · ${truncateAddress(t.txHash)}`}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{t.amount} {t.symbol}</div>
                  <div className="text-xs text-[#8B949E]">{formatCurrency(t.usdValue)}</div>
                </div>
                <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'} size="sm">{t.status}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <DepositModal isOpen={deposit.open} onClose={() => setDeposit({ ...deposit, open: false })} symbol={deposit.symbol} asset={deposit.symbol} />
      <WithdrawModal isOpen={withdraw.open} onClose={() => setWithdraw({ ...withdraw, open: false })} symbol={withdraw.symbol} />
    </div>
  );
}
