'use client'

import '@/styles/data-states.css'
import { useState } from 'react'
import { SignInCTA } from '@/components/SignInCTA'
import { SiteFooter } from '@/components/SiteFooter'
import { MatchAnalysis, Entry, CardState } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type DataState = 'white' | 'yellow' | 'green' | 'amber' | 'orange' | 'red'
type EntryStatus = 'default' | 'green' | 'red'

const dataStateClass: Record<DataState, string> = {
  white: 'state-white',
  yellow: 'state-yellow',
  green: 'state-green',
  amber: 'state-amber',
  orange: 'state-orange',
  red: 'state-red',
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

export interface DataPageV2Props {
  analysis?: MatchAnalysis
  cardState?: CardState
  coverImage?: string
  mode?: 'full' | 'teaser'
  teaserEntriesCount?: number
}

// ─── Font constants ───────────────────────────────────────────────────────────

const FONT_NUM  = "'Sora', sans-serif"
const FONT_TEXT = "'Barlow Condensed', sans-serif"

// ─── Helpers — identical to DataPage ─────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 70) return '#32e601'
  if (pct >= 50) return '#BBFF14'
  if (pct >= 35) return '#FFE23D'
  return '#f40101'
}

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

const SCENARIO_META: Record<string, { labelColor: string; buttonState: DataState; resultLabel: string }> = {
  PROVAVEL: { labelColor: '#32e601', buttonState: 'green',  resultLabel: 'BALANCE' },
  BOM:      { labelColor: '#e8cd01', buttonState: 'amber',  resultLabel: 'BALANCE' },
  RUIM:     { labelColor: '#cc0101', buttonState: 'red',    resultLabel: 'BALANCE' },
  PESSIMO:  { labelColor: '#cc0101', buttonState: 'red',    resultLabel: 'TOTAL LOSS:' },
  IDEAL:    { labelColor: '#32e601', buttonState: 'green',  resultLabel: 'BALANCE' },
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

function matchMarket(abbreviated: string, fullName: string): boolean {
  const a = abbreviated.toLowerCase().replace(/\s*\(.*?\)/g, '').trim()
  const f = fullName.toLowerCase().trim()
  return f.startsWith(a) || a.startsWith(f)
}

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
  if (r.includes('todas') && r.includes('acertam')) {
    return Array.from(stakesByMarket.values()).reduce((sum, e) => sum + (e.odd - 1) * e.stake, 0)
  }
  const restantePerde = r.includes('restante perde')
  const winKeys       = new Set<string>()
  const loseKeys      = new Set<string>()
  const uncertainKeys = new Set<string>()
  const matchFrag = (key: string, frag: string): boolean => {
    if (frag.startsWith('OVER:'))  return key.includes(`over ${frag.slice(5)}`)
    if (frag === 'PARI_25')        return key.includes('+2.5') || key.includes('handicap')
    if (frag === 'PARI_1MAP')      return key.includes('pelo menos 1') || key.includes('1+ mapa')
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
        if (isDepende)             uncertainKeys.add(key)
        else if (isPossivelMiss)   loseKeys.add(key)
        else if (acerta && !perde) winKeys.add(key)
        else if (perde  && !acerta) loseKeys.add(key)
      }
    }
  }
  if (winKeys.size === 0) return null
  let conservative = 0
  let optimistic   = 0
  for (const [key, val] of stakesByMarket) {
    const profit = (val.odd - 1) * val.stake
    if (winKeys.has(key)) {
      conservative += profit; optimistic += profit
    } else if (uncertainKeys.has(key)) {
      conservative -= val.stake; optimistic += profit
    } else if (loseKeys.has(key) || restantePerde) {
      conservative -= val.stake; optimistic -= val.stake
    }
  }
  return uncertainKeys.size > 0 ? (conservative + optimistic) / 2 : conservative
}

type MarketResult = 'hit' | 'miss' | 'indeterminate'

function resolveMarketFromScore(marketName: string, teamAScore: number, teamBScore: number): MarketResult {
  const m = marketName.toLowerCase()
  const totalMaps = teamAScore + teamBScore
  const isDecider = totalMaps === 3
  const teamBWins = teamBScore > teamAScore
  if (/over\s*2\.5/.test(m))  return totalMaps > 2  ? 'hit' : 'miss'
  if (/under\s*2\.5/.test(m)) return totalMaps <= 2 ? 'hit' : 'miss'
  if (!m.includes('mapa') && !m.includes('map ') && !m.includes('map1') && !m.includes('map2')) {
    if (m.includes('-1.5')) return (teamAScore === 2 && teamBScore === 0) ? 'hit' : 'miss'
    if (m.includes('+1.5')) return (teamBWins || isDecider) ? 'hit' : 'miss'
  }
  if (m.includes('placar') || m.includes('correct score') || m.includes('score correto')) {
    const cs = m.match(/(\d)\s*[-x,]\s*(\d)/)
    if (cs) return (parseInt(cs[1]) === teamAScore && parseInt(cs[2]) === teamBScore) ? 'hit' : 'miss'
  }
  if (m.includes('ao menos 1') || m.includes('pelo menos 1') || m.includes('win at least')) {
    const isBMarket = m.includes('team b') || m.includes('_b ') || m.includes('azarao')
    if (isBMarket) return teamBScore >= 1 ? 'hit' : 'miss'
    return teamAScore >= 1 ? 'hit' : 'miss'
  }
  if (
    m.includes('mapa 1') || m.includes('mapa 2') || m.includes('map 1') || m.includes('map 2') ||
    m.includes('rounds') || /over\s*\d{2}/.test(m) || /under\s*\d{2}/.test(m) ||
    m.includes('team total') || m.includes('overtime')
  ) return 'indeterminate'
  return 'indeterminate'
}

