import { PublicShell } from '@/components/layout/PublicShell';
import { MapPin } from 'lucide-react';

export const metadata = { title: 'Careers — Bridge Capital' };

const roles = [
  { t: 'Senior Backend Engineer', team: 'Engineering', loc: 'Remote' },
  { t: 'Product Designer', team: 'Design', loc: 'Remote' },
  { t: 'Compliance Analyst', team: 'Legal & Compliance', loc: 'Remote' },
  { t: 'Customer Support Specialist', team: 'Operations', loc: 'Remote' },
  { t: 'Growth Marketer', team: 'Marketing', loc: 'Remote' },
];

export default function CareersPage() {
  return (
    <PublicShell>
      <section className="max-w-3xl mx-auto px-4 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-4">Careers</h1>
        <p className="text-[#8B949E] mb-10">
          We&apos;re building the future of multi-asset investing. Join a distributed team that ships fast, cares deeply
          about users, and takes security seriously.
        </p>

        <h2 className="text-xl font-semibold mb-4">Open positions</h2>
        <div className="space-y-3">
          {roles.map((r) => (
            <a key={r.t} href={`mailto:support@bridgecapitalv1.com?subject=${encodeURIComponent(`Application: ${r.t}`)}`}
              className="flex items-center gap-4 rounded-xl bg-[#161B22] border border-[#21262D] p-4 hover:border-amber-500/30 transition-colors">
              <div className="flex-1">
                <div className="font-medium">{r.t}</div>
                <div className="text-xs text-[#8B949E]">{r.team}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#8B949E]"><MapPin size={12} /> {r.loc}</div>
              <span className="text-sm text-amber-400">Apply →</span>
            </a>
          ))}
        </div>

        <p className="text-sm text-[#8B949E] mt-8">
          Don&apos;t see your role? Send your CV to{' '}
          <a href="mailto:support@bridgecapitalv1.com?subject=Open%20application" className="text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>.
        </p>
      </section>
    </PublicShell>
  );
}
