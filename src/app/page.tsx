export const dynamic = 'force-dynamic';

import { getProfitCardData, getMatchesForCarrossel } from '@/lib/queries';
import { mockGameCards } from '@/components/GameCard';
import { GameCardItemV2 } from '@/components/GameCardV2';
import { HeroScene } from '@/components/HeroScene';
import Image from 'next/image';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteNavSmart } from '@/components/SiteNavSmart';
import { PricingButton } from '@/components/PricingButton';
import React from 'react';

const g = (size: number, weight: number, color: string): React.CSSProperties => ({
  fontFamily: "'Geist', sans-serif",
  fontWeight: weight,
  fontSize: `${size}px`,
  color,
  lineHeight: 'normal',
});

const btnYellow: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  gap: '8px', padding: '16px 32px', cursor: 'pointer', whiteSpace: 'nowrap' as const,
  ...g(20, 500, '#0f0f0f'),
};

const btnWhite: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  gap: '8px', padding: '16px 32px', borderRadius: '4px',
  border: '2px solid #FFF',
  background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6',
  cursor: 'pointer', whiteSpace: 'nowrap' as const,
  ...g(20, 500, '#0f0f0f'),
};

export default async function HomePage() {
  const [matches, profit] = await Promise.all([
    getMatchesForCarrossel(),
    getProfitCardData(),
  ]);

  const monthlyPriceId = process.env.STRIPE_PRICE_ID_MONTHLY ?? ''
  const annualPriceId  = process.env.STRIPE_PRICE_ID_ANNUAL  ?? ''

  const displayCards = (matches.length > 0 ? matches : mockGameCards).filter(c => c.cardState !== 'cyan').slice(0, 4);

  const winRate = profit.totalResolved > 0
    ? Math.round((profit.greens / profit.totalResolved) * 100)
    : 81;
  const sign = profit.balance >= 0 ? '+' : '';
  const netReturn = `${sign}${profit.balance.toFixed(0)}u`;

  const updatedLabel = profit.lastUpdated
    ? new Date(profit.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'May 27';

  return (
    <main style={{ background: '#0F100A', minHeight: '100vh' }}>

      {/* ── Menu + Hero ───────────────────────────────────────────────────────── */}
      <div className="relative">
        <SiteNavSmart position="absolute" background="transparent" />

        <HeroScene>
          <div className="w-full flex items-center justify-center" style={{ height: '100vh' }}>
            <div className="flex flex-col items-center gap-[24px] px-[24px]" style={{ maxWidth: '996px', width: '100%' }}>
              <div className="flex items-center gap-[6px]">
                <span className="bg-clip-text" style={{ ...g(20, 600, 'transparent'), backgroundImage: 'linear-gradient(90deg, #fff 0%, #fff 100%)', WebkitBackgroundClip: 'text' }}>
                  Real numbers. Always.
                </span>
                <div style={{ width: '32px', height: '1px', background: '#ffffff' }} />
                <div className="flex gap-[8px] items-center">
                  <span style={g(20, 500, '#ffffff')}>Updated</span>
                  <span style={g(20, 600, '#ffffff')}>{updatedLabel}</span>
                </div>
              </div>

              <p className="text-center whitespace-pre-line" style={{ ...g(56, 500, '#ffffff'), maxWidth: '800px' }}>
                {`${winRate}% win rate. ${netReturn} net return.\nThe data works.`}
              </p>

              <PricingButton priceId={monthlyPriceId} className="btn-yellow-lurker" style={{ ...btnYellow, padding: '24px 48px' }}>Get the edge</PricingButton>
            </div>
          </div>
        </HeroScene>
      </div>

      {/* ── Cards ─────────────────────────────────────────────────────────────── */}
      <section className="w-full" style={{ background: '#0F100A', paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="mx-auto flex flex-col gap-[48px] px-[24px]" style={{ maxWidth: '996px' }}>
          <p className="text-center w-full" style={g(48, 500, '#ffffff')}>
            Your next entry is already here.
          </p>
          <div className="flex gap-[12px]">
            {displayCards.map((card) => (
              <div key={card.slug} style={{ flex: '0 0 calc(25% - 9px)', minWidth: 0 }}>
                <GameCardItemV2 card={card} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="w-full relative overflow-hidden" style={{ background: '#0F100A', paddingTop: '64px' }}>
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '250px', background: '#ffffff' }} />
        <div className="mx-auto flex flex-col gap-[48px] px-[24px] relative" style={{ maxWidth: '996px', zIndex: 1 }}>
          <div className="flex flex-col gap-[8px]">
            <p style={g(24, 500, '#ffffff')}>How it works.</p>
            <p style={g(48, 500, '#ffffff')}>From data to edge.</p>
          </div>
          <div className="flex gap-[18px]">
            {[
              { title: 'Pick a match',       desc: 'Every match is analyzed before it starts.',     img: '/howitworks_01.jpg' },
              { title: 'Follow the entries', desc: 'Entries ranked by edge and recommended stake.', img: '/howitworks_02.jpg' },
              { title: 'Secondary markets',  desc: 'Map pools, round totals, series markets.',      img: '/howitworks_03.jpg' },
            ].map((item) => (
              <div key={item.title} className="relative flex flex-col justify-end p-[24px] flex-1 overflow-hidden" style={{ background: '#737373', height: '500px' }}>
                {item.img && (
                  <Image src={item.img} alt={item.title} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                )}
                <div className="relative flex flex-col gap-[8px]" style={{ zIndex: 1 }}>
                  <p style={g(22, 600, '#ffffff')}>{item.title}</p>
                  <p style={g(18, 500, '#ffffff')}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────────── */}
      <section id="pricing" className="w-full" style={{ background: '#ffffff', paddingTop: '128px', paddingBottom: '128px' }}>
        <div className="mx-auto flex flex-col gap-[64px] px-[24px]" style={{ maxWidth: '996px' }}>
          <div className="flex gap-[24px] items-start">
            <div className="flex flex-col gap-[17px] shrink-0" style={{ width: '282px' }}>
              <p style={g(24, 500, '#0F100A')}>Pricing.</p>
              <p style={{ ...g(48, 500, '#0F100A'), lineHeight: 1.1 }}>Simple pricing.<br />Full edge.</p>
            </div>
            <div className="flex flex-col gap-[18px] p-[24px] relative flex-1" style={{ border: '2px solid #e8e8e8' }}>
              <div className="flex items-center justify-between">
                <span style={g(24, 500, '#0F100A')}>Trial</span>
                <span style={g(24, 500, '#0F100A')}>50 spots only</span>
              </div>
              <p style={g(48, 500, '#0F100A')}>Free for 3 days</p>
              <p style={g(24, 500, '#0F100A')}>No card required.<br />Full access from minute one.</p>
              <div className="flex h-[64px]">
                <div className="flex-1 flex items-center px-[32px]" style={{ background: '#f1f1f1' }}>
                  <span style={g(16, 500, '#0F100A')}>Insert your email</span>
                </div>
                <button className="btn-yellow-lurker" style={{ ...btnYellow, borderRadius: '0', padding: '0 32px' }}>
                  Claim your spot
                </button>
              </div>
              <p style={g(24, 500, '#0F100A')}>12 / 50 remaining</p>
            </div>
          </div>

          <div className="flex gap-[26px]">
            <div className="flex-1 flex flex-col gap-[48px] items-center p-[24px] relative" style={{ background: '#d9ff00', border: '2px solid #d9ff00' }}>
              <div className="flex items-center justify-between w-full">
                <span style={g(24, 400, '#0F100A')}>Pro</span>
                <span style={g(24, 400, '#0F100A')}>14 days</span>
              </div>
              <p style={g(48, 500, '#0F100A')}>$7.99</p>
              <div className="flex flex-col gap-[12px] items-center w-full">
                <div style={{ height: '1px', background: '#2b2b2b', width: '100%' }} />
                <p style={{ ...g(14, 600, '#0F100A'), textTransform: 'uppercase' }}>43% cheaper per day than Scout.</p>
              </div>
              <div className="flex flex-col gap-[12px] items-center">
                <p style={g(24, 500, '#0F100A')}>Cancel anytime.</p>
                <p style={g(24, 500, '#0F100A')}>Full access.</p>
              </div>
              <PricingButton priceId={monthlyPriceId} style={{ ...btnWhite, width: '100%', padding: '24px 48px' }}>Get the edge</PricingButton>
            </div>

            <div className="flex-1 flex flex-col gap-[48px] items-center p-[24px] relative" style={{ border: '2px solid #f3f3f3' }}>
              <div className="flex items-center justify-between w-full">
                <span style={g(24, 400, '#0F100A')}>Scout</span>
                <span style={g(24, 400, '#0F100A')}>7 days</span>
              </div>
              <p style={g(48, 500, '#0F100A')}>$4.99</p>
              <div style={{ height: '30px' }} />
              <div className="flex flex-col gap-[12px] items-center">
                <p style={g(24, 500, '#0F100A')}>Cancel anytime.</p>
                <p style={g(24, 500, '#0F100A')}>Full access.</p>
              </div>
              <PricingButton priceId={annualPriceId} style={{ ...btnWhite, width: '100%', padding: '24px 48px' }}>Start scouting</PricingButton>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

    </main>
  );
}
