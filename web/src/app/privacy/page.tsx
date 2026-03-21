import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy | BuddyClaw" lastUpdated="March 18, 2026">
      <section className="space-y-6">
        <h2 className="text-2xl font-medium text-[#FFB300]">1. Data Collection</h2>
        <p>BuddyClaw collects minimal data required to provide our AI companion services. This includes your Telegram Chat ID, nicknames you provide, and interaction history with our bots.</p>
        
        <h2 className="text-2xl font-medium text-[#FFB300]">2. Chat History</h2>
        <p>Interaction data is stored securely in our localized persistence layer to provide context and "memory" for your AI companions. We do not sell this data to third parties.</p>

        <h2 className="text-2xl font-medium text-[#FFB300]">3. AI Processing</h2>
        <p>Conversations are processed via private AI proxies to generate responses. These interactions are anonymized where possible.</p>

        <h2 className="text-2xl font-medium text-[#FFB300]">4. Your Rights</h2>
        <p>You can wipe your memory at any time by typing <code className="text-[#FFB300]">/wipememory</code> in any our bot interfaces or via the Web Dashboard.</p>
      </section>
    </LegalLayout>
  );
}
