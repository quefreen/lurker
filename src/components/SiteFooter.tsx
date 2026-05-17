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
      className="w-full relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, rgba(31,33,20,0.8) 0%, rgba(15,16,10,0.8) 57.21%)', paddingTop: '128px', paddingLeft: '24px', paddingRight: '24px' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/blast_footer.svg"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', bottom: 0, right: 0, width: '382px', height: '159px', pointerEvents: 'none' }}
      />

      {/* cqi container — no inner padding, rows and tagline both 996px */}
      <div className="mx-auto" style={{ maxWidth: '996px', containerType: 'inline-size' }}>

        {/* Top row */}
        <div className="flex items-center justify-between w-full pb-[64px]">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo_lurkergg.gif" alt="lurker" width={187} height={48} />
          </Link>
          <div className="flex items-center gap-[12px]">
            <a href="/how-it-works" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>How it works</a>
            <a href="/#pricing" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>Pricing</a>
            <Link href="/sign-in?redirect_url=/" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>Sign in</Link>
            <Link href="/sign-in?redirect_url=/checkout">
              <button className="btn-yellow-lurker" style={btnYellow}>Get the edge</button>
            </Link>
          </div>
        </div>

        {/* Tagline — full 996px */}
        <p
          className="text-center w-full whitespace-nowrap"
          style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 'clamp(14px, 10.47cqi, 99.292px)', color: '#ffffff', lineHeight: 1 }}
        >
          Real numbers. Always.
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between w-full" style={{ paddingTop: '64px', paddingBottom: '128px' }}>
          <p style={g(14, 500, '#ffffff')}>© 2026 lurker.gg — All rights reserved.</p>
          <div className="flex items-center gap-[16px]">
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
