export interface ProfitCardProps {
  balance: number;
  greens: number;
  totalEntries: number;
  lastUpdated?: string;
}

type ProfitState = 'positive' | 'alert' | 'negative';

function calcWinRate(greens: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((greens / total) * 100);
}

function getProfitState(winRate: number): ProfitState {
  if (winRate > 60) return 'positive';
  if (winRate >= 50) return 'alert';
  return 'negative';
}

const GRAD = (color: string, darkBase: string) =>
  `radial-gradient(151.79% 151.79% at 50% 112.54%, ${color} 0%, #000 100%), ` +
  `radial-gradient(237.87% 66.04% at 50% 36.9%, ${darkBase} 55%, ${color} 100%), ` +
  `linear-gradient(180deg, #10111A 0%, #0C0D16 17.31%)`;

const profitStateStyles: Record<ProfitState, { background: string; accent: string }> = {
  positive: { background: GRAD('#D9FF00', '#090A05'), accent: '#BBFF14' },
  alert:    { background: GRAD('#FFB800', '#0A0900'), accent: '#F5C518' },
  negative: { background: GRAD('#FF1A00', '#0A0000'), accent: '#F40101' },
};

export function FixedProfitCard({ balance, greens, totalEntries, lastUpdated }: ProfitCardProps) {
  const winRate = calcWinRate(greens, totalEntries);
  const state   = getProfitState(winRate);
  const { background, accent } = profitStateStyles[state];

  const sign      = balance > 0 ? '+' : '';
  const netReturn = `${sign}${balance.toFixed(2)}u`;

  const updatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    : '—';

  return (
    <div
      className="relative rounded-[12px] w-full h-full"
      style={{
        background,
        backgroundBlendMode: 'color-dodge, color-dodge, normal',
        border: '1px solid #2B2B2B',
      }}
    >
      <div className="flex flex-col items-start justify-between p-[18px] h-full">
        {/* Top: Live record | period */}
        <div className="flex items-center justify-between w-full">
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 'normal' }}>
            Live record
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '12px', color: '#ffffff', lineHeight: 'normal' }}>
            2 weeks
          </span>
        </div>

        {/* Center: win rate + net return */}
        <div className="flex flex-col items-center gap-[32px] w-full">
          <div className="flex items-baseline justify-center">
            <span style={{ fontFamily: 'var(--font-sora), sans-serif', fontWeight: 600, fontSize: '58px', color: '#ffffff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {winRate}
            </span>
            <div className="flex flex-col items-start ml-[2px]">
              <span style={{ fontFamily: 'var(--font-sora), sans-serif', fontWeight: 600, fontSize: '33px', color: '#ffffff', lineHeight: 1 }}>%</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '8px', color: 'rgba(255,255,255,0.3)', lineHeight: 'normal' }}>win rate</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span style={{ fontFamily: 'var(--font-sora), sans-serif', fontWeight: 600, fontSize: '35px', color: accent, lineHeight: 'normal', fontVariantNumeric: 'tabular-nums' }}>
              {netReturn}
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '14px', color: 'rgba(255,255,255,0.3)', lineHeight: 'normal' }}>
              net return
            </span>
          </div>
        </div>

        {/* Bottom: Updated | date */}
        <div className="flex items-center justify-between w-full">
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '12px', color: '#ffffff', lineHeight: 'normal' }}>Updated</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '12px', color: '#ffffff', lineHeight: 'normal' }}>{updatedLabel}</span>
        </div>
      </div>
    </div>
  );
}
