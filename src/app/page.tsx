export const dynamic = 'force-dynamic';
import { getProfitCardData, getMatchesForCarrossel } from '@/lib/queries';
import { FixedProfitCard } from '@/components/ProfitCard';
import { GameCardItem, mockGameCards } from '@/components/GameCard';
import LandingMenu from '@/components/LandingMenu';
import { SignInCTA } from '@/components/SignInCTA';

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { value: '+75%',  label: 'ROI - IEM RIO' },
  { value: '1.2k+', label: 'MATCHES ANALYZED' },
  { value: '72%',   label: 'PICK ACCURACY' },
];

const MOCK_BETS = [
  { num: 1, label: 'Over 2.5 Maps',          badge: 'S', badgeBg: '#32e601', odd: '1.75', edge: '+12.4%', stake: '3u' },
  { num: 2, label: 'Handicap +1.5 (G2)',     badge: 'A', badgeBg: '#32e601', odd: '1.85', edge: '+8.7%',  stake: '2u' },
  { num: 3, label: 'Map 1 Total Over 26.5',  badge: 'B', badgeBg: '#e8cd01', odd: '1.90', edge: '+5.3%',  stake: '1u' },
];

// ─── Shared style helpers ─────────────────────────────────────────────────────

const sora   = (size: number, weight: number, color: string): React.CSSProperties =>
  ({ fontFamily: 'var(--font-sora), sans-serif', fontWeight: weight, fontSize: `${size}px`, color, lineHeight: 'normal' });

const inter  = (size: number, weight: number, color: string): React.CSSProperties =>
  ({ fontFamily: "'Inter', sans-serif", fontWeight: weight, fontSize: `${size}px`, color, lineHeight: 'normal' });

const barlow = (size: number, weight: number, color: string): React.CSSProperties =>
  ({ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: weight, fontSize: `${size}px`, color, lineHeight: 'normal' });

