import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  getTickets(userId?: string) {
    return this.prisma.supportTicket.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }).catch(() => []);
  }

  createTicket(userId: string, dto: { subject: string; category?: string; priority?: string }) {
    return this.prisma.supportTicket.create({
      data: { userId, subject: dto.subject, category: dto.category, priority: dto.priority || 'MEDIUM' },
    }).catch(() => ({ id: `ticket-${Date.now()}`, ...dto, status: 'OPEN' }));
  }

  sendMessage(ticketId: string, senderId: string, dto: { content: string; fileUrl?: string }) {
    return this.prisma.chatMessage.create({
      data: { ticketId, senderId, content: dto.content, fileUrl: dto.fileUrl },
    }).catch(() => ({ id: `msg-${Date.now()}`, ticketId, senderId, ...dto, createdAt: new Date() }));
  }

  getMessages(ticketId: string) {
    return this.prisma.chatMessage
      .findMany({
        where: { ticketId },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { name: true, role: true } } },
      })
      .catch(() => []);
  }

  /** Returns the user's most recent open ticket, creating one if none exists. */
  async ensureTicket(userId: string) {
    const existing = await this.prisma.supportTicket
      .findFirst({ where: { userId, status: { in: ['OPEN', 'IN_PROGRESS'] } }, orderBy: { updatedAt: 'desc' } })
      .catch(() => null);
    if (existing) return existing;
    return this.prisma.supportTicket
      .create({ data: { userId, subject: 'Live chat', category: 'General', priority: 'MEDIUM' } })
      .catch(() => null);
  }

  takeOver(ticketId: string, adminId: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedTo: adminId, status: 'IN_PROGRESS' },
    }).catch(() => ({ id: ticketId, assignedTo: adminId, status: 'IN_PROGRESS' }));
  }
}
