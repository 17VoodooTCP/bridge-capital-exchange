import { PublicShell } from '@/components/layout/PublicShell';
import { Mail, MessageSquare, Building2 } from 'lucide-react';

export const metadata = { title: 'Contact — Bridge Capital' };

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="max-w-3xl mx-auto px-4 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-[#8B949E] mb-10">We&apos;re here to help. Reach the right team below.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-[#161B22] border border-[#21262D] p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3"><Mail size={20} className="text-amber-400" /></div>
            <h3 className="font-semibold mb-1">Customer Support</h3>
            <p className="text-sm text-[#8B949E] mb-3">Account, deposits, withdrawals, and general help.</p>
            <a href="mailto:support@bridgecapitalv1.com" className="text-sm text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>
          </div>
          <div className="rounded-2xl bg-[#161B22] border border-[#21262D] p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3"><MessageSquare size={20} className="text-amber-400" /></div>
            <h3 className="font-semibold mb-1">Live Chat</h3>
            <p className="text-sm text-[#8B949E] mb-3">Chat with our support bot and agents, 24/7.</p>
            <a href="/support" className="text-sm text-amber-400 hover:text-amber-300">Open live chat →</a>
          </div>
          <div className="rounded-2xl bg-[#161B22] border border-[#21262D] p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3"><Building2 size={20} className="text-amber-400" /></div>
            <h3 className="font-semibold mb-1">Institutional & Partnerships</h3>
            <p className="text-sm text-[#8B949E] mb-3">OTC desks, market makers, and business enquiries.</p>
            <a href="mailto:support@bridgecapitalv1.com?subject=Institutional%20enquiry" className="text-sm text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>
          </div>
          <div className="rounded-2xl bg-[#161B22] border border-[#21262D] p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3"><Mail size={20} className="text-amber-400" /></div>
            <h3 className="font-semibold mb-1">Press & Media</h3>
            <p className="text-sm text-[#8B949E] mb-3">Interviews, brand assets, and announcements.</p>
            <a href="mailto:support@bridgecapitalv1.com?subject=Press%20enquiry" className="text-sm text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
