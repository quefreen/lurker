import { getMatchesForCarrossel, getProfitCardData } from '@/lib/queries'
import LandingMenu from '@/components/LandingMenu'
import { CarrosselJogos } from '@/components/CarrosselJogos'
import '@/styles/data-states.css'

// ─── Static mock data ─────────────────────────────────────────────────────────

const MATCH = {
  teamA: 'Natus Vincere', teamB: 'Vitality',
  rankA: 2, rankB: 1,
  event: 'BLAST Rivals 2026', format: 'BO5', date: '2026-05-03',
  forceA: 2.331, partiesA: 29, priorA: 1.091,
  forceB: 15.019, partiesB: 27, priorB: 2.466,
  vetoEdge: '+4.0%', probBase: 18.1, probFinal: 22.1,
  winA: 19.4, winB: 80.6,
  clutchA: 60.0, clutchSampleA: 5, clutchB: 40.0, clutchSampleB: 15,
  mapsEdgeA: 3, mapsEdgeB: 1, banA: 'Anubis', banB: 'Ancient',
  firstHalfA: 21.6,
}

const SERIES_MARKETS = [
  { label: 'Match Winner', rows: [
    { name: 'Natus Vincere', pct: 19.4, good: false },
    { name: 'Vitality', pct: 80.6, good: true },
  ]},
  { label: 'Total Maps 3.5', rows: [
    { name: 'Over', pct: 28.6, good: false },
    { name: 'Under', pct: 71.4, good: true },
  ]},
  { label: 'Handicap', rows: [
    { name: 'Natus Vincere −1.5', pct: 10.2, good: false },
    { name: 'Natus Vincere +1.5', pct: 68.9, good: true },
    { name: 'Vitality −1.5', pct: 61.2, good: true },
    { name: 'Vitality +1.5', pct: 96.6, good: true },
  ]},
  { label: 'At Least 1 Map', rows: [
    { name: 'Natus Vincere', pct: 68.9, good: true },
    { name: 'Vitality', pct: 96.6, good: true },
  ]},
  { label: 'Total Maps 4.5', rows: [
    { name: 'Over', pct: 28.6, good: false },
    { name: 'Under', pct: 71.4, good: true },
  ]},
]

const ROUND_MARKETS = [
  { label: '17.5', over: 72.7, under: 27.3 },
  { label: '19.5', over: 55.9, under: 44.1 },
  { label: '20.5', over: 46.6, under: 53.4 },
  { label: '21.5', over: 44.0, under: 56.0 },
]

const MAP_ROUNDS = [
  { map: 'Anubis',   o19: 65.3, o20: 65.3, o21: 56.3, t1: 5,  t2: 3,  ban: 'Natus Vincere' },
  { map: 'Ancient',  o19: 71.7, o20: 68.9, o21: 68.9, t1: 13, t2: 2,  ban: 'Vitality' },
  { map: 'Dust2',    o19: 34.6, o20: 27.8, o21: 27.0, t1: 20, t2: 17, ban: null },
  { map: 'Inferno',  o19: 73.2, o20: 49.5, o21: 40.0, t1: 13, t2: 12, ban: null },
  { map: 'Mirage',   o19: 54.6, o20: 49.2, o21: 49.2, t1: 21, t2: 15, ban: null },
  { map: 'Nuke',     o19: 68.3, o20: 61.7, o21: 57.4, t1: 5,  t2: 9,  ban: null },
  { map: 'Overpass', o19: 76.7, o20: 75.7, o21: 75.7, t1: 0,  t2: 11, ban: null },
]

const SCENARIOS = [
  { key: '3-0 Natus Vincere', prob: 3.4,  maps: 3, type: 'sweep',  winner: 'a', payoff: -3.0 },
  { key: '3-1 Natus Vincere', prob: 6.8,  maps: 4, type: 'clutch', winner: 'a', payoff: -3.0 },
  { key: '3-2 Natus Vincere', prob: 9.2,  maps: 5, type: 'clutch', winner: 'a', payoff: -3.0 },
  { key: '0-3 Vitality',      prob: 31.1, maps: 3, type: 'sweep',  winner: 'b', payoff:  1.71 },
  { key: '1-3 Vitality',      prob: 30.1, maps: 4, type: 'clutch', winner: 'b', payoff:  1.71 },
  { key: '2-3 Vitality',      prob: 19.4, maps: 5, type: 'clutch', winner: 'b', payoff: -3.0 },
]

