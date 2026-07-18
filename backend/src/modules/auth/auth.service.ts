import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly notifications: NotificationsService,
  ) {}

  async register(dto: RegisterDto, meta?: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } }).catch(() => null);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, country: dto.country },
    });

    // No session and no tokens yet — the account is unusable until the emailed
    // OTP is confirmed.
    await this.sendEmailOtp(user.id, user.email, user.name);
    await this.notifications.notifyAdmin(
      'New user registration',
      `${user.name} (${user.email}) just created an account${dto.country ? ` from ${dto.country}` : ''} and is pending email verification.`,
    );
    return { requiresVerification: true, email: user.email };
  }

  /** Generates a 6-digit OTP, stores it hashed, and emails it. */
  private async sendEmailOtp(userId: string, email: string, name: string) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const emailOtpHash = await bcrypt.hash(code, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailOtpHash, emailOtpExpires: new Date(Date.now() + 15 * 60 * 1000) },
    });

    await this.notifications.sendEmail(
      email,
      'Verify your email',
      this.notifications.emailHtml(
        name,
        'Verify your email address',
        `Welcome to Bridge Capital. Use the verification code below to activate your account — it expires in 15 minutes.
        <br/><br/>
        <span style="display:inline-block;background:#f6f7f9;border:1px solid #e4e7eb;border-radius:10px;padding:14px 26px;font-size:30px;font-weight:800;letter-spacing:8px;color:#0A1A3A">${code}</span>
        <br/><br/>
        If you didn't create an account, you can safely ignore this email.`,
        null,
      ),
    );
  }

  /** Confirms the OTP and, on success, activates the account and signs the user in. */
  async verifyEmail(email: string, code: string, meta?: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email } }).catch(() => null);
    if (!user) throw new UnauthorizedException('Invalid verification code');
    if (user.emailVerified) throw new BadRequestException('This email is already verified. You can sign in.');
    if (!user.emailOtpHash || !user.emailOtpExpires || user.emailOtpExpires < new Date()) {
      throw new UnauthorizedException('That code has expired. Request a new one.');
    }
    const ok = await bcrypt.compare(String(code).trim(), user.emailOtpHash);
    if (!ok) throw new UnauthorizedException('Invalid verification code');

    const verified = await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailOtpHash: null, emailOtpExpires: null, lastLoginAt: new Date() },
    });

    await this.recordSession(user.id, meta);
    await this.notifications.notify(user.id, {
      title: 'Welcome to Bridge Capital 🎉',
      body: 'Your email has been verified and your account is active. Complete KYC verification in Settings to unlock deposits, withdrawals, and full trading limits.',
      type: 'ACCOUNT',
      email: true,
      event: 'welcome',
    });
    return this.issueTokens(verified);
  }

  /** Re-sends the OTP. Always resolves OK so accounts can't be enumerated. */
  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } }).catch(() => null);
    if (user && !user.emailVerified) {
      await this.sendEmailOtp(user.id, user.email, user.name);
    }
    return { success: true, message: 'If that account needs verification, a new code has been sent.' };
  }

  async login(dto: LoginDto, meta?: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } }).catch(() => null);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Unverified signups can't sign in — resend the code and tell the client to
    // route to the verification screen.
    if (!user.emailVerified) {
      await this.sendEmailOtp(user.id, user.email, user.name).catch(() => null);
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    // Held accounts CAN sign in and browse — transactions are what's blocked.
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
    const deviceType = `${browser} on ${os}`;

    // Security alert when this device has never been seen on the account
    const known = await this.prisma.loginSession
      .findFirst({ where: { userId, deviceType } })
      .catch(() => null);

    const geo = await this.geolocate(meta?.ip);
    const place = [geo.city, geo.country].filter(Boolean).join(', ');

    await this.prisma.loginSession.create({
      data: {
        userId,
        ipAddress: meta?.ip || null,
        country: geo.country || null,
        city: geo.city || null,
        deviceType,
        userAgent: ua || null,
      },
    }).catch(() => null);

    if (!known) {
      await this.notifications.notify(userId, {
        title: 'Login from a new device',
        body: `A sign-in to your account was detected from ${deviceType}${place ? ` in ${place}` : ''}${meta?.ip ? ` (IP ${meta.ip})` : ''}. If this wasn't you, change your password immediately and contact support.`,
        type: 'SECURITY',
        email: true,
        event: 'security',
      });
    }
  }

  /** Best-effort IP → city/country lookup (free ip-api.com). Skips private IPs. */
  private async geolocate(ip?: string): Promise<{ city?: string; country?: string }> {
    if (!ip || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|fc|fd|localhost)/i.test(ip)) {
      return {};
    }
    try {
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,country`);
      if (!res.ok) return {};
      const data = (await res.json()) as { status?: string; city?: string; country?: string };
      if (data.status !== 'success') return {};
      return { city: data.city, country: data.country };
    } catch {
      return {};
    }
  }

  /** Sends a password-reset link. Always resolves OK so emails can't be enumerated. */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } }).catch(() => null);
    if (user) {
      const { randomBytes } = await import('crypto');
      const token = randomBytes(24).toString('hex');
      const resetTokenHash = await bcrypt.hash(token, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetTokenHash, resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000) },
      });
      const base = (process.env.FRONTEND_URL || 'https://bridgecapitalv1.com').replace(/\/$/, '');
      const link = `${base}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      await this.notifications.sendEmail(
        email,
        'Reset your password',
        this.notifications.emailHtml(
          user.name,
          'Password reset requested',
          `We received a request to reset your Bridge Capital password. Click the button below to choose a new one — this link expires in 30 minutes.<br/><br/>If you didn't request this, you can safely ignore this email and your password will stay the same.`,
          { label: 'Reset Password', url: link },
        ),
      );
    }
    return { success: true, message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    const user = await this.prisma.user.findUnique({ where: { email } }).catch(() => null);
    if (!user || !user.resetTokenHash || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new UnauthorizedException('Reset link is invalid or has expired. Request a new one.');
    }
    const ok = await bcrypt.compare(token, user.resetTokenHash);
    if (!ok) throw new UnauthorizedException('Reset link is invalid or has expired. Request a new one.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetTokenHash: null, resetTokenExpires: null, refreshTokenHash: null },
    });
    await this.notifications.notify(user.id, {
      title: 'Your password was changed',
      body: 'Your account password was just reset. If this was not you, contact support immediately.',
      type: 'SECURITY',
      email: true,
      event: 'security',
    });
    return { success: true };
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

  private async issueTokens(user: { id: string; email: string; role: string; name: string; kycStatus: string; isHeld: boolean; holdReason?: string | null; twoFactorEnabled: boolean }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'development_jwt_secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
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
        holdReason: user.holdReason ?? null,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }
}
