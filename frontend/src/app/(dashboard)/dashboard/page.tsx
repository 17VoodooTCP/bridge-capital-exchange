'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Percent, Eye, EyeOff, Plus } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { useMarketData } from '@/hooks/useMarketData';
import {
  mockPortfolio, mockTotalPortfolioValue, mockPortfolio24hChange,
  mockPortfolio24hChangePercent, mockTransactions,
} from '@/lib/mockData';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency, formatPercent, getChangeColor, formatDate, cn } from '@/lib/utils';

const ALLOC_COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#A855F7', '#EF4444', '#14B8A6'];

export default function DashboardPage() {
  const { getTopGainers, getTopLosers } = useMarketData();
  const [hideBalance, setHideBalance] = useState(false);
  const gainers = getTopGainers(3);
  const losers = getTopLosers(3);

  const mask = (v: string) => (hideBalance ? '••••••' : v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-[#8B949E]">Welcome back, here&apos;s your overview</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link href="/wallet"><Button variant="outline" leftIcon={<ArrowDownLeft size={16} />}>Deposit</Button></Link>
          <Link href="/trade"><Button leftIcon={<TrendingUp size={16} />}>Trade</Button></Link>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#8B949E] uppercase tracking-wider mb-1">
                Total Balance
                <button onClick={() => setHideBalance(!hideBalance)}>{hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}</button>
              </div>
              <div className="text-3xl font-bold">{mask(formatCurrency(mockTotalPortfolioValue))}</div>
              <div className={cn('flex items-center gap-1 text-sm mt-1', getChangeColor(mockPortfolio24hChange))}>
                <ArrowUpRight size={14} />
                {mask(`${formatCurrency(mockPortfolio24hChange)} (${formatPercent(mockPortfolio24hChangePercent)})`)}
                <span className="text-[#8B949E]">24h</span>
              </div>
            </div>
          </div>
          <div className="mt-4"><PortfolioChart currentValue={mockTotalPortfolioValue} days={30} height={140} /></div>
        </Card>
        <StatCard label="24h P&L" value={mask(formatCurrency(mockPortfolio24hChange))} subValue={formatPercent(mockPortfolio24hChangePercent)} subValueColor="text-green-400" icon={<TrendingUp size={18} className="text-green-400" />} iconBg="bg-green-500/10" />
        <StatCard label="Monthly P&L" value={mask('+$8,420.18')} subValue="+13.2%" subValueColor="text-green-400" icon={<Percent size={18} className="text-amber-400" />} />
      </div>

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
            {mockPortfolio.map((p, i) => (
              <div key={p.asset} className="flex items-center gap-4 px-5 py-3 border-b border-[#21262D]/50 last:border-0 hover:bg-[#1C2128] transition-colors">
                <AssetIcon symbol={p.symbol} fallback={p.icon} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{p.symbol}</div>
                  <div className="text-xs text-[#8B949E]">{mask(`${p.amount} ${p.symbol}`)}</div>
                </div>
                <div className="w-16 hidden sm:block"><MiniSparkline data={[p.avgBuyPrice, p.currentPrice]} positive={p.pnl >= 0} /></div>
                <div className="text-right">
                  <div className="font-medium">{mask(formatCurrency(p.currentValue))}</div>
                  <div className={cn('text-xs', getChangeColor(p.pnlPercent))}>{formatPercent(p.pnlPercent)}</div>
                </div>
                <div className="hidden md:flex items-center gap-1 w-20 justify-end">
                  <div className="h-1.5 rounded-full" style={{ width: `${p.allocation}%`, backgroundColor: ALLOC_COLORS[i % ALLOC_COLORS.length] }} />
                  <span className="text-xs text-[#8B949E]">{p.allocation}%</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card>
            <CardHeader><h3 className="font-semibold">Quick Actions</h3></CardHeader>
            <CardBody className="grid grid-cols-2 gap-3">
              <Link href="/wallet"><Button variant="secondary" fullWidth leftIcon={<ArrowDownLeft size={15} />}>Deposit</Button></Link>
              <Link href="/wallet"><Button variant="secondary" fullWidth leftIcon={<ArrowUpRight size={15} />}>Withdraw</Button></Link>
              <Link href="/trade"><Button variant="secondary" fullWidth leftIcon={<TrendingUp size={15} />}>Trade</Button></Link>
              <Link href="/earn"><Button variant="secondary" fullWidth leftIcon={<Percent size={15} />}>Earn</Button></Link>
            </CardBody>
          </Card>

          {/* Market movers */}
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
          {mockTransactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#21262D]/50 last:border-0">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', ['DEPOSIT', 'BUY', 'REWARD'].includes(t.type) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                {['DEPOSIT', 'BUY', 'REWARD'].includes(t.type) ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{TRANSACTION_TYPE_LABELS[t.type]} {t.symbol}</div>
                <div className="text-xs text-[#8B949E]">{formatDate(t.createdAt, 'relative')}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{t.amount} {t.symbol}</div>
                <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'} size="sm">{t.status}</Badge>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