function calcProfitFromScore(
  teamAScore: number,
  teamBScore: number,
  stakesByMarket: Map<string, EntryStakeInfo>
): { profit: number; hits: number; misses: number; indeterminate: number } {
  let profit = 0, hits = 0, misses = 0, indeterminate = 0
  for (const [marketName, info] of stakesByMarket) {
    const result = resolveMarketFromScore(marketName, teamAScore, teamBScore)
    if (result === 'hit')            { profit += (info.odd - 1) * info.stake; hits++ }
    else if (result === 'miss')      { profit -= info.stake; misses++ }
    else                              { indeterminate++ }
  }
  return { profit, hits, misses, indeterminate }
}

function jsonScenarioToData(
  s: any,
  idx: number,
  stakesByMarket?: Map<string, EntryStakeInfo>,
  totalInvestment?: number,
  rawBo3?: any
): ScenarioData {
  const scenarioKey = ((s.name ?? s.scenario ?? '') as string).toUpperCase()
  const meta = SCENARIO_META[scenarioKey] ?? { labelColor: '#ffffff', buttonState: 'white' as DataState, resultLabel: '' }
  const isV3 = s.predicted_series_score != null
  const isV2 = !isV3 && (s.entries_hit != null || s.net_result != null)
  let buttonLabel: string
  if (isV3 && stakesByMarket?.size) {
    const { hits, misses } = calcProfitFromScore(
      s.predicted_series_score.team_1_score ?? 0,
      s.predicted_series_score.team_2_score ?? 0,
      stakesByMarket
    )
    if (misses === 0 && hits > 0)       buttonLabel = `${hits} HITS`
    else if (hits === 0 && misses > 0)  buttonLabel = 'MIXED RESULT'
    else if (hits > 0 && misses > 0)    buttonLabel = 'MIXED RESULT'
    else                                buttonLabel = '—'
  } else if (isV2) {
    buttonLabel = getButtonLabel(s.entries_hit ?? [], s.entries_miss ?? [])
  } else {
    buttonLabel = parseV1ButtonLabel(s.result ?? '')
  }
  let percentage = ''
  if (s.probability != null) {
    percentage = `${s.probability}%`
  } else if (!isV2 && !isV3 && rawBo3) {
    percentage = deriveV1Probability(s.description ?? '', rawBo3)
  }
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
    if (profit !== null) resultValue = `${profit >= 0 ? '+' : ''}${profit.toFixed(2)}u`
  }
  return { id: idx + 1, label: scenarioKey.toLowerCase(), labelColor: meta.labelColor, percentage, description: s.description ?? '', buttonState: meta.buttonState, buttonLabel, resultLabel: meta.resultLabel, resultValue }
}

function parseDoNotRecommend(dnr: any, idx: number): NotRecItem {
  let pct: string
  if (typeof dnr.edge === 'number') {
    pct = `${dnr.edge > 0 ? '+' : ''}${dnr.edge}%`
  } else {
    const pctMatch = (dnr.reason ?? '').match(/\(([+-]?\d+\.?\d*%)\)/)
    pct = pctMatch ? pctMatch[1] : ''
  }
  return { id: idx, label: dnr.market ?? '', pct, reason: dnr.reason ?? '' }
}

function formatMatchDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' })
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg className="shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24">
      <path d="M8.4 17L7 15.6L10.6 12L7 8.425L8.4 7.025L12 10.625L15.575 7.025L16.975 8.425L13.375 12L16.975 15.6L15.575 17L12 13.4L8.4 17Z" fill="#D63434" />
    </svg>
  )
}

// ─── Section 1: Header ────────────────────────────────────────────────────────

interface HeaderProps {
  teamA: string; teamB: string; rankA?: number; rankB?: number
  tournament: string; format: string; matchDate?: string
  entriesCount: number; topEdge: number; coverImage?: string
}

