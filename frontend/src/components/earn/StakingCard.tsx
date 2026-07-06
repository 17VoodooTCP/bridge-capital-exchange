'use client';
import React, { useState } from 'react';
import { Lock, Unlock, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { formatNumber, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { StakingPlan } from '@/types';

interface StakingCardProps {
  plan: StakingPlan;
  stakedAmount?: number;
  earned?: number;
  className?: string;
}

export function StakingCard({ plan, stakedAmount = 0, earned = 0, className }: StakingCardProps) {
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isStaked = stakedAmount > 0;

  const handleStake = async () => {
    const num = parseFloat(amount);
    if (!num || num < plan.minAmount) {
      return toast.error(`Minimum stake is ${plan.minAmount} ${plan.symbol}`);
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success(`Successfully staked ${formatNumber(num)} ${plan.symbol}!`);
    setIsLoading(false);
    setShowStakeModal(false);
    setAmount('');
  };

  const handleUnstake = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success(`Unstaked ${formatNumber(stakedAmount)} ${plan.symbol}`);
    setIsLoading(false);
  };

  const utilization = plan.totalStaked / (plan.totalStaked + plan.availableQuota);

  return (
    <>
      <Card className={className} hover>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <AssetIcon symbol={plan.symbol} fallback={plan.icon} size={48} />
              <div>
                <div className="font-semibold text-[#E6EDF3]">{plan.symbol}</div>
                <div className="text-xs text-[#8B949E]">{plan.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-400">{plan.apr}%</div>
              <div className="text-xs text-[#8B949E]">APR</div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2 mb-4">
            {plan.isFlexible ? (
              <Badge variant="success" size="sm">
                <Unlock size={10} /> Flexible
              </Badge>
            ) : (
              <Badge variant="info" size="sm">
                <Lock size={10} /> {plan.duration}D Lock
              </Badge>
            )}
            <Badge variant="warning" size="sm">
              <TrendingUp size={10} /> High Yield
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs text-[#8B949E] mb-4">{plan.description}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#111318] rounded-lg p-3">
              <div className="text-xs text-[#8B949E]">Min. Stake</div>
              <div className="text-sm font-mono font-semibold text-[#E6EDF3] mt-0.5">
                {plan.minAmount} {plan.symbol}
              </div>
            </div>
            <div className="bg-[#111318] rounded-lg p-3">
              <div className="text-xs text-[#8B949E]">Duration</div>
              <div className="text-sm font-semibold text-[#E6EDF3] mt-0.5 flex items-center gap-1">
                <Clock size={12} />
                {plan.isFlexible ? 'Flexible' : `${plan.duration} Days`}
              </div>
            </div>
          </div>

          {/* If staked */}
          {isStaked && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#8B949E]">Your Stake</span>
                <span className="text-amber-400 font-mono">{formatNumber(stakedAmount)} {plan.symbol}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8B949E]">Earned</span>
                <span className="text-green-400 font-mono">+{formatNumber(earned, 6)} {plan.symbol}</span>
              </div>
            </div>
          )}

          {/* Capacity bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#8B949E] mb-1">
              <span>Pool Utilization</span>
              <span>{(utilization * 100).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${utilization * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              fullWidth
              size="sm"
              onClick={() => setShowStakeModal(true)}
            >
              Stake Now
            </Button>
            {isStaked && (
              <Button
                variant="outline"
                size="sm"
                isLoading={isLoading}
                onClick={handleUnstake}
              >
                Unstake
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Stake Modal */}
      <Modal isOpen={showStakeModal} onClose={() => setShowStakeModal(false)} title={`Stake ${plan.symbol}`} size="sm">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">{plan.icon}</div>
            <div className="text-3xl font-bold text-amber-400">{plan.apr}% APR</div>
            <div className="text-sm text-[#8B949E] mt-1">
              {plan.isFlexible ? 'Flexible — Unstake anytime' : `${plan.duration}-day lock period`}
            </div>
          </div>

          <Input
            label={`Amount (${plan.symbol})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min. ${plan.minAmount} ${plan.symbol}`}
            suffix={plan.symbol}
            hint={`Balance: 4.32 ETH` /* mock */}
          />

          {parseFloat(amount) > 0 && (
            <div className="bg-[#111318] rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8B949E]">Daily Earnings</span>
                <span className="text-green-400 font-mono">
                  +{((parseFloat(amount) * plan.apr) / 100 / 365).toFixed(6)} {plan.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B949E]">
                  {plan.duration > 0 ? `${plan.duration}-Day Earnings` : '30-Day Est.'}
                </span>
                <span className="text-green-400 font-mono">
                  +{((parseFloat(amount) * plan.apr) / 100 / 365 * (plan.duration || 30)).toFixed(4)} {plan.symbol}
                </span>
              </div>
            </div>
          )}

          <Button
            variant="default"
            fullWidth
            size="lg"
            isLoading={isLoading}
            onClick={handleStake}
          >
            Confirm Stake
          </Button>
        </div>
      </Modal>
    </>
  );
}
