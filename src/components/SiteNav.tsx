'use client'

import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { useState, useEffect, useRef } from 'react'
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
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  const navBg = open ? '#0F100A' : background

  return (
    <nav
      ref={navRef}
      className="w-full"
      style={{ background: navBg, position, top: 0, left: 0, right: 0, zIndex, paddingLeft: '24px', paddingRight: '24px', transition: 'background 0.2s' }}
    >
      <div className="mx-auto flex items-center justify-between py-[24px]" style={{ maxWidth: '996px' }}>

        <Link href="/" className="flex items-center shrink-0" onClick={() => setOpen(false)}>
          <Image src="/logo_lurkergg.gif" alt="lurker" width={187} height={48} priority />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-[12px]">
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

        {/* Hamburger — mobile only */}
        <button
          className="flex md:hidden items-center justify-center"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', minWidth: '44px', minHeight: '44px', flexDirection: 'column', gap: '5px' }}
        >
          <span style={{ width: '24px', height: '2px', background: '#fff', display: 'block', transition: 'transform 0.25s', transform: open ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ width: '24px', height: '2px', background: '#fff', display: 'block', transition: 'opacity 0.25s', opacity: open ? 0 : 1 }} />
          <span style={{ width: '24px', height: '2px', background: '#fff', display: 'block', transition: 'transform 0.25s', transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>

      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div
          className="flex flex-col md:hidden"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}
        >
          <Link
            href="/how-it-works"
            style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '18px', color: '#fff', textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            onClick={() => setOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/#pricing"
            style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '18px', color: '#fff', textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            onClick={() => setOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/sign-in?redirect_url=/"
            style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '18px', color: '#fff', textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/sign-in?redirect_url=/checkout"
            className="btn-yellow-lurker"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: GEIST, fontWeight: 500, fontSize: '18px', color: '#0f0f0f', textDecoration: 'none', padding: '20px', marginTop: '16px' }}
            onClick={() => setOpen(false)}
          >
            Get the edge
          </Link>
        </div>
      )}
    </nav>
  )
}
