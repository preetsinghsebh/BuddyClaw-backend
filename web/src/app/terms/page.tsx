import LegalLayout from '@/components/LegalLayout';

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service | BuddyClaw" lastUpdated="March 18, 2026">
      <section className="space-y-6">
        <h2 className="text-2xl font-medium text-[#FFB300]">1. Acceptance of Terms</h2>
        <p>By accessing BuddyClaw via Telegram or our Website, you agree to be bound by these terms. This service is provided "as is" for entertainment purposes.</p>
        
        <h2 className="text-2xl font-medium text-[#FFB300]">2. User Conduct</h2>
        <p>You agree not to use the AI companions for illegal activities, harassment, or to generate non-consensual sexual content. We reserve the right to terminate access for terms violations.</p>

        <h2 className="text-2xl font-medium text-[#FFB300]">3. Subscription & Payments</h2>
        <p>Pro features are billed via third-party processors (Razorpay). Subscriptions can be cancelled at any time, but partial month refunds are not provided.</p>

        <h2 className="text-2xl font-medium text-[#FFB300]">4. Intellectual Property</h2>
        <p>The AI models and character definitions (Manifestos) are the property of BuddyClaw. User-generated chat history is and remains the property of the user, processed under license to provide the service.</p>

        <h2 className="text-2xl font-medium text-[#FFB300]">5. Limitation of Liability</h2>
        <p>BuddyClaw is not liable for any emotional distress, misinformation, or perceived loss resulting from interaction with our fictional AI characters.</p>
      </section>
    </LegalLayout>
  );
}
