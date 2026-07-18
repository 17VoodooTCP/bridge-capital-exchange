'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const LENGTH = 6;

function VerifyForm() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const { verifyEmail } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const code = digits.join('');

  const submit = async (value?: string) => {
    const final = value ?? code;
    if (final.length !== LENGTH) return toast.error(`Enter all ${LENGTH} digits`);
    setLoading(true);
    try {
      await verifyEmail(email, final);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Invalid verification code');
      setDigits(Array(LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '');
    if (!clean) { setDigits((d) => d.map((x, k) => (k === i ? '' : x))); return; }
    // Handle paste of the whole code into one box
    if (clean.length > 1) {
      const next = clean.slice(0, LENGTH).split('');
      const filled = Array(LENGTH).fill('').map((_, k) => next[k] || '');
      setDigits(filled);
      inputs.current[Math.min(next.length, LENGTH - 1)]?.focus();
      if (next.length === LENGTH) submit(filled.join(''));
      return;
    }
    const nextDigits = digits.map((x, k) => (k === i ? clean : x));
    setDigits(nextDigits);
    if (i < LENGTH - 1) inputs.current[i + 1]?.focus();
    if (nextDigits.every((d) => d)) submit(nextDigits.join(''));
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const resend = async () => {
    try {
      await authApi.resendVerification(email);
      toast.success('A new code is on its way.');
      setCooldown(45);
    } catch {
      toast.error('Could not resend the code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0B0D]">
      <div className="absolute top-4 right-4"><LanguageSwitcher compact /></div>
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-8 justify-center">
          <Logo size={40} />
          <div className="text-sm font-bold">Bridge Capital</div>
        </Link>

        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <MailCheck size={22} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Verify your email</h1>
          <p className="text-sm text-[#8B949E] mb-6">
            We sent a {LENGTH}-digit code to{' '}
            <span className="text-[#E6EDF3] font-medium break-all">{email || 'your email'}</span>. It expires in 15 minutes.
          </p>

          <div className="flex gap-2 justify-between mb-5" dir="ltr">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={LENGTH}
                autoFocus={i === 0}
                className="w-12 h-14 text-center text-xl font-bold bg-[#111318] border border-[#21262D] rounded-lg text-[#E6EDF3] outline-none focus:border-amber-500/60 transition-colors"
              />
            ))}
          </div>

          <Button fullWidth size="lg" isLoading={loading} rightIcon={<ArrowRight size={16} />} onClick={() => submit()}>
            Verify &amp; Continue
          </Button>

          <div className="mt-5 text-center text-sm text-[#8B949E]">
            Didn&apos;t get it?{' '}
            {cooldown > 0 ? (
              <span className="text-[#6E7681]">Resend in {cooldown}s</span>
            ) : (
              <button onClick={resend} className="text-amber-400 hover:text-amber-300 font-medium">Resend code</button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[#8B949E] mt-6">
          Wrong address?{' '}
          <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium">Sign up again</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0B0D]" />}>
      <VerifyForm />
    </Suspense>
  );
}
