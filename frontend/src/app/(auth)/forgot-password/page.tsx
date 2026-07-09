'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/layout/Logo';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email address');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      // Endpoint always returns 200 to prevent email enumeration; show success regardless
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0B0D]">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-8"><Logo size={48} /></Link>

        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/15 flex items-center justify-center mb-4">
                <CheckCircle2 size={26} className="text-green-400" />
              </div>
              <h1 className="text-xl font-bold mb-2">Check your email</h1>
              <p className="text-sm text-[#8B949E] mb-6">
                If an account exists for <span className="text-[#E6EDF3]">{email}</span>, we&apos;ve sent a password-reset link. It expires in 30 minutes.
              </p>
              <Link href="/login"><Button variant="outline" fullWidth leftIcon={<ArrowLeft size={15} />}>Back to Sign In</Button></Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
              <p className="text-sm text-[#8B949E] mb-6">Enter your email and we&apos;ll send you a link to reset it.</p>
              <form onSubmit={submit} className="space-y-4">
                <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} prefix={<Mail size={15} />} />
                <Button type="submit" fullWidth size="lg" isLoading={loading} rightIcon={<ArrowRight size={16} />}>Send Reset Link</Button>
              </form>
              <Link href="/login" className="mt-5 flex items-center justify-center gap-1.5 text-sm text-[#8B949E] hover:text-amber-400 transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
