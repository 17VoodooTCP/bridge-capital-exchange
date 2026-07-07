import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CopyTradingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  listTraders(params: { market?: string; sort?: string; limit?: number }) {
    const orderBy =
      params.sort === 'winRate' ? { winRate: 'desc' as const } :
      params.sort === 'copiers' ? { copiers: 'desc' as const } :
      { roi30d: 'desc' as const };
    return this.prisma.trader
      .findMany({
        where: {
          isActive: true,
          ...(params.market && params.market !== 'ALL' ? { market: params.market } : {}),
        },
        orderBy,
        take: params.limit || 200,
      })
      .catch(() => []);
  }

  getMyPositions(userId: string) {
    return this.prisma.copyPosition
      .findMany({ where: { userId }, include: { trader: true }, orderBy: { startedAt: 'desc' } })
      .catch(() => []);
  }

  async copy(userId: string, dto: { traderId: string; allocation: number }) {
    const trader = await this.prisma.trader.findUnique({ where: { id: dto.traderId } });
    if (!trader) throw new NotFoundException('Trader not found');

    const existing = await this.prisma.copyPosition.findFirst({
      where: { userId, traderId: dto.traderId, status: 'ACTIVE' },
    });
    if (existing) throw new BadRequestException('You are already copying this trader');

    const position = await this.prisma.$transaction([
      this.prisma.copyPosition.create({
        data: { userId, traderId: dto.traderId, allocation: dto.allocation || 0 },
        include: { trader: true },
      }),
      this.prisma.trader.update({ where: { id: dto.traderId }, data: { copiers: { increment: 1 } } }),
    ]).then(([p]) => p);

    await this.notifications.notify(userId, {
      title: 'Copy trade connected',
      body: `You are now copying ${trader.name} (${trader.strategy}). Trades from this strategy will be mirrored to your allocated balance.`,
      type: 'GENERAL',
    });

    return position;
  }

  async stop(userId: string, positionId: string) {
    const pos = await this.prisma.copyPosition.findFirst({
      where: { id: positionId, userId, status: 'ACTIVE' },
      include: { trader: true },
    });
    if (!pos) throw new NotFoundException('Active copy position not found');

    const updated = await this.prisma.$transaction([
      this.prisma.copyPosition.update({
        where: { id: positionId },
        data: { status: 'STOPPED', stoppedAt: new Date() },
      }),
      this.prisma.trader.update({ where: { id: pos.traderId }, data: { copiers: { decrement: 1 } } }),
    ]).then(([p]) => p);

    await this.notifications.notify(userId, {
      title: 'Copy trade disconnected',
      body: `You have stopped copying ${pos.trader.name}. No further trades will be mirrored.`,
      type: 'GENERAL',
    });

    return updated;
  }
}