const mono   = (size: number, color: string): React.CSSProperties =>
  ({ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: `${size}px`, color, fontVariantNumeric: 'tabular-nums' });

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const [matches, profit] = await Promise.all([
    getMatchesForCarrossel(),
    getProfitCardData(),
  ]);

  const displayCards = matches.length > 0 ? matches.slice(0, 5) : mockGameCards;

  return (
    <main className="min-h-screen" style={{ background: '#05060f' }}>
      <LandingMenu />

      {/* ── [Hero] ──────────────────────────────────────────────────────── */}
      <section
        className="px-6 lg:px-[150px] py-[120px] relative flex items-center"
        style={{
          maxHeight: '620px',
          minHeight: '620px',
          background: `linear-gradient(0deg, #000 0%, #B4B4B4 100%), linear-gradient(0deg, #D9FF00 0%, #D9FF00 100%), url('/bg_hero_home.jpg') lightgray 50% / cover no-repeat`,
          backgroundBlendMode: 'multiply, hue, normal',
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left: headline + CTA */}
          <div className="flex flex-col gap-8 max-w-[600px]">
            <div className="flex flex-col gap-1">
              <h1 style={{ ...sora(48, 500, '#ffffff'), lineHeight: 1.2 }}>
                Stop betting on vibes.
              </h1>
              <h1 style={{ ...sora(48, 500, '#d9ff00'), lineHeight: 1.2 }}>
                Start lurking the data.
              </h1>
            </div>
            <SignInCTA
              className="self-start"
              style={{
                ...sora(13, 600, '#000'),
                background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6',
                border: '2px solid #FFF',
                padding: '16px 36px',
                borderRadius: '4px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            />
          </div>

          {/* Right: live Profit Card */}
          <div style={{ width: '218px', height: '306px', flexShrink: 0 }}>
            <FixedProfitCard
              balance={profit.balance}
              greens={profit.greens}
              totalEntries={profit.totalResolved}
              lastUpdated={profit.lastUpdated ?? undefined}
            />
          </div>
        </div>
      </section>

      {/* ── [Cards] ─────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-[150px] py-24">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-12">
          <h2 style={{ ...sora(32, 500, '#ffffff'), lineHeight: 1.2 }}>
            Live analysis updated for every match
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6" style={{ minHeight: '280px' }}>
            {displayCards.map((card) => (
              <GameCardItem key={card.slug} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* ── [Dashboard] ─────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-[150px] py-24">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-12">
          {/* Heading */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full" style={{ background: '#BBFF14', opacity: 0.7, width: '4px', height: '4px' }} />
              <span style={{ ...inter(11, 500, '#6b7280'), letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Analysis Platform
              </span>
            </div>
            <h2 style={{ ...sora(32, 500, '#ffffff'), lineHeight: 1.2 }}>
              Every analysis. Every entry. Every detail.
            </h2>
          </div>

          {/* Browser window */}
          <div className="rounded-[12px] overflow-hidden" style={{ border: '1px solid #2b2b2b' }}>
            {/* Chrome bar */}
            <div className="relative flex items-center px-4" style={{ background: '#0a0c0e', height: '30px' }}>
              <div className="flex items-center gap-[8px]">
                <div className="rounded-full" style={{ width: '8px', height: '8px', background: '#FF5E57' }} />
                <div className="rounded-full" style={{ width: '8px', height: '8px', background: '#FFBD2E' }} />
                <div className="rounded-full" style={{ width: '8px', height: '8px', background: '#29C740' }} />
              </div>
              <span className="absolute left-1/2 -translate-x-1/2" style={{ ...sora(12, 500, '#5a626b') }}>
                ANALYSIS GAME PAGE
              </span>
            </div>

            {/* DataPage mockup — tamanhos espelhados do componente DataPage real */}
            <div style={{ background: '#05060f' }}>
              {/* Match header — px-6 md:px-12 py-6 igual ao DataPage */}
              <div className="px-6 md:px-12 py-6" style={{ borderBottom: '1px solid #2b2b2b' }}>
                <div className="panel-bg rounded-[4px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ border: '1px solid #2b2b2b' }}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-full bg-[#BBFF14]" style={{ width: '6px', height: '6px' }} />
                      <span style={inter(12, 500, '#b5b5b5')}>PGL Cluj-Napoca 2026</span>
                      <div className="bg-white rounded-[2px] px-[6px] py-[2px]">
                        <span style={inter(12, 500, '#0a0b14')}>BO3</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p style={barlow(12, 500, '#666')}>#8</p>
                        <p style={barlow(24, 500, '#ffffff')}>Natus Vincere</p>
                      </div>
                      <span style={inter(12, 500, '#adadad')}>vs</span>
                      <div>
                        <p style={barlow(12, 500, '#666')}>#12</p>
                        <p style={barlow(24, 500, '#ffffff')}>G2</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="panel-bg rounded-[6px] flex flex-col items-center justify-center px-5 py-4 gap-1" style={{ border: '1px solid #1e2028', minWidth: '80px' }}>
                      <p style={{ ...inter(11, 500, '#6b7280'), letterSpacing: '0.08em', textTransform: 'uppercase' }}>ENTRIES</p>
                      <p style={{ ...barlow(22, 600, '#ffffff'), fontVariantNumeric: 'tabular-nums' }}>7 EV+</p>
                    </div>
                    <div className="panel-bg rounded-[6px] flex flex-col items-center justify-center px-5 py-4 gap-1" style={{ border: '1px solid #1e2028', minWidth: '72px' }}>
                      <p style={{ ...inter(11, 500, '#6b7280'), letterSpacing: '0.08em', textTransform: 'uppercase' }}>EDGE</p>
                      <p style={{ ...barlow(22, 600, '#BBFF14'), fontVariantNumeric: 'tabular-nums' }}>12.4%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DataViz row — gap-6 e padding iguais ao DataPage real */}
              <div className="px-6 md:px-12 py-6" style={{ borderBottom: '1px solid #2b2b2b' }}>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Win Probability */}
                  <div className="panel-bg rounded-[20px] p-[18px] flex flex-col justify-between gap-6 flex-1 min-w-0" style={{ border: '1px solid #2b2b2b' }}>
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-[6px]">
                        <span className="inline-block rounded-full" style={{ background: '#BBFF14', opacity: 0.6, width: '4px', height: '4px' }} />
                        <span style={{ ...inter(13, 500, '#6b7280'), letterSpacing: '0.08em', textTransform: 'uppercase' }}>Win Probability</span>
                      </div>
                      <div className="flex items-end justify-between w-full">
                        <div>
                          <p style={barlow(12, 500, '#666')}>#8</p>
                          <p style={barlow(20, 500, '#ffffff')}>NATUS VINCERE</p>
                        </div>
                        <div className="text-right">
                          <p style={barlow(12, 500, '#666')}>#12</p>
                          <p style={barlow(20, 500, '#ffffff')}>G2</p>
                        </div>
                      </div>
                      {/* Percentages — 36px / 32px igual ao DataPage */}
                      <div className="flex items-center justify-between w-full">
                        <span style={{ ...barlow(36, 600, '#ffffff'), fontVariantNumeric: 'tabular-nums' }}>52%</span>
                        <span style={{ ...barlow(32, 400, '#BBFF14'), fontVariantNumeric: 'tabular-nums' }}>48%</span>
                      </div>
                    </div>
                    {/* Bar — h-[72px] igual ao DataPage */}
                    <div className="flex w-full" style={{ height: '72px' }}>
                      <div className="state-white shrink-0" style={{ width: '52%', borderRight: 'none', borderRadius: '4px 0 0 4px' }} />
                      <div className="state-yellow flex-1" style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }} />
                    </div>
                  </div>

                  {/* Best Opportunity */}
                  <div className="panel-bg rounded-[20px] p-[18px] flex flex-col justify-between gap-6 flex-1 min-w-0 self-stretch" style={{ border: '1px solid #2b2b2b' }}>
                    <div className="flex items-center gap-[6px]">
                      <span className="inline-block rounded-full" style={{ background: '#BBFF14', opacity: 0.6, width: '4px', height: '4px' }} />
                      <span style={{ ...inter(13, 500, '#6b7280'), letterSpacing: '0.08em', textTransform: 'uppercase' }}>Best Opportunity</span>
                    </div>
                    <p style={inter(16, 500, '#ffffff')}>
                      NaVi domina first half — Over tem histórico forte neste mapa.
                    </p>
                    {/* Split card — h-[77px] igual ao DataPage */}
                    <div className="flex w-full" style={{ height: '77px' }}>
                      <div className="state-white flex-1 flex items-center px-6" style={{ borderRight: 'none', borderRadius: '4px 0 0 4px' }}>
                        <p style={barlow(18, 600, '#000')}>OVER 2.5 MAPS</p>
                      </div>
                      <div className="state-yellow flex items-center justify-center px-6 shrink-0" style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }}>
                        <p style={{ ...barlow(24, 600, '#000'), whiteSpace: 'nowrap' }}>67%</p>
                      </div>
                    </div>
                  </div>

                  {/* Entries Return — text-[20px] igual ao DataPage */}
                  <div className="panel-bg rounded-[20px] p-[18px] flex flex-col gap-[10px] flex-1 min-w-0 self-stretch" style={{ border: '1px solid #2b2b2b' }}>
                    <div className="state-white flex-1 flex items-center justify-center w-full">
                      <p style={barlow(20, 600, '#000')}>7 ENTRIES</p>
                    </div>
                    <div className="state-yellow flex-1 flex items-center justify-between px-6 w-full">
                      <p style={{ ...barlow(20, 600, '#000'), textTransform: 'uppercase' }}>POTENTIAL RETURN</p>
                      <p style={barlow(20, 600, '#000')}>+12u</p>
                    </div>
                    <div className="state-green flex-1 flex items-center justify-between px-6 w-full">
                      <p style={{ ...barlow(20, 600, '#000'), textTransform: 'uppercase' }}>PUBLIC BET</p>
                      <p style={barlow(20, 600, '#000')}>23% OVER</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bet rows — py-5 e gap-[8px] iguais ao DataPage */}
              <div className="px-6 md:px-12 py-6 flex flex-col gap-6">
                {MOCK_BETS.map((bet) => (
                  <div key={bet.num} className="panel-bg rounded-[4px] flex items-center gap-4 px-4 py-5 w-full" style={{ border: '1px solid #1e2028' }}>
                    <span style={{ ...mono(11, '#4b5563'), width: '16px', textAlign: 'right', flexShrink: 0 }}>{bet.num}</span>
                    <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
                      <p style={{ ...inter(15, 500, '#ffffff'), letterSpacing: '-0.2px' }}>{bet.label}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span style={{ ...inter(12, 500, '#4b5563'), textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          ODD{' '}<span style={mono(12, '#e2e8f0')}>{bet.odd}</span>
                        </span>
                        <span style={inter(12, 400, '#2b2b2b')}>·</span>
                        <span style={{ ...inter(12, 500, '#4b5563'), textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          EDGE{' '}<span style={mono(12, '#BBFF14')}>{bet.edge}</span>
                        </span>
                        <span style={inter(12, 400, '#2b2b2b')}>·</span>
                        <span style={{ ...inter(12, 500, '#4b5563'), textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          STAKE{' '}<span style={mono(12, '#e2e8f0')}>{bet.stake}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center shrink-0" style={{ width: '22px', height: '22px', borderRadius: '3px', background: bet.badgeBg }}>
                      <span style={{ ...inter(10, 700, '#000') }}>{bet.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── [Stats] ─────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-[150px] py-24">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center gap-12">
          {/* Stat items — sem card, texto puro */}
          <div className="flex flex-wrap items-center justify-center gap-[35px]">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-[9px]">
                <span style={{ ...sora(64, 600, '#d9ff00'), lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {stat.value}
                </span>
                <span style={{ ...sora(16, 500, '#5a626b') }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Headline */}
          <div className="flex flex-col items-center gap-[11px] text-center">
            <p style={{ ...sora(16, 400, '#5a626b') }}>Your edge is one tab away.</p>
            <h2>
              <span style={{ ...sora(64, 600, '#e8eaed'), display: 'block', lineHeight: 1.03 }}>Stop arguing.</span>
              <span style={{ ...sora(64, 600, '#e8eaed'), display: 'block', lineHeight: 1.03 }}>Start measuring.</span>
            </h2>
          </div>
        </div>
      </section>
    </main>
  );
}
