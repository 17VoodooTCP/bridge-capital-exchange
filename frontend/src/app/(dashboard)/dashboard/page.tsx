'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Percent, Eye, EyeOff, Wallet as WalletIcon } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { useMarketData } from '@/hooks/useMarketData';
import { useWalletData } from '@/hooks/useWalletData';
import { useAuthStore } from '@/store/authStore';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatPercent, getChangeColor, formatDate, cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getTopGainers, getTopLosers } = useMarketData();
  const { balances, transactions, totalUsdValue, isLoading } = useWalletData();
  const [hideBalance, setHideBalance] = useState(false);
  const gainers = getTopGainers(3);
  const losers = getTopLosers(3);

  const mask = (v: string) => (hideBalance ? '••••••' : v);
  const hasAssets = balances.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-[#8B949E]">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} — here&apos;s your overview</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link href="/wallet"><Button variant="outline" leftIcon={<ArrowDownLeft size={16} />}>Deposit</Button></Link>
          <Link href="/trade"><Button leftIcon={<TrendingUp size={16} />}>Trade</Button></Link>
        </div>
      </div>

      {/* Balance overview */}
      <Card className="p-5">
        <div className="flex items-center gap-2 text-xs text-[#8B949E] uppercase tracking-wider mb-1">
          Total Balance
          <button onClick={() => setHideBalance(!hideBalance)}>{hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}</button>
        </div>
        <div className="text-2xl sm:text-3xl font-bold break-all leading-tight">
          {isLoading ? <span className="skeleton inline-block w-40 h-8 rounded" /> : mask(formatCurrency(totalUsdValue))}
        </div>
        {hasAssets && <div className="mt-4"><PortfolioChart currentValue={totalUsdValue} days={30} height={140} /></div>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Holdings</h3>
              <Link href="/wallet" className="text-xs text-amber-400 hover:text-amber-300">View all</Link>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
            ) : !hasAssets ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <WalletIcon size={24} className="text-amber-400" />
                </div>
                <div className="font-medium mb-1">Your portfolio is empty</div>
                <p className="text-sm text-[#8B949E] mb-5">Deposit funds to start building your portfolio.</p>
                <Link href="/wallet"><Button leftIcon={<ArrowDownLeft size={16} />}>Make a Deposit</Button></Link>
              </div>
            ) : (
              balances.map((b) => {
                const allocation = totalUsdValue > 0 ? (b.usdValue / totalUsdValue) * 100 : 0;
                return (
                  <div key={b.asset} className="flex items-center gap-4 px-5 py-3 border-b border-[#21262D]/50 last:border-0 hover:bg-[#1C2128] transition-colors">
                    <AssetIcon symbol={b.symbol} fallback={b.icon} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{b.symbol}</div>
                      <div className="text-xs text-[#8B949E]">{mask(`${b.total.toFixed(6)} ${b.symbol}`)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{mask(formatCurrency(b.usdValue))}</div>
                      <div className="text-xs text-[#8B949E]">{formatCurrency(b.price)} / {b.symbol}</div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 w-24 justify-end">
                      <div className="flex-1 h-1.5 rounded-full bg-[#21262D] overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${allocation}%` }} />
                      </div>
                      <span className="text-xs text-[#8B949E] w-9 text-right">{allocation.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader><h3 className="font-semibold">Quick Actions</h3></CardHeader>
            <CardBody className="grid grid-cols-2 gap-3">
              <Link href="/wallet"><Button variant="secondary" fullWidth leftIcon={<ArrowDownLeft size={15} />}>Deposit</Button></Link>
              <Link href="/wallet"><Button variant="secondary" fullWidth leftIcon={<ArrowUpRight size={15} />}>Withdraw</Button></Link>
              <Link href="/trade"><Button variant="secondary" fullWidth leftIcon={<TrendingUp size={15} />}>Trade</Button></Link>
              <Link href="/earn"><Button variant="secondary" fullWidth leftIcon={<Percent size={15} />}>Earn</Button></Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold">Market Movers</h3></CardHeader>
            <CardBody className="space-y-3">
              <div className="text-xs text-[#8B949E] uppercase">Top Gainers</div>
              {gainers.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><AssetIcon symbol={a.symbol} fallback={a.icon} size={22} />{a.symbol}</span>
                  <span className="text-green-400">{formatPercent(a.changePercent24h)}</span>
                </div>
              ))}
              <div className="text-xs text-[#8B949E] uppercase pt-2">Top Losers</div>
              {losers.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><AssetIcon symbol={a.symbol} fallback={a.icon} size={22} />{a.symbol}</span>
                  <span className="text-red-400">{formatPercent(a.changePercent24h)}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Link href="/wallet" className="text-xs text-amber-400 hover:text-amber-300">View all</Link>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8B949E]">No activity yet.</div>
          ) : (
            transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#21262D]/50 last:border-0">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', ['DEPOSIT', 'BUY', 'REWARD', 'ADMIN_ADJUSTMENT'].includes(t.type) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                  {['DEPOSIT', 'BUY', 'REWARD', 'ADMIN_ADJUSTMENT'].includes(t.type) ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{TRANSACTION_TYPE_LABELS[t.type] || t.type} {t.symbol}</div>
                  <div className="text-xs text-[#8B949E]">{formatDate(t.createdAt, 'relative')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{t.amount} {t.symbol}</div>
                  <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'} size="sm">{t.status}</Badge>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
