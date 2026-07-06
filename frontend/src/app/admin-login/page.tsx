'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, KeyRound, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/layout/Logo';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFA, setTwoFA] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Enter your admin credentials');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password, twoFactorCode: twoFA || undefined });
      if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
        toast.error('This account does not have admin privileges.');
        return;
      }
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome, ${data.user.name}`);
      router.push('/admin');
    } catch {
      toast.error('Access denied. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0B0D] relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-500/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Logo size={52} />
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium">
            <Shield size={13} /> RESTRICTED — ADMINISTRATORS ONLY
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-1">Admin Control Center</h1>
          <p className="text-sm text-[#8B949E] mb-6">Authenticate to manage the platform</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin email"
              type="email"
              placeholder="admin@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefix={<Mail size={15} />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefix={<Lock size={15} />}
            />
            <Input
              label="2FA Code (if enabled)"
              placeholder="123456"
              value={twoFA}
              onChange={(e) => setTwoFA(e.target.value)}
              prefix={<KeyRound size={15} />}
            />
            <Button type="submit" fullWidth size="lg" variant="danger" isLoading={loading} rightIcon={<ArrowRight size={16} />}>
              Authenticate
            </Button>
          </form>

          <div className="flex items-start gap-2 text-xs text-[#8B949E] bg-[#0D1117] border border-[#21262D] rounded-lg p-3 mt-5">
            <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
            All access attempts are logged with IP address, device, and location. Unauthorized access is prohibited.
          </div>
        </div>

        <p className="text-center text-xs text-[#6E7681] mt-6">
          Bridge Capital Exchange · Admin Portal v1.0
        </p>
      </div>
    </div>
  );
}
