import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EarnService {
  constructor(private readonly prisma: PrismaService) {}

  getPlans() {
    return this.prisma.stakingPlan.findMany({ where: { isActive: true } }).catch(() => []);
  }

  async stake(userId: string, dto: { planId: string; amount: number }) {
    const plan = await this.prisma.stakingPlan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Staking plan not found');
    if (dto.amount < Number(plan.minAmount)) {
      throw new BadRequestException(`Minimum stake is ${plan.minAmount} ${plan.asset}`);
    }

    // Enforce real balance: user must hold enough of the asset
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId_asset: { userId, asset: plan.asset } },
    });
    if (!wallet || Number(wallet.balance) < dto.amount) {
      throw new BadRequestException(
        `Insufficient ${plan.asset} balance. Available: ${wallet ? Number(wallet.balance) : 0} ${plan.asset}`,
      );
    }

    // Atomically move funds from available balance into the staked position
    const [, position] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId_asset: { userId, asset: plan.asset } },
        data: {
          balance: { decrement: dto.amount },
          lockedBalance: { increment: dto.amount },
        },
      }),
      this.prisma.stakingPosition.create({
        data: {
          userId,
          planId: plan.id,
          amount: dto.amount,
          endDate: plan.isFlexible ? null : new Date(Date.now() + plan.duration * 86400000),
        },
        include: { plan: true },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'STAKE',
          asset: plan.asset,
          amount: dto.amount,
          status: 'COMPLETED',
          note: `Staked into ${plan.name}`,
          usdValue: 0,
        },
      }),
    ]);

    return position;
  }

  async unstake(userId: string, positionId: string) {
    const pos = await this.prisma.stakingPosition.findFirst({
      where: { id: positionId, userId, status: 'ACTIVE' },
      include: { plan: true },
    });
    if (!pos) throw new NotFoundException('Active position not found');

    // Fixed-term plans can't be exited before maturity
    if (!pos.plan.isFlexible && pos.endDate && pos.endDate > new Date()) {
      throw new BadRequestException(
        `This position is locked until ${pos.endDate.toISOString().split('T')[0]}`,
      );
    }

    const total = Number(pos.amount) + Number(pos.earned);
    const [updated] = await this.prisma.$transaction([
      this.prisma.stakingPosition.update({
        where: { id: positionId },
        data: { status: 'COMPLETED' },
      }),
      this.prisma.wallet.update({
        where: { userId_asset: { userId, asset: pos.plan.asset } },
        data: {
          balance: { increment: total },
          lockedBalance: { decrement: Number(pos.amount) },
        },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'UNSTAKE',
          asset: pos.plan.asset,
          amount: total,
          status: 'COMPLETED',
          note: `Unstaked from ${pos.plan.name} (incl. ${pos.earned} rewards)`,
          usdValue: 0,
        },
      }),
    ]);

    return updated;
  }

  getPositions(userId: string) {
    return this.prisma.stakingPosition
      .findMany({ where: { userId }, include: { plan: true }, orderBy: { startDate: 'desc' } })
      .catch(() => []);
  }
}
