'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

const FONT_NUM  = "'Sora', sans-serif"
const FONT_TEXT = "'Barlow Condensed', sans-serif"

function pctColor(pct: number) {
  if (pct >= 70) return '#32e601'
  if (pct >= 50) return '#BBFF14'
  if (pct >= 35) return '#FFE23D'
  return '#f40101'
}

export function MapRoundsTable({ maps }: { maps: MapRow[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 0)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateState()
    el.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState)
    return () => {
      el.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 160 : -160, behavior: 'smooth' })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-white uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>
          Round per map
        </p>
        <div className="flex gap-[12px] items-center lg:hidden">
          <button
            onClick={() => scroll('left')}
            disabled={!canLeft}
            className="flex items-center justify-center rounded-full size-[24px] transition-opacity"
            style={{ background: '#242424', opacity: canLeft ? 1 : 0.4, cursor: canLeft ? 'pointer' : 'not-allowed' }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} color="#ffffff" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canRight}
            className="flex items-center justify-center rounded-full size-[24px] transition-opacity"
            style={{ background: '#242424', opacity: canRight ? 1 : 0.4, cursor: canRight ? 'pointer' : 'not-allowed' }}
            aria-label="Scroll right"
          >
            <ChevronRight size={14} color="#ffffff" />
          </button>
        </div>
      </div>

      <style>{`
        .mrounds-wrap { min-width: 750px; }
        .mrounds-grid { grid-template-columns: 140px 100px 100px 100px 100px 90px 120px; }
        @media (min-width: 1024px) {
          .mrounds-wrap { min-width: unset; }
          .mrounds-grid { grid-template-columns: 140px 1fr 1fr 1fr 1fr 90px 120px; }
        }
      `}</style>

      <div className="panel-bg rounded-[20px] border border-[#2b2b2b] overflow-hidden">
        <div className="overflow-x-auto" ref={scrollRef}>
          <div className="mrounds-wrap">
            <div className="mrounds-grid grid border-b border-[#2b2b2b]">
              <div className="px-5 py-4 sticky left-0 z-10 panel-bg">
                <p className="text-[12px] uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#6b7280', letterSpacing: '0.08em' }}>Map</p>
              </div>
              {['O17.5', 'O19.5', 'O20.5', 'O21.5', 'Samples', 'Status'].map((h) => (
                <div key={h} className="px-5 py-4">
                  <p className="text-[12px] uppercase" style={{ fontFamily: FONT_TEXT, fontWeight: 500, color: '#6b7280', letterSpacing: '0.08em' }}>{h}</p>
                </div>
              ))}
            </div>
            {maps.map((row, i) => (
              <div
                key={row.map}
                className="mrounds-grid grid border-b border-[#2b2b2b] last:border-none"
                style={{
                  background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                  opacity: row.banned_by ? 0.5 : 1,
                }}
              >
                <div className="px-5 py-5 flex items-center sticky left-0 z-10 panel-bg">
                  <p className="text-white text-[16px]" style={{ fontFamily: FONT_TEXT, fontWeight: 500 }}>{row.map}</p>
                </div>
                {[row.over_17_5, row.over_19_5, row.over_20_5, row.over_21_5].map((val, vi) => (
                  <div key={vi} className="px-5 py-5 flex items-center">
                    <span className="text-[18px]" style={{ fontFamily: FONT_NUM, fontWeight: 600, color: pctColor(val) }}>
                      {val}%
                    </span>
                  </div>
                ))}
                <div className="px-5 py-5 flex items-center">
                  <span className="text-[13px]" style={{ fontFamily: FONT_NUM, fontWeight: 400, color: '#6b7280' }}>
                    {row.team_a_sample}/{row.team_b_sample}
                  </span>
                </div>
                <div className="px-5 py-5 flex items-center">
                  {row.banned_by ? (
                    <span
                      className="text-[11px] px-2 py-1 rounded-[4px]"
                      style={{ background: 'rgba(244,1,1,0.15)', color: '#f40101', fontFamily: FONT_TEXT, fontWeight: 500 }}
                    >
                      Ban {row.banned_by.length > 6 ? row.banned_by.slice(0, 4) : row.banned_by}
                    </span>
                  ) : (
                    <span className="text-[12px]" style={{ fontFamily: FONT_TEXT, color: '#32e601' }}>active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
