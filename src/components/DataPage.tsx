'use client'

import '@/styles/data-states.css'
import { SignInCTA } from '@/components/SignInCTA'
import svgPaths from '@/imports/DataPage/svg-ukueh2hs0j'
import { MatchAnalysis, Entry, CardState } from '@/lib/types'

// ─── Types ───────────────────────────────────────────────────────────────────

type DataState = 'white' | 'yellow' | 'green' | 'amber' | 'orange' | 'red'

const dataStateClass: Record<DataState, string> = {
  white: 'state-white',
  yellow: 'state-yellow',
  green: 'state-green',
  amber: 'state-amber',
  orange: 'state-orange',
  red: 'state-red',
}

interface BetRowData {
  num: number
  label: string
  badge: string
  state: DataState
  odd: string
  edge: string
  stake: string
  prob: string
}

interface ScenarioData {
  id: number
  label: string
  labelColor: string
  percentage: string
  description: string
  buttonState: DataState
  buttonLabel: string
  resultLabel: string
  resultValue: string
}

interface NotRecItem {
  id: number
  label: string
  pct: string
  reason: string
}

interface DataPageProps {
  analysis?: MatchAnalysis
  cardState?: CardState
  coverImage?: string
  mode?: 'full' | 'teaser'
  teaserEntriesCount?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function confidenceToState(conf: string): DataState {
  if (conf === 'S' || conf === 'A') return 'green'
  if (conf === 'B') return 'amber'
  if (conf === 'C') return 'orange'
  return 'red'
}

function normalizeEntry(e: any): Entry {
  return {
    rank: e.rank ?? 0,
    market_name: e.market_name ?? e.market ?? '',
    odd: e.odd ?? 0,
    implied_prob: e.implied_prob ?? 0,
    estimated_prob: e.estimated_prob ?? 0,
    edge: e.edge ?? 0,
    confidence: e.confidence ?? 'SEM EDGE',
    stake: e.stake ?? 1,
    justification_points: e.justification_points ?? e.justification ?? [],
    verdict: e.verdict ?? '',
  }
}

function entryToBetRow(e: any): BetRowData {
  const normalized = normalizeEntry(e)
  return {
    num: normalized.rank,
    label: normalized.market_name,
    badge: normalized.confidence === 'SEM EDGE' ? '-' : normalized.confidence,
    state: confidenceToState(normalized.confidence),
    odd: normalized.odd.toFixed(2),
    edge: `${normalized.edge.toFixed(1)}%`,
    stake: `${normalized.stake}u`,
    prob: `${normalized.implied_prob}% → ${normalized.estimated_prob}%`,
  }
}

const SCENARIO_META: Record<string, { labelColor: string; buttonState: DataState; resultLabel: string }> = {
  // v2 schema names
  PROVAVEL: { labelColor: '#32e601', buttonState: 'green', resultLabel: 'BALANCE' },
  BOM:      { labelColor: '#e8cd01', buttonState: 'amber', resultLabel: 'BALANCE' },
  RUIM:     { labelColor: '#cc0101', buttonState: 'red', resultLabel: 'BALANCE' },
  PESSIMO:  { labelColor: '#cc0101', buttonState: 'red', resultLabel: 'TOTAL LOSS:' },
  // v1 schema names
  IDEAL:    { labelColor: '#32e601', buttonState: 'green', resultLabel: 'BALANCE' },
  NEUTRO:   { labelColor: '#e86101', buttonState: 'orange', resultLabel: 'BALANCE' },
}

function getButtonLabel(entriesHit: string[], entriesMiss: string[]): string {
  if (entriesMiss?.includes('Todas')) return 'ALL ENTRIES'
  if (!entriesMiss?.length) return `${entriesHit?.length ?? 0} HITS`
  return 'MIXED RESULT'
}

function parseV1ButtonLabel(result: string): string {
  const r = result.toLowerCase()
  if (r.includes('todas')) return 'ALL ENTRIES'
  if (r.includes('misto')) return 'MIXED RESULT'
  if (r.includes('negativo')) return 'NEGATIVE RESULT'
  const rangeMatch = result.match(/(\d+-\d+)\s+de\s+\d+/i)
  if (rangeMatch) return `${rangeMatch[1]} HITS`
  const countMatch = result.match(/(\d+)\s+de\s+\d+/i)
  if (countMatch) return `${countMatch[1]} HITS`
  return '—'
}

type EntryStakeInfo = { odd: number; stake: number }

// ── v2: match abbreviated name (entries_hit/miss) to a full market name ────────
function matchMarket(abbreviated: string, fullName: string): boolean {
  const a = abbreviated.toLowerCase().replace(/\s*\(.*?\)/g, '').trim()
  const f = fullName.toLowerCase().trim()
  return f.startsWith(a) || a.startsWith(f)
}

// ── v2: net profit from explicit entries_hit / entries_miss ───────────────────
function calcScenarioProfit(
  entriesHit: string[],
  entriesMiss: string[],
  stakesByMarket: Map<string, EntryStakeInfo>,
  totalInvestment: number
): number {
  if (entriesMiss?.includes('Todas')) return -totalInvestment

  let profit = 0
  const find = (name: string) => {
    for (const [key, val] of stakesByMarket) {
      if (matchMarket(name, key)) return val
    }
  }
  for (const name of (entriesHit ?? [])) {
    const e = find(name)
    if (e) profit += (e.odd - 1) * e.stake
  }
  for (const name of (entriesMiss ?? [])) {
    const e = find(name)
    if (e) profit -= e.stake
  }
  return profit
}

// ── v1: derive probability from bo3_probabilities using score in description ──
function deriveV1Probability(description: string, rawBo3: any): string {
  const d = description.toLowerCase()
  const re = /(\w+)\s+3[-–](\d)/g
  let m: RegExpExecArray | null
  let total = 0
  let found = false
  while ((m = re.exec(d)) !== null) {
    const teamFrag = m[1].slice(0, 4)
    const suffix = `_3_${m[2]}`
    for (const [key, val] of Object.entries(rawBo3)) {
      if (key === 'summary') continue
      const kl = key.toLowerCase()
      if (kl.endsWith(suffix) && kl.includes(teamFrag)) {
        const prob = (val as any)?.prob
        if (typeof prob === 'number') { total += prob; found = true }
      }
    }
  }
  return found ? `${total.toFixed(1)}%` : ''
}

// ── v1: parse result text to identify winning/losing entries ──────────────────

// Normalize "Over 64.5, 69.5, 74.5" → "Over 64.5 Over 69.5 Over 74.5"
function expandOverList(sentence: string): string {
  return sentence.replace(
    /Over\s+([\d.]+)((?:\s*[,e]\s*[\d.]+)+)/gi,
    (_match, first: string, rest: string) => {
      const nums = rest.split(/\s*[,e]\s*/).filter(Boolean)
      return `Over ${first}` + nums.map((n) => ` Over ${n.trim()}`).join('')
    }
  )
}

function parseV1ScenarioProfit(
  result: string,
  stakesByMarket: Map<string, EntryStakeInfo>,
  _totalInvestment: number
): number | null {
  if (!result || !stakesByMarket.size) return null
  const r = result.toLowerCase()

  // "Todas as N entradas acertam" → all win
  if (r.includes('todas') && r.includes('acertam')) {
    return Array.from(stakesByMarket.values())
      .reduce((sum, e) => sum + (e.odd - 1) * e.stake, 0)
  }

  const restantePerde = r.includes('restante perde')
  const winKeys       = new Set<string>()  // definitivamente ganham
  const loseKeys      = new Set<string>()  // definitivamente perdem
  const uncertainKeys = new Set<string>()  // "depende" → vão para a média

  const matchFrag = (key: string, frag: string): boolean => {
    if (frag.startsWith('OVER:')) return key.includes(`over ${frag.slice(5)}`)
    if (frag === 'PARI_25')   return key.includes('+2.5') || key.includes('handicap')
    if (frag === 'PARI_1MAP') return key.includes('pelo menos 1') || key.includes('1+ mapa')
    if (frag.startsWith('RANGE:')) {
      const [, minS, maxS] = frag.split(':')
      const [min, max] = [parseFloat(minS), parseFloat(maxS)]
      const mv = key.match(/over\s+([\d.]+)/)
      if (mv) { const v = parseFloat(mv[1]); return v >= min && v <= max }
    }
    return false
  }

  const extractFrags = (sentence: string): string[] => {
    const expanded = expandOverList(sentence)
    const frags: string[] = []
    const rangeM = expanded.match(/Over\s+([\d.]+)\s+a\s+([\d.]+)/i)
    if (rangeM) {
      frags.push(`RANGE:${rangeM[1]}:${rangeM[2]}`)
    } else {
      for (const m of expanded.matchAll(/Over\s+([\d.]+)\+/gi)) frags.push(`RANGE:${m[1]}:9999`)
      for (const m of expanded.matchAll(/Over\s+([\d.]+)(?!\+|\d)/gi)) frags.push(`OVER:${m[1]}`)
    }
    const sl = expanded.toLowerCase()
    if (sl.includes('+2.5') || sl.includes('handicap')) frags.push('PARI_25')
    if (sl.includes('1+ mapa') || sl.includes('pelo menos 1')) frags.push('PARI_1MAP')
    return frags
  }

  for (const sentence of result.split(/\.(?!\d)/)) {
    const sl = sentence.toLowerCase()
    const isDepende      = sl.includes('depende')
    const isPossivelMiss = sl.includes('podem nao') || sl.includes('nao bater')
    const acerta = sl.includes('acertam') || (sl.includes('acerta') && !sl.includes('nao acerta'))
    const perde  = sl.includes('perdem')  || sl.includes('perde')  || sl.includes('nao bater')

    const frags = extractFrags(sentence)

    for (const key of stakesByMarket.keys()) {
      for (const frag of frags) {
        if (!matchFrag(key, frag)) continue
        if (isDepende)             uncertainKeys.add(key)  // ex: "depende dos scores"
        else if (isPossivelMiss)   loseKeys.add(key)       // ex: "podem nao bater" = perda esperada
        else if (acerta && !perde) winKeys.add(key)
        else if (perde  && !acerta) loseKeys.add(key)
      }
    }
  }

  if (winKeys.size === 0) return null

  // Conservador: uncertain perde | Otimista: uncertain ganha
  let conservative = 0
  let optimistic   = 0

  for (const [key, val] of stakesByMarket) {
    const profit = (val.odd - 1) * val.stake
    if (winKeys.has(key)) {
      conservative += profit
      optimistic   += profit
    } else if (uncertainKeys.has(key)) {
      conservative -= val.stake  // perde o stake no pior caso
      optimistic   += profit     // ganha o lucro no melhor caso
    } else if (loseKeys.has(key) || restantePerde) {
      conservative -= val.stake
      optimistic   -= val.stake
    }
  }

  // Se há entradas incertas, retorna a média dos dois cenários
  return uncertainKeys.size > 0
    ? (conservative + optimistic) / 2
    : conservative
}

// ── Market resolver: given a BO3 series score, determine hit/miss/indeterminate ──
//
// Returns 'hit' | 'miss' | 'indeterminate' for a market name given the series result.
// teamAScore / teamBScore refer to team_1_score and team_2_score in predicted_series_score.
// 'indeterminate' = map-level markets that cannot be resolved from the series score alone.
type MarketResult = 'hit' | 'miss' | 'indeterminate'

function resolveMarketFromScore(
  marketName: string,
  teamAScore: number,
  teamBScore: number
): MarketResult {
  const m = marketName.toLowerCase()
  const teamAWins  = teamAScore > teamBScore
  const teamBWins  = teamBScore > teamAScore
  const totalMaps  = teamAScore + teamBScore
  const isDecider  = totalMaps === 3

  // ── Over / Under 2.5 maps ──────────────────────────────────────────────────
  if (/over\s*2\.5/.test(m))  return totalMaps > 2  ? 'hit' : 'miss'
  if (/under\s*2\.5/.test(m)) return totalMaps <= 2 ? 'hit' : 'miss'

  // ── Handicap série -1.5 team A: only wins on 2-0 ──────────────────────────
  // "+1.5" is the complementary market (team B side) and resolves differently
  if (!m.includes('mapa') && !m.includes('map ') && !m.includes('map1') && !m.includes('map2')) {
    if (m.includes('-1.5')) return (teamAScore === 2 && teamBScore === 0) ? 'hit' : 'miss'
    if (m.includes('+1.5')) return (teamBWins || isDecider)              ? 'hit' : 'miss'
  }

  // ── Correct score ──────────────────────────────────────────────────────────
  if (m.includes('placar') || m.includes('correct score') || m.includes('score correto')) {
    const cs = m.match(/(\d)\s*[-x,]\s*(\d)/)
    if (cs) {
      const csA = parseInt(cs[1])
      const csB = parseInt(cs[2])
      return (csA === teamAScore && csB === teamBScore) ? 'hit' : 'miss'
    }
  }

  // ── "Vence ao menos 1 mapa" ────────────────────────────────────────────────
  if (m.includes('ao menos 1') || m.includes('pelo menos 1') || m.includes('win at least')) {
    // Detect if this is a team B market by looking for common team B keywords
    // (the JSON market_name should include the team name)
    // Heuristic: if team A name appears in market without "team_b" context → team A market
    // We check for "team_b" or "upset" or absence of common team A anchor
    // For safety, we resolve by checking both sides are non-zero
    const isBMarket = m.includes('team b') || m.includes('_b ') || m.includes('azarao')
    if (isBMarket) return teamBScore >= 1 ? 'hit' : 'miss'
    return teamAScore >= 1 ? 'hit' : 'miss'
  }

  // ── Map-level markets — cannot be resolved from series score ──────────────
  if (
    m.includes('mapa 1') || m.includes('mapa 2') || m.includes('map 1') || m.includes('map 2') ||
    m.includes('rounds') || /over\s*\d{2}/.test(m) || /under\s*\d{2}/.test(m) ||
    m.includes('team total') || m.includes('overtime')
  ) {
    return 'indeterminate'
  }

  return 'indeterminate'
}

// ── Profit from predicted_series_score ────────────────────────────────────────
function calcProfitFromScore(
  teamAScore: number,
  teamBScore: number,
  stakesByMarket: Map<string, EntryStakeInfo>
): { profit: number; hits: number; misses: number; indeterminate: number } {
  let profit = 0
  let hits = 0
  let misses = 0
  let indeterminate = 0

  for (const [marketName, info] of stakesByMarket) {
    const result = resolveMarketFromScore(marketName, teamAScore, teamBScore)
    if (result === 'hit') {
      profit += (info.odd - 1) * info.stake
      hits++
    } else if (result === 'miss') {
      profit -= info.stake
      misses++
    } else {
      indeterminate++
    }
  }

  return { profit, hits, misses, indeterminate }
}

// ── Scenario mapper ───────────────────────────────────────────────────────────
function jsonScenarioToData(
  s: any,
  idx: number,
  stakesByMarket?: Map<string, EntryStakeInfo>,
  totalInvestment?: number,
  rawBo3?: any
): ScenarioData {
  const scenarioKey = ((s.name ?? s.scenario ?? '') as string).toUpperCase()
  const meta = SCENARIO_META[scenarioKey] ?? { labelColor: '#ffffff', buttonState: 'white' as DataState, resultLabel: '' }

  // ── Detect schema version ────────────────────────────────────────────────
  // v3: has predicted_series_score — component resolves all market logic
  // v2: has entries_hit / net_result — use those fields
  // v1: has result string — parse via parseV1ScenarioProfit
  const isV3 = s.predicted_series_score != null
  const isV2 = !isV3 && (s.entries_hit != null || s.net_result != null)

  // ── Button label ─────────────────────────────────────────────────────────
  let buttonLabel: string
  if (isV3 && stakesByMarket?.size) {
    const { hits, misses } = calcProfitFromScore(
      s.predicted_series_score.team_1_score ?? 0,
      s.predicted_series_score.team_2_score ?? 0,
      stakesByMarket
    )
    if (misses === 0 && hits > 0)   buttonLabel = `${hits} HITS`
    else if (hits === 0 && misses > 0) buttonLabel = 'MIXED RESULT'
    else if (hits > 0 && misses > 0)   buttonLabel = 'MIXED RESULT'
    else                               buttonLabel = '—'
  } else if (isV2) {
    buttonLabel = getButtonLabel(s.entries_hit ?? [], s.entries_miss ?? [])
  } else {
    buttonLabel = parseV1ButtonLabel(s.result ?? '')
  }

  // ── Percentage ───────────────────────────────────────────────────────────
  let percentage = ''
  if (s.probability != null) {
    percentage = `${s.probability}%`
  } else if (!isV2 && !isV3 && rawBo3) {
    percentage = deriveV1Probability(s.description ?? '', rawBo3)
  }

  // ── Profit ───────────────────────────────────────────────────────────────
  // Priority: v3 score-based > v2 net_result > v2 recalc > v1 text parse
  let resultValue = ''
  if (isV3 && stakesByMarket?.size) {
    const { profit } = calcProfitFromScore(
      s.predicted_series_score.team_1_score ?? 0,
      s.predicted_series_score.team_2_score ?? 0,
      stakesByMarket
    )
    resultValue = `${profit >= 0 ? '+' : ''}${profit.toFixed(2)}u`
  } else if (typeof s.net_result === 'number') {
    resultValue = `${s.net_result >= 0 ? '+' : ''}${s.net_result.toFixed(2)}u`
  } else if (stakesByMarket?.size) {
    const profit = isV2
      ? calcScenarioProfit(s.entries_hit ?? [], s.entries_miss ?? [], stakesByMarket, totalInvestment ?? 0)
      : parseV1ScenarioProfit(s.result ?? '', stakesByMarket, totalInvestment ?? 0)
    if (profit !== null) {
      resultValue = `${profit >= 0 ? '+' : ''}${profit.toFixed(2)}u`
    }
  }

  return {
    id: idx + 1,
    label: scenarioKey.toLowerCase(),
    labelColor: meta.labelColor,
    percentage,
    description: s.description ?? '',
    buttonState: meta.buttonState,
    buttonLabel,
    resultLabel: meta.resultLabel,
    resultValue,
  }
}

function parseDoNotRecommend(dnr: any, idx: number): NotRecItem {
  // Support edge as dedicated field (v1) or embedded in reason string (v2)
  let pct: string
  if (typeof dnr.edge === 'number') {
    pct = `${dnr.edge > 0 ? '+' : ''}${dnr.edge}%`
  } else {
    const pctMatch = (dnr.reason ?? '').match(/\(([+-]?\d+\.?\d*%)\)/)
    pct = pctMatch ? pctMatch[1] : ''
  }
  const reason = dnr.reason ?? ''
  return { id: idx, label: dnr.market ?? '', pct, reason }
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function WarningIcon() {
  return (
    <svg className="shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p28073b80} fill="#1C1B1F" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="shrink-0 w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p308df980} fill="#D63434" />
    </svg>
  )
}

// ─── Probability Bar ─────────────────────────────────────────────────────────

function ProbabilityBar({ naviPct, g2Pct }: { naviPct: number; g2Pct: number }) {
  return (
    <div className="flex h-[72px] w-full">
      <div
        className="state-white shrink-0"
        style={{ width: `${naviPct}%`, borderRight: 'none', borderRadius: '4px 0 0 4px' }}
      />
      <div
        className="state-yellow flex-1"
        style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }}
      />
    </div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[6px]">
      <span className="inline-block w-[4px] h-[4px] rounded-full" style={{ background: '#BBFF14', opacity: 0.6 }} />
      <span
        className="text-[13px] uppercase tracking-widest"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280', letterSpacing: '0.08em' }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-full h-[1px] bg-[#2b2b2b]" />
}

// ─── Section 1: Header ───────────────────────────────────────────────────────

interface HeaderProps {
  teamA: string
  teamB: string
  rankA?: number
  rankB?: number
  tournament: string
  format: string
  matchDate?: string
  entriesCount: number
  topEdge: number
  coverImage?: string
}

function formatMatchDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' })
}

