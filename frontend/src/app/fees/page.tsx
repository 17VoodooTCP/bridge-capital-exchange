import { PublicShell } from '@/components/layout/PublicShell';

export const metadata = { title: 'Fees — Bridge Capital', alternates: { canonical: '/fees' } };

const rows = [
  ['Spot trading (maker)', '0.10%', 'Charged on the traded amount when your order adds liquidity.'],
  ['Spot trading (taker)', '0.10%', 'Charged when your order removes liquidity from the book.'],
  ['Crypto deposit', 'Free', 'Network (gas) fees are set by the blockchain, not by us.'],
  ['Crypto withdrawal', 'From 0.1%', 'Varies by asset and network to cover on-chain costs.'],
  ['Copy trading', 'Profit share', 'Each strategy lists its own profit-share % (paid only on gains).'],
  ['Staking / Earn', 'Free', 'No fees to stake or unstake. You keep 100% of the advertised APR.'],
];

export default function FeesPage() {
  return (
    <PublicShell>
      <section className="max-w-3xl mx-auto px-4 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-4">Fees</h1>
        <p className="text-[#8B949E] mb-10">Simple, transparent pricing. No hidden charges — what you see is what you pay.</p>

        <div className="rounded-2xl border border-[#21262D] overflow-hidden">
          {rows.map(([name, fee, desc], i) => (
            <div key={name} className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-5 ${i % 2 ? 'bg-[#0D1117]' : 'bg-[#161B22]'}`}>
              <div className="sm:w-52 font-medium">{name}</div>
              <div className="sm:w-28 text-amber-400 font-semibold">{fee}</div>
              <div className="flex-1 text-sm text-[#8B949E]">{desc}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#6E7681] mt-6">
          VIP tiers with higher trading volume receive discounted trading fees, ranging from 0.08% down to 0.02%.
          Fees are subject to change; the rates shown here are the current standard schedule.
        </p>
      </section>
    </PublicShell>
  );
}
