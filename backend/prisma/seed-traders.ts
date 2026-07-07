import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fictional trader names — no real individuals. First + last pools combined.
const FIRST = ['Alex', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Taylor', 'Cameron', 'Devon', 'Skyler', 'Quinn',
  'Marcus', 'Elena', 'Priya', 'Diego', 'Amara', 'Kenji', 'Sofia', 'Liam', 'Nadia', 'Omar',
  'Zoe', 'Ravi', 'Lena', 'Theo', 'Maya', 'Ivan', 'Chloe', 'Hassan', 'Grace', 'Mateo',
  'Aria', 'Felix', 'Nora', 'Sasha', 'Bruno', 'Ingrid', 'Kai', 'Yara', 'Emil', 'Rosa'];
const LAST = ['Vance', 'Reyes', 'Holt', 'Okafor', 'Sato', 'Kramer', 'Diallo', 'Novak', 'Bianchi', 'Farrell',
  'Mensah', 'Costa', 'Ahmed', 'Larsen', 'Petrov', 'Rhodes', 'Guerra', 'Nash', 'Ibrahim', 'Vega',
  'Frost', 'Malik', 'Serrano', 'Chen', 'Bauer', 'Osei', 'Kelly', 'Romano', 'Haas', 'Sharma'];

const CRYPTO_STRATS = ['BTC Momentum', 'ETH Swing', 'Altcoin Rotation', 'DeFi Yield Hunter', 'Scalping Grid',
  'Trend Following', 'Mean Reversion', 'Breakout Hunter', 'SOL Ecosystem', 'Layer-2 Basket'];
const STOCK_STRATS = ['Blue-Chip Growth', 'Tech Momentum', 'Dividend Compounder', 'Small-Cap Value',
  'Earnings Play', 'ETF Rotation', 'Sector Momentum', 'AI & Semis', 'Index Swing', 'Contrarian Value'];

const RISK = ['LOW', 'MEDIUM', 'HIGH'];
const ASSET_AVATARS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'USDT', 'AVAX'];

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  const existing = await prisma.trader.count().catch(() => 0);
  if (existing >= 150) {
    console.log(`✅ ${existing} traders already seeded — skipping`);
    return;
  }

  const traders = [];
  const usedHandles = new Set<string>();

  for (let i = 0; i < 200; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const name = `${first} ${last}`;
    let handle = `${first}${last}`.toLowerCase();
    while (usedHandles.has(handle)) handle = `${first}${last}${randInt(1, 99)}`.toLowerCase();
    usedHandles.add(handle);

    const market = i % 5 === 0 ? 'STOCKS' : i % 7 === 0 ? 'MIXED' : 'CRYPTO';
    const strategy = market === 'STOCKS' ? pick(STOCK_STRATS) : pick(CRYPTO_STRATS);
    const risk = pick(RISK);

    // Realistic, VARIED, non-guaranteed simulated performance.
    // Higher risk -> wider ROI range and lower win rate.
    const winRate = risk === 'LOW' ? rand(58, 74) : risk === 'MEDIUM' ? rand(48, 68) : rand(40, 62);
    const totalTrades = randInt(400, 4200);
    const wins = Math.round(totalTrades * (winRate / 100));
    const losses = totalTrades - wins;
    const roi30d = risk === 'LOW' ? rand(2, 9) : risk === 'MEDIUM' ? rand(4, 22) : rand(-6, 48);

    // Every ~9th trader uses an asset glyph avatar (e.g. Bitcoin), rest use initials
    const useAsset = i % 9 === 0;

    traders.push({
      name,
      handle,
      avatarType: useAsset ? 'ASSET' : 'INITIALS',
      avatarValue: useAsset ? pick(ASSET_AVATARS) : null,
      market,
      strategy,
      wins,
      losses,
      winRate: parseFloat(winRate.toFixed(1)),
      roi30d: parseFloat(roi30d.toFixed(1)),
      profitSharePct: pick([10, 10, 12, 15, 15, 18, 20, 8]),
      aum: parseFloat(rand(50_000, 8_000_000).toFixed(0)),
      copiers: randInt(12, 9800),
      riskLevel: risk,
      isActive: true,
    });
  }

  await prisma.trader.createMany({ data: traders, skipDuplicates: true });
  console.log(`✅ Seeded ${traders.length} simulated copy-trading strategies`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
