import Link from 'next/link';
import '@/styles/card-states.css';
import { CardState } from '@/lib/types';
import type { MatchCardData } from '@/lib/queries';

const cardStateClass: Record<CardState, string> = {
  neutral: 'card-neutral',
  yellow:  'card-yellow',
  gold:    'card-gold',
  cyan:    'card-cyan',
};

const statusColors: Record<CardState, string> = {
  neutral: '#BBFF14',
  yellow:  '#BBFF14',
  gold:    '#F26500',
  cyan:    '#19BBFF',
};

const statusLabels: Record<CardState, string> = {
  neutral: 'New',
  yellow:  'active',
  gold:    'closed',
  cyan:    'settled',
};

export type GameCardData = MatchCardData;

export const mockGameCards: GameCardData[] = [
  { slug: 'navi-vs-g2',         teamA: 'Natus Vincere', teamB: 'G2',      tournament: 'PGL Cluj-Napoca 2026', matchDate: '2026-02-18T18:00', cardState: 'neutral', entriesCount: 7 },
  { slug: 'spirit-vs-falcons',  teamA: 'Spirit',        teamB: 'Falcons', tournament: 'PGL Cluj-Napoca 2026', matchDate: '2026-02-18T20:00', cardState: 'yellow',  entriesCount: 5 },
  { slug: 'mongolz-vs-heroic',  teamA: 'The MongolZ',   teamB: 'Heroic',  tournament: 'PGL Cluj-Napoca 2026', matchDate: '2026-02-18T22:00', cardState: 'gold',    entriesCount: 4 },
  { slug: 'furia-vs-mibr',      teamA: 'Furia',         teamB: 'MIBR',    tournament: 'PGL Cluj-Napoca 2026', matchDate: '2026-02-18T16:00', cardState: 'cyan',    entriesCount: 6 },
  { slug: 'vitality-vs-liquid', teamA: 'Vitality',      teamB: 'Liquid',  tournament: 'PGL Cluj-Napoca 2026', matchDate: '2026-02-18T14:00', cardState: 'neutral', entriesCount: 3 },
];

export function GameCardItem({ card }: { card: GameCardData }) {
  const dotColor  = statusColors[card.cardState];
  const labelText = statusLabels[card.cardState];

  return (
    <Link
      href={`/games/${card.slug}`}
      className={`relative rounded-[20px] h-full block ${cardStateClass[card.cardState]}`}
    >
      <div aria-hidden="true" className="absolute inset-0 rounded-[20px] pointer-events-none" style={{ border: '1px solid #2b2b2b' }} />

      <div className="flex flex-col gap-[24px] items-stretch justify-between p-[18px] h-full relative z-[1]">
        {/* Top info */}
        <div className="flex flex-col gap-[7px] items-stretch w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-[4px] items-center">
              <div className="flex gap-[2px] items-center pr-[4px] py-[4px]">
                <svg width="2" height="2" viewBox="0 0 2 2" fill="none" className="shrink-0">
                  <circle cx="1" cy="1" r="1" fill={dotColor} />
                </svg>
                <span className="whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '14px', color: dotColor, lineHeight: 'normal' }}>
                  {labelText}
                </span>
              </div>
              <div className="relative flex items-center justify-center px-[4px] py-[2px] rounded-[2px]" style={{ border: '0.5px solid #5e5e5e' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: '8px', color: '#5e5e5e', lineHeight: 'normal' }}>BO3</span>
              </div>
            </div>
            <div className="bg-[#242424] rounded-full shrink-0 size-[20px]" />
          </div>

          <div className="flex flex-col gap-[12px] items-start w-full">
            <span className="w-full" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '10px', color: '#ddd', lineHeight: 'normal' }}>
              {card.tournament}
            </span>
            <div className="flex flex-col gap-[12px] items-start w-full">
              <span className="whitespace-nowrap" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500, fontSize: '28px', color: '#ffffff', lineHeight: 'normal' }}>
                {card.teamA}
              </span>
              <span className="whitespace-nowrap" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500, fontSize: '28px', color: '#ffffff', lineHeight: 'normal' }}>
                {card.teamB}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-[12px] items-stretch w-full">
          <div className="bg-white rounded-[4px] shrink-0 flex items-center justify-center px-[8px] py-[8px]">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '8px', color: '#000000', lineHeight: 'normal' }}>PRE GAME</span>
          </div>
          <div className="bg-[#131313] flex-1 rounded-[4px] flex items-center justify-center px-[12px] py-[8px]">
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500, fontSize: '12px', color: '#ffffff', lineHeight: 'normal' }}>
              {card.entriesCount > 0 ? `Entries ${card.entriesCount} EV+` : 'EV+'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
