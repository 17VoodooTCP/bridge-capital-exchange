'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/layout/Logo';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const invalid = !token || !email;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, newPassword: password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Reset link is invalid or expired. Request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const pwToggle = (
    <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#8B949E] hover:text-amber-400">
      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0B0D]">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-8"><Logo size={48} /></Link>
        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8">
          {invalid ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center mb-4"><AlertTriangle size={24} className="text-amber-400" /></div>
              <h1 className="text-xl font-bold mb-2">Invalid reset link</h1>
              <p className="text-sm text-[#8B949E] mb-6">This link is missing information or has expired. Request a new one.</p>
              <Link href="/forgot-password"><Button fullWidth>Request New Link</Button></Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/15 flex items-center justify-center mb-4"><CheckCircle2 size={26} className="text-green-400" /></div>
              <h1 className="text-xl font-bold mb-2">Password reset!</h1>
              <p className="text-sm text-[#8B949E]">Your password has been changed. Redirecting to sign in…</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
              <p className="text-sm text-[#8B949E] mb-6">For <span className="text-[#E6EDF3]">{email}</span></p>
              <form onSubmit={submit} className="space-y-4">
                <Input label="New password" type={showPw ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} prefix={<Lock size={15} />} suffix={pwToggle} />
                <Input label="Confirm new password" type={showPw ? 'text' : 'password'} placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} prefix={<Lock size={15} />} />
                <Button type="submit" fullWidth size="lg" isLoading={loading} rightIcon={<ArrowRight size={16} />}>Reset Password</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0A0B0D]"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ResetForm />
    </Suspense>
  );
}
