'use client'

import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import '@/styles/data-states.css'

const GEIST = "'Geist', sans-serif"

const g = (size: number, weight: number, color: string): React.CSSProperties => ({
  fontFamily: GEIST,
  fontWeight: weight,
  fontSize: `${size}px`,
  color,
  lineHeight: 'normal',
})

const btnYellow: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  gap: '8px', padding: '16px 32px', cursor: 'pointer', whiteSpace: 'nowrap',
  fontFamily: GEIST, fontWeight: 500, fontSize: '20px', color: '#0f0f0f',
}

export function SiteFooter() {
  return (
    <footer
      className="sf-root w-full relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)', paddingTop: '128px', paddingLeft: '24px', paddingRight: '24px' }}
    >
      <style>{`
        @media (max-width: 767px) {
          .sf-root { padding-top: 64px !important; }

          /* Top row: stack logo + links + button */
          .sf-top-row { flex-direction: column !important; align-items: flex-start !important; gap: 0 !important; padding-bottom: 48px !important; }
          .sf-links-group { flex-direction: column !important; align-items: flex-start !important; gap: 0 !important; width: 100%; margin-top: 8px; }
          .sf-nav-link { padding: 16px 0 !important; font-size: 18px !important; border-bottom: 1px solid rgba(255,255,255,0.06); display: block; }
          .sf-cta-wrap { width: 100% !important; margin-top: 24px; }
          .sf-cta-btn { width: 100% !important; white-space: normal !important; justify-content: center !important; padding: 20px !important; }

          /* Tagline: allow wrap on mobile */
          .sf-tagline { white-space: normal !important; word-break: break-word; }

          /* Bottom row: stack copyright + links */
          .sf-bottom-row { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; padding-top: 32px !important; padding-bottom: 64px !important; }
          .sf-bottom-links { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }

          /* Hide decorative blast image on mobile */
          .sf-blast { display: none !important; }
        }
      `}</style>

      {/* Decorative blast SVG */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sf-blast"
        src="/blast_footer.svg"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', bottom: 0, right: 0, width: '382px', height: '159px', pointerEvents: 'none' }}
      />

      <div className="mx-auto" style={{ maxWidth: '996px', containerType: 'inline-size' }}>

        {/* Top row */}
        <div className="sf-top-row flex items-center justify-between w-full pb-[64px]">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo_lurkergg.gif" alt="lurker" width={187} height={48} />
          </Link>
          <div className="sf-links-group flex items-center gap-[12px]">
            <a href="/how-it-works" className="sf-nav-link nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>How it works</a>
            <a href="/#pricing" className="sf-nav-link nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>Pricing</a>
            <Link href="/sign-in?redirect_url=/" className="sf-nav-link nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>Sign in</Link>
            <span className="sf-cta-wrap">
              <Link href="/sign-in?redirect_url=/checkout">
                <button className="sf-cta-btn btn-yellow-lurker" style={btnYellow}>Get the edge</button>
              </Link>
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          className="sf-tagline text-center w-full whitespace-nowrap"
          style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 'clamp(14px, 10.47cqi, 99.292px)', color: '#ffffff', lineHeight: 1 }}
        >
          Real numbers. Always.
        </p>

        {/* Bottom row */}
        <div className="sf-bottom-row flex items-center justify-between w-full" style={{ paddingTop: '64px', paddingBottom: '128px' }}>
          <p style={g(14, 500, '#ffffff')}>© 2026 lurker.gg — All rights reserved.</p>
          <div className="sf-bottom-links flex items-center gap-[16px]">
            <a href="mailto:support@lurker.gg" style={{ ...g(14, 500, '#ffffff'), textDecoration: 'underline' }}>
              support@lurker.gg
            </a>
            <span style={g(14, 500, '#ffffff')}>Privacy Policy</span>
            <span style={g(14, 500, '#ffffff')}>Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
