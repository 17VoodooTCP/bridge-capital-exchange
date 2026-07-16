import { PublicShell } from '@/components/layout/PublicShell';

export const metadata = { title: 'Legal — Bridge Capital' };

export default function LegalPage() {
  return (
    <PublicShell>
      <section className="max-w-3xl mx-auto px-4 lg:px-8 py-20 space-y-14">
        <div id="risk" className="scroll-mt-24">
          <h1 className="text-3xl font-bold mb-4">Risk Disclosure</h1>
          <div className="space-y-3 text-sm text-[#8B949E] leading-relaxed">
            <p>Trading and investing in cryptocurrencies, stocks, and ETFs involves substantial risk and may result in the loss of some or all of your invested capital. Prices can be highly volatile and are influenced by factors beyond our control.</p>
            <p>Past performance — including any simulated or backtested figures shown on the platform (for example, in Copy Trading) — is not a reliable indicator of future results and does not guarantee future returns. Only invest capital you can afford to lose.</p>
            <p>Copy trading carries the additional risk that a strategy you follow may perform differently than its historical figures suggest. Staking and Earn products may have lock-up periods during which funds cannot be withdrawn. Nothing on this platform constitutes financial, investment, legal, or tax advice.</p>
            <p>You are solely responsible for evaluating the merits and risks associated with the use of any information or services provided. Consider seeking independent professional advice before making investment decisions.</p>
          </div>
        </div>

        <div id="terms" className="scroll-mt-24">
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <div className="space-y-3 text-sm text-[#8B949E] leading-relaxed">
            <p><strong className="text-[#E6EDF3]">1. Acceptance.</strong> By creating an account or using Bridge Capital, you agree to these Terms. If you do not agree, do not use the platform.</p>
            <p><strong className="text-[#E6EDF3]">2. Eligibility.</strong> You must be of legal age in your jurisdiction and complete any required identity verification (KYC) to access full account features.</p>
            <p><strong className="text-[#E6EDF3]">3. Account security.</strong> You are responsible for safeguarding your credentials and for all activity under your account. Enable two-factor authentication for additional protection.</p>
            <p><strong className="text-[#E6EDF3]">4. Prohibited use.</strong> You may not use the platform for unlawful activity, market manipulation, or to circumvent applicable regulations.</p>
            <p><strong className="text-[#E6EDF3]">5. Suspension.</strong> We may restrict or suspend accounts showing unusual or suspicious activity, pending review. Restricted users retain read access and may contact support to resolve the matter.</p>
            <p><strong className="text-[#E6EDF3]">6. Changes.</strong> We may update these Terms; continued use after changes constitutes acceptance.</p>
          </div>
        </div>

        <div id="privacy" className="scroll-mt-24">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <div className="space-y-3 text-sm text-[#8B949E] leading-relaxed">
            <p><strong className="text-[#E6EDF3]">Data we collect.</strong> Account details (name, email), verification documents, transaction records, device and session information (IP, device type) used for security.</p>
            <p><strong className="text-[#E6EDF3]">How we use it.</strong> To operate your account, process transactions, prevent fraud, comply with legal obligations, and send service notifications.</p>
            <p><strong className="text-[#E6EDF3]">Security.</strong> Sensitive data is encrypted, and access to it is restricted by role-based permissions and audited.</p>
            <p><strong className="text-[#E6EDF3]">Your rights.</strong> You may request access to or deletion of your personal data by contacting support, subject to legal retention requirements.</p>
            <p>Questions about privacy? Email <a href="mailto:support@bridgecapitalv1.com" className="text-amber-400 hover:text-amber-300">support@bridgecapitalv1.com</a>.</p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
