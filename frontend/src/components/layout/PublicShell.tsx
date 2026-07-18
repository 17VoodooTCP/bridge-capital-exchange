'use client';
import Link from 'next/link';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/button';

const footerCols = [
  { h: 'About', links: [['About Us', '/about'], ['Careers', '/careers'], ['Press Room', '/about#press'], ['Announcements', '/about#announcements'], ['Risk Disclosure', '/legal#risk']] },
  { h: 'Services', links: [['Trade', '/trade'], ['Earn', '/earn'], ['Copy Trading', '/copy-trading'], ['Referral Program', '/about'], ['Institutional', '/contact']] },
  { h: 'Support', links: [['Help Center', '/help'], ['Contact Us', '/contact'], ['Trading Fees', '/fees'], ['Terms of Service', '/legal#terms'], ['Privacy Policy', '/legal#privacy']] },
  { h: 'Products', links: [['Markets', '/markets'], ['Stocks', '/stocks'], ['ETFs', '/etfs'], ['Wallet', '/wallet'], ['News', '/news']] },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E6EDF3] flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0B0D]/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={34} />
            <span className="text-sm font-bold">Bridge Capital</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#8B949E]">
            <Link href="/about" className="hover:text-[#E6EDF3]">About</Link>
            <Link href="/fees" className="hover:text-[#E6EDF3]">Fees</Link>
            <Link href="/help" className="hover:text-[#E6EDF3]">Help</Link>
            <Link href="/contact" className="hover:text-[#E6EDF3]">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Link href="/login" className="px-4 py-2 text-sm hover:text-amber-400 transition-colors">Log In</Link>
            <Link href="/register"><Button size="sm">Sign Up</Button></Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4"><Logo size={34} /><span className="font-bold text-sm">Bridge Capital</span></div>
              <p className="text-xs text-[#8B949E]">Multi-asset trading for crypto, stocks and ETFs.</p>
            </div>
            {footerCols.map((col) => (
              <div key={col.h}>
                <div className="font-semibold text-sm mb-4">{col.h}</div>
                <ul className="space-y-2.5 text-xs text-[#8B949E]">
                  {col.links.map(([label, href]) => (
                    <li key={label}><Link href={href} className="hover:text-[#E6EDF3] transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 text-sm text-[#8B949E]">
            Support: <a href="mailto:support@bridgecapitalv1.com" className="text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>
          </div>
          <div className="border-t border-white/[0.06] mt-6 pt-6 text-xs text-[#6E7681] flex flex-col md:flex-row justify-between gap-3">
            <span>© 2026 Bridge Capital. All rights reserved.</span>
            <span>Trading involves risk. Past performance is not indicative of future results.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
