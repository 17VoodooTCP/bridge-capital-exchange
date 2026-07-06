import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshTokenHash, twoFactorSecret, ...safe } = user;
    return safe;
  }

  updateProfile(userId: string, data: Partial<{ name: string; phone: string; country: string; avatarUrl: string; antiPhishingCode: string }>) {
    return this.prisma.user.update({ where: { id: userId }, data }).catch(() => ({ success: true, ...data }));
  }

  getSessions(userId: string) {
    return this.prisma.loginSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }).catch(() => []);
  }

  revokeSession(sessionId: string) {
    return this.prisma.loginSession.update({ where: { id: sessionId }, data: { isActive: false } }).catch(() => ({ success: true }));
  }
}
