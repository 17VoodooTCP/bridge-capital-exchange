import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

/** Formats a numeric/Decimal amount as whole USD, e.g. $500,000 */
const fmtUsd = (v: unknown) =>
  Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async submit(userId: string, dto: { type: string; fileUrl: string }) {
    const result = await this.prisma.$transaction([
      this.prisma.kYCDocument.create({ data: { userId, type: dto.type, fileUrl: dto.fileUrl } }),
      this.prisma.user.update({ where: { id: userId }, data: { kycStatus: 'PENDING' } }),
    ]);
    const user = await this.prisma.user
      .findUnique({ where: { id: userId }, select: { name: true, email: true } })
      .catch(() => null);
    await this.notifications.notifyAdmin(
      'New KYC submission',
      `${user?.name || 'A user'} (${user?.email || userId}) submitted a ${dto.type.replace(/_/g, ' ').toLowerCase()} for identity verification. Review it in Admin → KYC Review.`,
    );
    return result;
  }

  /**
   * User-initiated request to raise their withdrawal limit. Alerts staff for
   * manual review and confirms to the user in-app + by email.
   */
  async requestLimitIncrease(
    userId: string,
    dto: { requestedLimit: number; reason?: string },
  ) {
    if (!dto?.requestedLimit || Number(dto.requestedLimit) <= 0) {
      throw new BadRequestException('Enter the daily withdrawal limit you need.');
    }
    const user = await this.prisma.user
      .findUnique({ where: { id: userId }, select: { name: true, email: true, kycStatus: true, withdrawalLimit: true } })
      .catch(() => null);

    if (user && user.kycStatus !== 'APPROVED') {
      throw new BadRequestException('Complete identity verification before requesting a higher limit.');
    }

    // Only one open request at a time
    const existing = await this.prisma.limitIncreaseRequest
      .findFirst({ where: { userId, status: 'PENDING' } })
      .catch(() => null);
    if (existing) {
      throw new BadRequestException('You already have a limit increase request under review.');
    }

    const currentLimit = Number(user?.withdrawalLimit ?? 100000);
    const request = await this.prisma.limitIncreaseRequest.create({
      data: {
        userId,
        currentLimit,
        requestedLimit: Number(dto.requestedLimit),
        reason: dto.reason,
      },
    });

    const limit = fmtUsd(dto.requestedLimit);

    await this.notifications.notifyAdmin(
      'Withdrawal limit increase requested',
      `${user?.name || 'A user'} (${user?.email || userId}) requested a daily withdrawal limit of ${limit} (currently ${fmtUsd(currentLimit)}).${dto.reason ? ` Reason: ${dto.reason}` : ''} Approve or reject it in Admin → KYC Review.`,
    );

    await this.notifications.notify(userId, {
      title: 'Limit increase request received',
      body: `We've received your request to raise your daily withdrawal limit to ${limit}. Our compliance team will review it and respond within 1-2 business days.`,
      type: 'KYC',
      email: true,
      event: 'kyc',
    });

    return request;
  }

  // ─── Admin: review limit increase requests ────────────────────────

  listLimitRequests(status = 'PENDING') {
    return this.prisma.limitIncreaseRequest
      .findMany({
        where: status === 'ALL' ? undefined : { status },
        include: { user: { select: { name: true, email: true, kycStatus: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
      .catch(() => []);
  }

  async reviewLimitRequest(
    id: string,
    approve: boolean,
    reviewerId: string,
    note?: string,
  ) {
    const req = await this.prisma.limitIncreaseRequest.findUnique({ where: { id } });
    if (!req) throw new BadRequestException('Request not found');
    if (req.status !== 'PENDING') throw new BadRequestException('This request has already been reviewed.');

    const updated = await this.prisma.limitIncreaseRequest.update({
      where: { id },
      data: {
        status: approve ? 'APPROVED' : 'REJECTED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });

    // Approving actually raises the user's limit
    if (approve) {
      await this.prisma.user
        .update({ where: { id: req.userId }, data: { withdrawalLimit: req.requestedLimit } })
        .catch(() => null);
    }

    await this.notifications.notify(req.userId, {
      title: approve ? 'Withdrawal limit increased ✓' : 'Limit increase request declined',
      body: approve
        ? `Your daily withdrawal limit has been raised to ${fmtUsd(req.requestedLimit)}. It's active immediately.`
        : `We couldn't approve your request to raise your daily withdrawal limit to ${fmtUsd(req.requestedLimit)}${note ? `: ${note}` : '.'} Your current limit of ${fmtUsd(req.currentLimit)} still applies. Contact support if you'd like to discuss it.`,
      type: 'KYC',
      email: true,
      event: 'kyc',
    });

    return updated;
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user
      .findUnique({ where: { id: userId }, select: { kycStatus: true, withdrawalLimit: true } })
      .catch(() => null);
    const pending = await this.prisma.limitIncreaseRequest
      .findFirst({ where: { userId, status: 'PENDING' }, select: { requestedLimit: true, createdAt: true } })
      .catch(() => null);
    return {
      kycStatus: user?.kycStatus || 'NONE',
      withdrawalLimit: Number(user?.withdrawalLimit ?? 100000),
      pendingLimitRequest: pending ? { requestedLimit: Number(pending.requestedLimit), createdAt: pending.createdAt } : null,
    };
  }

  listPending() {
    return this.prisma.kYCDocument.findMany({ where: { status: 'PENDING' }, include: { user: true } }).catch(() => []);
  }

  async review(docId: string, decision: 'APPROVED' | 'REJECTED', reviewerId: string, note?: string) {
    const doc = await this.prisma.kYCDocument.update({
      where: { id: docId },
      data: { status: decision, reviewedBy: reviewerId, reviewedAt: new Date(), reviewNote: note },
    }).catch(() => null);
    if (doc) {
      await this.prisma.user.update({ where: { id: doc.userId }, data: { kycStatus: decision } }).catch(() => null);
      await this.notifications.notify(doc.userId, {
        event: 'kyc' as const,
        title: decision === 'APPROVED' ? 'Identity verification approved ✓' : 'Identity verification rejected',
        body: decision === 'APPROVED'
          ? 'Your KYC documents were approved. You now have full access to deposits, withdrawals, and trading.'
          : `Your KYC submission was rejected${note ? `: ${note}` : ''}. Please upload new, clearly legible documents in Settings → KYC.`,
        type: 'KYC',
        email: true,
      });
    }
    return doc || { id: docId, status: decision };
  }
}
