import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type NotifType = 'GENERAL' | 'TRANSACTION' | 'SECURITY' | 'KYC' | 'ACCOUNT';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── In-app notifications ─────────────────────────────────────────

  list(userId: string, limit = 30) {
    return this.prisma.notification
      .findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit })
      .catch(() => []);
  }

  markRead(userId: string, id: string) {
    return this.prisma.notification
      .updateMany({ where: { id, userId }, data: { isRead: true } })
      .catch(() => null);
  }

  markAllRead(userId: string) {
    return this.prisma.notification
      .updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
      .catch(() => null);
  }

  /**
   * Creates an in-app notification and (optionally) sends the same message
   * by email. All platform events funnel through here.
   */
  async notify(
    userId: string,
    opts: { title: string; body: string; type?: NotifType; email?: boolean },
  ) {
    await this.prisma.notification
      .create({ data: { userId, title: opts.title, body: opts.body, type: opts.type || 'GENERAL' } })
      .catch(() => null);

    if (opts.email) {
      const user = await this.prisma.user
        .findUnique({ where: { id: userId }, select: { email: true, name: true } })
        .catch(() => null);
      if (user) await this.sendEmail(user.email, opts.title, this.emailHtml(user.name, opts.title, opts.body));
    }
  }

  // ─── Email delivery (Resend) ──────────────────────────────────────

  async sendEmail(to: string, subject: string, html: string) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      this.logger.warn(`RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
      return { skipped: true };
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || 'Bridge Capital <onboarding@resend.dev>',
          to: [to],
          subject: `${subject} — Bridge Capital Exchange`,
          html,
        }),
      });
      if (!res.ok) this.logger.error(`Resend error ${res.status}: ${await res.text()}`);
      return { sent: res.ok };
    } catch (e) {
      this.logger.error(`Email send failed: ${e}`);
      return { sent: false };
    }
  }

  private emailHtml(name: string, title: string, body: string) {
    return `
<div style="background:#0A0B0D;padding:40px 16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#161B22;border:1px solid #21262D;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#F59E0B,#EA580C);padding:20px 28px">
      <span style="font-size:18px;font-weight:bold;color:#000">Bridge Capital Exchange</span>
    </div>
    <div style="padding:28px;color:#E6EDF3">
      <h2 style="margin:0 0 12px;font-size:18px">${title}</h2>
      <p style="margin:0 0 8px;color:#8B949E;font-size:14px;line-height:1.6">Hi ${name},</p>
      <p style="margin:0 0 20px;color:#E6EDF3;font-size:14px;line-height:1.6">${body}</p>
      <a href="${process.env.FRONTEND_URL || '#'}" style="display:inline-block;background:#F59E0B;color:#000;text-decoration:none;font-weight:bold;font-size:14px;padding:10px 22px;border-radius:10px">Open Dashboard</a>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #21262D;color:#6E7681;font-size:11px;line-height:1.5">
      This is an automated message from Bridge Capital Exchange. If you did not expect this email, please contact support immediately.
    </div>
  </div>
</div>`;
  }
}
