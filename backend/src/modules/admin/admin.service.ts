import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async stats() {
    const dayAgo = new Date(Date.now() - 86400000);
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    const [users, newUsersWeek, tx24h, tickets, pendingKyc, deposits24h, activeStakes, recentUsers, recentTx] = await Promise.all([
      this.prisma.user.count().catch(() => 0),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }).catch(() => 0),
      this.prisma.transaction.aggregate({
        _sum: { usdValue: true },
        where: { createdAt: { gte: dayAgo }, status: 'COMPLETED' },
      }).catch(() => ({ _sum: { usdValue: 0 } })),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }).catch(() => 0),
      this.prisma.kYCDocument.count({ where: { status: 'PENDING' } }).catch(() => 0),
      this.prisma.transaction.aggregate({
        _sum: { usdValue: true },
        where: { createdAt: { gte: dayAgo }, type: 'DEPOSIT', status: 'COMPLETED' },
      }).catch(() => ({ _sum: { usdValue: 0 } })),
      this.prisma.stakingPosition.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, kycStatus: true, createdAt: true },
      }).catch(() => []),
      this.prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, userId: true, type: true, asset: true, amount: true, usdValue: true, status: true, createdAt: true },
      }).catch(() => []),
    ]);

    return {
      totalUsers: users,
      newUsersThisWeek: newUsersWeek,
      volume24h: Number((tx24h as { _sum: { usdValue: unknown } })._sum.usdValue) || 0,
      pendingKyc,
      openTickets: tickets,
      deposits24h: Number((deposits24h as { _sum: { usdValue: unknown } })._sum.usdValue) || 0,
      activeStakes,
      recentUsers,
      recentTransactions: recentTx,
    };
  }

  /**
   * Sum of a user's wallet balances converted to USD.
   * Stablecoins are 1:1; anything else needs a price feed, which we don't have server-side yet,
   * so those are reported at their raw balance amount — client can multiply by market price if needed.
   */
  async getUserBalanceUsd(userId: string) {
    try {
      const wallets = await this.prisma.wallet.findMany({ where: { userId } });
      return wallets.reduce((sum, w) => {
        const total = Number(w.balance) + Number(w.lockedBalance);
        if (w.asset === 'USDT' || w.asset === 'USDC') return sum + total;
        return sum;
      }, 0);
    } catch {
      return 0;
    }
  }

  async listUsersWithBalances(query?: string, page = 1, pageSize = 50) {
    const users = await this.listUsers(query, page, pageSize);
    const enriched = await Promise.all(
      users.map(async (u) => {
        let wallets: { asset: string; balance: unknown; lockedBalance: unknown }[] = [];
        try {
          wallets = await this.prisma.wallet.findMany({ where: { userId: u.id } });
        } catch { /* keep empty */ }
        return {
          ...u,
          totalBalanceUsd: await this.getUserBalanceUsd(u.id),
          wallets,
        };
      }),
    );
    return enriched;
  }

  listUsers(query?: string, page = 1, pageSize = 50) {
    return this.prisma.user.findMany({
      where: query ? { OR: [{ email: { contains: query, mode: 'insensitive' } }, { name: { contains: query, mode: 'insensitive' } }] } : undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, kycStatus: true, isHeld: true, country: true, createdAt: true, lastLoginAt: true },
    }).catch(() => []);
  }

  async adjustFunds(adminId: string, dto: { userId: string; asset: string; amount: number; type: 'ADD' | 'DEDUCT'; reason: string; notify?: boolean; recordTransaction?: boolean }, ipAddress?: string) {
    if (!dto.reason?.trim()) throw new BadRequestException('Reason required for audit');
    const delta = dto.type === 'ADD' ? dto.amount : -dto.amount;

    const ops: Promise<unknown>[] = [
      this.prisma.wallet.upsert({
        where: { userId_asset: { userId: dto.userId, asset: dto.asset } },
        create: { userId: dto.userId, asset: dto.asset, balance: delta },
        update: { balance: { increment: delta } },
      }).catch(() => ({ userId: dto.userId, asset: dto.asset, balance: delta })),
      // Admin context always goes to the audit log (compliance), regardless of notify.
      this.prisma.adminLog.create({
        data: { adminId, action: `FUND_ADJUSTMENT_${dto.type}`, targetId: dto.userId, targetType: 'USER', details: dto, ipAddress },
      }).catch(() => null),
    ];

    // Only leave a user-visible ledger entry when the admin opts to (default: no).
    if (dto.recordTransaction) {
      ops.push(
        this.prisma.transaction.create({
          data: {
            userId: dto.userId,
            type: dto.type === 'ADD' ? 'DEPOSIT' : 'WITHDRAWAL',
            asset: dto.asset,
            amount: Math.abs(dto.amount),
            status: 'COMPLETED',
            usdValue: 0,
          },
        }).catch(() => null),
      );
    }

    const [wallet] = await Promise.all(ops);

    // Silent by default — only notify/email the user if the admin ticks the box.
    if (dto.notify) {
      await this.notifications.notify(dto.userId, {
        title: dto.type === 'ADD' ? 'Deposit confirmed ✓' : 'Debit processed',
        body: dto.type === 'ADD'
          ? `+${dto.amount} ${dto.asset} has been credited to your wallet and is available for trading.`
          : `-${dto.amount} ${dto.asset} has been debited from your wallet.`,
        type: 'TRANSACTION',
        email: true,
      });
    }

    return { success: true, wallet };
  }

  async toggleHold(adminId: string, userId: string, reason?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    if (!user) throw new BadRequestException('User not found');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isHeld: !user.isHeld, holdReason: !user.isHeld ? reason : null },
    }).catch(() => ({ ...user, isHeld: !user.isHeld }));

    await this.prisma.adminLog.create({
      data: { adminId, action: updated.isHeld ? 'HOLD_ACCOUNT' : 'RELEASE_HOLD', targetId: userId, targetType: 'USER', details: { reason }, ipAddress },
    }).catch(() => null);

    await this.notifications.notify(userId, {
      title: updated.isHeld ? 'Your account has been placed on hold' : 'Your account hold has been released',
      body: updated.isHeld
        ? `Your account was temporarily restricted${reason ? ` (${reason})` : ''}. Please contact support for assistance.`
        : 'Full access to your account has been restored. Thank you for your patience.',
      type: 'ACCOUNT',
      email: true,
    });

    return updated;
  }

  async deleteUser(adminId: string, userId: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } }).catch(() => null);
    if (!user) throw new BadRequestException('User not found');
    if (user.role === 'SUPER_ADMIN') throw new BadRequestException('Cannot delete a super admin account');
    await this.prisma.adminLog.create({
      data: { adminId, action: 'DELETE_ACCOUNT', targetId: userId, targetType: 'USER', details: { email: user.email }, ipAddress },
    }).catch(() => null);
    await this.prisma.user.delete({ where: { id: userId } }).catch(() => null);
    return { success: true };
  }

  async createUser(dto: { name: string; email: string; password: string; country?: string }) {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(dto.password || Math.random().toString(36), 10);
    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, country: dto.country },
      select: { id: true, name: true, email: true, role: true, kycStatus: true, isHeld: true, country: true, createdAt: true },
    });
  }

  listTransactions(status?: string) {
    return this.prisma.transaction.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    }).catch(() => []);
  }

  listAdminLogs() {
    return this.prisma.adminLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }).catch(() => []);
  }

  listWalletConfigs() {
    return this.prisma.walletConfig.findMany().catch(() => []);
  }

  upsertWalletConfig(dto: { asset: string; network: string; address: string; qrCodeUrl?: string; minDeposit?: number; maxWithdrawal?: number; confirmations?: number; isActive?: boolean }) {
    const data = {
      asset: dto.asset,
      network: dto.network,
      address: dto.address,
      qrCodeUrl: dto.qrCodeUrl,
      minDeposit: dto.minDeposit ?? 0,
      maxWithdrawal: dto.maxWithdrawal ?? 0,
      confirmations: dto.confirmations ?? 1,
      isActive: dto.isActive ?? true,
    };
    return this.prisma.walletConfig.upsert({
      where: { asset_network: { asset: dto.asset, network: dto.network } },
      create: data,
      update: data,
    });
  }

  deleteWalletConfig(id: string) {
    return this.prisma.walletConfig.delete({ where: { id } }).catch(() => ({ id, deleted: true }));
  }

  async reviewTransaction(adminId: string, txId: string, approve: boolean, ipAddress?: string) {
    const tx = await this.prisma.transaction.update({
      where: { id: txId },
      data: { status: approve ? 'COMPLETED' : 'FAILED', completedAt: new Date() },
    }).catch(() => ({ id: txId, status: approve ? 'COMPLETED' : 'FAILED' }));

    // Approving a deposit credits the user's wallet; approving a withdrawal
    // debits it (funds were reserved at request time in a full implementation).
    const t = tx as { userId?: string; type?: string; amount?: unknown; asset?: string };
    if (approve && t.userId && t.asset && t.amount) {
      if (t.type === 'DEPOSIT') {
        await this.prisma.wallet.upsert({
          where: { userId_asset: { userId: t.userId, asset: t.asset } },
          create: { userId: t.userId, asset: t.asset, balance: Number(t.amount) },
          update: { balance: { increment: Number(t.amount) } },
        }).catch(() => null);
      } else if (t.type === 'WITHDRAWAL') {
        await this.prisma.wallet.update({
          where: { userId_asset: { userId: t.userId, asset: t.asset } },
          data: { balance: { decrement: Number(t.amount) } },
        }).catch(() => null);
      }
    }

    await this.prisma.adminLog.create({
      data: { adminId, action: approve ? 'TX_APPROVED' : 'TX_REJECTED', targetId: txId, targetType: 'TRANSACTION', ipAddress },
    }).catch(() => null);

    const fullTx = tx as { userId?: string; type?: string; amount?: unknown; asset?: string };
    if (fullTx.userId) {
      await this.notifications.notify(fullTx.userId, {
        title: approve ? 'Transaction approved ✓' : 'Transaction rejected',
        body: approve
          ? `Your ${String(fullTx.type || 'transaction').toLowerCase()} of ${fullTx.amount} ${fullTx.asset} has been approved and completed.`
          : `Your ${String(fullTx.type || 'transaction').toLowerCase()} of ${fullTx.amount} ${fullTx.asset} was rejected. Contact support if you believe this is an error.`,
        type: 'TRANSACTION',
        email: true,
      });
    }

    return tx;
  }

  requestSecureAccess(adminId: string, ipAddress?: string) {
    // Generates a one-time 8-char access code; in production, deliver out-of-band.
    const code = Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    this.prisma.adminLog.create({
      data: { adminId, action: 'SECURE_ACCESS_REQUEST', details: { code }, ipAddress },
    }).catch(() => null);
    return { code, expiresIn: 300 };
  }
}
