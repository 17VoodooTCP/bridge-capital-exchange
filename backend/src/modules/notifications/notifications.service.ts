import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type NotifType = 'GENERAL' | 'TRANSACTION' | 'SECURITY' | 'KYC' | 'ACCOUNT';
export type EmailEvent = 'welcome' | 'deposit' | 'withdrawal' | 'fundAdjustment' | 'kyc' | 'security' | 'copyTrade';

// Which events email the user by default. Admins can override in settings.
const DEFAULT_EMAIL_FLAGS: Record<EmailEvent, boolean> = {
  welcome: true,
  deposit: true,
  withdrawal: true,
  fundAdjustment: true,
  kyc: true,
  security: true,
  copyTrade: true,
};
const FLAGS_KEY = 'notif_email_flags';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Per-event email settings (admin-configurable) ────────────────

  async getEmailFlags(): Promise<Record<EmailEvent, boolean>> {
    const row = await this.prisma.appSetting.findUnique({ where: { key: FLAGS_KEY } }).catch(() => null);
    if (!row) return { ...DEFAULT_EMAIL_FLAGS };
    try {
      return { ...DEFAULT_EMAIL_FLAGS, ...(JSON.parse(row.value) as Record<EmailEvent, boolean>) };
    } catch {
      return { ...DEFAULT_EMAIL_FLAGS };
    }
  }

  async setEmailFlags(flags: Partial<Record<EmailEvent, boolean>>) {
    const merged = { ...(await this.getEmailFlags()), ...flags };
    await this.prisma.appSetting
      .upsert({ where: { key: FLAGS_KEY }, create: { key: FLAGS_KEY, value: JSON.stringify(merged) }, update: { value: JSON.stringify(merged) } })
      .catch(() => null);
    return merged;
  }

  private async emailAllowed(event?: EmailEvent): Promise<boolean> {
    if (!event) return true; // untagged emails always send
    const flags = await this.getEmailFlags();
    return flags[event] !== false;
  }

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
    opts: { title: string; body: string; type?: NotifType; email?: boolean; event?: EmailEvent },
  ) {
    // In-app notification always records, regardless of the email setting.
    await this.prisma.notification
      .create({ data: { userId, title: opts.title, body: opts.body, type: opts.type || 'GENERAL' } })
      .catch(() => null);

    if (opts.email && (await this.emailAllowed(opts.event))) {
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
   * General-purpose composed email — any subject/body sent through the same
   * branded white template used for every notification. Optionally appends a
   * device/location details block (for login/security alerts) and records a
   * matching in-app notification if the recipient is a registered user.
   */
  async sendComposed(
    to: string,
    opts: {
      name?: string;
      subject: string;
      body: string;
      device?: string;
      location?: string;
      notifyInApp?: boolean;
      type?: NotifType;
    },
  ) {
    if (!to || !opts.subject || !opts.body) {
      return { sent: false, error: 'Recipient, subject, and message are required.' };
    }

    // Look up the user so we can greet them by name and (optionally) record an
    // in-app notification alongside the email.
    const user = await this.prisma.user
      .findUnique({ where: { email: to }, select: { id: true, name: true } })
      .catch(() => null);

    let bodyHtml = opts.body.replace(/\n/g, '<br/>');
    if (opts.device || opts.location) {
      const rows: string[] = [];
      if (opts.device) rows.push(`Device: ${opts.device}`);
      if (opts.location) rows.push(`Location: ${opts.location}`);
      rows.push(`Time: ${new Date().toUTCString()}`);
      bodyHtml += `<br/><br/><span style="display:inline-block;background:#f6f7f9;border:1px solid #eee;border-radius:8px;padding:12px 14px;font-size:13px;color:#555;line-height:1.6">${rows.join('<br/>')}</span>`;
    }

    const html = this.emailHtml(opts.name || user?.name || 'there', opts.subject, bodyHtml);
    const result = await this.sendEmail(to, opts.subject, html);

    if (opts.notifyInApp && user) {
      await this.prisma.notification
        .create({ data: { userId: user.id, title: opts.subject, body: opts.body, type: opts.type || 'GENERAL' } })
        .catch(() => null);
    }
    return result;
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
    const logo = `${site.replace(/\/$/, '')}/email/logo.png`;
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
    ${this.emailFooter()}
  </div>
</div>`;
  }

  /**
   * Shared marketing footer appended to every email: tagline, CTA, social tiles,
   * quick links and the legal line. Uses hosted PNGs because Gmail and Outlook
   * strip inline SVG.
   */
  private emailFooter() {
    const site = (process.env.FRONTEND_URL || 'https://bridgecapitalv1.com').replace(/\/$/, '');
    const gold = '#E8B547';
    const navy = '#0A1A3A';
    const address = process.env.COMPANY_ADDRESS || '';

    const social = [
      { name: 'X', file: 'x.png', url: process.env.SOCIAL_X || 'https://x.com/' },
      { name: 'Instagram', file: 'instagram.png', url: process.env.SOCIAL_INSTAGRAM || 'https://instagram.com/' },
      { name: 'YouTube', file: 'youtube.png', url: process.env.SOCIAL_YOUTUBE || 'https://youtube.com/' },
    ]
      .map(
        (s) =>
          `<a href="${s.url}" style="text-decoration:none;display:inline-block;margin:0 7px"><img src="${site}/email/${s.file}" alt="${s.name}" width="40" height="40" style="display:block;border:0;border-radius:9px" /></a>`,
      )
      .join('');

    const links = [
      ['FAQ', `${site}/help`],
      ['Dashboard', `${site}/dashboard`],
      ['Contact', `${site}/contact`],
      ['Privacy Policy', `${site}/legal#privacy`],
    ]
      .map(([label, url]) => `<a href="${url}" style="color:#555;text-decoration:none;padding:0 12px;font-size:13px">${label}</a>`)
      .join('<span style="color:#d9d9d9">|</span>');

    return `
    <div style="margin-top:36px;padding-top:34px;border-top:1px solid #eee;text-align:center">
      <div style="font-size:24px;font-weight:800;color:${navy};margin-bottom:22px;line-height:1.3">
        For Every Trader, <span style="color:${gold}">Every Market</span>
      </div>

      <img src="${site}/email/badges.png" alt="Multi-asset trading · Verified accounts · Live support" width="520" style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 26px;border:0" />

      <a href="${site}/dashboard" style="display:block;background:${gold};color:${navy};text-decoration:none;font-weight:700;font-size:16px;padding:16px 24px;border-radius:10px;margin:0 auto 28px">
        Start Trading with Bridge Capital
      </a>

      <div style="margin-bottom:24px">${social}</div>

      <div style="margin-bottom:18px">${links}</div>

      <div style="font-size:12px;color:#999;line-height:1.7">
        &copy; ${new Date().getFullYear()} Bridge Capital. All Rights Reserved.
        ${address ? `<br/>${address}` : ''}
        <br/>Support: <a href="mailto:support@bridgecapitalv1.com" style="color:#999">support@bridgecapitalv1.com</a>
      </div>
    </div>`;
  }

  /**
   * The one branded email layout for the entire platform — white background,
   * logo header, greeting, body, call-to-action button. Every outbound email
   * (welcome, OTP, password reset, deposits, KYC…) renders through this.
   * `cta` overrides the default "Open Dashboard" button.
   */
  emailHtml(
    name: string,
    title: string,
    body: string,
    cta?: { label: string; url: string } | null,
  ) {
    const site = (process.env.FRONTEND_URL || 'https://bridgecapitalv1.com').replace(/\/$/, '');
    const logo = `${site}/email/logo.png`;
    const button = cta === null
      ? ''
      : `<a href="${cta?.url || `${site}/dashboard`}" style="display:inline-block;background:#E8B547;color:#0A1A3A;text-decoration:none;font-weight:700;font-size:14px;padding:11px 26px;border-radius:8px">${cta?.label || 'Open Dashboard'}</a>`;
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
      ${button}
    </div>
    ${this.emailFooter()}
  </div>
</div>`;
  }
}