const COVERED_SCENARIOS = ['3-0 Natus Vincere', '0-3 Vitality']

const EV_ENTRY = {
  market: 'Under 3.5 — Total Maps',
  odd: 2.58, prob: 71.4, edge: 84.1, confidence: 'A', stake: 3.0, impliedProb: 38.8,
  verdict: 'Good risk/reward ratio validated by sample. Build opportunity.',
  justification: [
    'Historical trend of Under rounds per map in both teams.',
    'Favorite (Vitality) at 81% — dominance compresses series length.',
  ],
}

const PORTFOLIO_ENTRY = {
  market: 'Vitality −1.5 — Map Handicap',
  odd: 1.57, stake: 3.0, type: 'hedge_structural',
  covers: ['0-3 Vitality', '1-3 Vitality'],
}

const DO_NOT_RECOMMEND = [
  { market: 'Match Winner Natus Vincere', edge: -30.6, reason: 'Real probability does not exceed the minimum structural value threshold.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 70) return '#32e601'
  if (pct >= 50) return '#BBFF14'
  if (pct >= 35) return '#FFE23D'
  return '#f40101'
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[6px]">
      <span className="inline-block w-[4px] h-[4px] rounded-full" style={{ background: '#BBFF14', opacity: 0.6 }} />
      <span className="text-[13px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280', letterSpacing: '0.08em' }}>
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="w-full h-[1px] bg-[#2b2b2b]" />
}

function Mono({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontVariantNumeric: 'tabular-nums', color: color ?? '#e2e8f0' }}>
      {children}
    </span>
  )
}

// ─── Section: Header ──────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto">
        <div className="panel-bg rounded-[4px] border border-[#2b2b2b] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#BBFF14]" />
              <span className="text-[#b5b5b5] text-[12px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{MATCH.event}</span>
              <div className="bg-white rounded-[2px] px-[6px] py-[2px]">
                <span className="text-[#0a0b14] text-[12px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{MATCH.format}</span>
              </div>
              <span className="text-[#b5b5b5] text-[12px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{MATCH.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[#666] text-[12px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>#{MATCH.rankA}</p>
                <p className="text-white text-[28px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>{MATCH.teamA}</p>
              </div>
              <span className="text-[#adadad] text-[12px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>vs</span>
              <div>
                <p className="text-[#666] text-[12px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>#{MATCH.rankB}</p>
                <p className="text-white text-[28px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>{MATCH.teamB}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="panel-bg border border-[#1e2028] rounded-[6px] flex flex-col items-center justify-center px-5 py-4 min-w-[80px] gap-1">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280' }}>EDGE</p>
              <p className="text-[22px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, color: '#BBFF14', fontVariantNumeric: 'tabular-nums' }}>+84.1%</p>
            </div>
            <div className="panel-bg border border-[#1e2028] rounded-[6px] flex flex-col items-center justify-center px-5 py-4 min-w-[80px] gap-1">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280' }}>EV+</p>
              <p className="text-white text-[22px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>1 Entry</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Win Probability + Best Opportunity ──────────────────────────────

function WinProbSection() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col lg:flex-row gap-6">
        {/* Win Probability */}
        <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-6 flex-1 min-w-0">
          <SectionLabel label="Win Probability" />
          <div className="flex items-end justify-between w-full">
            <div>
              <p className="text-[#666] text-[12px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>#{MATCH.rankA}</p>
              <p className="text-white text-[20px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>{MATCH.teamA.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[#666] text-[12px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>#{MATCH.rankB}</p>
              <p className="text-white text-[20px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>{MATCH.teamB.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-white text-[36px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{MATCH.winA}%</span>
            <span className="text-[32px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400, color: '#BBFF14', fontVariantNumeric: 'tabular-nums' }}>{MATCH.winB}%</span>
          </div>
          <div className="flex h-[72px] w-full">
            <div className="state-white shrink-0" style={{ width: `${MATCH.winA}%`, borderRight: 'none', borderRadius: '4px 0 0 4px' }} />
            <div className="state-yellow flex-1" style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }} />
          </div>
        </div>

        {/* Best Opportunity */}
        <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col justify-between gap-6 flex-1 min-w-0">
          <SectionLabel label="Best Opportunity" />
          <p className="text-white text-[16px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {EV_ENTRY.verdict}
          </p>
          <div className="flex h-[77px] w-full">
            <div className="state-white flex-1 flex items-center px-6" style={{ borderRight: 'none', borderRadius: '4px 0 0 4px' }}>
              <p className="text-black uppercase text-[18px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>Under 3.5 Maps</p>
            </div>
            <div className="state-yellow flex items-center justify-center px-6 shrink-0" style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }}>
              <p className="text-black text-[24px] whitespace-nowrap" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>71.4%</p>
            </div>
          </div>
        </div>

        {/* Entries + Return */}
        <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-[10px] flex-1 min-w-0">
          <div className="state-white flex-1 flex items-center justify-center w-full">
            <p className="text-black uppercase text-[20px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>1 EV+ Entry</p>
          </div>
          <div className="state-yellow flex-1 flex items-center justify-between px-6 w-full">
            <p className="text-black uppercase text-[18px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>POTENTIAL RETURN</p>
            <p className="text-black text-[20px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>4.74u</p>
          </div>
          <div className="state-green flex-1 flex items-center justify-between px-6 w-full">
            <p className="text-black uppercase text-[18px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>PUBLIC BET</p>
            <p className="text-black text-[20px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>79% VITALITY</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Model Intelligence ──────────────────────────────────────────────