function Header({ teamA, teamB, rankA, rankB, tournament, format, matchDate, entriesCount, topEdge, coverImage }: HeaderProps) {
  return (
    <div className="w-full bg-[#0F100A] px-6 md:px-12 py-6">
      <div className="max-w-[996px] mx-auto">
        <div
          className="border border-[#2c2c2c] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: coverImage
              ? `url('${coverImage}') center/cover`
              : 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)',
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-[51px]">
              <span className="text-sm font-semibold text-[#d9ff00]" style={{ fontFamily: FONT_TEXT }}>{tournament}</span>
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-[2px] px-[6px] py-[2px]">
                  <span className="text-[#0a0b14] text-[12px] font-medium" style={{ fontFamily: FONT_TEXT }}>{format}</span>
                </div>
                {matchDate && (
                  <span className="text-[#b5b5b5] text-[12px]" style={{ fontFamily: FONT_TEXT }}>{formatMatchDate(matchDate)}</span>
                )}
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div>
                {rankA != null && <p className="text-white text-[12px]" style={{ fontFamily: FONT_NUM }}>#{rankA}</p>}
                <p className="text-white text-2xl" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{teamA}</p>
              </div>
              <span className="text-[#adadad] text-[12px] pb-[5px]" style={{ fontFamily: FONT_TEXT }}>vs</span>
              <div>
                {rankB != null && <p className="text-white text-[12px]" style={{ fontFamily: FONT_NUM }}>#{rankB}</p>}
                <p className="text-white text-2xl" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{teamB}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center gap-1 p-[18px] rounded bg-[#0F100A] border border-[#2b2b2b]">
              <p className="text-white text-xs font-medium" style={{ fontFamily: FONT_TEXT }}>ENTRIES</p>
              <p className="text-white text-xl font-semibold" style={{ fontFamily: FONT_TEXT }}>{entriesCount} EV+</p>
            </div>
            {topEdge >= 0 && (
              <div className="flex flex-col items-center justify-center gap-1 p-[18px] rounded bg-[#0F100A] border border-[#2b2b2b]">
                <p className="text-white text-xs font-medium" style={{ fontFamily: FONT_TEXT }}>EDGE</p>
                <p className="text-white text-xl font-semibold" style={{ fontFamily: FONT_NUM }}>+{topEdge.toFixed(1)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Combo Bet Pill ───────────────────────────────────────────────────────────

function ComboBetPill() {
  return (
    <span
      style={{
        fontFamily: FONT_TEXT,
        fontWeight: 700,
        fontSize: '10px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#BBFF14',
        border: '1px solid #BBFF14',
        borderRadius: '999px',
        padding: '2px 8px',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      Combo Bet
    </span>
  )
}

// ─── Section 2: Win Probability + Best Opportunity ────────────────────────────

interface WinProbSectionProps {
  teamA: string; teamB: string; rankA?: number; rankB?: number
  winA: number; winB: number
  topEntries: any[]
  activeEntriesCount: number
  potentialReturn: string
  publicBet: string | null
  isTeaser: boolean
}

function WinProbSection({ teamA, teamB, rankA, rankB, winA, winB, topEntries, activeEntriesCount, potentialReturn, publicBet, isTeaser }: WinProbSectionProps) {
  return (
    <div className="w-full bg-[#0F100A] px-6 md:px-12 py-6">
      <div className="max-w-[996px] mx-auto">
        <div className="flex items-stretch gap-6 h-[360px]">

          {/* Win Probability */}
          <div className="flex flex-col gap-6 flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#d9ff00]" style={{ fontFamily: FONT_TEXT }}>Win probability</p>
            <div
              className="flex flex-col flex-1 px-6 py-8 rounded-[20px] border-2 border-[#2b2b2b]"
              style={{ background: 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)' }}
            >
              <div className="flex items-start justify-between w-full">
                <div>
                  {rankA != null && <p className="text-xs font-medium text-[#d6d6d6]" style={{ fontFamily: FONT_NUM }}>#{rankA}</p>}
                  <p className="text-white text-xl font-medium" style={{ fontFamily: FONT_TEXT }}>{teamA}</p>
                </div>
                <div className="text-right">
                  {rankB != null && <p className="text-xs font-medium text-[#d6d6d6]" style={{ fontFamily: FONT_NUM }}>#{rankB}</p>}
                  <p className="text-white text-xl font-medium" style={{ fontFamily: FONT_TEXT }}>{teamB}</p>
                </div>
              </div>
              <div className="flex items-center justify-between w-full mt-6">
                <span className="text-[32px] font-semibold" style={{ fontFamily: FONT_NUM, color: winA >= winB ? '#d9ff00' : '#fff1f1' }}>{winA}%</span>
                <span className="text-[32px]" style={{ fontFamily: FONT_NUM, color: winB > winA ? '#d9ff00' : '#fff1f1' }}>{winB}%</span>
              </div>
              <div className="flex h-[72px] w-full mt-auto">
                {winA >= winB ? (
                  <>
                    <div className="state-yellow shrink-0" style={{ width: `${winA}%`, borderRight: 'none', borderRadius: '4px 0 0 4px' }} />
                    <div className="state-white flex-1"   style={{ borderLeft:  'none', borderRadius: '0 4px 4px 0' }} />
                  </>
                ) : (
                  <>
                    <div className="state-white shrink-0" style={{ width: `${winA}%`, borderRight: 'none', borderRadius: '4px 0 0 4px' }} />
                    <div className="state-yellow flex-1"  style={{ borderLeft:  'none', borderRadius: '0 4px 4px 0' }} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Best Opportunity */}
          <div className="flex flex-col gap-6 flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#d9ff00]" style={{ fontFamily: FONT_TEXT }}>
              {topEntries.length > 1 ? 'Best Opportunities' : 'Best Opportunity'}
            </p>
            {isTeaser ? (
              <div
                className="rounded-xl flex flex-col justify-between gap-6 p-4 flex-1 min-h-[314px]"
                style={{ border: '2px solid #2B2B2B', backgroundImage: "url('/card_paybutton.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <p style={{ fontFamily: FONT_NUM, fontWeight: 600, fontSize: '32px', color: '#ffffff', textTransform: 'uppercase', lineHeight: 1.1 }}>
                  Reveal<br />Best<br />Opportunity
                </p>
                <SignInCTA
                  style={{ fontFamily: FONT_NUM, fontWeight: 600, fontSize: '20px', textTransform: 'uppercase', color: '#000', background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6', border: '2px solid #FFF', borderRadius: '4px', padding: '16px 32px', cursor: 'pointer', width: '100%' }}
                />
              </div>
            ) : topEntries.length === 1 ? (
              /* 1 entry — gradient card, centered */
              <div
                className="flex flex-col items-center justify-center flex-1 overflow-hidden gap-[6px] px-[18px] py-8"
                style={{ borderRadius: '12px', border: '1px solid #2B2B2B', background: 'radial-gradient(80.22% 80.22% at 50% 112.54%, #E6FF55 0%, #0F100A 100%), radial-gradient(252.05% 69.98% at 50% 32.96%, rgba(15, 16, 10, 0.50) 55%, rgba(230, 255, 85, 0.50) 100%), linear-gradient(180deg, #0F100A 0%, #0F100A 17.31%)', backgroundBlendMode: 'color-dodge, color-dodge, normal' }}
              >
                {topEntries[0]?.combo_bet && <ComboBetPill />}
                <p className="text-white text-[32px] font-medium text-center leading-[1.2]" style={{ fontFamily: FONT_TEXT }}>
                  {topEntries[0]?.market_name ?? topEntries[0]?.market ?? '—'}
                </p>
                <div className="flex items-center gap-[5px]">
                  <span className="text-sm font-light" style={{ fontFamily: FONT_TEXT, color: '#c0c0c0' }}>ODD</span>
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: FONT_NUM }}>{topEntries[0]?.odd?.toFixed(2) ?? '—'}</span>
                  <span style={{ color: '#94a3b8' }}>·</span>
                  <span className="text-sm font-light" style={{ fontFamily: FONT_TEXT, color: '#c0c0c0' }}>STAKE</span>
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: FONT_NUM }}>{topEntries[0]?.stake ?? '—'}u</span>
                </div>
              </div>
            ) : topEntries.length === 2 ? (
              /* 2 entries — 2 stacked rows, flex-col center each */
              <div className="flex flex-col flex-1 min-h-[314px]">
                {topEntries.map((entry, i) => (
                  <div key={i} className="flex flex-col justify-center items-center flex-1 overflow-hidden gap-8 px-[18px] py-8" style={{ borderRadius: '8px', border: '2px solid #0F100A', background: 'radial-gradient(108.4% 65.92% at 50% 100.32%, #E6FF55 0%, #000 100%), radial-gradient(384.26% 106.69% at 50% 107.01%, #090A05 55%, #E6FF55 100%), #0F100A', backgroundBlendMode: 'color-dodge, color-dodge, normal' }}>
                    <div className="flex justify-start items-center gap-3">
                      <p className="text-xl font-medium text-white shrink-0" style={{ fontFamily: FONT_TEXT }}>{i + 1}</p>
                      <div className="flex flex-col gap-[6px]">
                        {entry?.combo_bet && <ComboBetPill />}
                        <p className="text-xl font-medium text-white" style={{ fontFamily: FONT_TEXT }}>
                          {entry?.market_name ?? entry?.market ?? '—'}
                        </p>
                        <div className="flex items-center gap-[5px]">
                          <span className="text-sm font-light" style={{ fontFamily: FONT_TEXT, color: '#c0c0c0' }}>ODD</span>
                          <span className="text-sm font-semibold text-white" style={{ fontFamily: FONT_NUM }}>{entry?.odd?.toFixed(2) ?? '—'}</span>
                          <span style={{ color: '#94a3b8' }}>·</span>
                          <span className="text-sm font-light" style={{ fontFamily: FONT_TEXT, color: '#c0c0c0' }}>STAKE</span>
                          <span className="text-sm font-semibold text-white" style={{ fontFamily: FONT_NUM }}>{entry?.stake ?? '—'}u</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 3 entries — 3 stacked rows, flex-row each */
              <div className="flex flex-col flex-1 min-h-[314px]">
                {topEntries.slice(0, 3).map((entry, i) => (
                  <div key={i} className="flex justify-start items-center flex-1 overflow-hidden gap-3 p-8" style={{ borderRadius: '8px', border: '2px solid #0F100A', background: 'radial-gradient(108.4% 65.92% at 50% 100.32%, #E6FF55 0%, #000 100%), radial-gradient(384.26% 106.69% at 50% 107.01%, #090A05 55%, #E6FF55 100%), #0F100A', backgroundBlendMode: 'color-dodge, color-dodge, normal' }}>
                    <p className="text-xl font-medium text-white shrink-0" style={{ fontFamily: FONT_TEXT }}>{i + 1}</p>
                    <div className="flex flex-col justify-center items-start gap-[6px]">
                      {entry?.combo_bet && <ComboBetPill />}
                      <p className="text-xl font-medium text-left text-white" style={{ fontFamily: FONT_TEXT }}>
                        {entry?.market_name ?? entry?.market ?? '—'}
                      </p>
                      <div className="flex items-center gap-[5px]">
                        <span className="text-sm font-light" style={{ fontFamily: FONT_TEXT, color: '#c0c0c0' }}>ODD</span>
                        <span className="text-sm font-semibold text-white" style={{ fontFamily: FONT_NUM }}>{entry?.odd?.toFixed(2) ?? '—'}</span>
                        <span style={{ color: '#94a3b8' }}>·</span>
                        <span className="text-sm font-light" style={{ fontFamily: FONT_TEXT, color: '#c0c0c0' }}>STAKE</span>
                        <span className="text-sm font-semibold text-white" style={{ fontFamily: FONT_NUM }}>{entry?.stake ?? '—'}u</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pick Summary */}
          <div className="flex flex-col gap-6 flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#d9ff00]" style={{ fontFamily: FONT_TEXT }}>Pick Summary</p>
            <div
              className="flex flex-col gap-3 p-[18px] rounded-xl border-2 border-[#2b2b2b]"
              style={{ background: 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)' }}
            >
              <div className="state-white min-h-[64px] flex items-center justify-center w-full p-6">
                <p className="text-black uppercase text-[20px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>{activeEntriesCount} Entry</p>
              </div>
              <div className="state-yellow min-h-[64px] flex items-center justify-between w-full p-6">
                <p className="text-black uppercase text-[18px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>POTENTIAL RETURN</p>
                <p className="text-black text-[20px]" style={{ fontFamily: FONT_NUM, fontWeight: 600 }}>{isTeaser ? '—' : `${potentialReturn}u`}</p>
              </div>
              <div className="state-green min-h-[64px] flex items-center justify-between w-full p-6">
                <p className="text-black uppercase text-[18px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>PUBLIC BET</p>
                <p className="text-black text-[20px]" style={{ fontFamily: FONT_TEXT, fontWeight: 600 }}>{publicBet ?? '—'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Section 3: Series Markets ────────────────────────────────────────────────

function SeriesMarketsSection({ markets }: { markets: Array<{ label: string; rows: Array<{ name: string; pct: number }> }> }) {
  if (!markets.length) return null

  const leftMarkets = markets.filter(m => !m.label.toLowerCase().includes('handicap')).slice(0, 2)
  const handicapMarket = markets.find(m => m.label.toLowerCase().includes('handicap'))

  return (
    <div className="w-full bg-[#0F100A] px-6 md:px-12 py-6">
      <div className="max-w-[996px] mx-auto">
        <div className="grid grid-cols-3 gap-6">

          {/* Left col 1 — two small stacked cards */}
          <div className="flex flex-col gap-8">
            {leftMarkets.map((market) => (
              <div key={market.label} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-[#d9ff00]" style={{ fontFamily: FONT_TEXT }}>{market.label}</p>
                <div className="flex flex-col justify-center gap-4 px-6 py-6 rounded border border-[#2b2b2b]" style={{ background: 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)' }}>
                  <div className="flex flex-wrap gap-4">
                    {market.rows.map((row) => (
                      <div key={row.name} className="flex items-center gap-3">
                        <p className="text-xl font-semibold uppercase text-white" style={{ fontFamily: FONT_TEXT }}>{row.name}</p>
                        <p className="text-xl font-semibold uppercase" style={{ fontFamily: FONT_NUM, color: pctColor(row.pct) }}>{row.pct}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right cols 2-3 — handicap table */}
          {handicapMarket && (
            <div className="flex flex-col gap-3 col-span-2">
              <p className="text-sm font-semibold text-[#d9ff00]" style={{ fontFamily: FONT_TEXT }}>{handicapMarket.label}</p>
              <div className="flex flex-col justify-center gap-8 p-6 rounded border-2 border-[#2b2b2b] flex-1" style={{ background: 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)' }}>
                {/* Header */}
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold uppercase text-white" style={{ fontFamily: FONT_TEXT }}>TIMES</p>
                  <div className="flex justify-between w-48">
                    <p className="text-xs font-semibold uppercase text-white" style={{ fontFamily: FONT_TEXT }}>+1.5</p>
                    <p className="text-xs font-semibold uppercase text-white" style={{ fontFamily: FONT_TEXT }}>-1.5</p>
                  </div>
                </div>
                {/* Team rows — pairs: [i*2]=team+1.5, [i*2+1]=team-1.5 */}
                <div className="flex flex-col gap-6">
                  {Array.from({ length: Math.ceil(handicapMarket.rows.length / 2) }).map((_, i) => {
                    const r1 = handicapMarket.rows[i * 2]
                    const r2 = handicapMarket.rows[i * 2 + 1]
                    if (!r1) return null
                    return (
                      <div key={i} className="flex flex-col gap-6">
                        {i > 0 && <div className="w-full h-[2px] bg-[#2b2b2b]" />}
                        <div className="flex justify-between items-center">
                          <p className="text-xl font-semibold uppercase text-white" style={{ fontFamily: FONT_TEXT }}>{r1.name}</p>
                          <div className="flex justify-between w-48">
                            <p className="text-xl font-semibold uppercase" style={{ fontFamily: FONT_NUM, color: pctColor(r1.pct) }}>{r1.pct}%</p>
                            {r2 && <p className="text-xl font-semibold uppercase" style={{ fontFamily: FONT_NUM, color: pctColor(r2.pct) }}>{r2.pct}%</p>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── Section 4: Map Rounds ────────────────────────────────────────────────────

interface RoundMarket { threshold: string; over: number; under: number }

const MAP_CARD_BG = 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)'
const GEIST = "'Geist', sans-serif"

function MapRoundsSection({ maps, rounds }: { maps: any[]; rounds: RoundMarket[] }) {
  const [selectedMaps, setSelectedMaps] = useState<Set<string>>(new Set())

  if (!maps.length) return null

  const toggleMap = (name: string) => {
    setSelectedMaps(prev => {
      const next = new Set(prev)
      if (next.has(name)) { next.delete(name) } else { next.add(name) }
      return next
    })
  }

  const filteredMaps = selectedMaps.size === 0 ? maps : maps.filter(m => selectedMaps.has(m.map))

  const filterBtn = (active: boolean, onClick: () => void, label: string, dimmed?: boolean) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        fontFamily: GEIST,
        fontWeight: 500,
        fontSize: '14px',
        padding: '6px 14px',
        borderRadius: '4px',
        border: `1px solid ${active ? '#d9ff00' : '#2b2b2b'}`,
        background: active ? '#d9ff00' : 'transparent',
        color: active ? '#000' : '#fff',
        cursor: 'pointer',
        opacity: dimmed ? 0.45 : 1,
        transition: 'all 0.12s',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="w-full bg-[#0F100A] px-6 md:px-12 py-6">
      <div className="max-w-[996px] mx-auto flex flex-col gap-6">

        {/* Section label */}
        <p className="text-sm font-semibold text-[#d9ff00]" style={{ fontFamily: FONT_TEXT }}>Map Pool</p>

        {/* Main card */}
        <div
          className="rounded border border-[#2b2b2b] p-6 flex flex-col gap-6"
          style={{ background: MAP_CARD_BG }}
        >
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {filterBtn(selectedMaps.size === 0, () => setSelectedMaps(new Set()), 'All')}
            {maps.map(m => filterBtn(selectedMaps.has(m.map), () => toggleMap(m.map), m.map, !!m.banned_by))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <div style={{ minWidth: '580px' }}>
              {/* Header row */}
              <div
                className="grid border-b border-[#2b2b2b]"
                style={{ gridTemplateColumns: '130px 1fr 1fr 1fr 1fr 80px 110px' }}
              >
                {['Map', 'O17.5', 'O19.5', 'O20.5', 'O21.5', 'Samples', 'Status'].map(h => (
                  <div key={h} className="px-0 py-3 pr-4">
                    <p style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {h}
                    </p>
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {filteredMaps.map((row: any, i: number) => (
                <div
                  key={row.map}
                  className="grid border-b border-[#2b2b2b] last:border-none"
                  style={{
                    gridTemplateColumns: '130px 1fr 1fr 1fr 1fr 80px 110px',
                    background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  <div className="py-4 pr-4 flex items-center" style={{ opacity: row.banned_by ? 0.45 : 1 }}>
                    <span style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '14px', color: '#fff' }}>{row.map}</span>
                  </div>
                  {[row.over_17_5, row.over_19_5, row.over_20_5, row.over_21_5].map((val: number, vi: number) => (
                    <div key={vi} className="py-4 pr-4 flex items-center" style={{ opacity: row.banned_by ? 0.45 : 1 }}>
                      <span style={{ fontFamily: FONT_NUM, fontWeight: 600, fontSize: '16px', color: pctColor(val) }}>{val}%</span>
                    </div>
                  ))}
                  <div className="py-4 pr-4 flex items-center" style={{ opacity: row.banned_by ? 0.45 : 1 }}>
                    <span style={{ fontFamily: FONT_NUM, fontWeight: 400, fontSize: '13px', color: '#6b7280' }}>
                      {row.team_a_sample}/{row.team_b_sample}
                    </span>
                  </div>
                  <div className="py-4 pr-4 flex items-center">
                    {row.banned_by ? (
                      <span
                        className="state-red"
                        style={{
                          fontFamily: GEIST,
                          fontWeight: 600,
                          fontSize: '11px',
                          padding: '4px 0',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '76px',
                        }}
                      >
                        Ban {row.banned_by.length > 6 ? row.banned_by.slice(0, 4) : row.banned_by}
                      </span>
                    ) : (
                      <span
                        className="state-green"
                        style={{
                          fontFamily: GEIST,
                          fontWeight: 600,
                          fontSize: '11px',
                          padding: '4px 0',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '76px',
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Threshold summary cards */}
        {(() => {
          const thresholds = [
            { label: 'Over 17.5', key: 'over_17_5' },
            { label: 'Over 19.5', key: 'over_19_5' },
            { label: 'Over 20.5', key: 'over_20_5' },
            { label: 'Over 21.5', key: 'over_21_5' },
          ]
          const src = filteredMaps.length > 0 ? filteredMaps : maps
          return (
            <div className="flex gap-6">
              {thresholds.map(({ label, key }) => {
                const avg = Math.round(src.reduce((s: number, m: any) => s + (m[key] ?? 0), 0) / src.length)
                return (
                  <div key={key} className="flex-1 flex flex-col gap-3">
                    <p className="text-sm font-semibold text-[#d9ff00]" style={{ fontFamily: FONT_TEXT }}>{label}</p>
                    <div
                      className="rounded border border-[#2b2b2b] p-6 flex items-center justify-center"
                      style={{ background: MAP_CARD_BG }}
                    >
                      <span style={{ fontFamily: FONT_NUM, fontWeight: 700, fontSize: '36px', color: pctColor(avg) }}>{avg}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}

      </div>
    </div>
  )
}

// ─── Section 5: Entries Archive ───────────────────────────────────────────────
// TODO: retomar quando houver painel admin. Green/red vem do Turso (tabela EntryRecord),
// não de estado local. Exibir apenas para admin, não para usuários do produto.
//
// function EntriesArchiveSection({ entries }: { entries: any[] }) {
//   const [statuses, setStatuses] = useState<Record<number, EntryStatus>>({})
//
//   const toggle = (rank: number, status: 'green' | 'red') => {
//     setStatuses((prev) => ({ ...prev, [rank]: prev[rank] === status ? 'default' : status }))
//   }
//
//   if (!entries.length) return null
//
//   return (
//     <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
//       <div className="max-w-[996px] mx-auto flex flex-col gap-6">
//         <p className="text-[14px] text-white uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>
//           Entries Archive
//         </p>
//         <div className="flex flex-col gap-4">
//           {entries.map((entry) => {
//             const n = normalizeEntry(entry)
//             const status = statuses[n.rank] ?? 'default'
//             const borderColor = status === 'green' ? '#32e601' : status === 'red' ? '#f40101' : '#2b2b2b'
//             const confState = confidenceToState(n.confidence)
//             return (
//               <div
//                 key={n.rank}
//                 className="panel-bg rounded-[20px] p-[18px] flex items-center gap-6 transition-colors"
//                 style={{ border: `1px solid ${borderColor}` }}
//               >
//                 <span className="text-[#4b5563] text-[13px] shrink-0 w-4 text-right" style={{ fontFamily: FONT_NUM }}>
//                   {n.rank}
//                 </span>
//                 <div className="flex-1 min-w-0 flex flex-col gap-2">
//                   <p className="text-white text-[20px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{n.market_name}</p>
//                   <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
//                     <span style={{ fontFamily: FONT_TEXT, color: '#6b7280' }}>
//                       ODD <span style={{ fontFamily: FONT_NUM, color: 'white' }}>{n.odd.toFixed(2)}</span>
//                     </span>
//                     <span style={{ color: '#2b2b2b' }}>·</span>
//                     <span style={{ fontFamily: FONT_TEXT, color: '#6b7280' }}>
//                       STAKE <span style={{ fontFamily: FONT_NUM, color: 'white' }}>{n.stake}u</span>
//                     </span>
//                     <span style={{ color: '#2b2b2b' }}>·</span>
//                     <span style={{ fontFamily: FONT_TEXT, color: '#6b7280' }}>
//                       EDGE <span style={{ fontFamily: FONT_NUM, color: '#BBFF14' }}>+{n.edge.toFixed(1)}%</span>
//                     </span>
//                     <span style={{ color: '#2b2b2b' }}>·</span>
//                     <span
//                       className={`${dataStateClass[confState]} text-[11px]`}
//                       style={{ padding: '2px 8px', borderRadius: 3, fontFamily: FONT_TEXT, fontWeight: 600 }}
//                     >
//                       {n.confidence === 'SEM EDGE' ? '—' : n.confidence}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex gap-3 shrink-0">
//                   <button
//                     onClick={() => toggle(n.rank, 'green')}
//                     className="flex items-center justify-center size-[38px] rounded-full transition-all"
//                     style={{
//                       background: status === 'green' ? '#32e601' : 'transparent',
//                       border: '2px solid #32e601',
//                       color: status === 'green' ? '#000' : '#32e601',
//                       opacity: status === 'red' ? 0.25 : 1,
//                       fontSize: 18,
//                       lineHeight: 1,
//                     }}
//                     aria-label="Mark green"
//                   >✓</button>
//                   <button
//                     onClick={() => toggle(n.rank, 'red')}
//                     className="flex items-center justify-center size-[38px] rounded-full transition-all"
//                     style={{
//                       background: status === 'red' ? '#f40101' : 'transparent',
//                       border: '2px solid #f40101',
//                       color: status === 'red' ? '#fff' : '#f40101',
//                       opacity: status === 'green' ? 0.25 : 1,
//                       fontSize: 18,
//                       lineHeight: 1,
//                     }}
//                     aria-label="Mark red"
//                   >✗</button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }

// ─── Section 6: Scenarios ─────────────────────────────────────────────────────

function ScenarioCard({ scenario }: { scenario: ScenarioData }) {
  return (
    <div className="panel-bg rounded-[20px] border border-[#2b2b2b] p-[18px] flex flex-col gap-6 flex-1 min-w-0">
      <p className="text-[16px] uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 600, color: scenario.labelColor }}>
        {scenario.label}
      </p>
      <div className="flex flex-col gap-3">
        {scenario.percentage && (
          <p className="text-[48px] leading-none" style={{ fontFamily: FONT_NUM, fontWeight: 600, color: 'white' }}>
            {scenario.percentage}
          </p>
        )}
        <p className="text-[16px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#e2e8f0' }}>
          {scenario.description}
        </p>
      </div>
      {scenario.resultValue && (
        <>
          <div className="w-full h-[1px] bg-[#2B2B2B]" />
          <div className="flex items-center justify-between">
            <p className="text-[14px] uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#6b7280' }}>
              {scenario.resultLabel || 'BALANCE'}
            </p>
            <p
              className="text-[20px]"
              style={{
                fontFamily: FONT_NUM,
                fontWeight: 600,
                color: scenario.resultValue.startsWith('+') ? '#BBFF14' : scenario.resultValue.startsWith('-') ? '#f40101' : '#e2e8f0',
              }}
            >
              {scenario.resultValue}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function ScenariosSection({ scenarios }: { scenarios: ScenarioData[] }) {
  if (!scenarios.length) return null
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6">
      <div className="max-w-[996px] mx-auto flex flex-col gap-6">
        <p className="text-[14px] text-white uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>
          Scenarios
        </p>
        <div className="flex flex-col lg:flex-row gap-6">
          {scenarios.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Not Recommended ─────────────────────────────────────────────────────────

function NotRecommendedSection({ items }: { items: NotRecItem[] }) {
  if (!items.length) return null
  return (
    <div className="w-full bg-[#05060f] px-6 md:px-12 py-6 pb-12">
      <div className="max-w-[996px] mx-auto flex flex-col gap-6">
        <p className="text-[14px] text-white uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>
          Not Recommended
        </p>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.id} className="panel-bg rounded-[20px] border border-[#f40101] border-opacity-40 p-[18px] flex items-start gap-4">
              <CloseIcon />
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white text-[18px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{item.label}</p>
                  {item.pct && <p style={{ fontFamily: FONT_NUM, fontSize: 14, color: '#fd3d3d' }}>{item.pct}</p>}
                </div>
                {item.reason && <p className="text-[#898989] text-[13px]" style={{ fontFamily: FONT_TEXT }}>{item.reason}</p>}
              </div>
            </div>
          ))}
        </div>
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
        <div className="flex flex-col items-center gap-6">
          <p className="text-5xl font-bold text-center" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
            <span style={{ color: '#e8eaed' }}>Stop Guessing.</span><br />
            <span style={{ color: '#d9ff00' }}>Start Knowing.</span>
          </p>
          <p className="text-xl font-semibold text-center" style={{ fontFamily: 'var(--font-sora), sans-serif', color: '#9ba3af', maxWidth: '314px' }}>
            This in-depth tactical insight is reserved for Pro members.
          </p>
        </div>
        <SignInCTA
          style={{ fontFamily: 'var(--font-sora), sans-serif', fontWeight: 600, fontSize: '20px', textTransform: 'uppercase', color: '#000', background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6', border: '2px solid #FFF', borderRadius: '4px', padding: '24px 48px', cursor: 'pointer', letterSpacing: '0.02em' }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DataPageV2({ analysis, coverImage, mode = 'full', teaserEntriesCount }: DataPageV2Props) {
  if (!analysis) return null
  const data: MatchAnalysis = analysis
  const raw = data as any

  // Teams
  const headerMatch: string = data.header?.match ?? raw.match ?? ''
  const parts = headerMatch.split(' vs ')
  const teamA = parts[0]?.trim() ?? ''
  const teamB = parts[1]?.trim() ?? ''

  // Rankings
  const rankEntries = Object.values(data.context?.rankings ?? {}) as Array<{ position: number }>
  const rankA = rankEntries[0]?.position
  const rankB = rankEntries[1]?.position

  // Win probabilities — series_markets[0] primary (new schema), fallback to bo3_probabilities (old schema)
  const seriesMarkets: Array<{ label: string; rows: Array<{ name: string; pct: number }> }> = raw.series_markets ?? []
  const matchWinner = seriesMarkets[0]
  const bo3Raw = raw.bo3_probabilities ?? {}
  const bo3Summary = bo3Raw.summary ?? bo3Raw
  const teamWinValues = Object.entries(bo3Summary)
    .filter(([k, v]) => typeof v === 'number' && (k.endsWith('_total') || k.endsWith('_win')))
    .map(([, v]) => v as number)
  const naviTotal: number = bo3Raw.team_a_total ?? bo3Raw.navi_total ?? teamWinValues[0] ?? 0
  const g2Total:   number = bo3Raw.team_b_total ?? bo3Raw.g2_total  ?? teamWinValues[1] ?? 0
  const winA = matchWinner?.rows?.[0]?.pct ?? (Math.round((raw.model_probs?.team_a_win ?? 0) * 100) || naviTotal)
  const winB = matchWinner?.rows?.[1]?.pct ?? (Math.round((raw.model_probs?.team_b_win ?? 0) * 100) || g2Total)

  // Entries
  const recStakesRaw: any[] = data.recommendations?.entries_with_stakes ?? []
  const recRankSet = new Set(
    recStakesRaw.map((r) => {
      if (typeof r === 'string') { const m = r.match(/^#(\d+)/); return m ? parseInt(m[1]) : null }
      return r?.rank ?? null
    }).filter((v): v is number => v != null)
  )
  const allEntries: any[] = data.entries_ranked ?? []
  const activeEntries = recRankSet.size > 0
    ? allEntries.filter((e) => recRankSet.has(e.rank))
    : allEntries.filter((e) => (e.confidence ?? '') !== 'SEM EDGE')
  const topEntry = allEntries[0]

  // Public bet
  const publicSplit: Record<string, string | null> = raw.odds_movement?.public_split ?? {}
  const publicEntries = (Object.entries(publicSplit) as [string, string | null][]).filter(([, v]) => v != null) as [string, string][]
  const topPublic = publicEntries.sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))[0]
  const publicBet: string | null = topPublic ? `${topPublic[1]} ${topPublic[0].toUpperCase()}` : null

  // Stakes lookup & totals
  const stakesByMarket = new Map<string, EntryStakeInfo>()
  for (const e of activeEntries) {
    const n = normalizeEntry(e)
    stakesByMarket.set(n.market_name.toLowerCase().trim(), { odd: n.odd, stake: n.stake })
  }
  const totalInvestment = activeEntries.reduce((sum, e) => sum + normalizeEntry(e).stake, 0)
  const potentialReturn = activeEntries.reduce((sum, e) => {
    const n = normalizeEntry(e); return sum + (n.odd - 1) * n.stake
  }, 0).toFixed(2)

  // Teaser
  const isTeaser = mode === 'teaser'
  const activeEntriesCount = isTeaser ? (teaserEntriesCount ?? activeEntries.length) : activeEntries.length

  // Map / round data
  const mapAnalysis: any[] = raw.map_analysis ?? []
  const roundMarkets: RoundMarket[] = raw.round_markets ?? []

  // Scenarios
  const scenarios: ScenarioData[] = (data.recommendations?.scenario_analysis ?? []).map(
    (s: any, i: number) => jsonScenarioToData(s, i, stakesByMarket, totalInvestment, bo3Raw)
  )

  // Not recommended
  const notRecItems: NotRecItem[] = (data.do_not_recommend ?? []).map(
    (d: any, i: number) => parseDoNotRecommend(d, i + 1)
  )

  // Header meta
  const tournament: string = data.header?.event ?? raw.tournament ?? ''
  const format: string     = data.header?.format ?? raw.format ?? 'BO3'
  const matchDate: string  = data.header?.date ?? raw.match_date ?? ''

  return (
    <div className="min-h-screen w-full bg-[#05060f] flex flex-col">
      <Header
        teamA={teamA} teamB={teamB} rankA={rankA} rankB={rankB}
        tournament={tournament} format={format} matchDate={matchDate}
        entriesCount={activeEntriesCount} topEdge={topEntry?.edge ?? 0}
        coverImage={coverImage ?? raw.header?.cover_image}
      />
      <WinProbSection
        teamA={teamA} teamB={teamB} rankA={rankA} rankB={rankB}
        winA={winA} winB={winB}
        topEntries={activeEntries}
        activeEntriesCount={activeEntriesCount}
        potentialReturn={potentialReturn}
        publicBet={publicBet}
        isTeaser={isTeaser}
      />
      <SeriesMarketsSection markets={seriesMarkets} />
      <MapRoundsSection maps={mapAnalysis} rounds={roundMarkets} />
      {isTeaser && <GatedSection />}
      <div style={{ height: '128px', background: '#0F100A' }} />
      <SiteFooter />
    </div>
  )
}
