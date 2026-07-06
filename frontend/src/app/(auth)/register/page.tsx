'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Globe, ArrowRight, Check } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'Japan', 'India', 'Brazil', 'Other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', country: 'United States' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-8 justify-center">
          <Logo size={40} />
          <div>
            <div className="text-sm font-bold">Bridge Capital</div>
            <div className="text-[10px] text-[#8B949E] tracking-[0.2em]">EXCHANGE</div>
          </div>
        </Link>

        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-[#8B949E] mb-6">Start investing in minutes. No fees to open.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" placeholder="John Smith" value={form.name} onChange={(e) => set('name', e.target.value)} prefix={<User size={15} />} />
            <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} prefix={<Mail size={15} />} />
            <div>
              <Input label="Password" type="password" placeholder="At least 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} prefix={<Lock size={15} />} />
              {strength && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded-full bg-[#21262D] overflow-hidden">
                    <div className={`h-full transition-all ${strength === 'Strong' ? 'w-full bg-green-500' : strength === 'Good' ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-red-500'}`} />
                  </div>
                  <span className="text-xs text-[#8B949E]">{strength}</span>
                </div>
              )}
            </div>
            <Input label="Confirm password" type="password" placeholder="Re-enter password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} prefix={<Lock size={15} />} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#8B949E]">Country</label>
              <div className="flex items-center gap-2 bg-[#111318] border border-[#21262D] rounded-lg px-3 py-2.5 focus-within:border-amber-500/60">
                <Globe size={15} className="text-[#8B949E]" />
                <select value={form.country} onChange={(e) => set('country', e.target.value)} className="flex-1 bg-transparent text-sm text-[#E6EDF3] outline-none">
                  {COUNTRIES.map((c) => <option key={c} value={c} className="bg-[#161B22]">{c}</option>)}
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-sm text-[#8B949E]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded border-[#21262D] bg-[#111318] text-amber-500 focus:ring-amber-500/30" />
              <span>I agree to the <a href="#" className="text-amber-400 hover:text-amber-300">Terms of Service</a> and <a href="#" className="text-amber-400 hover:text-amber-300">Privacy Policy</a></span>
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
    </div>
  );
}