function Header({ teamA, teamB, rankA, rankB, tournament, format, matchDate, entriesCount, topEdge, coverImage }: HeaderProps) {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto">
        <div
          className="panel-bg rounded-[4px] border border-[#2b2b2b] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={coverImage ? { backgroundImage: `url('${coverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center center' } : undefined}
        >
          {/* Left: match info */}
          <div className="flex flex-col gap-2">
            {/* Tournament + format */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-[4px]">
                <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#BBFF14]" />
                <span
                  className="text-[#b5b5b5] text-[12px]"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {tournament}
                </span>
              </div>
              <div className="bg-white rounded-[2px] px-[6px] py-[2px]">
                <span
                  className="text-[#0a0b14] text-[12px]"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {format}
                </span>
              </div>
              {matchDate && (
                <span
                  className="text-[#b5b5b5] text-[12px]"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {formatMatchDate(matchDate)}
                </span>
              )}
            </div>
            {/* Teams */}
            <div className="flex items-center gap-3">
              <div>
                {rankA != null && (
                  <p
                    className="text-[#666] text-[12px] font-barlow"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}
                  >
                    #{rankA}
                  </p>
                )}
                <p
                  className="text-white text-[24px] font-barlow"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}
                >
                  {teamA}
                </p>
              </div>
              <span
                className="text-[#adadad] text-[12px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                vs
              </span>
              <div>
                {rankB != null && (
                  <p
                    className="text-[#666] text-[12px] font-barlow"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}
                  >
                    #{rankB}
                  </p>
                )}
                <p
                  className="text-white text-[24px] font-barlow"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}
                >
                  {teamB}
                </p>
              </div>
            </div>
          </div>

          {/* Right: stats */}
          <div className="flex items-center gap-4">
            <div className="panel-bg border border-[#1e2028] rounded-[6px] flex flex-col items-center justify-center px-5 py-4 min-w-[80px] gap-1">
              <p
                className="text-[11px] uppercase tracking-widest"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280', letterSpacing: '0.08em' }}
              >
                ENTRIES
              </p>
              <p
                className="text-white text-[22px] font-barlow"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
              >
                {entriesCount} EV+
              </p>
            </div>
            <div className="panel-bg border border-[#1e2028] rounded-[6px] flex flex-col items-center justify-center px-5 py-4 min-w-[72px] gap-1">
              <p
                className="text-[11px] uppercase tracking-widest"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6b7280', letterSpacing: '0.08em' }}
              >
                EDGE
              </p>
              <p
                className="text-[22px] font-barlow"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, color: '#BBFF14', fontVariantNumeric: 'tabular-nums' }}
              >
                {topEdge.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 2: DataViz ───────────────────────────────────────────────────────

interface WinProbabilityCardProps {
  teamA: string
  teamB: string
  rankA?: number
  rankB?: number
  naviTotal: number
  g2Total: number
}

function WinProbabilityCard({ teamA, teamB, rankA, rankB, naviTotal, g2Total }: WinProbabilityCardProps) {
  return (
    <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col justify-between gap-6 flex-1 min-w-0">
      <div className="flex flex-col gap-6">
        <SectionLabel label="Win Probability" />
        {/* Teams row */}
        <div className="flex items-end justify-between w-full">
          <div>
            {rankA != null && (
              <p className="text-[#666] text-[12px] font-barlow" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>
                #{rankA}
              </p>
            )}
            <p className="text-white text-[20px] font-barlow" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>
              {teamA.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            {rankB != null && (
              <p className="text-[#666] text-[12px] font-barlow" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>
                #{rankB}
              </p>
            )}
            <p className="text-white text-[20px] font-barlow" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>
              {teamB.toUpperCase()}
            </p>
          </div>
        </div>
        {/* Percentages */}
        <div className="flex items-center justify-between w-full">
          <span
            className="text-white text-[36px] font-barlow"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
          >
            {naviTotal}%
          </span>
          <span
            className="text-[32px] font-barlow"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400, color: '#BBFF14', fontVariantNumeric: 'tabular-nums' }}
          >
            {g2Total}%
          </span>
        </div>
      </div>
      {/* Bar */}
      <ProbabilityBar naviPct={naviTotal} g2Pct={g2Total} />
    </div>
  )
}

