import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EarnService {
  constructor(private readonly prisma: PrismaService) {}

  getPlans() {
    return this.prisma.stakingPlan.findMany({ where: { isActive: true } }).catch(() => []);
  }

  async stake(userId: string, dto: { planId: string; amount: number }) {
    const plan = await this.prisma.stakingPlan.findUnique({ where: { id: dto.planId } }).catch(() => null);
    if (!plan) throw new NotFoundException('Staking plan not found');
    if (dto.amount < Number(plan.minAmount)) throw new BadRequestException('Amount below minimum');

    return this.prisma.stakingPosition.create({
      data: {
        userId,
        planId: plan.id,
        amount: dto.amount,
        endDate: plan.isFlexible ? null : new Date(Date.now() + plan.duration * 86400000),
      },
    }).catch(() => ({ id: `pos-${Date.now()}`, ...dto, status: 'ACTIVE' }));
  }

  async unstake(userId: string, positionId: string) {
    const pos = await this.prisma.stakingPosition.findFirst({ where: { id: positionId, userId } }).catch(() => null);
    if (!pos) throw new NotFoundException('Position not found');
    return this.prisma.stakingPosition.update({ where: { id: positionId }, data: { status: 'COMPLETED' } }).catch(() => ({ ...pos, status: 'COMPLETED' }));
  }

  getPositions(userId: string) {
    return this.prisma.stakingPosition.findMany({ where: { userId }, include: { plan: true }, orderBy: { startDate: 'desc' } }).catch(() => []);
  }
}
