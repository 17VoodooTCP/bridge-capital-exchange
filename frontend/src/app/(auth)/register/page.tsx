'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Modal } from '@/components/ui/modal';
import { TermsContent, PrivacyContent, RiskContent } from '@/components/legal/LegalContent';
import { COUNTRIES, flagUrl } from '@/lib/countries';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', country: 'United States' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  // Which legal document the sign-up modal is showing (null = closed)
  const [legal, setLegal] = useState<'terms' | 'privacy' | 'risk' | null>(null);

  const LEGAL_DOCS = {
    terms: { title: 'Terms of Service', body: <TermsContent /> },
    privacy: { title: 'Privacy Policy', body: <PrivacyContent /> },
    risk: { title: 'Risk Disclosure', body: <RiskContent /> },
  };

  const pwToggle = (
    <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#8B949E] hover:text-amber-400 transition-colors">
      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (!agreed) return toast.error('Please accept the terms to continue');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, country: form.country });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg === 'Email already registered' ? 'This email is already registered.' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length >= 12 ? 'Strong' : form.password.length >= 8 ? 'Good' : form.password.length > 0 ? 'Weak' : '';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0B0D]">
      <div className="absolute top-4 right-4"><LanguageSwitcher compact /></div>
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-8 justify-center">
          <Logo size={40} />
          <div>
            <div className="text-sm font-bold">Bridge Capital</div>
          </div>
        </Link>

        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-[#8B949E] mb-6">Start investing in minutes. No fees to open.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" placeholder="John Smith" value={form.name} onChange={(e) => set('name', e.target.value)} prefix={<User size={15} />} />
            <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} prefix={<Mail size={15} />} />
            <div>
              <Input label="Password" type={showPw ? 'text' : 'password'} placeholder="At least 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} prefix={<Lock size={15} />} suffix={pwToggle} />
              {strength && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded-full bg-[#21262D] overflow-hidden">
                    <div className={`h-full transition-all ${strength === 'Strong' ? 'w-full bg-green-500' : strength === 'Good' ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-red-500'}`} />
                  </div>
                  <span className="text-xs text-[#8B949E]">{strength}</span>
                </div>
              )}
            </div>
            <Input label="Confirm password" type={showPw ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} prefix={<Lock size={15} />} suffix={pwToggle} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#8B949E]">Country</label>
              <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 focus-within:border-amber-500/60">
                {/* Real flag of the selected country */}
                {(() => { const c = COUNTRIES.find((x) => x.name === form.country); return c ? <img src={flagUrl(c.iso, 20)} alt="" width={20} height={15} className="rounded-sm shrink-0" /> : null; })()}
                <select value={form.country} onChange={(e) => set('country', e.target.value)} className="flex-1 bg-transparent text-sm text-[#E6EDF3] outline-none">
                  {COUNTRIES.map((c) => <option key={c.iso + c.name} value={c.name} className="bg-[#161B22]">{c.name}</option>)}
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-sm text-[#8B949E]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded border-[#21262D] bg-[#111318] text-amber-500 focus:ring-amber-500/30" />
              <span>
                I agree to the{' '}
                <button type="button" onClick={() => setLegal('terms')} className="text-amber-400 hover:text-amber-300 underline underline-offset-2">Terms of Service</button>
                {', '}
                <button type="button" onClick={() => setLegal('risk')} className="text-amber-400 hover:text-amber-300 underline underline-offset-2">Risk Disclosure</button>
                {' and '}
                <button type="button" onClick={() => setLegal('privacy')} className="text-amber-400 hover:text-amber-300 underline underline-offset-2">Privacy Policy</button>
              </span>
            </label>

            <Button type="submit" fullWidth size="lg" isLoading={loading} rightIcon={<ArrowRight size={16} />}>Create Account</Button>
          </form>

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-[#8B949E]">
            <span className="flex items-center gap-1.5"><Check size={13} className="text-green-400" /> Free account</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-green-400" /> Insured custody</span>
          </div>
        </div>

        <p className="text-center text-sm text-[#8B949E] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link>
        </p>
      </div>

      {/* Legal documents — readable without leaving the form */}
      <Modal isOpen={legal !== null} onClose={() => setLegal(null)} title={legal ? LEGAL_DOCS[legal].title : ''} size="lg">
        {legal && (
          <div className="p-6 space-y-5">
            <div className="max-h-[55vh] overflow-y-auto pr-1">{LEGAL_DOCS[legal].body}</div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#21262D]">
              {(['terms', 'risk', 'privacy'] as const).filter((k) => k !== legal).map((k) => (
                <Button key={k} size="sm" variant="ghost" onClick={() => setLegal(k)}>Read {LEGAL_DOCS[k].title}</Button>
              ))}
              <Button size="sm" className="ml-auto" onClick={() => { setAgreed(true); setLegal(null); }}>Accept &amp; Continue</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
