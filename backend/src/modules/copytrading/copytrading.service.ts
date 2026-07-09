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
      params.sort === 'roi30d' ? { roi30d: 'desc' as const } :
      params.sort === 'copiers' ? { copiers: 'desc' as const } :
      { winRate: 'desc' as const }; // default: highest win rate first
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

  // ─── Admin management ─────────────────────────────────────────────

  adminListTraders() {
    return this.prisma.trader.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
  }

  private normalize(dto: Record<string, unknown>) {
    const data: Record<string, unknown> = { ...dto };
    // Keep winRate consistent with wins/losses when those are provided
    const wins = data.wins != null ? Number(data.wins) : undefined;
    const losses = data.losses != null ? Number(data.losses) : undefined;
    if (wins != null && losses != null && wins + losses > 0) {
      data.winRate = parseFloat(((wins / (wins + losses)) * 100).toFixed(1));
    } else if (data.winRate != null) {
      data.winRate = parseFloat(Number(data.winRate).toFixed(1));
    }
    for (const k of ['wins', 'losses', 'copiers']) if (data[k] != null) data[k] = Math.round(Number(data[k]));
    for (const k of ['roi30d', 'profitSharePct', 'aum']) if (data[k] != null) data[k] = Number(data[k]);
    if (data.avatarType === 'INITIALS') data.avatarValue = null;
    return data;
  }

  async createTrader(dto: Record<string, unknown>) {
    const data = this.normalize(dto);
    if (!data.name || !data.handle) throw new BadRequestException('Name and handle are required');
    return this.prisma.trader.create({ data: data as never });
  }

  async updateTrader(id: string, dto: Record<string, unknown>) {
    const exists = await this.prisma.trader.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Trader not found');
    const data = this.normalize(dto);
    delete data.id;
    delete data.createdAt;
    return this.prisma.trader.update({ where: { id }, data: data as never });
  }

  async deleteTrader(id: string) {
    await this.prisma.copyPosition.deleteMany({ where: { traderId: id } }).catch(() => null);
    return this.prisma.trader.delete({ where: { id } }).catch(() => ({ id, deleted: true }));
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
