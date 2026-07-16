import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { assertNotHeld } from '../../common/account.util';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getBalances(userId: string) {
    return this.prisma.wallet.findMany({ where: { userId } }).catch(() => []);
  }

  async deposit(userId: string, dto: { asset: string; amount: number; network?: string; txHash?: string }) {
    await assertNotHeld(this.prisma, userId);
    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        asset: dto.asset,
        amount: dto.amount,
        network: dto.network,
        txHash: dto.txHash,
        status: 'PENDING',
        usdValue: dto.amount,
      },
    });
    await this.notifications.notify(userId, {
      title: 'Deposit received — pending confirmation',
      body: `Your deposit of ${dto.amount} ${dto.asset}${dto.network ? ` via ${dto.network}` : ''} has been detected and is awaiting network confirmation. Funds will be credited automatically.`,
      type: 'TRANSACTION',
      email: true,
    });
    await this.notifications.notifyAdmin(
      'New deposit pending approval',
      `A deposit of ${dto.amount} ${dto.asset}${dto.network ? ` (${dto.network})` : ''} from user ${userId} is pending. Review it in Admin → Transactions.`,
    );
    return tx;
  }

  async withdraw(userId: string, dto: { asset: string; amount: number; toAddress: string; network: string }) {
    await assertNotHeld(this.prisma, userId);
    if (!dto.toAddress) throw new BadRequestException('Recipient address required');
    if (dto.amount <= 0) throw new BadRequestException('Amount must be positive');

    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        asset: dto.asset,
        amount: dto.amount,
        toAddress: dto.toAddress,
        network: dto.network,
        status: 'PENDING',
        fee: dto.amount * 0.001,
        usdValue: dto.amount,
      },
    });
    await this.notifications.notify(userId, {
      title: 'Withdrawal request submitted',
      body: `Your withdrawal of ${dto.amount} ${dto.asset} to ${dto.toAddress.slice(0, 10)}…${dto.toAddress.slice(-6)} (${dto.network}) is being reviewed. You'll be notified once it's processed.`,
      type: 'TRANSACTION',
      email: true,
    });
    await this.notifications.notifyAdmin(
      'Withdrawal request needs review',
      `User ${userId} requested a withdrawal of ${dto.amount} ${dto.asset} to ${dto.toAddress} (${dto.network}). Approve or reject it in Admin → Transactions.`,
    );
    return tx;
  }

  async transfer(userId: string, dto: { asset: string; amount: number; toUserId: string }) {
    return this.prisma.transaction.create({
      data: { userId, type: 'TRANSFER', asset: dto.asset, amount: dto.amount, toAddress: dto.toUserId, status: 'COMPLETED', usdValue: dto.amount },
    }).catch(() => ({ id: `tx-${Date.now()}`, ...dto, status: 'COMPLETED' }));
  }

  async history(userId: string, limit = 50) {
    return this.prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit }).catch(() => []);
  }

  async getDepositAddress(asset: string, network: string) {
    return this.prisma.walletConfig.findFirst({ where: { asset, network, isActive: true } }).catch(() => null);
  }

  async listActiveConfigs() {
    return this.prisma.walletConfig
      .findMany({ where: { isActive: true }, orderBy: [{ asset: 'asc' }, { network: 'asc' }] })
      .catch(() => []);
  }
}