function ModelSection() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col lg:flex-row gap-6">

        {/* Clutch Factor */}
        <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-5 flex-1">
          <SectionLabel label="Clutch Factor (post 10-10)" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#6b7280] text-[11px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Natus Vincere</p>
              <p className="text-[48px] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#BBFF14' }}>{MATCH.clutchA}%</p>
              <p className="text-[#4b5563] text-[12px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{MATCH.clutchSampleA} mapas</p>
            </div>
            <div className="w-[1px] self-stretch bg-[#2b2b2b]" />
            <div className="text-right">
              <p className="text-[#6b7280] text-[11px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Vitality</p>
              <p className="text-[48px] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#e2e8f0' }}>{MATCH.clutchB}%</p>
              <p className="text-[#4b5563] text-[12px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{MATCH.clutchSampleB} mapas</p>
            </div>
          </div>
        </div>

        {/* Map Pool Edge */}
        <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-5 flex-1">
          <SectionLabel label="Map Pool Edge (SoS >15%)" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[#6b7280] text-[11px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Natus Vincere</p>
              <p className="text-[48px] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#BBFF14' }}>{MATCH.mapsEdgeA}</p>
              <p className="text-[#4b5563] text-[12px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>mapas com edge</p>
            </div>
            <div className="w-[1px] self-stretch bg-[#2b2b2b]" />
            <div className="text-right">
              <p className="text-[#6b7280] text-[11px] uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Vitality</p>
              <p className="text-[48px] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#e2e8f0' }}>{MATCH.mapsEdgeB}</p>
              <p className="text-[#4b5563] text-[12px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>mapa com edge</p>
            </div>
          </div>
          <Divider />
          <div className="flex flex-col gap-1">
            <p className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif', color: '#4b5563' }}>F1 Ban NaVi <span style={{ color: '#e2e8f0' }}>{MATCH.banA}</span></p>
            <p className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif', color: '#4b5563' }}>F1 Ban Vitality <span style={{ color: '#e2e8f0' }}>{MATCH.banB}</span></p>
          </div>
        </div>

        {/* Model Strength */}
        <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-4 flex-1">
          <SectionLabel label="Model Strength" />
          <div className="flex flex-col gap-3">
            {[
              { team: MATCH.teamA, force: MATCH.forceA, n: MATCH.partiesA, maps: MATCH.forceA, prior: MATCH.priorA },
              { team: MATCH.teamB, force: MATCH.forceB, n: MATCH.partiesB, maps: MATCH.forceB, prior: MATCH.priorB },
            ].map((t) => (
              <div key={t.team} className="rounded-[4px] p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2028' }}>
                <p className="text-white text-[13px] mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{t.team}</p>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-[11px]" style={{ fontFamily: 'ui-monospace, monospace', color: '#4b5563' }}>força <span style={{ color: '#BBFF14' }}>{t.force.toFixed(3)}</span></span>
                  <span className="text-[11px]" style={{ fontFamily: 'ui-monospace, monospace', color: '#4b5563' }}>n=<span style={{ color: '#e2e8f0' }}>{t.n}</span></span>
                  <span className="text-[11px]" style={{ fontFamily: 'ui-monospace, monospace', color: '#4b5563' }}>prior <span style={{ color: '#e2e8f0' }}>{t.prior.toFixed(3)}</span></span>
                </div>
              </div>
            ))}
          </div>
          <Divider />
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif', color: '#4b5563' }}>Veto edge</span>
              <span className="text-[12px]" style={{ fontFamily: 'ui-monospace, monospace', color: '#BBFF14' }}>{MATCH.vetoEdge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif', color: '#4b5563' }}>Prob base → final T1</span>
              <span className="text-[12px]" style={{ fontFamily: 'ui-monospace, monospace', color: '#e2e8f0' }}>
                {MATCH.probBase}% → <span style={{ color: '#BBFF14' }}>{MATCH.probFinal}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Series Markets ──────────────────────────────────────────────────

function SeriesMarketsSection() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col gap-4">
        <SectionLabel label="Mercados da Série — BO5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SERIES_MARKETS.map((market) => (
            <div key={market.label} className="panel-bg rounded-[12px] border border-[#2b2b2b] p-4 flex flex-col gap-3">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280', letterSpacing: '0.08em' }}>{market.label}</p>
              <div className="flex flex-col gap-2">
                {market.rows.map((row) => (
                  <div key={row.name} className="flex items-center justify-between gap-2">
                    <p className="text-[13px] truncate" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#e2e8f0' }}>{row.name}</p>
                    <span
                      className="text-[15px] shrink-0"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: pctColor(row.pct) }}
                    >
                      {row.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section: Map Rounds Table ────────────────────────────────────────────────

function MapRoundsSection() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col gap-4">
        <SectionLabel label="Rounds por Mapa (decay × SoS | pós-ban)" />
        <div className="panel-bg rounded-[12px] border border-[#2b2b2b] overflow-hidden">
          {/* Header row */}
          <div className="grid border-b border-[#2b2b2b]" style={{ gridTemplateColumns: '120px 1fr 1fr 1fr 80px 120px' }}>
            {['Mapa', 'O19.5', 'O20.5', 'O21.5', 'Amostras', 'Status'].map((h) => (
              <div key={h} className="px-4 py-3">
                <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#4b5563', letterSpacing: '0.08em' }}>{h}</p>
              </div>
            ))}
          </div>
          {/* Data rows */}
          {MAP_ROUNDS.map((row, i) => (
            <div
              key={row.map}
              className="grid border-b border-[#1e2028] last:border-none"
              style={{ gridTemplateColumns: '120px 1fr 1fr 1fr 80px 120px', background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent', opacity: row.ban ? 0.5 : 1 }}
            >
              <div className="px-4 py-4 flex items-center">
                <p className="text-white text-[14px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>{row.map}</p>
              </div>
              {[row.o19, row.o20, row.o21].map((val, vi) => (
                <div key={vi} className="px-4 py-4 flex items-center">
                  <span className="text-[15px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: pctColor(val) }}>
                    {val}%
                  </span>
                </div>
              ))}
              <div className="px-4 py-4 flex items-center">
                <span className="text-[12px]" style={{ fontFamily: 'ui-monospace, monospace', color: '#4b5563' }}>{row.t1}/{row.t2}</span>
              </div>
              <div className="px-4 py-4 flex items-center">
                {row.ban ? (
                  <span className="text-[11px] px-2 py-1 rounded" style={{ background: 'rgba(244,1,1,0.15)', color: '#f40101', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Ban {row.ban === 'Natus Vincere' ? 'NaVi' : 'Vit'}
                  </span>
                ) : (
                  <span className="text-[#32e601] text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>ativo</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Round Thresholds Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {ROUND_MARKETS.map((r) => (
            <div key={r.label} className="panel-bg rounded-[12px] border border-[#2b2b2b] p-4 flex flex-col gap-3">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280' }}>Rounds {r.label}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4b5563] text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>Over</p>
                  <p className="text-[22px] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: pctColor(r.over) }}>{r.over}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[#4b5563] text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>Under</p>
                  <p className="text-[22px] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: pctColor(r.under) }}>{r.under}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section: BO5 Scenario Matrix ─────────────────────────────────────────────

function ScenarioMatrix() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col gap-4">
        <SectionLabel label="Cenários BO5" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {SCENARIOS.map((sc) => {
            const isCovered = COVERED_SCENARIOS.includes(sc.key)
            const isWinA = sc.winner === 'a'
            const barWidth = Math.round((sc.prob / 31.1) * 100)
            return (
              <div
                key={sc.key}
                className="panel-bg rounded-[12px] border p-4 flex flex-col gap-3"
                style={{ borderColor: isCovered ? '#BBFF14' : isWinA ? '#1e2028' : '#2b2b2b' }}
              >
                {/* Scenario label */}
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: isWinA ? '#4b5563' : '#BBFF14', letterSpacing: '0.08em' }}>
                    {sc.type}
                  </p>
                  <p className="text-white text-[13px] leading-tight" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{sc.key}</p>
                </div>

                {/* Prob */}
                <div>
                  <p className="text-[32px] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: isWinA ? '#e2e8f0' : '#BBFF14' }}>
                    {sc.prob}%
                  </p>
                  <div className="mt-2 h-[3px] rounded-full" style={{ background: '#1e2028' }}>
                    <div className="h-full rounded-full" style={{ width: `${barWidth}%`, background: isWinA ? '#4b5563' : '#BBFF14' }} />
                  </div>
                </div>

                {/* Maps + payoff */}
                <Divider />
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-[11px]" style={{ fontFamily: 'Inter, sans-serif', color: '#4b5563' }}>Maps</span>
                    <span className="text-[11px]" style={{ fontFamily: 'ui-monospace, monospace', color: '#e2e8f0' }}>{sc.maps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px]" style={{ fontFamily: 'Inter, sans-serif', color: '#4b5563' }}>Payoff</span>
                    <span className="text-[11px]" style={{ fontFamily: 'ui-monospace, monospace', color: sc.payoff > 0 ? '#32e601' : '#f40101', fontWeight: 600 }}>
                      {sc.payoff > 0 ? '+' : ''}{sc.payoff.toFixed(2)}u
                    </span>
                  </div>
                </div>
                {isCovered && (
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#BBFF14]" />
                    <span className="text-[10px]" style={{ fontFamily: 'Inter, sans-serif', color: '#BBFF14' }}>coberto</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Section: EV+ Entry ───────────────────────────────────────────────────────

function EVSection() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col gap-4">
        <SectionLabel label="EV+ — Rastreador de Valor Esperado" />
        <div className="panel-bg rounded-[12px] border border-[#2b2b2b] p-6 flex flex-col md:flex-row gap-6">
          {/* Left: entry info */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white text-[20px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{EV_ENTRY.market}</p>
                <p className="text-[#4b5563] text-[13px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{EV_ENTRY.verdict}</p>
              </div>
              <div className="state-green flex items-center justify-center shrink-0" style={{ width: 32, height: 32, borderRadius: 4 }}>
                <span className="text-black text-[13px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>{EV_ENTRY.confidence}</span>
              </div>
            </div>

            <Divider />

            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[#4b5563] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Odd</p>
                <p className="text-white text-[28px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{EV_ENTRY.odd}</p>
              </div>
              <div>
                <p className="text-[#4b5563] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Edge</p>
                <p className="text-[28px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#BBFF14' }}>+{EV_ENTRY.edge}%</p>
              </div>
              <div>
                <p className="text-[#4b5563] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Stake</p>
                <p className="text-white text-[28px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{EV_ENTRY.stake}u</p>
              </div>
              <div>
                <p className="text-[#4b5563] text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Prob Implied → Real</p>
                <p className="text-[28px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ color: '#4b5563' }}>{EV_ENTRY.impliedProb}%</span>
                  <span style={{ color: '#4b5563' }}> → </span>
                  <span style={{ color: '#BBFF14' }}>{EV_ENTRY.prob}%</span>
                </p>
              </div>
            </div>

            <Divider />

            <ul className="flex flex-col gap-2">
              {EV_ENTRY.justification.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="inline-block w-[4px] h-[4px] rounded-full mt-[7px] shrink-0" style={{ background: '#BBFF14' }} />
                  <p className="text-[13px]" style={{ fontFamily: 'Inter, sans-serif', color: '#9ca3af' }}>{pt}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: coverage */}
          <div className="flex flex-col gap-4 md:w-[220px] shrink-0">
            <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280' }}>Cobertura de Cenários</p>
            <p className="text-[40px] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#BBFF14' }}>34%</p>
            <div className="flex flex-col gap-2">
              {SCENARIOS.map((sc) => {
                const covered = COVERED_SCENARIOS.includes(sc.key)
                return (
                  <div key={sc.key} className="flex items-center gap-2">
                    <span style={{ color: covered ? '#32e601' : '#f40101', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{covered ? '✓' : '✗'}</span>
                    <span className="text-[12px] truncate" style={{ fontFamily: 'Inter, sans-serif', color: covered ? '#e2e8f0' : '#4b5563' }}>{sc.key}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Smart Portfolio ─────────────────────────────────────────────────

function PortfolioSection() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col gap-4">
        <SectionLabel label="Portfólio Inteligente" />
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Portfolio entry */}
          <div className="panel-bg rounded-[12px] border border-[#2b2b2b] p-6 flex flex-col gap-5 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white text-[18px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{PORTFOLIO_ENTRY.market}</p>
                <p className="text-[#4b5563] text-[12px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>hedge_structural</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] uppercase" style={{ fontFamily: 'Inter, sans-serif', color: '#4b5563' }}>Odd</p>
                  <p className="text-white text-[20px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{PORTFOLIO_ENTRY.odd}</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-[10px] uppercase" style={{ fontFamily: 'Inter, sans-serif', color: '#4b5563' }}>Stake</p>
                  <p className="text-white text-[20px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{PORTFOLIO_ENTRY.stake}u</p>
                </div>
              </div>
            </div>
            <Divider />
            <div className="flex flex-col gap-2">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280' }}>Cobre os cenários</p>
              {PORTFOLIO_ENTRY.covers.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <span className="inline-block w-[4px] h-[4px] rounded-full bg-[#BBFF14]" />
                  <p className="text-white text-[13px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{c}</p>
                </div>
              ))}
            </div>
            <Divider />
            <div className="flex flex-col gap-2">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280' }}>Orçamento</p>
              <div className="flex items-center gap-3">
                <p className="text-white text-[24px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>3.0u</p>
                <p className="text-[#4b5563] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>faixa 2.5 – 3.5u (Confiança A)</p>
              </div>
            </div>
          </div>

          {/* Payoff table */}
          <div className="panel-bg rounded-[12px] border border-[#2b2b2b] p-6 flex flex-col gap-4 lg:w-[340px] shrink-0">
            <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280' }}>Payoff por Cenário</p>
            <div className="flex flex-col gap-0">
              {SCENARIOS.map((sc, i) => {
                const pay = sc.payoff
                return (
                  <div
                    key={sc.key}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: i < SCENARIOS.length - 1 ? '1px solid #1e2028' : 'none' }}
                  >
                    <p className="text-[13px]" style={{ fontFamily: 'Inter, sans-serif', color: '#9ca3af' }}>{sc.key}</p>
                    <p
                      className="text-[15px]"
                      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: pay > 0 ? '#32e601' : '#f40101' }}
                    >
                      {pay > 0 ? '+' : ''}{pay.toFixed(2)}u
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Not Recommended ─────────────────────────────────────────────────

function DNRSection() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6 pb-16">
      <div className="max-w-[1184px] mx-auto flex flex-col gap-4">
        <SectionLabel label="Não Recomendado" />
        <div className="flex flex-col gap-3">
          {DO_NOT_RECOMMEND.map((item, i) => (
            <div key={i} className="panel-bg rounded-[4px] border-2 border-[#f40101] flex items-start gap-3 p-4">
              <svg className="shrink-0 w-5 h-5 mt-[2px]" viewBox="0 0 24 24" fill="none">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#D63434" />
              </svg>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-white text-[15px]" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{item.market}</p>
                  <p className="text-[#fd3d3d] text-[13px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {item.edge > 0 ? '+' : ''}{item.edge}%
                  </p>
                </div>
                <p className="text-[#898989] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TerminalPage() {
  const [matches, profit] = await Promise.all([
    getMatchesForCarrossel(),
    getProfitCardData(),
  ])

  return (
    <main className="min-h-screen">
      <LandingMenu />
      <CarrosselJogos
        matches={matches}
        balance={profit.balance}
        greens={profit.greens}
        totalEntries={profit.totalResolved}
        lastUpdated={profit.lastUpdated ?? undefined}
      />
      <div className="min-h-screen w-full bg-[#05060f] flex flex-col">
        <PageHeader />
        <WinProbSection />
        <ModelSection />
        <SeriesMarketsSection />
        <MapRoundsSection />
        <ScenarioMatrix />
        <EVSection />
        <PortfolioSection />
        <DNRSection />
      </div>
    </main>
  )
}