interface BestOpportunityCardProps {
  topMarketName: string
  over25Prob: number
  scenarioDescription: string
}

function BestOpportunityCard({ topMarketName, over25Prob, scenarioDescription }: BestOpportunityCardProps) {
  return (
    <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col justify-between gap-6 flex-1 min-w-0 self-stretch">
      <SectionLabel label="Best Opportunity" />
      <p
        className="text-white text-[16px] w-full"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
      >
        {scenarioDescription}
      </p>
      {/* Split card */}
      <div className="flex h-[77px] w-full">
        <div className="state-white flex-1 flex items-center px-6" style={{ borderRight: 'none', borderRadius: '4px 0 0 4px' }}>
          <p
            className="text-black uppercase text-[18px] font-barlow"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}
          >
            {topMarketName}
          </p>
        </div>
        <div
          className="state-yellow flex items-center justify-center px-6 shrink-0"
          style={{ borderLeft: 'none', borderRadius: '0 4px 4px 0' }}
        >
          <p
            className="text-black text-[24px] whitespace-nowrap font-barlow"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}
          >
            {over25Prob}%
          </p>
        </div>
      </div>
    </div>
  )
}

interface EntriesReturnCardProps {
  entriesCount: number
  totalReturn: number | null
  publicBet?: string | null
}

