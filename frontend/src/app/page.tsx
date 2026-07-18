'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, Shield, Sparkles, TrendingUp, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { SocialIcons } from '@/components/layout/SocialIcons';
import { AssetIcon } from '@/components/ui/AssetIcon';
import { CryptoConstellation } from '@/components/layout/CryptoConstellation';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { useMarketData } from '@/hooks/useMarketData';
import { formatCurrency, formatPercent, getChangeColor, formatVolume, cn } from '@/lib/utils';

const glass = 'backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl';

export default function LandingPage() {
  const router = useRouter();
  const { assets } = useMarketData();
  const [heroTab, setHeroTab] = useState<'hot' | 'gainers'>('hot');
  const [phoneScreen, setPhoneScreen] = useState(0);

  // Cycle the phone demo through Portfolio → Trade → Earn
  useEffect(() => {
    const t = setInterval(() => setPhoneScreen((s) => (s + 1) % 3), 4500);
    return () => clearInterval(t);
  }, []);

  const cryptos = assets.filter((a) => a.type === 'CRYPTO');
  const trending = cryptos.slice(0, 2);
  const hotCoins = cryptos.slice(0, 4);
  const gainers = [...assets].sort((a, b) => b.changePercent24h - a.changePercent24h).slice(0, 4);
  const listed = heroTab === 'hot' ? hotCoins : gainers;

  const createAccount = async () => {
    if (!form.name.trim() || !form.email.trim()) return toast.error('Please enter your name and email');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setCreating(true);
    try {
      const data = await authApi.register({ name: form.name.trim(), email: form.email.trim(), password: form.password, country: 'US' });
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome to Bridge Capital, ${form.name.split(' ')[0]}! 🎉`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg === 'Email already registered' ? 'This email is already registered — try logging in.' : 'Could not create account. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E6EDF3] overflow-x-hidden">
      {/* Sweep + float animations */}
      <style>{`
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0) rotate(var(--tilt, 0deg)); }
          50% { transform: translateY(-14px) rotate(var(--tilt, 0deg)); }
        }
        @keyframes shineSweep {
          0% { transform: translateX(-150%) skewX(-18deg); }
          60%, 100% { transform: translateX(250%) skewX(-18deg); }
        }
        @keyframes slowSpin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes wave { 0%,100% { transform: rotate(0deg);} 25% { transform: rotate(14deg);} 75% { transform: rotate(-8deg);} }
        @keyframes bobble { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
        .flip-scene { perspective: 1200px; }
        .flip-inner { transform-style: preserve-3d; transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1); }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .flip-back { transform: rotateY(180deg); }
        .btc-avatar { animation: bobble 2.4s ease-in-out infinite; }
        .logo-spin { animation: slowSpin 8s linear infinite; display: flex; }
        .shine {
          content: ''; position: absolute; top: 0; bottom: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: shineSweep 4.5s ease-in-out infinite;
        }
        .card-swipe { scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; }
        .card-swipe::-webkit-scrollbar { display: none; }
        .globe-ring { animation: slowSpin 24s linear infinite; }
        @keyframes screenIn { from { opacity: 0; transform: translateX(24px);} to { opacity: 1; transform: translateX(0);} }
        .screen-in { animation: screenIn 0.45s ease-out; }
        @keyframes balancePulse { 0%,100% { opacity: 1;} 50% { opacity: 0.75;} }
        .balance-live { animation: balancePulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* ─── Nav ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0B0D]/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={34} />
              <div>
                <div className="text-sm font-bold leading-tight">Bridge Capital</div>
              </div>
            </Link>
            <nav className="hidden lg:flex items-center gap-6 text-sm text-[#8B949E]">
              <Link href="/markets" className="hover:text-[#E6EDF3] transition-colors">Markets</Link>
              <Link href="/trade" className="hover:text-[#E6EDF3] transition-colors">Trade</Link>
              <Link href="/earn" className="hover:text-[#E6EDF3] transition-colors">Earn</Link>
              <Link href="/stocks" className="hover:text-[#E6EDF3] transition-colors">Stocks</Link>
              <Link href="/etfs" className="hover:text-[#E6EDF3] transition-colors">ETFs</Link>
              <Link href="/news" className="hover:text-[#E6EDF3] transition-colors">News</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Link href="/login" className="px-4 py-2 text-sm text-[#E6EDF3] hover:text-amber-400 transition-colors">Log In</Link>
            <Link href="/register"><Button size="sm">Sign Up</Button></Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40"><CryptoConstellation /></div>
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-[1.08] mb-4">
              One bridge to
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">every market.</span>
            </h1>
            <p className="text-[#8B949E] mb-8 max-w-md">
              Crypto, stocks and ETFs in a single secure account. Open yours in under a minute.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/register">
                <Button size="xl" rightIcon={<ArrowRight size={18} />}>Sign Up</Button>
              </Link>
              <Link href="/markets" className="text-sm text-[#8B949E] hover:text-amber-400 transition-colors">
                Explore markets first →
              </Link>
            </div>
          </div>

          {/* Glass market widget */}
          <div className="space-y-4">
            <div className={cn(glass, 'p-5')}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold flex items-center gap-2"><Sparkles size={14} className="text-amber-400" /> Trending</span>
                <span className="text-xs text-[#8B949E]">TradFi</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {trending.map((a) => (
                  <div key={a.id} className="rounded-xl bg-black/30 p-4">
                    <div className="flex items-center gap-2 text-xs text-[#8B949E] mb-1">
                      <AssetIcon symbol={a.symbol} fallback={a.icon} size={18} /> {a.symbol}/USDT
                    </div>
                    <div className="text-xl font-bold">{formatCurrency(a.price)}</div>
                    <div className={cn('text-xs', getChangeColor(a.changePercent24h))}>{formatPercent(a.changePercent24h)}</div>
                    <div className="mt-2"><MiniSparkline data={a.sparkline || []} positive={a.changePercent24h >= 0} height={28} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn(glass, 'p-5')}>
              <div className="flex items-center gap-4 mb-3 text-sm">
                <button onClick={() => setHeroTab('hot')} className={cn('font-semibold pb-1 border-b-2 transition-colors', heroTab === 'hot' ? 'border-amber-500 text-[#E6EDF3]' : 'border-transparent text-[#8B949E]')}>Hot Coins</button>
                <button onClick={() => setHeroTab('gainers')} className={cn('font-semibold pb-1 border-b-2 transition-colors', heroTab === 'gainers' ? 'border-amber-500 text-[#E6EDF3]' : 'border-transparent text-[#8B949E]')}>Top Gainers</button>
                <Link href="/markets" className="ml-auto text-xs text-[#8B949E] hover:text-amber-400">View all</Link>
              </div>
              {listed.map((a) => (
                <Link key={a.id} href="/markets" className="flex items-center gap-3 py-2 hover:bg-white/[0.03] rounded-lg px-2 -mx-2 transition-colors">
                  <AssetIcon symbol={a.symbol} fallback={a.icon} size={26} />
                  <span className="text-sm font-medium flex-1">{a.symbol}<span className="text-[#6E7681] text-xs">/USDT</span></span>
                  <span className="text-sm font-mono">{formatCurrency(a.price)}</span>
                  <span className={cn('text-xs w-16 text-right', getChangeColor(a.changePercent24h))}>{formatPercent(a.changePercent24h)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Spot listings ─── */}
      <section className="bg-[#F5F6F8] text-[#111318] py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <div className="text-xs tracking-[0.3em] text-[#8B949E] mb-2">SPOT X</div>
          <h2 className="text-2xl lg:text-4xl font-bold mb-2">Never miss a listing — and a chance to earn.</h2>
          <p className="text-sm text-[#57606A] mb-10">Share our rewarding prize pools from exciting launch events.</p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Token Splash', pool: 'Share 30,000,000 CAP', sym: 'BTC' },
              { name: 'Token Splash', pool: 'Share 2,150,000 ARX', sym: 'ETH' },
              { name: 'Puzzle Hunt', pool: 'Share 200,000 USDT', sym: 'USDT' },
            ].map((e, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E4E7EB] p-5 text-left hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/register')}>
                <div className="text-xs text-[#8B949E] mb-1">{e.name}</div>
                <div className="font-semibold mb-3">{e.pool}</div>
                <div className="flex items-center gap-2 text-sm text-[#57606A]">
                  <AssetIcon symbol={e.sym} size={22} /> <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-10" onClick={() => router.push('/register')}>Explore Spot X</Button>
        </div>
      </section>

      {/* ─── Earn ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-4xl font-bold mb-12">Make crypto work <span className="text-amber-400">for you</span></h2>
          <div className="grid lg:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <div className={cn(glass, 'p-8 relative overflow-hidden text-left')}>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/15 blur-[70px] rounded-full" />
              <div className="text-xs text-[#8B949E] flex items-center gap-2 mb-4"><Shield size={13} className="text-amber-400" /> New user exclusive</div>
              <div className="text-sm text-[#8B949E]">Up to</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent my-2">8.00% APR</div>
              <div className="text-sm text-[#8B949E]">on your first USDT fixed savings</div>
            </div>
            <div className="grid gap-5">
              {[
                { sym: 'BTC', label: 'BTC Savings APR', apr: '5.00%' },
                { sym: 'ETH', label: 'ETH Savings APR', apr: '4.50%' },
              ].map((s) => (
                <Link key={s.sym} href="/earn" className={cn(glass, 'p-6 flex items-center gap-4 hover:border-amber-500/30 transition-colors')}>
                  <AssetIcon symbol={s.sym} size={40} />
                  <div className="text-left flex-1">
                    <div className="text-sm text-[#8B949E]">{s.label}</div>
                    <div className="text-2xl font-bold text-green-400">{s.apr}</div>
                  </div>
                  <ChevronRight size={18} className="text-[#8B949E]" />
                </Link>
              ))}
            </div>
          </div>
          <Link href="/earn"><Button className="mt-10">Earn Now</Button></Link>
        </div>
      </section>

      {/* ─── Cards / Pay ─── */}
      <section className="bg-[#F5F6F8] text-[#111318] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <div className="card-swipe flex gap-5 overflow-x-auto pb-6 mb-8 px-[calc(50%-7rem)] snap-x snap-mandatory">
            {[
              { bg: 'bg-gradient-to-br from-gray-100 to-gray-300 text-[#111]', name: 'Silver', last: '4821' },
              { bg: 'bg-gradient-to-br from-[#111318] to-[#2A2F36] text-white', name: 'Obsidian', last: '7390' },
              { bg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-black', name: 'Gold', last: '1024' },
              { bg: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white', name: 'Prime', last: '5567' },
            ].map((c, i) => (
              <div
                key={i}
                className={cn('relative w-56 h-36 rounded-2xl shadow-2xl p-4 text-left overflow-hidden shrink-0 snap-center', c.bg)}
              >
                <span className="shine" />
                <div className="flex items-center gap-2">
                  <Logo size={26} />
                  <span className="text-xs font-bold tracking-wider">BRIDGE CAPITAL</span>
                </div>
                <div className="absolute top-4 right-4 text-[10px] font-semibold uppercase opacity-60">{c.name}</div>
                <div className="absolute bottom-4 left-4 text-xs font-mono opacity-70">•••• {c.last}</div>
                <div className="absolute bottom-4 right-4 flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500/80" />
                  <div className="w-6 h-6 rounded-full bg-amber-400/80" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#8B949E] mb-8 flex items-center justify-center gap-1.5"><span className="hidden sm:inline">←</span> Swipe to explore all cards <span className="hidden sm:inline">→</span></p>
          <h2 className="text-2xl lg:text-4xl font-bold mb-6">Live crypto. Pay anywhere. Get 10% back.</h2>
          <Button onClick={() => router.push('/register')}>Get My Card</Button>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-14">
            {[
              { v: '8', l: 'Currencies supported' },
              { v: '2 million', l: 'Cardholders globally' },
              { v: 'Top tier', l: 'Cashback and rewards' },
            ].map((s) => (
              <div key={s.l}><div className="text-xl lg:text-2xl font-bold">{s.v}</div><div className="text-xs text-[#57606A] mt-1">{s.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mobile app ─── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          {/* Phone mockup — animated in-app demo (Portfolio → Trade → Earn) */}
          <div className="flex justify-center">
            <div className="relative w-64 h-[520px] rounded-[2.5rem] border-4 border-[#21262D] bg-[#0D1117] shadow-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20"><div className="w-24 h-5 bg-[#21262D] rounded-b-2xl" /></div>

              {/* App header (always visible) */}
              <div className="absolute top-7 inset-x-0 px-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-bold text-black">AM</div>
                  <div>
                    <div className="text-[10px] text-[#8B949E] leading-tight">Welcome back</div>
                    <div className="text-[11px] font-semibold leading-tight">Alex Morgan</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>

              {/* Screens */}
              <div className="pt-16 px-5 pb-14 h-full">
                {phoneScreen === 0 && (
                  <div className="screen-in">
                    <div className="text-[10px] text-[#8B949E]">Total Balance</div>
                    <div className="text-2xl font-bold balance-live">{formatCurrency(72338 + (cryptos[0]?.price ?? 0) % 100)}</div>
                    <div className="text-[11px] text-green-400 mb-3">+$1,842.15 (2.61%) today</div>
                    <div className="grid grid-cols-4 gap-1.5 mb-4">
                      {['Deposit', 'Withdraw', 'Trade', 'Earn'].map((q) => (
                        <div key={q} className="rounded-lg bg-[#161B22] border border-[#21262D] py-1.5 text-center text-[9px] text-[#8B949E]">{q}</div>
                      ))}
                    </div>
                    <div className="h-20 mb-4"><MiniSparkline data={cryptos[0]?.sparkline || []} positive height={76} /></div>
                    <div className="text-[10px] text-[#8B949E] mb-2">Holdings</div>
                    <div className="space-y-2.5">
                      {cryptos.slice(0, 4).map((a) => (
                        <div key={a.id} className="flex items-center gap-2 text-[11px]">
                          <AssetIcon symbol={a.symbol} fallback={a.icon} size={20} />
                          <span className="flex-1 font-medium">{a.symbol}</span>
                          <span className="font-mono">{formatCurrency(a.price)}</span>
                          <span className={cn('w-12 text-right', getChangeColor(a.changePercent24h))}>{formatPercent(a.changePercent24h)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {phoneScreen === 1 && (
                  <div className="screen-in">
                    <div className="flex items-center gap-2 mb-1">
                      <AssetIcon symbol="BTC" size={20} />
                      <span className="text-xs font-semibold">BTC/USDT</span>
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">LIVE</span>
                    </div>
                    <div className="text-xl font-bold">{formatCurrency(cryptos[0]?.price ?? 0)}</div>
                    <div className={cn('text-[11px] mb-3', getChangeColor(cryptos[0]?.changePercent24h ?? 0))}>{formatPercent(cryptos[0]?.changePercent24h ?? 0)} · 24h</div>
                    <div className="h-28 mb-3"><MiniSparkline data={cryptos[0]?.sparkline || []} positive={(cryptos[0]?.changePercent24h ?? 0) >= 0} height={108} /></div>
                    <div className="flex gap-1 mb-4">
                      {['1m', '15m', '1H', '4H', '1D'].map((tf, i) => (
                        <div key={tf} className={cn('flex-1 text-center text-[9px] py-1 rounded', i === 2 ? 'bg-amber-500/15 text-amber-400' : 'text-[#6E7681]')}>{tf}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-green-500 text-black text-center py-2.5 text-xs font-bold">Buy</div>
                      <div className="rounded-xl bg-red-500 text-white text-center py-2.5 text-xs font-bold">Sell</div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex justify-between text-[10px] font-mono">
                          <span className="text-red-400">{formatCurrency((cryptos[0]?.price ?? 0) * (1 + 0.0004 * (i + 1)))}</span>
                          <span className="text-[#6E7681]">{(0.4 + i * 0.31).toFixed(3)}</span>
                          <span className="text-green-400">{formatCurrency((cryptos[0]?.price ?? 0) * (1 - 0.0004 * (i + 1)))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {phoneScreen === 2 && (
                  <div className="screen-in">
                    <div className="text-xs font-semibold mb-3">Earn Center</div>
                    <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-600/5 border border-amber-500/20 p-3 mb-3">
                      <div className="text-[10px] text-[#8B949E]">Total Earning</div>
                      <div className="text-lg font-bold text-amber-400">+$412.86</div>
                      <div className="text-[9px] text-[#8B949E]">across 3 active positions</div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { sym: 'USDT', apr: '8.0%', d: '90d Fixed' },
                        { sym: 'BTC', apr: '5.0%', d: '30d Fixed' },
                        { sym: 'ETH', apr: '4.5%', d: 'Flexible' },
                        { sym: 'SOL', apr: '6.5%', d: '60d Fixed' },
                      ].map((p) => (
                        <div key={p.sym} className="flex items-center gap-2 rounded-xl bg-[#161B22] border border-[#21262D] p-2.5">
                          <AssetIcon symbol={p.sym} size={22} />
                          <div className="flex-1">
                            <div className="text-[11px] font-medium">{p.sym} Earn</div>
                            <div className="text-[9px] text-[#6E7681]">{p.d}</div>
                          </div>
                          <span className="text-[11px] font-bold text-green-400">{p.apr}</span>
                          <div className="text-[9px] px-2 py-1 rounded-lg bg-amber-500 text-black font-semibold">Stake</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom nav */}
              <div className="absolute bottom-0 inset-x-0 h-12 bg-[#0D1117] border-t border-[#21262D] flex items-center justify-around px-3 z-10">
                {['Home', 'Markets', 'Trade', 'Earn'].map((t, i) => (
                  <div key={t} className={cn('text-[9px] text-center transition-colors duration-300', phoneScreen === (i === 0 ? 0 : i === 2 ? 1 : i === 3 ? 2 : -1) ? 'text-amber-400 font-semibold' : 'text-[#6E7681]')}>
                    <div className={cn('w-1 h-1 rounded-full mx-auto mb-1 transition-colors duration-300', phoneScreen === (i === 0 ? 0 : i === 2 ? 1 : i === 3 ? 2 : -1) ? 'bg-amber-400' : 'bg-transparent')} />
                    {t}
                  </div>
                ))}
              </div>

              {/* Screen progress dots */}
              <div className="absolute bottom-14 inset-x-0 flex justify-center gap-1.5 z-10">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={cn('h-1 rounded-full transition-all duration-300', phoneScreen === i ? 'w-4 bg-amber-400' : 'w-1 bg-[#30363D]')} />
                ))}
              </div>
            </div>
          </div>
          {/* Live market tiles */}
          <div className={cn(glass, 'p-8')}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl lg:text-2xl font-bold">Markets, in real time</h3>
              <span className="flex items-center gap-1.5 text-xs text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live</span>
            </div>
            <p className="text-sm text-[#8B949E] mb-6">Prices update every few seconds, straight from the exchange.</p>
            <div className="grid grid-cols-2 gap-3">
              {cryptos.slice(0, 6).map((a, i) => (
                <div
                  key={a.id}
                  className={cn(glass, 'p-4 flex flex-col gap-2 transition-transform hover:scale-[1.03]')}
                  style={{ animation: `cardFloat 6s ease-in-out ${i * 0.4}s infinite` }}
                >
                  <div className="flex items-center gap-2">
                    <AssetIcon symbol={a.symbol} fallback={a.icon} size={26} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight">{a.symbol}</div>
                      <div className="text-[10px] text-[#8B949E] truncate">{a.name}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums">{formatCurrency(a.price)}</div>
                  <div className={cn('text-xs font-medium', getChangeColor(a.changePercent24h))}>{formatPercent(a.changePercent24h)} 24h</div>
                </div>
              ))}
            </div>
            <Link href="/markets"><Button variant="outline" fullWidth className="mt-6" rightIcon={<ArrowRight size={15} />}>View all markets</Button></Link>
          </div>
        </div>
      </section>

      {/* ─── Trust / stats ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          {/* Dotted globe */}
          <div className="flex justify-center">
            <div className="relative w-72 h-72">
              <div className="globe-ring absolute inset-0 rounded-full border border-amber-500/20" />
              <div className="globe-ring absolute inset-4 rounded-full border border-dashed border-amber-500/25" style={{ animationDirection: 'reverse', animationDuration: '32s' }} />
              <div
                className="absolute inset-8 rounded-full opacity-80"
                style={{
                  backgroundImage: 'radial-gradient(circle at 35% 35%, rgba(232,181,71,0.35), transparent 60%), radial-gradient(rgba(232,181,71,0.5) 1.2px, transparent 1.4px)',
                  backgroundSize: '100% 100%, 12px 12px',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center"><Logo size={64} /></div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-4xl font-bold mb-8">Robust and reliable, trusted by millions</h2>
            <div className={cn(glass, 'p-6 mb-4')}>
              <div className="text-3xl font-bold">{formatVolume(18_258_061_324)}</div>
              <div className="text-xs text-[#8B949E] mt-1">24h trading volume</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(glass, 'p-6')}><div className="text-2xl font-bold">350+</div><div className="text-xs text-[#8B949E] mt-1">Assets listed</div></div>
              <div className={cn(glass, 'p-6')}><div className="text-2xl font-bold">20+</div><div className="text-xs text-[#8B949E] mt-1">Trading tools</div></div>
            </div>
            <Link href="/register"><Button className="mt-8" rightIcon={<ArrowRight size={16} />}>Join the Movement</Button></Link>
          </div>
        </div>
      </section>

      {/* ─── Safety ─── */}
      <section className="py-20 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-4xl font-bold mb-14">You&apos;re safe to grow with us</h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, t: 'Globally regulated', d: 'Licensed and compliant across major jurisdictions.' },
              { icon: TrendingUp, t: 'Industry-recognized', d: 'Awarded exchange platform of the year, 2025.' },
              { icon: Headphones, t: 'Worldwide support', d: '24/7 customer service across 240+ countries.' },
            ].map((s) => (
              <div key={s.t} className={cn(glass, 'p-8')}>
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center mb-4"><s.icon size={22} className="text-amber-400" /></div>
                <div className="font-semibold mb-2">{s.t}</div>
                <div className="text-xs text-[#8B949E] leading-relaxed">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.06] bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4"><Logo size={34} /><span className="font-bold text-sm">Bridge Capital</span></div>
              <SocialIcons />
            </div>
            {[
              { h: 'About', links: [['About Us', '/about'], ['Careers', '/careers'], ['Press Room', '/about#press'], ['Announcements', '/about#announcements'], ['Risk Disclosure', '/legal#risk']] },
              { h: 'Services', links: [['Trade', '/trade'], ['Earn', '/earn'], ['Copy Trading', '/copy-trading'], ['Stocks', '/stocks'], ['ETFs', '/etfs']] },
              { h: 'Support', links: [['Help Center', '/help'], ['Contact Us', '/contact'], ['Trading Fees', '/fees'], ['Terms of Service', '/legal#terms'], ['Privacy Policy', '/legal#privacy']] },
              { h: 'Products', links: [['Markets', '/markets'], ['Wallet', '/wallet'], ['News', '/news'], ['Settings', '/settings'], ['Support', '/support']] },
            ].map((col) => (
              <div key={col.h}>
                <div className="font-semibold text-sm mb-4">{col.h}</div>
                <ul className="space-y-2.5 text-xs text-[#8B949E]">
                  {col.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-[#E6EDF3] transition-colors">{label}</Link></li>)}
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
