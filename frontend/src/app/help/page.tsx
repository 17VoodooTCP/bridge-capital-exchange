import { PublicShell } from '@/components/layout/PublicShell';
import { FAQ_ITEMS } from '@/lib/constants';

export const metadata = { title: 'Help Center — Bridge Capital' };

export default function HelpPage() {
  return (
    <PublicShell>
      <section className="max-w-3xl mx-auto px-4 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-[#8B949E] mb-10">
          Answers to the most common questions. Still stuck? Email{' '}
          <a href="mailto:support@bridgecapitalv1.com" className="text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>{' '}
          or open live chat from your dashboard.
        </p>

        <div className="space-y-3">
          {FAQ_ITEMS.map((f, i) => (
            <details key={i} className="group rounded-xl bg-[#161B22] border border-[#21262D] p-4">
              <summary className="cursor-pointer font-medium text-sm list-none flex items-center justify-between">
                {f.question}
                <span className="text-[#8B949E] group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="text-sm text-[#8B949E] mt-3 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
