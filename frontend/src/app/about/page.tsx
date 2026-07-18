import { PublicShell } from '@/components/layout/PublicShell';
import { Shield, Globe, TrendingUp, Users } from 'lucide-react';

export const metadata = { title: 'About — Bridge Capital', alternates: { canonical: '/about' } };

const stats = [
  { v: '2.4M+', l: 'Registered users' },
  { v: '$142B', l: '24h trading volume' },
  { v: '350+', l: 'Listed assets' },
  { v: '99.99%', l: 'Platform uptime' },
];

const values = [
  { icon: Shield, t: 'Security first', d: 'Cold-storage custody, multi-factor authentication, and continuous monitoring protect every account.' },
  { icon: Globe, t: 'One account, every market', d: 'Trade cryptocurrencies, US stocks, and ETFs from a single unified balance.' },
  { icon: TrendingUp, t: 'Built for everyone', d: 'From first-time investors to professional traders, our tools scale with your ambition.' },
  { icon: Users, t: 'Transparent by design', d: 'Clear fees, auditable operations, and honest disclosures — no hidden surprises.' },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="max-w-4xl mx-auto px-4 lg:px-8 py-20">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">About Bridge Capital</h1>
        <p className="text-lg text-[#8B949E] leading-relaxed mb-12">
          Bridge Capital is a multi-asset trading and investment platform on a mission to make institutional-grade
          markets accessible to everyone. We bring crypto, equities, and ETFs together under one secure account so you
          can build and manage your entire portfolio in one place.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((s) => (
            <div key={s.l} className="rounded-2xl bg-[#161B22] border border-[#21262D] p-5 text-center">
              <div className="text-2xl lg:text-3xl font-bold text-amber-400">{s.v}</div>
              <div className="text-xs text-[#8B949E] mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">What we stand for</h2>
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {values.map((v) => (
            <div key={v.t} className="rounded-2xl bg-[#161B22] border border-[#21262D] p-6">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3"><v.icon size={20} className="text-amber-400" /></div>
              <h3 className="font-semibold mb-1.5">{v.t}</h3>
              <p className="text-sm text-[#8B949E] leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>

        <div id="press" className="scroll-mt-24 mb-16">
          <h2 className="text-2xl font-bold mb-4">Press Room</h2>
          <p className="text-sm text-[#8B949E] leading-relaxed mb-4">
            For media enquiries, interviews, or brand assets, reach our communications team at{' '}
            <a href="mailto:support@bridgecapitalv1.com" className="text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>.
          </p>
        </div>

        <div id="announcements" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4">Announcements</h2>
          <div className="space-y-3">
            {[
              { d: 'Copy Trading is live', t: 'Follow leading strategies and mirror their trades automatically.' },
              { d: 'Stocks & ETFs added', t: 'Trade US equities and ETFs alongside crypto from one balance.' },
              { d: 'Earn up to 8% APR', t: 'Flexible and fixed staking products now available on major assets.' },
            ].map((a) => (
              <div key={a.d} className="rounded-xl bg-[#161B22] border border-[#21262D] p-4">
                <div className="font-medium text-sm">{a.d}</div>
                <div className="text-xs text-[#8B949E] mt-0.5">{a.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