function EntriesReturnCard({ entriesCount, totalReturn, publicBet }: EntriesReturnCardProps) {
  return (
    <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-[10px] flex-1 min-w-0 self-stretch">
      {/* N Entradas */}
      <div className="state-white flex-1 flex items-center justify-center w-full">
        <p
          className="text-black uppercase text-[20px] font-barlow"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}
        >
          {entriesCount} ENTRIES
        </p>
      </div>
      {/* Retorno Potencial */}
      <div className="state-yellow flex-1 flex items-center justify-between px-6 w-full">
        <p
          className="text-black uppercase text-[20px]"
          style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 600 }}
        >
          POTENTIAL RETURN
        </p>
        <p
          className="text-black text-[20px] font-barlow"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}
        >
          {totalReturn !== null ? `${totalReturn}u` : '—'}
        </p>
      </div>
      {/* Aposta Pública */}
      <div className="state-green flex-1 flex items-center justify-between px-6 w-full">
        <p
          className="text-black uppercase text-[20px]"
          style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 600 }}
        >
          PUBLIC BET
        </p>
        <p
          className="text-black text-[20px] font-barlow"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}
        >
          {publicBet ?? '—'}
        </p>
      </div>
    </div>
  )
}

function BestOpportunityCardLocked() {
  return (
    <div
      className="rounded-[20px] flex flex-col justify-between gap-6 p-4 flex-1 min-w-0 self-stretch"
      style={{
        border: '2px solid #2B2B2B',
        backgroundImage: "url('/card_paybutton.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <p style={{ fontFamily: 'var(--font-sora), sans-serif', fontWeight: 600, fontSize: '32px', color: '#ffffff', textTransform: 'uppercase', lineHeight: 1.1 }}>
        Reveal<br />Best<br />Opportunity
      </p>
      <SignInCTA
        style={{
          fontFamily: 'var(--font-sora), sans-serif',
          fontWeight: 600,
          fontSize: '20px',
          textTransform: 'uppercase',
          color: '#000',
          background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6',
          border: '2px solid #FFF',
          borderRadius: '4px',
          padding: '16px 32px',
          cursor: 'pointer',
          width: '100%',
        }}
      />
    </div>
  )
}

interface DataVizProps {
  teamA: string
  teamB: string
  rankA?: number
  rankB?: number
  naviTotal: number
  g2Total: number
  topMarketName: string
  over25Prob: number
  scenarioDescription: string
  entriesCount: number
  totalReturn: number | null
  publicBet?: string | null
  isTeaser?: boolean
}

function DataVizSection({ teamA, teamB, rankA, rankB, naviTotal, g2Total, topMarketName, over25Prob, scenarioDescription, entriesCount, totalReturn, publicBet, isTeaser }: DataVizProps) {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col lg:flex-row gap-6">
        <WinProbabilityCard teamA={teamA} teamB={teamB} rankA={rankA} rankB={rankB} naviTotal={naviTotal} g2Total={g2Total} />
        {isTeaser
          ? <BestOpportunityCardLocked />
          : <BestOpportunityCard topMarketName={topMarketName} over25Prob={over25Prob} scenarioDescription={scenarioDescription} />
        }
        <EntriesReturnCard entriesCount={entriesCount} totalReturn={totalReturn} publicBet={publicBet} />
      </div>
    </div>
  )
}

// ─── Section 3: Maps / Bets ───────────────────────────────────────────────────

function BetRow({ bet }: { bet: BetRowData }) {
  return (
    <div className="panel-bg rounded-[4px] border border-[#1e2028] flex items-center gap-4 px-4 py-5 w-full">
      {/* Number */}
      <span
        className="text-[#4b5563] text-[11px] w-4 text-right shrink-0"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontVariantNumeric: 'tabular-nums' }}
      >
        {bet.num}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
        <p
          className="text-white text-[15px] tracking-[-0.2px]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          {bet.label}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-[#4b5563] text-[12px] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            ODD{' '}
            <span
              className="text-[#e2e8f0]"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontVariantNumeric: 'tabular-nums' }}
            >
              {bet.odd}
            </span>
          </span>
          <span className="text-[#2b2b2b] text-[12px]">·</span>
          <span className="text-[#4b5563] text-[12px] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            EDGE{' '}
            <span
              className="text-[#BBFF14]"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontVariantNumeric: 'tabular-nums' }}
            >
              {bet.edge}
            </span>
          </span>
          <span className="text-[#2b2b2b] text-[12px]">·</span>
          <span className="text-[#4b5563] text-[12px] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            STAKE{' '}
            <span
              className="text-[#e2e8f0]"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontVariantNumeric: 'tabular-nums' }}
            >
              {bet.stake}
            </span>
          </span>
          <span className="text-[#2b2b2b] text-[12px]">·</span>
          <span className="text-[#4b5563] text-[12px] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            PROB{' '}
            <span
              className="text-[#e2e8f0]"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontVariantNumeric: 'tabular-nums' }}
            >
              {bet.prob.split('→')[0]}
            </span>
            <span className="text-[#4b5563]">→</span>
            <span
              className="text-[#BBFF14]"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontVariantNumeric: 'tabular-nums' }}
            >
              {bet.prob.split('→')[1]?.trim()}
            </span>
          </span>
        </div>
      </div>

      {/* Badge */}
      <div
        className={`${dataStateClass[bet.state]} flex items-center justify-center shrink-0`}
        style={{ width: 22, height: 22, borderRadius: 3 }}
      >
        <span
          className="text-black text-[10px]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
        >
          {bet.badge}
        </span>
      </div>
    </div>
  )
}

