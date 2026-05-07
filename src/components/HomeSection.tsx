'use client'

export default function HomeSection() {
  return (
    <section className="w-full px-6 py-12">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-16">

        {/* Hero */}
        <div className="flex flex-col gap-5 max-w-[760px]">
          {/* Eyebrow label */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-[4px] h-[4px] rounded-full" style={{ background: '#BBFF14' }} />
            <span
              className="text-[11px] uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#6b7280', letterSpacing: '0.1em' }}
            >
              CS2 Analytics · Positive Expected Value Betting
            </span>
          </div>
          <h1
            className="text-[44px] sm:text-[56px] font-semibold leading-[1.05] tracking-tight text-white"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Data-driven decisions,{' '}
            <span style={{ color: '#BBFF14' }}>not gut feelings.</span>
          </h1>
          <p
            className="text-[15px] leading-relaxed max-w-[600px]"
            style={{ fontFamily: "'Inter', sans-serif", color: '#6b7280' }}
          >
            Find the perfect edge in top CS2 matches. Our platform cross-references
            statistics, map history, and market movements to surface entries with{' '}
            <span style={{ color: '#e2e8f0', fontWeight: 500 }}>Positive Expected Value (+EV)</span>.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="📊"
            title="Real Probability vs. Odds"
            description="We don't just look at who's going to win. We calculate the real probability of each outcome to find discrepancies at the bookmakers. If the odds pay more than the risk, we flag the entry."
            accent="#D9FF00"
          />
          <FeatureCard
            icon="🛡️"
            title="Controlled Exposure"
            description="Bankroll management is everything. Every entry suggestion includes the exact recommended stake size (in units), classifying exposure between conservative and aggressive to protect your capital."
            accent="#60FFFA"
          />
          <FeatureCard
            icon="🎯"
            title="Skin in the Game"
            description="Full transparency on results. Our dashboard shows the real-time PnL (Profit and Loss) of our analyses. Track the balance over the past weeks and verify the model's effectiveness yourself."
            accent="#BBFF14"
          />
        </div>

        {/* CTA */}
        <div
          className="flex flex-col items-center gap-4 py-12 rounded-[20px] border"
          style={{
            background: 'linear-gradient(180deg, #10111A 0%, #0C0D16 100%)',
            borderColor: '#1e2028',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-[4px] h-[4px] rounded-full" style={{ background: '#BBFF14' }} />
            <span
              className="text-[11px] uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: '#6b7280', letterSpacing: '0.1em' }}
            >
              Getting started
            </span>
          </div>
          <p
            className="text-[22px] font-semibold text-white text-center"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Select a match from the panel above ↑
          </p>
          <p
            className="text-[14px] text-center max-w-[480px]"
            style={{ fontFamily: "'Inter', sans-serif", color: '#6b7280', lineHeight: '1.6' }}
          >
            Browse the carousel to access the detailed dashboard for each match.
            Explore active analyses, compare map vetos, and check pre-game entry suggestions.
          </p>
        </div>

      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: string
  title: string
  description: string
  accent: string
}) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-[20px] border relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #10111A 0%, #0C0D16 100%)',
        borderColor: '#1e2028',
      }}
    >
      {/* Accent left border */}
      <div
        className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full"
        style={{ background: accent, opacity: 0.7 }}
        aria-hidden
      />
      <div className="flex items-center gap-3 pl-3">
        <span className="text-[22px]" aria-hidden>{icon}</span>
        <span
          className="text-[17px] font-semibold leading-tight"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            color: accent,
          }}
        >
          {title}
        </span>
      </div>
      <p
        className="text-[14px] leading-relaxed pl-3"
        style={{ fontFamily: "'Inter', sans-serif", color: '#6b7280' }}
      >
        {description}
      </p>
    </div>
  )
}
