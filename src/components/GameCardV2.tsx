import Link from 'next/link';
import type { MatchCardData } from '@/lib/queries';
import '@/styles/data-states.css';

export type GameCardData = MatchCardData;

const ARROW_PATH = "M7.60937 13.0469L6.95312 12.3906L11.4531 7.89062H7.42188V6.95312H13.0469V12.5781H12.1094V8.54688L7.60937 13.0469Z";
const VS_V_PATH = "M5.58168 10.667C5.51868 10.667 5.48018 10.6355 5.46618 10.5725L4.17468 5.43802L4.16418 5.39602C4.16418 5.34702 4.19568 5.32252 4.25868 5.32252H5.15118C5.22118 5.32252 5.25968 5.35402 5.26668 5.41702L6.02268 9.01852C6.02968 9.03952 6.03668 9.05002 6.04368 9.05002C6.05068 9.05002 6.05768 9.03952 6.06468 9.01852L6.81018 5.41702C6.82418 5.35402 6.86268 5.32252 6.92568 5.32252L7.81818 5.33302C7.85318 5.33302 7.87768 5.34352 7.89168 5.36452C7.91268 5.38552 7.91618 5.41352 7.90218 5.44852L6.62118 10.5725C6.61418 10.6355 6.57568 10.667 6.50568 10.667H5.58168Z";
const VS_S_PATH = "M10.1035 10.73C9.57849 10.73 9.16199 10.604 8.85399 10.352C8.55299 10.093 8.40249 9.74652 8.40249 9.31252V9.21802C8.40249 9.14802 8.43749 9.11302 8.50749 9.11302H9.25299C9.32299 9.11302 9.35799 9.14802 9.35799 9.21802V9.29152C9.35799 9.48052 9.43149 9.64152 9.57849 9.77452C9.72549 9.90052 9.90749 9.96352 10.1245 9.96352C10.3345 9.96352 10.5025 9.90052 10.6285 9.77452C10.7615 9.64852 10.828 9.48752 10.828 9.29152C10.828 9.13752 10.7825 9.00802 10.6915 8.90302C10.6005 8.79802 10.492 8.71752 10.366 8.66152C10.247 8.59852 10.0615 8.51452 9.80949 8.40952C9.53649 8.29052 9.30899 8.17502 9.12699 8.06302C8.95199 7.95102 8.79449 7.79002 8.65449 7.58002C8.51449 7.37002 8.44449 7.10402 8.44449 6.78202C8.44449 6.30602 8.59149 5.93502 8.88549 5.66902C9.18649 5.40302 9.58899 5.27002 10.093 5.27002C10.611 5.27002 11.017 5.40652 11.311 5.67952C11.612 5.95252 11.7625 6.32352 11.7625 6.79252V6.82402C11.7625 6.89402 11.7275 6.92902 11.6575 6.92902H10.933C10.863 6.92902 10.828 6.89402 10.828 6.82402V6.75052C10.828 6.56152 10.7615 6.40052 10.6285 6.26752C10.4955 6.13452 10.324 6.06802 10.114 6.06802C9.89699 6.06802 9.72549 6.13452 9.59949 6.26752C9.47349 6.40052 9.41049 6.56152 9.41049 6.75052C9.41049 6.89752 9.45249 7.02002 9.53649 7.11802C9.62049 7.21602 9.72199 7.29652 9.84099 7.35952C9.95999 7.41552 10.149 7.49952 10.408 7.61152C10.695 7.73752 10.933 7.86002 11.122 7.97902C11.311 8.09102 11.4755 8.25202 11.6155 8.46202C11.7625 8.67202 11.836 8.93452 11.836 9.24952C11.836 9.70452 11.6785 10.065 11.3635 10.331C11.0555 10.597 10.6355 10.73 10.1035 10.73Z";

