'use client';
import { cn } from '@/lib/utils';

const PURPLE = '#5B4EE8';
const LEAF = 'M0,0 C4.5,-6 13,-7 19,-1.5 C12.5,3.5 4.5,4.5 0,0 Z';

const BADGES = [
  { title: ['MULTI-ASSET', 'TRADING'], sub: 'CRYPTO · STOCKS · ETFS' },
  { title: ['VERIFIED', 'ACCOUNTS'], sub: 'EMAIL OTP & KYC' },
  { title: ['LIVE', 'SUPPORT'], sub: 'IN-APP CHAT' },
];

/** One laurel branch. side: -1 left, 1 right */
function Laurel({ cx, cy, side }: { cx: number; cy: number; side: -1 | 1 }) {
  const R = 128, N = 14, SPAN = 132;
  const at = (t: number) => {
    const deg = (side === -1 ? 180 : 360) + t;
    const rad = (deg * Math.PI) / 180;
    return { deg, x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  };
  const stem: string[] = [];
  for (let k = 0; k <= 24; k++) {
    const { x, y } = at(-SPAN / 2 + (SPAN * k) / 24);
    stem.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <g>
      <polyline points={stem.join(' ')} fill="none" stroke={PURPLE} strokeWidth={3.5} strokeLinecap="round" />
      {Array.from({ length: N }, (_, i) => {
        const t = -SPAN / 2 + (SPAN * i) / (N - 1);
        const { deg, x, y } = at(t);
        const rot = deg + (t < 0 ? 24 : -24);
        const scale = 0.95 + 0.4 * (1 - Math.abs(t) / (SPAN / 2));
        return (
          <g key={i} transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${scale.toFixed(2)})`}>
            <path d={LEAF} fill={PURPLE} />
          </g>
        );
      })}
    </g>
  );
}

/** Laurel trust badges — the same set used in the email footer. */
export function TrustBadges({ className }: { className?: string }) {
  const BW = 420, H = 310, W = BW * BADGES.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('w-full max-w-3xl mx-auto h-auto', className)} role="img" aria-label="Multi-asset trading, verified accounts, live support">
      {BADGES.map((b, i) => {
        const cx = BW * i + BW / 2, cy = H / 2;
        const startY = cy - 14;
        return (
          <g key={b.sub}>
            <Laurel cx={cx} cy={cy} side={-1} />
            <Laurel cx={cx} cy={cy} side={1} />
            {b.title.map((line, k) => (
              <text key={line} x={cx} y={startY + k * 30} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={24} fontWeight={700} letterSpacing={0.5} fill="currentColor">
                {line}
              </text>
            ))}
            <text x={cx} y={startY + b.title.length * 30 + 14} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={15} letterSpacing={1} fill="currentColor" opacity={0.6}>
              {b.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
