'use client'

import React from 'react'
import Link from 'next/link'

const SORA   = "'Sora', sans-serif"
const GEIST  = "'Geist', sans-serif"
const BARLOW = "'Barlow Condensed', sans-serif"

export interface SettledMatch {
  slug: string
  teamA: string
  teamB: string
  tournament: string
}

export interface NotifProfitData {
  balance: number
  greens: number
  totalResolved: number
  lastUpdated: string | null
  winRate: number
  period: string
}

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  profit: NotifProfitData | null
  settled: SettledMatch[]
}

type DotVariant = 'green' | 'yellow' | 'red'

function dotVariant(value: number, type: 'rate' | 'balance'): DotVariant {
  if (type === 'rate') {
    if (value >= 65) return 'green'
    if (value >= 50) return 'yellow'
    return 'red'
  }
  if (value > 0) return 'green'
  if (value === 0) return 'yellow'
  return 'red'
}

const DOT_STYLES: Record<DotVariant, React.CSSProperties> = {
  green:  { border: '1.6px solid #32E601', background: 'radial-gradient(518.75% 518.75% at 50% 0%, #32E601 0%, #000 62.02%), #FFF' },
  yellow: { border: '1.6px solid #D9FF00', background: 'radial-gradient(518.75% 518.75% at 50% 0%, #D9FF00 0%, #000 62.02%), #FFF' },
  red:    { border: '1.6px solid #F40101', background: 'radial-gradient(518.75% 518.75% at 50% 0%, #F40101 0%, #000 62.02%), #FFF' },
}

function StatDot({ variant }: { variant: DotVariant }) {
  return (
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      flexShrink: 0,
      ...DOT_STYLES[variant],
    }} />
  )
}

export function NotificationPanel({ open, onClose, profit, settled }: NotificationPanelProps) {
  const [visibleCount, setVisibleCount] = React.useState(6)

  const sign = profit && profit.balance >= 0 ? '+' : ''
  const netReturn = profit ? `${sign}${profit.balance.toFixed(0)}u` : '–'
  const winRateStr = profit ? `${profit.winRate}%` : '–'
  const period = profit?.period ?? '–'
  const updatedStr = profit?.lastUpdated
    ? new Date(profit.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const rateVariant = profit ? dotVariant(profit.winRate, 'rate') : 'green'
  const balVariant  = profit ? dotVariant(profit.balance, 'balance') : 'green'

  return (
    <>
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.4)' }}
          onClick={() => { setVisibleCount(6); onClose(); }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '368px',
          zIndex: 50,
          background: '#0F100A',
          borderLeft: '1px solid #2b2b2b',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
        }}
      >
        {/* Panel header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid #2b2b2b',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: GEIST, fontWeight: 600, fontSize: '16px', color: '#ffffff' }}>
            Notifications
          </span>
          <button
            onClick={() => { setVisibleCount(6); onClose(); }}
            aria-label="Close notifications"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Live record card — exact prototype layout */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '24px',
          padding: '48px 24px',
          background: '#0F100A',
          flexShrink: 0,
        }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' }}>
            <span style={{ fontFamily: SORA, fontWeight: 600, fontSize: '14px', color: '#d9ff00' }}>
              Live record
            </span>
            <span style={{ fontFamily: SORA, fontWeight: 600, fontSize: '14px', color: '#ffffff' }}>
              {period}
            </span>
          </div>

          {/* Stats — height 64px, space-between */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            alignSelf: 'stretch',
            height: '64px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', alignSelf: 'stretch' }}>
              <StatDot variant={rateVariant} />
              <span style={{ fontFamily: SORA, fontWeight: 400, fontSize: '20px', color: '#ffffff' }}>
                {winRateStr} win rate
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', alignSelf: 'stretch' }}>
              <StatDot variant={balVariant} />
              <span style={{ fontFamily: SORA, fontWeight: 400, fontSize: '20px', color: '#ffffff' }}>
                {netReturn} net return
              </span>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' }}>
            <span style={{ fontFamily: SORA, fontWeight: 500, fontSize: '12px', color: '#ffffff' }}>
              Updated
            </span>
            <span style={{ fontFamily: SORA, fontWeight: 500, fontSize: '12px', color: '#ffffff' }}>
              {updatedStr ?? '–'}
            </span>
          </div>
        </div>

        {/* Settled games */}
        <div style={{ flex: 1 }}>
          {settled.slice(0, visibleCount).map((match) => (
            <Link
              key={match.slug}
              href={`/games/${match.slug}`}
              onClick={onClose}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '24px',
                background: '#0f100a',
                borderBottom: '4px solid #0cf',
                textDecoration: 'none',
              }}
            >
              {/* Top: Settled tag + tournament */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{
                  fontFamily: GEIST,
                  fontWeight: 500,
                  fontSize: '8px',
                  color: '#00ccff',
                  textTransform: 'uppercase',
                }}>
                  Settled
                </span>
                <span style={{
                  fontFamily: GEIST,
                  fontWeight: 500,
                  fontSize: '8px',
                  color: '#ffffff',
                }}>
                  {match.tournament}
                </span>
              </div>

              {/* Bottom: teams + chevron */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignSelf: 'stretch',
                height: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '16px', color: '#ffffff' }}>
                    {match.teamA}
                  </span>
                  <span style={{ fontFamily: GEIST, fontWeight: 300, fontSize: '20px', color: '#ffffff' }}>
                    vs
                  </span>
                  <span style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '16px', color: '#ffffff' }}>
                    {match.teamB}
                  </span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <clipPath id="chevron-clip"><rect width="24" height="24" fill="white" /></clipPath>
                  <g clipPath="url(#chevron-clip)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.14604 4.14598C9.19248 4.09941 9.24766 4.06247 9.30841 4.03727C9.36915 4.01206 9.43427 3.99908 9.50004 3.99908C9.56581 3.99908 9.63093 4.01206 9.69167 4.03727C9.75242 4.06247 9.80759 4.09941 9.85404 4.14598L17.177 11.47C17.3175 11.6106 17.3964 11.8012 17.3964 12C17.3964 12.1987 17.3175 12.3894 17.177 12.53L9.85404 19.854C9.76015 19.9479 9.63281 20.0006 9.50004 20.0006C9.36726 20.0006 9.23993 19.9479 9.14604 19.854C9.05215 19.7601 8.99941 19.6328 8.99941 19.5C8.99941 19.3672 9.05215 19.2399 9.14604 19.146L16.293 12L9.14604 4.85398C9.09948 4.80753 9.06253 4.75236 9.03733 4.69161C9.01212 4.63087 8.99915 4.56575 8.99915 4.49998C8.99915 4.43421 9.01212 4.36909 9.03733 4.30834C9.06253 4.2476 9.09948 4.19242 9.14604 4.14598Z"
                      fill="#5A6474"
                    />
                  </g>
                </svg>
              </div>
            </Link>
          ))}

          {settled.length === 0 && profit !== null && (
            <p style={{ fontFamily: GEIST, fontSize: '13px', color: '#4b5563', padding: '24px', textAlign: 'center', margin: 0 }}>
              No settled games yet.
            </p>
          )}
        </div>

        {visibleCount < settled.length && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #2b2b2b', flexShrink: 0 }}>
            <button
              onClick={() => setVisibleCount(v => v + 6)}
              style={{ fontFamily: GEIST, fontSize: '13px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              see more
            </button>
          </div>
        )}
      </div>
    </>
  )
}
