import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { assertNotHeld } from '../../common/account.util';

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

  async copy(userId: string, dto: { traderId: string; allocation: number; asset?: string }) {
    await assertNotHeld(this.prisma, userId);
    const trader = await this.prisma.trader.findUnique({ where: { id: dto.traderId } });
    if (!trader) throw new NotFoundException('Trader not found');

    const asset = (dto.asset || 'USDT').toUpperCase();
    const allocation = Number(dto.allocation) || 0;
    if (allocation <= 0) throw new BadRequestException('Enter an allocation amount');

    const existing = await this.prisma.copyPosition.findFirst({
      where: { userId, traderId: dto.traderId, status: 'ACTIVE' },
    });
    if (existing) throw new BadRequestException('You are already copying this trader');

    // Must have enough balance in the chosen asset
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId_asset: { userId, asset } },
    });
    if (!wallet || Number(wallet.balance) < allocation) {
      throw new BadRequestException(
        `Insufficient ${asset} balance. Available: ${wallet ? Number(wallet.balance) : 0} ${asset}`,
      );
    }

    const result = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId_asset: { userId, asset } },
        data: { balance: { decrement: allocation }, lockedBalance: { increment: allocation } },
      }),
      this.prisma.copyPosition.create({
        data: { userId, traderId: dto.traderId, asset, allocation },
        include: { trader: true },
      }),
      this.prisma.trader.update({ where: { id: dto.traderId }, data: { copiers: { increment: 1 } } }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'TRANSFER',
          asset,
          amount: allocation,
          status: 'COMPLETED',
          note: `Copy allocation → ${trader.name} (${trader.strategy})`,
          usdValue: asset === 'USDT' || asset === 'USDC' ? allocation : 0,
        },
      }),
    ]);
    const position = result[1];

    await this.notifications.notify(userId, {
      title: 'Copy trade connected',
      body: `You are now copying ${trader.name} (${trader.strategy}) with ${allocation} ${asset}. Trades from this strategy will be mirrored to your allocated balance.`,
      type: 'GENERAL',
      email: true,
      event: 'copyTrade',
    });

    return position;
  }

  async stop(userId: string, positionId: string) {
    const pos = await this.prisma.copyPosition.findFirst({
      where: { id: positionId, userId, status: 'ACTIVE' },
      include: { trader: true },
    });
    if (!pos) throw new NotFoundException('Active copy position not found');

    // Return the allocation (plus any admin-set P&L) to the wallet balance
    const returned = Number(pos.allocation) + Number(pos.pnl);
    const updated = await this.prisma.$transaction([
      this.prisma.copyPosition.update({
        where: { id: positionId },
        data: { status: 'STOPPED', stoppedAt: new Date() },
      }),
      this.prisma.trader.update({ where: { id: pos.traderId }, data: { copiers: { decrement: 1 } } }),
      this.prisma.wallet.update({
        where: { userId_asset: { userId, asset: pos.asset } },
        data: {
          balance: { increment: returned > 0 ? returned : 0 },
          lockedBalance: { decrement: Number(pos.allocation) },
        },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'TRANSFER',
          asset: pos.asset,
          amount: returned > 0 ? returned : 0,
          status: 'COMPLETED',
          note: `Copy allocation released ← ${pos.trader.name}${pos.pnl ? ` (P&L ${pos.pnl >= 0 ? '+' : ''}${pos.pnl})` : ''}`,
          usdValue: pos.asset === 'USDT' || pos.asset === 'USDC' ? Math.max(returned, 0) : 0,
        },
      }),
    ]).then(([p]) => p);

    await this.notifications.notify(userId, {
      title: 'Copy trade disconnected',
      body: `You have stopped copying ${pos.trader.name}. Your allocation of ${pos.allocation} ${pos.asset} has been returned to your wallet.`,
      type: 'GENERAL',
      email: true,
      event: 'copyTrade',
    });

    return updated;
  }

  // ─── Admin: adjust the Copy P&L shown on a position ───────────────
  async adminListPositions(userId?: string) {
    return this.prisma.copyPosition
      .findMany({
        where: { status: 'ACTIVE', ...(userId ? { userId } : {}) },
        include: { trader: true, user: { select: { name: true, email: true } } },
        orderBy: { startedAt: 'desc' },
      })
      .catch(() => []);
  }

  async adjustPnl(positionId: string, pnl: number) {
    const pos = await this.prisma.copyPosition.findUnique({ where: { id: positionId } });
    if (!pos) throw new NotFoundException('Position not found');
    const updated = await this.prisma.copyPosition.update({
      where: { id: positionId },
      data: { pnl: Number(pnl) },
      include: { trader: true },
    });
    await this.notifications.notify(pos.userId, {
      title: 'Copy trading P&L updated',
      body: `Your copy position P&L is now ${Number(pnl) >= 0 ? '+' : ''}${Number(pnl)} ${pos.asset}.`,
      type: 'GENERAL',
      email: true,
      event: 'copyTrade',
    });
    return updated;
  }
}
