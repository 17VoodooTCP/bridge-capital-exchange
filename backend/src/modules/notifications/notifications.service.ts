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

  /**
   * Emails the platform administrator (ADMIN_EMAIL env var) about events
   * that need staff attention: signups, withdrawals, deposits, KYC submissions.
   */
  async notifyAdmin(subject: string, body: string) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      this.logger.warn(`ADMIN_EMAIL not set — skipping admin alert "${subject}"`);
      return;
    }
    await this.sendEmail(adminEmail, `[ADMIN] ${subject}`, this.emailHtml('Admin', subject, body));
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
          from: process.env.MAIL_FROM || 'Bridge Capital <support@bridgecapitalv1.com>',
          reply_to: process.env.SUPPORT_EMAIL || 'support@bridgecapitalv1.com',
          to: [to],
          subject: `${subject} — Bridge Capital`,
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

  /**
   * P2P order-completion email — clean white transactional layout with the
   * Bridge Capital logo header, matching the reference design.
   */
  async sendOrderCompleted(
    to: string,
    order: {
      name?: string;
      side?: 'Buy' | 'Sell';
      orderId: string;
      createdAt?: string;
      fiatAmount: string; // e.g. "111253.73 NGN"
      cryptoQuantity: string; // e.g. "80 USDT"
    },
  ) {
    const side = order.side || 'Sell';
    const created = order.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19) + ' (UTC+0)';
    const html = this.orderCompletedHtml({ ...order, side, createdAt: created });
    return this.sendEmail(to, `Your P2P ${side} Order Completed`, html);
  }

  private orderCompletedHtml(o: {
    name?: string;
    side: string;
    orderId: string;
    createdAt: string;
    fiatAmount: string;
    cryptoQuantity: string;
  }) {
    const site = process.env.FRONTEND_URL || 'https://bridgecapitalv1.com';
    const logo = `${site.replace(/\/$/, '')}/logo.svg`;
    return `
<div style="background:#ffffff;padding:0;margin:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
  <div style="max-width:600px;margin:0 auto;padding:40px 28px">
    <!-- Logo header -->
    <div style="text-align:center;padding-bottom:28px;border-bottom:1px solid #eee">
      <img src="${logo}" alt="Bridge Capital" width="56" height="56" style="display:inline-block;border-radius:12px" />
      <div style="font-size:26px;font-weight:800;letter-spacing:1px;margin-top:10px;color:#0A1A3A">
        BRIDGE<span style="color:#E8B547">CAPITAL</span>
      </div>
      <div style="font-size:13px;color:#666;margin-top:6px">
        <span style="font-weight:600">#YourBridge</span> to <span style="color:#E8B547;font-weight:600">Digital Markets</span>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px 4px 8px;font-size:15px;line-height:1.7;color:#333">
      <p style="margin:0 0 20px">Dear ${o.name || 'Trader'},</p>
      <p style="margin:0 0 20px">
        Your P2P ${o.side} Order has been successfully completed, and the coins have been transferred to your buyer.
        You can proceed to the P2P order page to check details of the completed transaction. If you have any concerns,
        you can click on the &quot;Chat&quot; icon to communicate with the buyer in real-time.
      </p>
      <p style="margin:0 0 8px">Your order details are as follows:</p>
      <p style="margin:0 0 4px">- Order ID: ******${o.orderId.slice(-4)}</p>
      <p style="margin:0 0 4px">- Order Creation Time: ${o.createdAt}</p>
      <p style="margin:0 0 4px">- Fiat Amount: ${o.fiatAmount}</p>
      <p style="margin:0 0 20px">- Crypto Quantity: ${o.cryptoQuantity}</p>
      <p style="margin:0 0 24px">
        If you have any further inquiries, please consult our
        <a href="${site}/help" style="color:#2563eb;text-decoration:underline">&quot;P2P Frequently Asked Questions&quot;</a>.
        Thank you for your support!
      </p>
      <p style="margin:0 0 2px">Regards,</p>
      <p style="margin:0;font-weight:600">The Bridge Capital Team</p>
    </div>

    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999;line-height:1.5;text-align:center">
      This is an automated message from Bridge Capital. Please do not reply directly.
      Need help? Contact support@bridgecapitalv1.com
    </div>
  </div>
</div>`;
  }

  // Clean, white transactional layout with the Bridge Capital logo header —
  // used for every notification email (welcome, deposits, withdrawals, KYC…).
  private emailHtml(name: string, title: string, body: string) {
    const site = (process.env.FRONTEND_URL || 'https://bridgecapitalv1.com').replace(/\/$/, '');
    const logo = `${site}/logo.svg`;
    return `
<div style="background:#ffffff;padding:0;margin:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
  <div style="max-width:600px;margin:0 auto;padding:40px 28px">
    <div style="text-align:center;padding-bottom:28px;border-bottom:1px solid #eee">
      <img src="${logo}" alt="Bridge Capital" width="56" height="56" style="display:inline-block;border-radius:12px" />
      <div style="font-size:26px;font-weight:800;letter-spacing:1px;margin-top:10px;color:#0A1A3A">
        BRIDGE<span style="color:#E8B547">CAPITAL</span>
      </div>
      <div style="font-size:13px;color:#666;margin-top:6px">
        <span style="font-weight:600">#YourBridge</span> to <span style="color:#E8B547;font-weight:600">Digital Markets</span>
      </div>
    </div>
    <div style="padding:32px 4px 8px;font-size:15px;line-height:1.7;color:#333">
      <h2 style="margin:0 0 18px;font-size:19px;color:#0A1A3A">${title}</h2>
      <p style="margin:0 0 16px">Dear ${name},</p>
      <p style="margin:0 0 24px">${body}</p>
      <a href="${site}/dashboard" style="display:inline-block;background:#E8B547;color:#0A1A3A;text-decoration:none;font-weight:700;font-size:14px;padding:11px 26px;border-radius:8px">Open Dashboard</a>
    </div>
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999;line-height:1.5;text-align:center">
      This is an automated message from Bridge Capital. If you did not expect this email, contact support@bridgecapitalv1.com.
    </div>
  </div>
</div>`;
  }
}
