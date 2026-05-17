export const dynamic = 'force-dynamic';

import { getProfitCardData, getMatchesForCarrossel } from '@/lib/queries';
import { mockGameCards } from '@/components/GameCard';
import { GameCardItemV2 } from '@/components/GameCardV2';
import { HeroScene } from '@/components/HeroScene';
import Image from 'next/image';
import Link from 'next/link';
import { SignInButton } from '@clerk/nextjs';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteNav } from '@/components/SiteNav';
import React from 'react';

// ─── Font helpers (Geist everywhere, Barlow only in card team names) ──────────

const g = (size: number, weight: number, color: string): React.CSSProperties => ({
  fontFamily: "'Geist', sans-serif",
  fontWeight: weight,
  fontSize: `${size}px`,
  color,
  lineHeight: 'normal',
});

// ─── Button styles ────────────────────────────────────────────────────────────

// btnYellow: layout only — background/border/radius live in .btn-yellow-lurker CSS class
const btnYellow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '16px 32px',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  ...g(20, 500, '#0f0f0f'),
};

const btnWhite: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '16px 32px',
  borderRadius: '4px',
  border: '2px solid #FFF',
  background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  ...g(20, 500, '#0f0f0f'),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PreviewPage() {
  const [matches, profit] = await Promise.all([
    getMatchesForCarrossel(),
    getProfitCardData(),
  ]);

  const displayCards = matches.length > 0 ? matches.slice(0, 4) : mockGameCards.slice(0, 4);

  const winRate = profit.totalResolved > 0
    ? Math.round((profit.greens / profit.totalResolved) * 100)
    : 81;
  const sign = profit.balance >= 0 ? '+' : '';
  const netReturn = `${sign}${profit.balance.toFixed(0)}u`;

  const updatedLabel = profit.lastUpdated
    ? new Date(profit.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'May 27';

  return (
    <main style={{ background: '#17190f', minHeight: '100vh' }}>

      {/* ── Menu + Hero (nav floats over hero) ─────────────────────────────── */}
      <div className="relative">
        <SiteNav position="absolute" />

        {/* Hero */}
        <HeroScene>
          <div className="w-full flex items-center justify-center" style={{ height: '100vh' }}>
          <div
            className="flex flex-col items-center gap-[24px] px-[24px]"
            style={{ maxWidth: '996px', width: '100%' }}
          >
            {/* Label row */}
            <div className="flex items-center gap-[6px]">
              <span
                className="bg-clip-text"
                style={{
                  ...g(20, 600, 'transparent'),
                  backgroundImage: 'linear-gradient(90deg, #fff 0%, #fff 100%)',
                  WebkitBackgroundClip: 'text',
                }}
              >
                Real numbers. Always.
              </span>
              <div style={{ width: '32px', height: '1px', background: '#ffffff' }} />
              <div className="flex gap-[8px] items-center">
                <span style={g(20, 500, '#ffffff')}>Updated</span>
                <span style={g(20, 600, '#ffffff')}>{updatedLabel}</span>
              </div>
            </div>

            {/* Big headline */}
            <p
              className="text-center whitespace-pre-line"
              style={{ ...g(56, 500, '#ffffff'), maxWidth: '800px' }}
            >
              {`${winRate}% win rate. ${netReturn} net return.\nThe data works.`}
            </p>

            <SignInButton mode="modal">
              <button className="btn-yellow-lurker" style={{ ...btnYellow, padding: '24px 48px' }}>Get the edge</button>
            </SignInButton>
          </div>
        </div>
        </HeroScene>
      </div>{/* end Menu+Hero wrapper */}

      {/* ── Cards ──────────────────────────────────────────────────────────── */}
      <section
        className="w-full"
        style={{ background: '#17190f', paddingTop: '64px', paddingBottom: '64px' }}
      >
        <div
          className="mx-auto flex flex-col gap-[48px] px-[24px]"
          style={{ maxWidth: '996px' }}
        >
          <p className="text-center w-full" style={g(48, 500, '#ffffff')}>
            Your next entry is already here.
          </p>

          {/* 4 cards */}
          <div className="flex gap-[12px]">
            {displayCards.map((card) => (
              <div key={card.slug} style={{ flex: '0 0 calc(25% - 9px)', minWidth: 0 }}>
                <GameCardItemV2 card={card} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="w-full relative overflow-hidden"
        style={{ background: '#17190f', paddingTop: '64px' }}
      >
        {/* White block behind bottom 50% of cards (500px cards → 250px) */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '250px', background: '#ffffff' }}
        />

        <div
          className="mx-auto flex flex-col gap-[48px] px-[24px] relative"
          style={{ maxWidth: '996px', zIndex: 1 }}
        >
          {/* Heading */}
          <div className="flex flex-col gap-[8px]">
            <p style={g(24, 500, '#ffffff')}>How it works.</p>
            <p style={g(48, 500, '#ffffff')}>From data to edge.</p>
          </div>

          {/* 3 feature cards — flex-1 each, no bg on wrapper */}
          <div className="flex gap-[18px]">
            {[
              { title: 'Pick a match',       desc: 'Every match is analyzed before it starts.',        img: '/howitworks_01.jpg' },
              { title: 'Follow the entries', desc: 'Entries ranked by edge and recommended stake.',    img: '/howitworks_02.jpg' },
              { title: 'Secondary markets',  desc: 'Map pools, round totals, series markets.',         img: '/howitworks_03.jpg' },
            ].map((item) => (
              <div
                key={item.title}
                className="relative flex flex-col justify-end p-[24px] flex-1 overflow-hidden"
                style={{ background: '#737373', height: '500px' }}
              >
                {item.img && (
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  />
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

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="w-full"
        style={{ background: '#ffffff', paddingTop: '128px', paddingBottom: '128px' }}
      >
        <div
          className="mx-auto flex flex-col gap-[64px] px-[24px]"
          style={{ maxWidth: '996px' }}
        >
          {/* Top row: heading + trial card */}
          <div className="flex gap-[24px] items-start">
            {/* Left heading */}
            <div
              className="flex flex-col gap-[17px] shrink-0"
              style={{ width: '282px' }}
            >
              <p style={g(24, 500, '#17190f')}>Pricing.</p>
              <p style={{ ...g(48, 500, '#17190f'), lineHeight: 1.1 }}>
                Simple pricing.<br />Full edge.
              </p>
            </div>

            {/* Trial card */}
            <div
              className="flex flex-col gap-[18px] p-[24px] relative flex-1"
              style={{ border: '2px solid #e8e8e8' }}
            >
              <div className="flex items-center justify-between">
                <span style={g(24, 500, '#17190f')}>Trial</span>
                <span style={g(24, 500, '#17190f')}>50 spots only</span>
              </div>
              <p style={g(48, 500, '#17190f')}>Free for 3 days</p>
              <p style={g(24, 500, '#17190f')}>
                No card required.<br />Full access from minute one.
              </p>
              {/* Email + CTA row */}
              <div className="flex h-[64px]">
                <div
                  className="flex-1 flex items-center px-[32px]"
                  style={{ background: '#f1f1f1' }}
                >
                  <span style={g(16, 500, '#17190f')}>Insert your email</span>
                </div>
                <button className="btn-yellow-lurker" style={{ ...btnYellow, borderRadius: '0', padding: '0 32px' }}>
                  Claim your spot
                </button>
              </div>
              <p style={g(24, 500, '#17190f')}>12 / 50 remaining</p>
            </div>
          </div>

          {/* Pricing tabs */}
          <div className="flex gap-[26px]">
            {/* Pro */}
            <div
              className="flex-1 flex flex-col gap-[48px] items-center p-[24px] relative"
              style={{ background: '#d9ff00', border: '2px solid #d9ff00' }}
            >
              <div className="flex items-center justify-between w-full">
                <span style={g(24, 400, '#17190f')}>Pro</span>
                <span style={g(24, 400, '#17190f')}>14 days</span>
              </div>
              <p style={g(48, 500, '#17190f')}>$7.99</p>
              <div className="flex flex-col gap-[12px] items-center w-full">
                <div style={{ height: '1px', background: '#2b2b2b', width: '100%' }} />
                <p style={{ ...g(14, 600, '#17190f'), textTransform: 'uppercase' }}>
                  43% cheaper per day than Scout.
                </p>
              </div>
              <div className="flex flex-col gap-[12px] items-center">
                <p style={g(24, 500, '#17190f')}>Cancel anytime.</p>
                <p style={g(24, 500, '#17190f')}>Full access.</p>
              </div>
              <SignInButton mode="modal">
                <button style={{ ...btnWhite, width: '100%', padding: '24px 48px' }}>Get the edge</button>
              </SignInButton>
            </div>

            {/* Scout */}
            <div
              className="flex-1 flex flex-col gap-[48px] items-center p-[24px] relative"
              style={{ border: '2px solid #f3f3f3' }}
            >
              <div className="flex items-center justify-between w-full">
                <span style={g(24, 400, '#17190f')}>Scout</span>
                <span style={g(24, 400, '#17190f')}>7 days</span>
              </div>
              <p style={g(48, 500, '#17190f')}>$4.99</p>
              <div style={{ height: '30px' }} />
              <div className="flex flex-col gap-[12px] items-center">
                <p style={g(24, 500, '#17190f')}>Cancel anytime.</p>
                <p style={g(24, 500, '#17190f')}>Full access.</p>
              </div>
              <button style={{ ...btnWhite, width: '100%', padding: '24px 48px' }}>
                Start scouting
              </button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

    </main>
  );
}