export function GameCardItemV2({ card }: { card: GameCardData }) {
  const evLabel = card.entriesCount > 0 ? `${card.entriesCount} EV+` : 'EV+';

  return (
    <Link href={`/games/${card.slug}`} className="card-shimmer block h-full">
      {/* Top: game info */}
      <div style={{
        background: 'radial-gradient(237.87% 66.04% at 50% 36.9%, #383D24 55%, #D9FF00 100%), #0F100A',
        backgroundBlendMode: 'color-dodge, normal',
        borderTop: '3px solid #65FF0F',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        alignItems: 'center',
        WebkitMaskImage: 'radial-gradient(circle at 100% 100%, transparent 6px, #fff 7px), radial-gradient(circle at 0% 100%, transparent 6px, #fff 7px)',
        maskImage: 'radial-gradient(circle at 100% 100%, transparent 6px, #fff 7px), radial-gradient(circle at 0% 100%, transparent 6px, #fff 7px)',
        WebkitMaskComposite: 'destination-in',
        maskComposite: 'intersect',
      }}>
        {/* Header: BO3 | tournament | arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ padding: '6px', background: '#2B2B2B', borderRadius: '2px', justifyContent: 'center', alignItems: 'center', gap: '8px', display: 'inline-flex', flexShrink: 0 }}>
            <div style={{ color: 'white', fontSize: '12px', fontFamily: "'Sora', sans-serif", fontWeight: 700, wordWrap: 'break-word' }}>BO3</div>
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500, fontSize: '12px', color: '#fff', lineHeight: 'normal', textAlign: 'center', flex: 1, padding: '0 8px' }}>
            {card.tournament}
          </span>
          <div style={{ flexShrink: 0, width: 24, height: 24 }}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <rect fill="#242424" height="20" rx="10" width="20" />
              <path d={ARROW_PATH} fill="white" />
            </svg>
          </div>
        </div>

        {/* Teams + VS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500, fontSize: '24px', color: '#fff', lineHeight: 'normal', whiteSpace: 'nowrap' }}>
              {card.teamA}
            </span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <rect fill="#0F100A" height="16" rx="8" width="16" />
            <path d={VS_V_PATH} fill="white" />
            <path d={VS_S_PATH} fill="white" />
          </svg>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500, fontSize: '24px', color: '#fff', lineHeight: 'normal', whiteSpace: 'nowrap' }}>
              {card.teamB}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: action badges */}
      <div style={{
        background: 'radial-gradient(122.19% 122.19% at 50% 8.82%, #D9FF00 0%, #000 100%), radial-gradient(237.87% 66.04% at 50% 63.1%, #383D24 55%, #D9FF00 100%), #0F100A',
        backgroundBlendMode: 'color-dodge, color-dodge, normal',
        borderTop: '3px solid #65FF0F',
        padding: '24px',
        WebkitMaskImage: 'radial-gradient(circle at 100% 0%, transparent 6px, #fff 7px), radial-gradient(circle at 0% 0%, transparent 6px, #fff 7px)',
        maskImage: 'radial-gradient(circle at 100% 0%, transparent 6px, #fff 7px), radial-gradient(circle at 0% 0%, transparent 6px, #fff 7px)',
        WebkitMaskComposite: 'destination-in',
        maskComposite: 'intersect',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            flex: 1,
            borderRadius: '4px',
            border: '2px solid #FFF',
            background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px 24px',
          }}>
            <span style={{ fontFamily: "'Geist', sans-serif", fontWeight: 500, fontSize: '12px', color: '#0f0f0f', lineHeight: 'normal', whiteSpace: 'nowrap' }}>
              PRE GAME
            </span>
          </div>
          <div style={{
            flex: 1,
            borderRadius: '4px',
            border: '2px solid #000',
            background: 'radial-gradient(518.75% 518.75% at 50% 0%, #0F100A 0%, #000 62.02%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px 24px',
          }}>
            <span style={{ fontFamily: "'Geist', sans-serif", fontWeight: 500, fontSize: '12px', color: '#fff', lineHeight: 'normal', whiteSpace: 'nowrap' }}>
              {evLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
