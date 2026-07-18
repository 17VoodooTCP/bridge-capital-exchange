'use client';
import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState({ maintenance: false, deposits: true, withdrawals: true, trading: true, staking: true, kycRequired: true });
  const [banner, setBanner] = useState('');
  const [fees, setFees] = useState({ trading: '0.1', withdrawal: '0.05', minWithdrawal: '10', maxDaily: '100000' });
  const [mail, setMail] = useState({ to: '', name: '', subject: '', body: '', device: '', location: '', notifyInApp: true });
  const [template, setTemplate] = useState('custom');
  const [sending, setSending] = useState(false);

  // Per-event email notification toggles
  const [emailFlags, setEmailFlags] = useState<Record<string, boolean>>({});
  const [savingFlags, setSavingFlags] = useState(false);

  useEffect(() => {
    api.get('/admin/notification-settings').then((r) => setEmailFlags(r.data || {})).catch(() => {});
  }, []);

  const saveEmailFlags = async (next: Record<string, boolean>) => {
    setEmailFlags(next);
    setSavingFlags(true);
    try {
      await api.patch('/admin/notification-settings', next);
      toast.success('Notification settings saved');
    } catch {
      toast.error('Could not save');
    } finally {
      setSavingFlags(false);
    }
  };

  // Ready-made email templates. Selecting one fills subject + body (still fully
  // editable). `device` marks templates that show the device/location fields.
  const MAIL_TEMPLATES: Record<string, { label: string; subject: string; body: string; device?: boolean }> = {
    custom: { label: 'Custom message', subject: '', body: '' },
    welcome: { label: 'Welcome / account created', subject: 'Welcome to Bridge Capital', body: 'Your account has been created successfully. Complete your KYC verification in Settings to unlock deposits, withdrawals, and full trading limits.\n\nWe\'re glad to have you on board.' },
    deposit: { label: 'Deposit received', subject: 'Deposit received', body: 'We\'ve received your deposit and it is being confirmed on the network. Your funds will be credited to your wallet shortly and available for trading.' },
    depositCredited: { label: 'Deposit credited', subject: 'Funds credited to your wallet', body: 'Your deposit has been fully confirmed and credited to your wallet. You can now trade, stake, or withdraw these funds.' },
    withdrawal: { label: 'Withdrawal update', subject: 'Your withdrawal is being processed', body: 'Your withdrawal request has been received and is being reviewed by our team. You\'ll get a follow-up as soon as it is processed on-chain.' },
    withdrawalDone: { label: 'Withdrawal completed', subject: 'Withdrawal completed', body: 'Your withdrawal has been processed and broadcast to the network. Depending on network conditions it may take a few minutes to arrive.' },
    login: { label: 'New login / security alert', subject: 'New sign-in to your account', body: 'We detected a new sign-in to your Bridge Capital account. If this was you, no action is needed. If you don\'t recognise this activity, change your password immediately and contact support.', device: true },
    kyc: { label: 'KYC approved', subject: 'Identity verification approved', body: 'Great news — your identity verification has been approved. You now have full access to deposits, withdrawals, and higher trading limits.' },
    kycRejected: { label: 'KYC rejected', subject: 'Identity verification needs attention', body: 'We were unable to approve your identity verification. Please upload new, clearly legible documents in Settings → KYC and resubmit.' },
    p2p: { label: 'P2P order completed', subject: 'Your P2P order is completed', body: 'Your P2P order has been successfully completed and the coins have been transferred. You can view the full details on your P2P orders page.' },
  };

  const applyTemplate = (key: string) => {
    setTemplate(key);
    const t = MAIL_TEMPLATES[key];
    if (t) setMail((m) => ({ ...m, subject: t.subject, body: t.body }));
  };

  const showDeviceFields = MAIL_TEMPLATES[template]?.device;

  const sendMail = async () => {
    if (!mail.to || !mail.subject || !mail.body) {
      return toast.error('Fill in recipient, subject and message');
    }
    setSending(true);
    try {
      await api.post('/admin/send-email', {
        to: mail.to,
        name: mail.name || undefined,
        subject: mail.subject,
        body: mail.body,
        device: showDeviceFields ? mail.device || undefined : undefined,
        location: showDeviceFields ? mail.location || undefined : undefined,
        notifyInApp: mail.notifyInApp,
      });
      toast.success(`Email sent to ${mail.to}`);
      setMail({ to: '', name: '', subject: '', body: '', device: '', location: '', notifyInApp: true });
      setTemplate('custom');
    } catch {
      toast.error('Could not send — check Resend is configured.');
    } finally {
      setSending(false);
    }
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn('w-11 h-6 rounded-full transition-colors relative', on ? 'bg-amber-500' : 'bg-[#21262D]')}>
      <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', on ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold">Platform Settings</h1><p className="text-sm text-[#8B949E]">Control global platform configuration</p></div>

      <Card>
        <CardHeader><h3 className="font-semibold">Feature Flags</h3></CardHeader>
        <CardBody className="space-y-1">
          {[
            { key: 'maintenance', label: 'Maintenance Mode', desc: 'Take the platform offline for all users', danger: true },
            { key: 'deposits', label: 'Deposits Enabled', desc: 'Allow users to deposit funds' },
            { key: 'withdrawals', label: 'Withdrawals Enabled', desc: 'Allow users to withdraw funds' },
            { key: 'trading', label: 'Trading Enabled', desc: 'Allow spot trading' },
            { key: 'staking', label: 'Staking Enabled', desc: 'Allow earn/staking products' },
            { key: 'kycRequired', label: 'KYC Required', desc: 'Require KYC before withdrawals' },
          ].map((f) => (
            <div key={f.key} className="flex items-center justify-between py-3 border-b border-[#21262D]/50 last:border-0">
              <div><div className={cn('font-medium text-sm', f.danger && 'text-red-400')}>{f.label}</div><div className="text-xs text-[#8B949E]">{f.desc}</div></div>
              <Toggle on={flags[f.key as keyof typeof flags]} onClick={() => { setFlags((p) => ({ ...p, [f.key]: !p[f.key as keyof typeof flags] })); toast.success(`${f.label} updated`); }} />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Announcement Banner</h3></CardHeader>
        <CardBody className="space-y-3">
          <Input placeholder="Enter a site-wide announcement (leave blank to hide)" value={banner} onChange={(e) => setBanner(e.target.value)} />
          {banner && <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">{banner}</div>}
          <Button onClick={() => toast.success('Banner published')}>Publish Banner</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Fee Settings</h3></CardHeader>
        <CardBody className="grid sm:grid-cols-2 gap-4">
          <Input label="Trading Fee (%)" value={fees.trading} onChange={(e) => setFees({ ...fees, trading: e.target.value })} />
          <Input label="Withdrawal Fee (%)" value={fees.withdrawal} onChange={(e) => setFees({ ...fees, withdrawal: e.target.value })} />
          <Input label="Min Withdrawal (USD)" value={fees.minWithdrawal} onChange={(e) => setFees({ ...fees, minWithdrawal: e.target.value })} />
          <Input label="Max Daily Withdrawal (USD)" value={fees.maxDaily} onChange={(e) => setFees({ ...fees, maxDaily: e.target.value })} />
          <div className="sm:col-span-2"><Button onClick={() => toast.success('Fee settings saved')}>Save Fees</Button></div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Notification Emails</h3></CardHeader>
        <CardBody className="space-y-1">
          <p className="text-sm text-[#8B949E] pb-2">Choose which events send an email to users. In-app notifications are always recorded regardless of these settings.</p>
          {[
            { key: 'welcome', label: 'Account created', desc: 'Welcome email when a user registers' },
            { key: 'deposit', label: 'Deposit received', desc: 'When a deposit is detected/credited' },
            { key: 'withdrawal', label: 'Withdrawal submitted', desc: 'When a withdrawal request is made' },
            { key: 'fundAdjustment', label: 'Balance adjustment', desc: 'When an admin credits/debits a balance (with "Notify user" ticked)' },
            { key: 'kyc', label: 'KYC decision', desc: 'When identity verification is approved or rejected' },
            { key: 'security', label: 'Security alerts', desc: 'New-device logins and password changes' },
            { key: 'copyTrade', label: 'Copy trading', desc: 'Copy connected/disconnected and P&L updates' },
          ].map((e) => (
            <div key={e.key} className="flex items-center justify-between py-3 border-b border-[#21262D]/50 last:border-0">
              <div><div className="font-medium text-sm">{e.label}</div><div className="text-xs text-[#8B949E]">{e.desc}</div></div>
              <Toggle on={emailFlags[e.key] !== false} onClick={() => saveEmailFlags({ ...emailFlags, [e.key]: emailFlags[e.key] === false ? true : false })} />
            </div>
          ))}
          {savingFlags && <div className="text-xs text-[#8B949E] pt-2">Saving…</div>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Compose &amp; Send Email</h3></CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-[#8B949E]">Send any message to a user through the branded Bridge Capital email (logo + white layout). Pick a ready-made template or write your own. Works for every event — deposits, withdrawals, login alerts, KYC, P2P and more.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#8B949E]">Template</label>
              <select value={template} onChange={(e) => applyTemplate(e.target.value)} className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50">
                {Object.entries(MAIL_TEMPLATES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
              </select>
            </div>
            <Input label="Recipient Email" type="email" value={mail.to} onChange={(e) => setMail({ ...mail, to: e.target.value })} placeholder="user@example.com" />
            <Input label="Recipient Name (optional)" value={mail.name} onChange={(e) => setMail({ ...mail, name: e.target.value })} placeholder="Auto-filled from the account if left blank" />
            <Input label="Subject" value={mail.subject} onChange={(e) => setMail({ ...mail, subject: e.target.value })} placeholder="Subject line" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#8B949E]">Message</label>
            <textarea
              value={mail.body}
              onChange={(e) => setMail({ ...mail, body: e.target.value })}
              rows={6}
              placeholder="Write your message… Line breaks are preserved. It will be wrapped in the branded template with your logo, a greeting, and an “Open Dashboard” button."
              className="bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50 resize-y"
            />
          </div>

          {showDeviceFields && (
            <div className="grid sm:grid-cols-2 gap-4 rounded-lg bg-[#111318] border border-[#21262D] p-3">
              <Input label="Device (optional)" value={mail.device} onChange={(e) => setMail({ ...mail, device: e.target.value })} placeholder="Chrome on Windows" />
              <Input label="Location (optional)" value={mail.location} onChange={(e) => setMail({ ...mail, location: e.target.value })} placeholder="Dallas, USA" />
              <p className="sm:col-span-2 text-xs text-[#6E7681]">Shown as a details block at the bottom of the email, with the current time.</p>
            </div>
          )}

          <label className="flex items-center gap-2.5 cursor-pointer text-sm">
            <input type="checkbox" checked={mail.notifyInApp} onChange={(e) => setMail({ ...mail, notifyInApp: e.target.checked })} className="rounded border-[#21262D] bg-[#0D1117] text-amber-500 focus:ring-amber-500/30" />
            <span>Also show this as an in-app notification (if the recipient is a registered user)</span>
          </label>

          <Button isLoading={sending} onClick={sendMail}>Send Email</Button>
        </CardBody>
      </Card>
    </div>
  );
}
