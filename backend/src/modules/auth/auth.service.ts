import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto, meta?: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } }).catch(() => null);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, country: dto.country },
    });
    await this.recordSession(user.id, meta);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto, meta?: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } }).catch(() => null);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (user.isHeld) throw new UnauthorizedException('Account on hold. Contact support.');

    if (user.twoFactorEnabled && !dto.twoFactorCode) {
      throw new UnauthorizedException('2FA_REQUIRED');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => null);
    await this.recordSession(user.id, meta);
    return this.issueTokens(user);
  }

  /** Records a login session with IP + parsed device info for the Devices page */
  private async recordSession(userId: string, meta?: { ip?: string; userAgent?: string }) {
    const ua = meta?.userAgent || '';
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    const os = /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iOS/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown OS';
    await this.prisma.loginSession.create({
      data: {
        userId,
        ipAddress: meta?.ip || null,
        deviceType: `${browser} on ${os}`,
        userAgent: ua || null,
      },
    }).catch(() => null);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } }).catch(() => null);
    return { success: true };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException();
    return this.issueTokens(user);
  }

  private async issueTokens(user: { id: string; email: string; role: string; name: string; kycStatus: string; isHeld: boolean; twoFactorEnabled: boolean }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'development_jwt_secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'development_refresh_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } }).catch(() => null);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: user.kycStatus,
        isHeld: user.isHeld,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }
}
