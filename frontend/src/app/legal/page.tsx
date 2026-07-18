import { PublicShell } from '@/components/layout/PublicShell';
import { RiskContent, TermsContent, PrivacyContent } from '@/components/legal/LegalContent';

export const metadata = { title: 'Legal — Bridge Capital', alternates: { canonical: '/legal' } };

export default function LegalPage() {
  return (
    <PublicShell>
      <section className="max-w-3xl mx-auto px-4 lg:px-8 py-20 space-y-14">
        <div id="risk" className="scroll-mt-24">
          <h1 className="text-3xl font-bold mb-4">Risk Disclosure</h1>
          <RiskContent />
        </div>

        <div id="terms" className="scroll-mt-24">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <TermsContent />
        </div>

        <div id="privacy" className="scroll-mt-24">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <PrivacyContent />
        </div>
      </section>
    </PublicShell>
  );
}
