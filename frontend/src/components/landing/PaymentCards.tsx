'use client';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

/* Fixed OHLC series — deterministic so server and client render identically
   (Math.random here would break hydration). Values are in arbitrary price units. */
const CANDLES: { o: number; h: number; l: number; c: number }[] = [
  { o: 42, h: 48, l: 40, c: 46 }, { o: 46, h: 52, l: 45, c: 51 },
  { o: 51, h: 53, l: 46, c: 47 }, { o: 47, h: 50, l: 43, c: 44 },
  { o: 44, h: 49, l: 42, c: 48 }, { o: 48, h: 56, l: 47, c: 55 },
  { o: 55, h: 58, l: 52, c: 53 }, { o: 53, h: 55, l: 47, c: 49 },
  { o: 49, h: 51, l: 44, c: 45 }, { o: 45, h: 54, l: 44, c: 53 },
  { o: 53, h: 61, l: 52, c: 60 }, { o: 60, h: 63, l: 56, c: 57 },
  { o: 57, h: 59, l: 53, c: 58 }, { o: 58, h: 66, l: 57, c: 65 },
];

const PAIRS = ['EUR/USD', 'BTC/USD', 'XAU/USD', 'GBP/JPY'];
const QUOTES = ['1.0847', '63,929', '2,412.60', '188.42'];

/** Animated candlestick chart drawn on the back of each card. */
function Candles({ tint }: { tint: string }) {
  const W = 200, H = 64, PAD = 3;
  const highs = CANDLES.map((c) => c.h);
  const lows = CANDLES.map((c) => c.l);
  const max = Math.max(...highs), min = Math.min(...lows);
  const y = (v: number) => PAD + ((max - v) / (max - min)) * (H - PAD * 2);
  const step = W / CANDLES.length;
  const bw = step * 0.52;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" aria-hidden="true">
      {/* faint grid */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke={tint} strokeOpacity="0.12" strokeWidth="0.5" strokeDasharray="2 3" />
      ))}
      {CANDLES.map((c, i) => {
        const up = c.c >= c.o;
        const color = up ? '#16C784' : '#EA3943';
        const cx = i * step + step / 2;
        const top = y(Math.max(c.o, c.c));
        const bot = y(Math.min(c.o, c.c));
        return (
          <g key={i} className="candle" style={{ animationDelay: `${i * 55}ms`, transformOrigin: `${cx}px ${H / 2}px` }}>
            <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth="1" />
            <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(bot - top, 1.5)} fill={color} rx="0.6" />
          </g>
        );
      })}
    </svg>
  );
}

const CARDS = [
  { front: 'bg-gradient-to-br from-gray-100 to-gray-300 text-[#111]', back: 'bg-gradient-to-br from-gray-200 to-gray-400 text-[#111]', tint: '#111318', name: 'Silver', last: '4821' },
  { front: 'bg-gradient-to-br from-[#111318] to-[#2A2F36] text-white', back: 'bg-gradient-to-br from-[#15181D] to-[#31363E] text-white', tint: '#ffffff', name: 'Obsidian', last: '7390' },
  { front: 'bg-gradient-to-br from-amber-400 to-orange-500 text-black', back: 'bg-gradient-to-br from-amber-500 to-orange-600 text-black', tint: '#1a1206', name: 'Gold', last: '1024' },
  { front: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white', back: 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white', tint: '#ffffff', name: 'Prime', last: '5567' },
];

export function PaymentCards() {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [armed, setArmed] = useState(false);

  // Flip as the cards scroll into view, then keep cycling on their own.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setArmed(true); io.disconnect(); } },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!armed) return;
    // Respect users who prefer reduced motion — show the backs, don't loop.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const first = setTimeout(() => setFlipped(true), 350);
    if (reduce) return () => clearTimeout(first);
    const loop = setInterval(() => setFlipped((f) => !f), 6500);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, [armed]);

  return (
    <div ref={ref} className="card-swipe flex gap-5 overflow-x-auto pb-6 mb-8 px-[calc(50%-7rem)] snap-x snap-mandatory">
      {CARDS.map((c, i) => (
        <div key={c.name} className="shrink-0 snap-center" style={{ perspective: '1200px' }}>
          <div
            className="relative w-56 h-36"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${flipped ? 180 : 0}deg)`,
              transition: 'transform 900ms cubic-bezier(.2,.75,.25,1)',
              transitionDelay: `${i * 130}ms`,
            }}
          >
            {/* Front */}
            <div className={cn('absolute inset-0 rounded-2xl shadow-2xl p-4 text-left overflow-hidden', c.front)} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
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

            {/* Back — live-markets face */}
            <div
              className={cn('absolute inset-0 rounded-2xl shadow-2xl overflow-hidden', c.back)}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="absolute inset-0 flex flex-col">
                {/* magnetic stripe */}
                <div className="h-7 bg-black/70 mt-3 shrink-0" />
                <div className="flex-1 min-h-0 flex flex-col px-4 pt-1.5 pb-3">
                  <div className="flex items-baseline justify-between shrink-0">
                    <span className="text-[9px] font-semibold tracking-wider opacity-70">{PAIRS[i]}</span>
                    <span className="text-[9px] font-mono opacity-70">{QUOTES[i]}</span>
                  </div>
                  {/* chart fills whatever height is left */}
                  <div className="flex-1 min-h-0 py-0.5">{flipped && <Candles tint={c.tint} />}</div>
                  <div className="flex items-end justify-between shrink-0">
                    <div>
                      <div className="text-[7px] uppercase tracking-wider opacity-50 leading-none mb-0.5">Valid thru</div>
                      <div className="text-[10px] font-mono opacity-80 leading-none">09/30</div>
                    </div>
                    <div className="text-[9px] font-semibold tracking-wider opacity-60">{c.name}</div>
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full bg-red-500/80" />
                      <div className="w-5 h-5 rounded-full bg-amber-400/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
