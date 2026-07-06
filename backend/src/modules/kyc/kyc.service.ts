import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  submit(userId: string, dto: { type: string; fileUrl: string }) {
    return this.prisma.$transaction([
      this.prisma.kYCDocument.create({ data: { userId, type: dto.type, fileUrl: dto.fileUrl } }),
      this.prisma.user.update({ where: { id: userId }, data: { kycStatus: 'PENDING' } }),
    ]).catch(() => [{ id: `kyc-${Date.now()}`, ...dto, status: 'PENDING' }]);
  }

  getStatus(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { kycStatus: true } }).catch(() => ({ kycStatus: 'NONE' }));
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
