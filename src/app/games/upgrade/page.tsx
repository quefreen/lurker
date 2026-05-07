import { getMatchesForCarrossel, getProfitCardData } from '@/lib/queries'
import LandingMenu from '@/components/LandingMenu'
import { CarrosselJogos } from '@/components/CarrosselJogos'
import '@/styles/data-states.css'
import rawData from '../../../../g2-vs-fisher-PGL-Astana-09-05.json'
import { MapRoundsTable } from '@/components/MapRoundsTable'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapRow {
  map: string
  over_17_5: number
  over_19_5: number
  over_20_5: number
  over_21_5: number
  team_a_sample: number
  team_b_sample: number
  banned_by: string | null
}

// ─── Data derivation ──────────────────────────────────────────────────────────

const data = rawData as any

const [teamA, teamB] = (data.header.match as string).split(' vs ').map((s: string) => s.trim())
const rankA: number = data.context.rankings.team_a.position
const rankB: number = data.context.rankings.team_b.position
const winA: number = data.series_markets[0].rows[0].pct
const winB: number = data.series_markets[0].rows[1].pct

const topEntry = data.entries_ranked?.[0] ?? null

const potentialReturn = topEntry ? ((topEntry.odd - 1) * topEntry.stake).toFixed(2) : '0.00'

const publicSplitEntries = Object.entries(data.odds_movement.public_split as Record<string, string | null>)
  .filter(([, v]) => v != null) as [string, string][]
const publicBet = publicSplitEntries.length > 0
  ? `${publicSplitEntries[0][1]} ${publicSplitEntries[0][0].toUpperCase()}`
  : null

// ─── Font constants ───────────────────────────────────────────────────────────

const FONT_NUM  = "'Sora', sans-serif"
const FONT_TEXT = "'Barlow Condensed', sans-serif"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 70) return '#32e601'
  if (pct >= 50) return '#BBFF14'
  if (pct >= 35) return '#FFE23D'
  return '#f40101'
}

// ─── Section: Header ──────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto">
        <div className="panel-bg rounded-[4px] border border-[#2b2b2b] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#b5b5b5] text-[12px]" style={{ fontFamily: FONT_TEXT }}>{data.header.event}</span>
              <div className="bg-white rounded-[2px] px-[6px] py-[2px]">
                <span className="text-[#0a0b14] text-[12px]" style={{ fontFamily: FONT_TEXT }}>{data.header.format}</span>
              </div>
              <span className="text-[#b5b5b5] text-[12px]" style={{ fontFamily: FONT_TEXT }}>{data.header.date}</span>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-[#666] text-[12px]" style={{ fontFamily: FONT_NUM }}>#{rankA}</p>
                <p className="text-white text-[28px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{teamA}</p>
              </div>
              <span className="text-[#adadad] text-[12px] pb-[5px]" style={{ fontFamily: FONT_TEXT }}>vs</span>
              <div>
                <p className="text-[#666] text-[12px]" style={{ fontFamily: FONT_NUM }}>#{rankB}</p>
                <p className="text-white text-[28px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{teamB}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="panel-bg border border-[#1e2028] rounded-[6px] flex flex-col items-center justify-center px-5 py-4 min-w-[80px] gap-1">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#6b7280' }}>EDGE</p>
              <p className="text-[22px]" style={{ fontFamily: FONT_NUM, fontWeight: 600, color: '#BBFF14' }}>+{topEntry?.edge ?? 0}%</p>
            </div>
            <div className="panel-bg border border-[#1e2028] rounded-[6px] flex flex-col items-center justify-center px-5 py-4 min-w-[80px] gap-1">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#6b7280' }}>EV+</p>
              <p className="text-white text-[22px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>{data.entries_ranked.length} Entry</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 1: Win Probability + Best Opportunity ────────────────────────────

function WinProbSection() {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col lg:flex-row gap-6">

        {/* Win Probability */}
        <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-6 flex-1 min-w-0">
          <p className="text-[16px] uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 600, color: '#BBFF14' }}>Win Probability</p>
          <div className="flex items-end justify-between w-full">
            <div>
              <p className="text-[#666] text-[12px]" style={{ fontFamily: FONT_NUM }}>#{rankA}</p>
              <p className="text-white text-[20px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{teamA.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[#666] text-[12px]" style={{ fontFamily: FONT_NUM }}>#{rankB}</p>
              <p className="text-white text-[20px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{teamB.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-[36px]" style={{ fontFamily: FONT_NUM, fontWeight: 600, color: winA >= winB ? '#BBFF14' : 'white' }}>{winA}%</span>
            <span className="text-[32px]" style={{ fontFamily: FONT_NUM, fontWeight: 400, color: winB > winA ? '#BBFF14' : 'white' }}>{winB}%</span>
          </div>
          <div className="flex h-[72px] w-full">
            {winA >= winB ? (
              <>
                <div className="state-yellow shrink-0" style={{ width: `${winA}%`, borderRight: 'none', borderRadius: '4px 0 0 4px' }} />
                <div className="state-white flex-1" style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }} />
              </>
            ) : (
              <>
                <div className="state-white shrink-0" style={{ width: `${winA}%`, borderRight: 'none', borderRadius: '4px 0 0 4px' }} />
                <div className="state-yellow flex-1" style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }} />
              </>
            )}
          </div>
        </div>

        {/* Best Opportunity */}
        <div
          className="rounded-[20px] flex flex-col items-center flex-1 min-w-0 p-[18px] min-h-[240px]"
          style={{
            border: '1px solid #2B2B2B',
            background: 'radial-gradient(151.79% 151.79% at 50% 112.54%, #E6FF55 0%, #000 100%), radial-gradient(237.87% 66.04% at 50% 36.9%, rgba(9, 10, 5, 0.50) 55%, rgba(230, 255, 85, 0.50) 100%), linear-gradient(180deg, #10111A 0%, #0C0D16 17.31%)',
            backgroundBlendMode: 'color-dodge, color-dodge, normal',
          }}
        >
          <p className="text-[16px] uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 600, color: '#BBFF14' }}>
            Best Opportunity
          </p>
          <div className="flex flex-col items-center justify-center flex-1 gap-[16px]">
            <p
              className="text-white text-[32px] text-center leading-[1.2]"
              style={{ fontFamily: FONT_TEXT, fontWeight: 500, letterSpacing: '-0.41px' }}
            >
              {topEntry?.market_name ?? '—'}
            </p>
            <div className="flex items-center gap-[5px] text-[18px]">
              <span style={{ fontFamily: FONT_TEXT, color: '#94a3b8' }}>ODD</span>
              <span style={{ fontFamily: FONT_NUM, color: 'white' }}>{topEntry?.odd ?? '—'}</span>
              <span style={{ fontFamily: FONT_TEXT, color: '#94a3b8' }}>·</span>
              <span style={{ fontFamily: FONT_TEXT, color: '#94a3b8' }}>STAKE</span>
              <span style={{ fontFamily: FONT_NUM, color: 'white' }}>{topEntry?.stake ?? '—'}u</span>
            </div>
          </div>
        </div>

        {/* Entries + Return */}
        <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-[10px] flex-1 min-w-0 min-h-[240px]">
          <div className="state-white flex-1 min-h-[64px] flex items-center justify-center w-full">
            <p className="text-black uppercase text-[20px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>{data.entries_ranked.length} EV+ Entry</p>
          </div>
          <div className="state-yellow flex-1 min-h-[64px] flex items-center justify-between px-6 w-full">
            <p className="text-black uppercase text-[18px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>POTENTIAL RETURN</p>
            <p className="text-black text-[20px]" style={{ fontFamily: FONT_NUM, fontWeight: 600 }}>{potentialReturn}u</p>
          </div>
          <div className="state-green flex-1 min-h-[64px] flex items-center justify-between px-6 w-full">
            <p className="text-black uppercase text-[18px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>PUBLIC BET</p>
            <p className="text-black text-[20px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>{publicBet ?? '—'}</p>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Section 3: Series Markets ────────────────────────────────────────────────

