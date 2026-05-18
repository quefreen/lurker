export const dynamic = 'force-dynamic';

import { getProfitCardData, getMatchesForCarrossel } from '@/lib/queries';
import { mockGameCards } from '@/components/GameCard';
import { GameCardItemV2 } from '@/components/GameCardV2';
import { HeroScene } from '@/components/HeroScene';
import Image from 'next/image';
import Link from 'next/link';
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
      <style>{`
        @media (max-width: 767px) {
          /* ── Hero ── */
          .hi-hero-meta { flex-wrap: wrap !important; justify-content: center !important; gap: 8px !important; }
          .hi-hero-divider { display: none !important; }
          .hi-hero-text { font-size: 24px !important; }
          .hi-hero-btn { width: 100% !important; padding: 20px 24px !important; white-space: normal !important; justify-content: center !important; }

          /* ── Cards ── */
          .hi-cards-section { padding-top: 48px !important; padding-bottom: 48px !important; }
          .hi-cards-title { font-size: 22px !important; text-align: left !important; }
          .hi-cards-grid { overflow-x: auto !important; scroll-snap-type: x mandatory !important; -webkit-overflow-scrolling: touch; padding-bottom: 8px !important; gap: 12px !important; flex-wrap: nowrap !important; }
          .hi-cards-grid::-webkit-scrollbar { display: none; }
          .hi-card-item { flex: 0 0 280px !important; scroll-snap-align: start !important; }

          /* ── How it works ── */
          .hi-hiw-section { padding-top: 48px !important; }
          .hi-hiw-bg-strip { height: 80px !important; }
          .hi-hiw-heading { font-size: 28px !important; }
          .hi-hiw-grid { flex-direction: column !important; gap: 12px !important; }
          .hi-hiw-card { height: 220px !important; flex: none !important; width: 100% !important; }

          /* ── Pricing ── */
          .hi-pricing-section { padding-top: 64px !important; padding-bottom: 64px !important; }
          .hi-pricing-wrapper { flex-direction: column !important; gap: 32px !important; }
          .hi-pricing-headline { font-size: 22px !important; }
          .hi-pricing-card { width: 100% !important; }
          .hi-pricing-top { padding: 24px !important; }
          .hi-pricing-top-inner { height: auto !important; }
          .hi-pricing-pro { font-size: 20px !important; }
          .hi-pricing-price { font-size: 20px !important; }
          .hi-pricing-bottom { padding: 24px !important; gap: 24px !important; }
          .hi-pricing-features { flex-direction: column !important; gap: 16px !important; }
          .hi-pricing-btn { padding: 20px 24px !important; }
        }
      `}</style>

      {/* ── Menu + Hero ───────────────────────────────────────────────────────── */}
      <div className="relative">
        <SiteNavSmart position="absolute" background="transparent" />

        <HeroScene>
          <div className="w-full flex items-center justify-center" style={{ height: '100vh' }}>
            <div className="flex flex-col items-center gap-[24px] px-[24px]" style={{ maxWidth: '996px', width: '100%' }}>
              <div className="hi-hero-meta flex items-center gap-[6px]">
                <span className="bg-clip-text" style={{ ...g(20, 600, 'transparent'), backgroundImage: 'linear-gradient(90deg, #fff 0%, #fff 100%)', WebkitBackgroundClip: 'text' }}>
                  Real numbers. Always.
                </span>
                <div className="hi-hero-divider" style={{ width: '32px', height: '1px', background: '#ffffff' }} />
                <div className="flex gap-[8px] items-center">
                  <span style={g(20, 500, '#ffffff')}>Updated</span>
                  <span style={g(20, 600, '#ffffff')}>{updatedLabel}</span>
                </div>
              </div>

              <p className="hi-hero-text text-center whitespace-pre-line" style={{ ...g(56, 500, '#ffffff'), maxWidth: '800px' }}>
                {`${winRate}% win rate. ${netReturn} net return.\nThe data works.`}
              </p>

              <PricingButton priceId={monthlyPriceId} className="hi-hero-btn btn-yellow-lurker" style={{ ...btnYellow, padding: '24px 48px' }}>Get the edge</PricingButton>
            </div>
          </div>
        </HeroScene>
      </div>

      {/* ── Cards ─────────────────────────────────────────────────────────────── */}
      <section className="hi-cards-section w-full" style={{ background: '#0F100A', paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="mx-auto flex flex-col gap-[48px] px-[24px]" style={{ maxWidth: '996px' }}>
          <p className="hi-cards-title text-center w-full" style={g(48, 500, '#ffffff')}>
            Your next entry is already here.
          </p>
          <div className="hi-cards-grid flex gap-[12px]">
            {displayCards.map((card) => (
              <div key={card.slug} className="hi-card-item" style={{ flex: '0 0 calc(25% - 9px)', minWidth: 0 }}>
                <GameCardItemV2 card={card} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="hi-hiw-section w-full relative overflow-hidden" style={{ background: '#0F100A', paddingTop: '64px' }}>
        <div className="hi-hiw-bg-strip absolute bottom-0 left-0 right-0" style={{ height: '250px', background: '#ffffff' }} />
        <div className="mx-auto flex flex-col gap-[48px] px-[24px] relative" style={{ maxWidth: '996px', zIndex: 1 }}>
          <div className="flex flex-col gap-[8px]">
            <p style={g(24, 500, '#ffffff')}>How it works.</p>
            <p className="hi-hiw-heading" style={g(48, 500, '#ffffff')}>From data to edge.</p>
          </div>
          <div className="hi-hiw-grid flex gap-[18px]">
            {[
              { title: 'Pick a match',       desc: 'Every match is analyzed before it starts.',     img: '/howitworks_01.jpg' },
              { title: 'Follow the entries', desc: 'Entries ranked by edge and recommended stake.', img: '/howitworks_02.jpg' },
              { title: 'Secondary markets',  desc: 'Map pools, round totals, series markets.',      img: '/howitworks_03.jpg' },
            ].map((item) => (
              <div key={item.title} className="hi-hiw-card relative flex flex-col justify-end p-[24px] flex-1 overflow-hidden" style={{ background: '#737373', height: '500px' }}>
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
      <section id="pricing" className="hi-pricing-section w-full" style={{ background: '#ffffff', paddingTop: '128px', paddingBottom: '128px' }}>
        <div className="mx-auto px-[24px]" style={{ maxWidth: '996px' }}>
          <div className="hi-pricing-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', alignSelf: 'stretch' }}>

            {/* Left — headline */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px' }}>
              <p style={g(24, 500, '#17190f')}>How it works.</p>
              <p className="hi-pricing-headline" style={g(32, 500, '#17190f')}>
                <span>Simple pricing.</span><br />
                <span>Full edge.</span>
              </p>
            </div>

            {/* Right — card */}
            <div className="hi-pricing-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: '648px' }}>

              {/* Black top: price */}
              <div className="hi-pricing-top" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch', gap: '8px', padding: '48px', background: '#000' }}>
                <div className="hi-pricing-top-inner" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', alignSelf: 'stretch', height: '56px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '48px' }}>
                      <p className="hi-pricing-pro" style={g(32, 600, '#fff')}>Pro</p>
                      <p className="hi-pricing-pro" style={g(32, 300, '#9e9e9e')}>weekly</p>
                    </div>
                    <p className="hi-pricing-price" style={g(32, 600, '#fff')}>$ 6,99</p>
                  </div>
                </div>
              </div>

              {/* Dark bottom: features + button */}
              <div className="hi-pricing-bottom" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch', gap: '48px', padding: '48px', background: '#17190f' }}>
                <div className="hi-pricing-features" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', alignSelf: 'stretch' }}>
                  {(['Full access.', 'Cancel anytime.', 'TAX include'] as const).map((label) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '14px' }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        <circle cx="10" cy="10" r="10" fill="#AFDFC1" />
                        <path d="M16.3 7.4L9.25 14.45L5 10.2L6.4 8.8L9.25 11.65L14.9 6L16.3 7.4Z" fill="#009D31" />
                      </svg>
                      <p style={g(20, 500, '#fff')}>{label}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/sign-in?redirect_url=/checkout"
                  className="hi-pricing-btn btn-yellow-lurker"
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch', padding: '24px 48px', textDecoration: 'none', cursor: 'pointer' }}
                >
                  <p style={g(20, 500, '#0f0f0f')}>Get the edge</p>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <SiteFooter />

    </main>
  );
}
