'use client';
import { useState, useRef } from 'react';
import { User, Shield, Bell, ShieldCheck, Smartphone, Check, Monitor, X, QrCode } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockLoginSessions } from '@/lib/mockData';
import { KYC_STATUS_LABELS } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const [twoFA, setTwoFA] = useState(false);
  const [notifs, setNotifs] = useState({ trades: true, deposits: true, security: true, marketing: false, priceAlerts: true });
  const [kycUploads, setKycUploads] = useState<string[]>([]);
  const kycFileRef = useRef<HTMLInputElement>(null);

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn('w-11 h-6 rounded-full transition-colors relative', on ? 'bg-amber-500' : 'bg-[#21262D]')}>
      <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', on ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[#8B949E]">Manage your account preferences and security</p>
      </div>

      <Tabs
        tabs={[
          { id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' },
          { id: 'notifications', label: 'Notifications' }, { id: 'kyc', label: 'KYC' }, { id: 'devices', label: 'Devices' },
        ]}
        activeTab={tab}
        onChange={setTab}
        variant="pills"
      />

      {tab === 'profile' && (
        <Card>
          <CardHeader><h3 className="font-semibold flex items-center gap-2"><User size={16} className="text-amber-400" /> Profile</h3></CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-black">JS</div>
              <Button variant="outline" size="sm">Change Avatar</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue="John Smith" />
              <Input label="Email" type="email" defaultValue="john@example.com" />
              <Input label="Phone" defaultValue="+1 555 012 3456" />
              <Input label="Country" defaultValue="United States" />
            </div>
            <Button onClick={() => toast.success('Profile updated')}>Save Changes</Button>
          </CardBody>
        </Card>
      )}

      {tab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><h3 className="font-semibold flex items-center gap-2"><Shield size={16} className="text-amber-400" /> Password</h3></CardHeader>
            <CardBody className="space-y-4">
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
              </div>
              <Button onClick={() => toast.success('Password changed')}>Update Password</Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold">Two-Factor Authentication</h3></CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Authenticator App (2FA)</div>
                  <div className="text-sm text-[#8B949E]">Add an extra layer of security to your account</div>
                </div>
                <Toggle on={twoFA} onClick={() => { setTwoFA(!twoFA); toast.success(twoFA ? '2FA disabled' : '2FA enabled'); }} />
              </div>
              {twoFA && (
                <div className="mt-4 flex items-center gap-4 p-4 rounded-lg bg-[#0D1117] border border-[#21262D]">
                  <div className="w-28 h-28 bg-white rounded-lg flex items-center justify-center"><QrCode size={80} className="text-black" /></div>
                  <div className="text-sm text-[#8B949E]">
                    <p className="mb-2">Scan this QR code with Google Authenticator or Authy.</p>
                    <code className="text-xs bg-[#161B22] px-2 py-1 rounded">JBSWY3DPEHPK3PXP</code>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold">Anti-Phishing Code</h3></CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-[#8B949E]">A unique code shown in all genuine emails from Bridge Capital to protect against phishing.</p>
              <div className="flex gap-3">
                <Input placeholder="Set your anti-phishing code" containerClassName="flex-1" defaultValue="BCE-SECURE-2026" />
                <Button onClick={() => toast.success('Anti-phishing code saved')}>Save</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader><h3 className="font-semibold flex items-center gap-2"><Bell size={16} className="text-amber-400" /> Notification Preferences</h3></CardHeader>
          <CardBody className="space-y-1">
            {[
              { key: 'trades', label: 'Trade confirmations', desc: 'Get notified when your orders are filled' },
              { key: 'deposits', label: 'Deposits & withdrawals', desc: 'Updates on your fund movements' },
              { key: 'security', label: 'Security alerts', desc: 'New logins and security events' },
              { key: 'priceAlerts', label: 'Price alerts', desc: 'When assets hit your target prices' },
              { key: 'marketing', label: 'Product updates', desc: 'News, features, and promotions' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between py-3 border-b border-[#21262D]/50 last:border-0">
                <div><div className="font-medium text-sm">{n.label}</div><div className="text-xs text-[#8B949E]">{n.desc}</div></div>
                <Toggle on={notifs[n.key as keyof typeof notifs]} onClick={() => setNotifs((p) => ({ ...p, [n.key]: !p[n.key as keyof typeof notifs] }))} />
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {tab === 'kyc' && (
        <Card>
          <CardHeader><h3 className="font-semibold flex items-center gap-2"><ShieldCheck size={16} className="text-amber-400" /> Identity Verification</h3></CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center"><Check size={20} className="text-green-400" /></div>
                <div><div className="font-medium">Verification Status</div><div className="text-sm text-green-400">{KYC_STATUS_LABELS.APPROVED}</div></div>
              </div>
              <Badge variant="success" dot>Level 2</Badge>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#21262D]"><div className="text-[#8B949E] text-xs">Daily Withdrawal</div><div className="font-medium">$100,000</div></div>
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#21262D]"><div className="text-[#8B949E] text-xs">Identity</div><div className="font-medium text-green-400">Verified</div></div>
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#21262D]"><div className="text-[#8B949E] text-xs">Address</div><div className="font-medium text-green-400">Verified</div></div>
            </div>
            <input
              ref={kycFileRef}
              type="file"
              accept=".pdf,image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) {
                  setKycUploads((prev) => [...prev, ...files.map((f) => f.name)]);
                  toast.success(`${files.length} document(s) uploaded for review`);
                }
                e.target.value = '';
              }}
            />
            {kycUploads.length > 0 && (
              <div className="space-y-2">
                {kycUploads.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-[#0D1117] border border-[#21262D]">
                    <ShieldCheck size={14} className="text-amber-400" />
                    <span className="flex-1 truncate">{name}</span>
                    <Badge variant="warning" size="sm">Pending review</Badge>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" onClick={() => kycFileRef.current?.click()}>Upload Additional Documents</Button>
          </CardBody>
        </Card>
      )}

      {tab === 'devices' && (
        <Card>
          <CardHeader><h3 className="font-semibold flex items-center gap-2"><Smartphone size={16} className="text-amber-400" /> Active Sessions</h3></CardHeader>
          <CardBody className="p-0">
            {mockLoginSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#21262D]/50 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-[#21262D] flex items-center justify-center"><Monitor size={18} className="text-[#8B949E]" /></div>
                <div className="flex-1">
                  <div className="font-medium text-sm flex items-center gap-2">{s.deviceType} {s.isCurrent && <Badge variant="success" size="sm">This device</Badge>}</div>
                  <div className="text-xs text-[#8B949E]">{s.country} · {s.ipAddress} · {s.carrier} · {formatDate(s.createdAt, 'relative')}</div>
                </div>
                {!s.isCurrent && <Button size="sm" variant="ghost" className="text-red-400" onClick={() => toast.success('Session revoked')}><X size={14} /> Revoke</Button>}
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