interface MapsSectionProps {
  conservadoraUnits: number
  totalUnits: number
  entries: BetRowData[]
}

function MapsSection({ conservadoraUnits, totalUnits, entries }: MapsSectionProps) {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto flex flex-col md:flex-row gap-6">
        {/* Exposure sidebar */}
        <div className="flex flex-col gap-6 md:w-[200px] shrink-0">
          {/* Conservative */}
          <div className="panel-bg rounded-[12px] border border-[#2b2b2b] p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <p
                className="text-white text-[14px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                EXPOSURE
              </p>
              <p
                className="text-white text-[14px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Conservative
              </p>
            </div>
            <p
              className="text-[64px] leading-none font-barlow"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, color: '#BBFF14', fontVariantNumeric: 'tabular-nums' }}
            >
              {conservadoraUnits}u
            </p>
          </div>
          {/* Total */}
          <div className="panel-bg rounded-[12px] border border-[#2b2b2b] p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <p
                className="text-white text-[14px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                EXPOSURE
              </p>
              <p
                className="text-white text-[14px]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                TOTAL
              </p>
            </div>
            <p
              className="text-[64px] leading-none font-barlow"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, color: '#BBFF14', fontVariantNumeric: 'tabular-nums' }}
            >
              {totalUnits}u
            </p>
          </div>
        </div>

        {/* Bet list */}
        <div className="flex-1 flex flex-col gap-6">
          {entries.map((bet) => (
            <BetRow key={bet.num} bet={bet} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section 4: Scenarios ─────────────────────────────────────────────────────

function ScenarioCard({ scenario }: { scenario: ScenarioData }) {
  return (
    <div className="flex-1 min-w-0 rounded-[20px] border border-[#2b2b2b] flex flex-col justify-between p-[18px] gap-6">
      {/* Top info */}
      <div className="flex flex-col gap-2">
        <p
          className="text-[16px]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: scenario.labelColor }}
        >
          {scenario.label}
        </p>
        <p
          className="text-white text-[56px] leading-none font-barlow"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
        >
          {scenario.percentage}
        </p>
        <p
          className="text-white text-[16px]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          {scenario.description}
        </p>
      </div>

      {/* Bottom action */}
      <div className="flex flex-col gap-6">
        <div className={`${dataStateClass[scenario.buttonState]} flex items-center justify-center p-6 w-full`}>
          <p
            className="text-white text-[14px] uppercase text-center"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            {scenario.buttonLabel}
          </p>
        </div>
        <Divider />
        <div className="flex items-center justify-between">
          <p
            className="text-white text-[16px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {scenario.resultLabel}
          </p>
          <p
            className="text-[16px]"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: scenario.resultValue.startsWith('+') ? '#BBFF14' : scenario.resultValue.startsWith('-') ? '#f40101' : '#e2e8f0',
            }}
          >
            {scenario.resultValue}
          </p>
        </div>
      </div>
    </div>
  )
}

function ScenariosSection({ scenarios }: { scenarios: ScenarioData[] }) {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[1184px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </div>
    </div>
  )
}

// ─── Section 5: Alerts + Not Recommended ─────────────────────────────────────

function AlertsColumn({ alerts }: { alerts: string[] }) {
  return (
    <div className="flex-1 min-w-0 bg-[#05060f] rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-6">
      <SectionLabel label="Model Alerts" />
      {alerts.map((text, i) => (
        <div key={i} className="state-amber flex items-center gap-2 p-6 w-full">
          <WarningIcon />
          <p
            className="text-black text-[16px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            {text}
          </p>
        </div>
      ))}
    </div>
  )
}

function NotRecommendedColumn({ items }: { items: NotRecItem[] }) {
  return (
    <div className="flex-1 min-w-0 bg-[#05060f] rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-6">
      <SectionLabel label="Not Recommended" />
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-[4px] border-2 border-[#f40101] panel-bg flex items-start gap-3 p-4 w-full"
        >
          <CloseIcon />
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="text-white text-[16px] font-barlow"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}
              >
                {item.label}
              </p>
              {item.pct && (
                <p
                  className="text-[#fd3d3d] text-[14px] font-barlow"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {item.pct}
                </p>
              )}
            </div>
            {item.reason && (
              <p
                className="text-[#898989] text-[13px] break-words"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {item.reason}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function AlertsSection({ alerts, doNotRecommend }: { alerts: string[]; doNotRecommend: NotRecItem[] }) {
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6 pb-12">
      <div className="max-w-[1184px] mx-auto flex flex-col lg:flex-row gap-6">
        <AlertsColumn alerts={alerts} />
        <NotRecommendedColumn items={doNotRecommend} />
      </div>
    </div>
  )
}

// ─── Gated Section ────────────────────────────────────────────────────────────

function GatedSection() {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{
        minHeight: '620px',
        background: `linear-gradient(0deg, #000 0%, #B4B4B4 100%), linear-gradient(0deg, #D9FF00 0%, #D9FF00 100%), url('/bg_hero_home.jpg') lightgray 50% / cover no-repeat`,
        backgroundBlendMode: 'multiply, hue, normal',
      }}
    >
      <div className="flex flex-col items-center gap-6 px-12 py-24">
        {/* Headline */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-5xl font-bold text-center" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
            <span style={{ color: '#e8eaed' }}>Stop Guessing.</span>
            <br />
            <span style={{ color: '#d9ff00' }}>Start Knowing.</span>
          </p>
          <p
            className="text-xl font-semibold text-center"
            style={{ fontFamily: 'var(--font-sora), sans-serif', color: '#9ba3af', maxWidth: '314px' }}
          >
            This in-depth tactical insight is reserved for Pro members.
          </p>
        </div>

        {/* CTA */}
        <SignInCTA
          style={{
            fontFamily: 'var(--font-sora), sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            textTransform: 'uppercase',
            color: '#000',
            background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6',
            border: '2px solid #FFF',
            borderRadius: '4px',
            padding: '24px 48px',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DataPage({ analysis, cardState: _cardState = 'neutral', coverImage, mode = 'full', teaserEntriesCount }: DataPageProps) {
  if (!analysis) return null
  const data: MatchAnalysis = analysis

  const raw = data as any

  // Derive teams — support header.match (v2) or top-level match (v1)
  const headerMatch: string = data.header?.match ?? raw.match ?? ''
  const parts = headerMatch.split(' vs ')
  const teamA = parts[0]?.trim() ?? ''
  const teamB = parts[1]?.trim() ?? ''

  // Rankings
  const rankEntries = Object.values(data.context?.rankings ?? {}) as Array<{ position: number }>
  const rankA = rankEntries[0]?.position
  const rankB = rankEntries[1]?.position

  // Entries — entries_with_stakes can be objects {rank} (v2) or strings "#1 ..." (v1)
  const recStakesRaw: any[] = data.recommendations?.entries_with_stakes ?? []
  const recRankSet = new Set(
    recStakesRaw.map((r) => {
      if (typeof r === 'string') {
        const m = r.match(/^#(\d+)/)
        return m ? parseInt(m[1]) : null
      }
      return r?.rank ?? null
    }).filter((v): v is number => v != null)
  )
  // If entries_with_stakes is missing or empty, show all entries_ranked
  const allEntries: any[] = data.entries_ranked ?? []
  const activeEntries = recRankSet.size > 0
    ? allEntries.filter((e) => recRankSet.has(e.rank))
    : allEntries.filter((e) => (e.confidence ?? '') !== 'SEM EDGE')
  const topEntry = allEntries[0]

  // Bo3 probabilities — v2: {navi_total, g2_total, over_2_5_maps}; v1: {summary: {TEAM_win, over_4_5_maps}}
  const bo3Raw = raw.bo3_probabilities ?? {}
  const bo3Summary = bo3Raw.summary ?? bo3Raw
  const teamWinValues = Object.entries(bo3Summary)
    .filter(([k, v]) => typeof v === 'number' && (k.endsWith('_total') || k.endsWith('_win')))
    .map(([, v]) => v as number)
  const naviTotal: number = bo3Raw.team_a_total ?? bo3Raw.navi_total ?? teamWinValues[0] ?? 0
  const g2Total: number = bo3Raw.team_b_total ?? bo3Raw.g2_total ?? teamWinValues[1] ?? 0
  const over25Prob: number = bo3Raw.over_2_5_maps ?? bo3Summary.over_4_5_maps ?? bo3Summary.over_3_5_maps ?? 0

  // Public split (odds_movement.public_split)
  const publicSplit: Record<string, string> = raw.odds_movement?.public_split ?? {}
  const publicEntries = Object.entries(publicSplit) as [string, string][]
  const topPublic = publicEntries.sort(
    (a, b) => parseFloat(b[1]) - parseFloat(a[1])
  )[0]
  const publicBet: string | null = topPublic
    ? `${topPublic[1]} ${topPublic[0].toUpperCase()}`
    : null

  // Build stake lookup from active entries (normalized)
  const stakesByMarket = new Map<string, EntryStakeInfo>()
  for (const e of activeEntries) {
    const n = normalizeEntry(e)
    stakesByMarket.set(n.market_name.toLowerCase().trim(), { odd: n.odd, stake: n.stake })
  }

  // Calculate totals dynamically from entries
  const totalInvestment = activeEntries.reduce((sum, e) => sum + normalizeEntry(e).stake, 0)
  const totalReturn = parseFloat(
    activeEntries.reduce((sum, e) => {
      const n = normalizeEntry(e)
      return sum + (n.odd - 1) * n.stake
    }, 0).toFixed(2)
  )

  // DataViz data — em teaser mode usa o override para não mostrar 0
  const isTeaser = mode === 'teaser'
  const entriesCount = isTeaser ? (teaserEntriesCount ?? activeEntries.length) : activeEntries.length
  const displayTotalReturn: number | null = isTeaser ? null : totalReturn

  const provalScenario = (data.recommendations?.scenario_analysis ?? []).find(
    (s: any) => (s.name ?? s.scenario ?? '').toUpperCase() === 'PROVAVEL'
  )
  const scenarioDescription: string = provalScenario?.description ?? topEntry?.verdict ?? ''

  // MapsSection data
  const conservadoraUnits: number = activeEntries.reduce((sum, e) => {
    const n = normalizeEntry(e)
    return (n.confidence === 'S' || n.confidence === 'A') ? sum + n.stake : sum
  }, 0)
  const totalUnits: number = totalInvestment
  const betRows: BetRowData[] = activeEntries.map(entryToBetRow)

  // Scenarios
  const scenariosData: ScenarioData[] = (data.recommendations?.scenario_analysis ?? []).map(
    (s: any, i: number) => jsonScenarioToData(s, i, stakesByMarket, totalInvestment, raw.bo3_probabilities)
  )

  // Alerts
  const alertsList: string[] = data.alerts ?? []
  const doNotRecommend: NotRecItem[] = (data.do_not_recommend ?? []).map(
    (d: any, i: number) => parseDoNotRecommend(d, i)
  )

  // Tournament/format/date — support header.event (v2) or top-level tournament (v1)
  const tournament: string = data.header?.event ?? raw.tournament ?? ''
  const format: string = data.header?.format ?? raw.format ?? 'BO3'
  const matchDate: string = data.header?.date ?? raw.match_date ?? ''
  // Top entry market name
  const topMarketName: string = topEntry?.market_name ?? topEntry?.market ?? ''

  return (
    <div className="min-h-screen w-full bg-[#05060f] flex flex-col">
      <Header
        teamA={teamA}
        teamB={teamB}
        rankA={rankA}
        rankB={rankB}
        tournament={tournament}
        format={format}
        matchDate={matchDate}
        entriesCount={entriesCount}
        topEdge={topEntry?.edge ?? 0}
        coverImage={coverImage}
      />
      <DataVizSection
        teamA={teamA}
        teamB={teamB}
        rankA={rankA}
        rankB={rankB}
        naviTotal={naviTotal}
        g2Total={g2Total}
        topMarketName={topMarketName}
        over25Prob={over25Prob}
        scenarioDescription={scenarioDescription}
        entriesCount={entriesCount}
        totalReturn={displayTotalReturn}
        publicBet={publicBet}
        isTeaser={isTeaser}
      />
      {isTeaser ? (
        <GatedSection />
      ) : (
        <>
          <MapsSection
            conservadoraUnits={conservadoraUnits}
            totalUnits={totalUnits}
            entries={betRows}
          />
          <ScenariosSection scenarios={scenariosData} />
        </>
      )}
      {/* <AlertsSection alerts={alertsList} doNotRecommend={doNotRecommend} /> */}
    </div>
  )
}