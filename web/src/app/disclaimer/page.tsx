import LegalLayout from '@/components/LegalLayout';

export default function Disclaimer() {
  return (
    <LegalLayout title="AI Safety Disclaimer" lastUpdated="March 18, 2026">
      <section className="space-y-8">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl space-y-4">
            <h2 className="text-red-500 font-bold uppercase tracking-widest text-sm">Vital Warning</h2>
            <p className="text-white text-lg">BuddyClaw provides <strong>fictional AI characters</strong> for entertainment purposes only.</p>
        </div>

        <div className="space-y-6 text-white/70">
            <p><strong>Non-Human Entities:</strong> Users explicitly acknowledge that all personas, including "Ziva," "Bua Ji," and others, are artificial intelligence constructs and not real people.</p>
            <p><strong>Mental Health:</strong> These bots are NOT a substitute for professional mental health advice, therapy, or medical intervention. If you are experiencing a crisis, please contact your local emergency services or a mental health professional immediately.</p>
            <p><strong>Factuality:</strong> AI companions may "hallucinate" or provide incorrect information. Do not rely on them for financial, legal, or medical decisions.</p>
            <p><strong>Age Restriction:</strong> This service is intended for users aged 18 and older due to the complex emotional nature of the AI interactions.</p>
        </div>
      </section>
    </LegalLayout>
  );
}