function SeriesMarketsSection() {
  const markets = data.series_markets as Array<{ label: string; rows: Array<{ name: string; pct: number; good: boolean }> }>

  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col gap-6">
        <p className="text-[14px] text-white uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>
          Series Markets — {data.header.format}
        </p>
        <div className="flex flex-col lg:flex-row gap-6">
          {markets.map((market) => (
            <div key={market.label} className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-6 flex-1 min-w-0">
              <p className="text-[16px] uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 600, color: '#BBFF14' }}>
                {market.label}
              </p>
              <div className="flex flex-col">
                {market.rows.map((row, i) => (
                  <div key={row.name}>
                    {i > 0 && <div className="w-full h-[1px] bg-[#2B2B2B] my-6" />}
                    <div className="flex items-center justify-between">
                      <p className="text-[24px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#e2e8f0' }}>
                        {row.name}
                      </p>
                      <span className="text-[20px]" style={{ fontFamily: FONT_NUM, fontWeight: 600, color: pctColor(row.pct) }}>
                        {row.pct}%
                      </span>
                    </div>
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

// ─── Section 4: Map Rounds Table ──────────────────────────────────────────────

function MapRoundsSection() {
  const maps = data.map_analysis as MapRow[]
  const rounds = data.round_markets as Array<{ threshold: string; over: number; under: number }>

  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col gap-6">
        <MapRoundsTable maps={maps} />

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {rounds.map((r) => (
            <div key={r.threshold} className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-6 flex-1 min-w-0">
              <p className="text-[16px] uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 600, color: '#BBFF14' }}>
                Rounds {r.threshold}
              </p>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-[24px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#e2e8f0' }}>Over</p>
                  <span className="text-[20px]" style={{ fontFamily: FONT_NUM, fontWeight: 600, color: pctColor(r.over) }}>
                    {r.over}%
                  </span>
                </div>
                <div className="w-full h-[1px] bg-[#2B2B2B] my-6" />
                <div className="flex items-center justify-between">
                  <p className="text-[24px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#e2e8f0' }}>Under</p>
                  <span className="text-[20px]" style={{ fontFamily: FONT_NUM, fontWeight: 600, color: pctColor(r.under) }}>
                    {r.under}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UpgradePage() {
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
        <SeriesMarketsSection />
        <MapRoundsSection />
      </div>
    </main>
  )
}
