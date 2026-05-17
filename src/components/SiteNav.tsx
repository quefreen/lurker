'use client'

import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import '@/styles/data-states.css'

const GEIST = "'Geist', sans-serif"

const btnYellow: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  gap: '8px', padding: '16px 32px', cursor: 'pointer', whiteSpace: 'nowrap',
  fontFamily: GEIST, fontWeight: 500, fontSize: '20px', color: '#0f0f0f',
}

interface SiteNavProps {
  background?: string
  position?: 'static' | 'absolute'
  zIndex?: number
}

export function SiteNav({ background = 'transparent', position = 'static', zIndex = 30 }: SiteNavProps) {
  return (
    <nav
      className="w-full"
      style={{ background, position, top: 0, left: 0, right: 0, zIndex, paddingLeft: '24px', paddingRight: '24px' }}
    >
      <div className="mx-auto flex items-center justify-between py-[24px]" style={{ maxWidth: '996px' }}>
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo_lurkergg.gif" alt="lurker" width={187} height={48} priority />
        </Link>
        <div className="flex items-center gap-[12px]">
          <Link href="/how-it-works" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>
            How it works
          </Link>
          <Link href="/#pricing" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>
            Pricing
          </Link>
          <Link href="/sign-in?redirect_url=/" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>
            Sign in
          </Link>
          <Link href="/sign-in?redirect_url=/checkout">
            <button className="btn-yellow-lurker" style={btnYellow}>Get the edge</button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
