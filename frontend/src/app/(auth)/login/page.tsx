'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Shield, ArrowRight, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { CryptoConstellation } from '@/components/layout/CryptoConstellation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFA, setTwoFA] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password, twoFactorCode: twoFA || undefined });
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[#0D1117] to-[#161B22] p-12 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full" />
        <CryptoConstellation />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <Logo size={36} />
          <div>
            <div className="text-sm font-bold">Bridge Capital</div>
          </div>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Welcome back to <span className="text-amber-400">institutional-grade</span> investing.
          </h2>
          <p className="text-[#8B949E] max-w-md">Access your portfolio, trade across crypto, stocks and ETFs, and manage your wealth — all in one secure platform.</p>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#8B949E] relative z-10">
          <span className="flex items-center gap-1.5"><Shield size={13} /> SOC 2 Type II</span>
          <span className="flex items-center gap-1.5"><Lock size={13} /> 256-bit SSL</span>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#0A0B0D]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Logo size={36} />
            <span className="font-bold">Bridge Capital</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-sm text-[#8B949E] mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefix={<Mail size={15} />}
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefix={<Lock size={15} />}
              suffix={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#8B949E] hover:text-amber-400 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            {show2FA && (
              <Input
                label="2FA Code"
                type="text"
                placeholder="123456"
                value={twoFA}
                onChange={(e) => setTwoFA(e.target.value)}
                prefix={<KeyRound size={15} />}
                hint="Enter the 6-digit code from your authenticator app"
              />
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-[#8B949E]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-[#21262D] bg-[#111318] text-amber-500 focus:ring-amber-500/30"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-amber-400 hover:text-amber-300">Forgot password?</Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={loading} rightIcon={<ArrowRight size={16} />}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-[#8B949E] mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
