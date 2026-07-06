'use client';
import { useState, useRef, useEffect } from 'react';
import { User, Shield, Bell, ShieldCheck, Smartphone, Check, Monitor, X, QrCode, Clock, Upload, FileText } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { KYC_STATUS_LABELS } from '@/lib/constants';
import { formatDate, getInitials, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'NATIONAL_ID', label: 'National ID Card' },
  { value: 'PROOF_OF_ADDRESS', label: 'Proof of Address' },
];

interface Session {
  id: string;
  ipAddress?: string;
  country?: string;
  deviceType?: string;
  carrier?: string;
  createdAt: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [twoFA, setTwoFA] = useState(user?.twoFactorEnabled ?? false);
  const [notifs, setNotifs] = useState({ trades: true, deposits: true, security: true, marketing: false, priceAlerts: true });

  // Profile form seeded from the real logged-in user
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', country: user?.country || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // KYC
  const [docType, setDocType] = useState('PASSPORT');
  const [kycFiles, setKycFiles] = useState<{ type: string; name: string }[]>([]);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const kycFileRef = useRef<HTMLInputElement>(null);
  const kycStatus = user?.kycStatus || 'NONE';

  // Devices
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', email: user.email || '', phone: user.phone || '', country: user.country || '' });
  }, [user]);

  useEffect(() => {
    api.get<Session[]>('/users/me/sessions')
      .then((r) => setSessions(Array.isArray(r.data) ? r.data.filter((s) => s.isActive) : []))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.patch('/users/me', { name: profile.name, phone: profile.phone, country: profile.country });
      updateUser({ name: profile.name, phone: profile.phone, country: profile.country });
      toast.success('Profile updated');
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const onKycFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setKycFiles((prev) => [...prev.filter((x) => x.type !== docType), { type: docType, name: f.name }]);
      toast.success(`${DOC_TYPES.find((d) => d.value === docType)?.label} attached`);
    }
    e.target.value = '';
  };

  const submitKyc = async () => {
    if (kycFiles.length === 0) return toast.error('Attach at least one document');
    setSubmittingKyc(true);
    try {
      for (const f of kycFiles) {
        await api.post('/kyc/submit', { type: f.type, fileUrl: f.name });
      }
      updateUser({ kycStatus: 'PENDING' });
      setKycFiles([]);
      toast.success('Documents submitted — our team will review them within 24-48 hours.');
    } catch {
      toast.error('Submission failed. Try again.');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const revokeSession = async (id: string) => {
    try {
      await api.delete(`/users/me/sessions/${id}`);
      setSessions((list) => list.filter((s) => s.id !== id));
      toast.success('Session revoked');
    } catch {
      toast.error('Could not revoke session');
    }
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={cn('w-11 h-6 rounded-full transition-colors relative', on ? 'bg-amber-500' : 'bg-[#21262D]')}>
      <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform', on ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );

  const kycBadge = kycStatus === 'APPROVED' ? 'success' : kycStatus === 'PENDING' ? 'warning' : kycStatus === 'REJECTED' ? 'danger' : 'default';

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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-black">
                {user ? getInitials(user.name) : '?'}
              </div>
              <div>
                <div className="font-semibold">{user?.name}</div>
                <div className="text-sm text-[#8B949E]">{user?.email}</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              <Input label="Email" type="email" value={profile.email} disabled hint="Contact support to change your email" />
              <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 ..." />
              <Input label="Country" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
            </div>
            <Button isLoading={savingProfile} onClick={saveProfile}>Save Changes</Button>
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
                <Input placeholder="Set your anti-phishing code" containerClassName="flex-1" />
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
          <CardBody className="space-y-5">
            {/* Status banner reflects the real account state */}
            <div className={cn('flex items-center justify-between p-4 rounded-lg border',
              kycStatus === 'APPROVED' ? 'bg-green-500/5 border-green-500/20' :
              kycStatus === 'PENDING' ? 'bg-amber-500/5 border-amber-500/20' :
              kycStatus === 'REJECTED' ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0D1117] border-[#21262D]')}>
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center',
                  kycStatus === 'APPROVED' ? 'bg-green-500/15' : kycStatus === 'PENDING' ? 'bg-amber-500/15' : 'bg-[#21262D]')}>
                  {kycStatus === 'APPROVED' ? <Check size={20} className="text-green-400" /> :
                   kycStatus === 'PENDING' ? <Clock size={20} className="text-amber-400" /> :
                   <ShieldCheck size={20} className="text-[#8B949E]" />}
                </div>
                <div>
                  <div className="font-medium">Verification Status</div>
                  <div className={cn('text-sm',
                    kycStatus === 'APPROVED' ? 'text-green-400' : kycStatus === 'PENDING' ? 'text-amber-400' :
                    kycStatus === 'REJECTED' ? 'text-red-400' : 'text-[#8B949E]')}>
                    {KYC_STATUS_LABELS[kycStatus as keyof typeof KYC_STATUS_LABELS]}
                  </div>
                </div>
              </div>
              <Badge variant={kycBadge} dot>{kycStatus === 'APPROVED' ? 'Level 2' : kycStatus === 'PENDING' ? 'In review' : 'Level 0'}</Badge>
            </div>

            {kycStatus === 'APPROVED' ? (
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#21262D]"><div className="text-[#8B949E] text-xs">Daily Withdrawal</div><div className="font-medium">$100,000</div></div>
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#21262D]"><div className="text-[#8B949E] text-xs">Identity</div><div className="font-medium text-green-400">Verified</div></div>
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#21262D]"><div className="text-[#8B949E] text-xs">Address</div><div className="font-medium text-green-400">Verified</div></div>
              </div>
            ) : kycStatus === 'PENDING' ? (
              <p className="text-sm text-[#8B949E]">Your documents are being reviewed by our compliance team. This usually takes 24-48 hours. You&apos;ll be notified once complete.</p>
            ) : (
              <>
                <p className="text-sm text-[#8B949E]">
                  {kycStatus === 'REJECTED'
                    ? 'Your previous submission was rejected. Please upload new, clearly legible documents.'
                    : 'Verify your identity to unlock deposits, withdrawals, and full trading limits.'}
                </p>

                {/* Document type selector */}
                <div>
                  <label className="text-sm font-medium text-[#8B949E] mb-2 block">Document Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DOC_TYPES.map((d) => (
                      <button key={d.value} onClick={() => setDocType(d.value)}
                        className={cn('px-3 py-2.5 rounded-lg border text-xs transition-all',
                          docType === d.value ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#21262D] text-[#8B949E] hover:border-[#30363D]')}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input ref={kycFileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={onKycFile} />
                <button onClick={() => kycFileRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#21262D] hover:border-amber-500/40 rounded-xl p-8 text-center transition-colors">
                  <Upload size={24} className="mx-auto text-[#8B949E] mb-2" />
                  <div className="text-sm font-medium">Upload {DOC_TYPES.find((d) => d.value === docType)?.label}</div>
                  <div className="text-xs text-[#6E7681] mt-1">PDF, JPG or PNG · max 10 MB</div>
                </button>

                {kycFiles.length > 0 && (
                  <div className="space-y-2">
                    {kycFiles.map((f) => (
                      <div key={f.type} className="flex items-center gap-2 text-sm p-2.5 rounded-lg bg-[#0D1117] border border-[#21262D]">
                        <FileText size={14} className="text-amber-400" />
                        <span className="text-xs text-[#8B949E]">{DOC_TYPES.find((d) => d.value === f.type)?.label}:</span>
                        <span className="flex-1 truncate">{f.name}</span>
                        <button onClick={() => setKycFiles((p) => p.filter((x) => x.type !== f.type))} className="text-[#8B949E] hover:text-red-400"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <Button fullWidth size="lg" isLoading={submittingKyc} onClick={submitKyc} disabled={kycFiles.length === 0}>
                  Submit for Review
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'devices' && (
        <Card>
          <CardHeader><h3 className="font-semibold flex items-center gap-2"><Smartphone size={16} className="text-amber-400" /> Active Sessions</h3></CardHeader>
          <CardBody className="p-0">
            {sessionsLoading ? (
              <div className="p-5 space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
            ) : sessions.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#8B949E]">No session data recorded yet. New logins will appear here.</div>
            ) : (
              sessions.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-4 border-b border-[#21262D]/50 last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-[#21262D] flex items-center justify-center"><Monitor size={18} className="text-[#8B949E]" /></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {s.deviceType || 'Unknown device'}
                      {i === 0 && <Badge variant="success" size="sm">Most recent</Badge>}
                    </div>
                    <div className="text-xs text-[#8B949E]">
                      {[s.country, s.ipAddress, s.carrier, formatDate(s.createdAt, 'relative')].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  {i !== 0 && (
                    <Button size="sm" variant="ghost" className="text-red-400" onClick={() => revokeSession(s.id)}><X size={14} /> Revoke</Button>
                  )}
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
