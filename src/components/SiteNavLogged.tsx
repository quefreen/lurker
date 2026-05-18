'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import '@/styles/data-states.css'
import { NotificationPanel, type NotifProfitData, type SettledMatch } from '@/components/NotificationPanel'

const GEIST = "'Geist', sans-serif"

const btnYellow = {
  display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center',
  gap: '8px', padding: '16px 32px', cursor: 'pointer', whiteSpace: 'nowrap' as const,
  fontFamily: GEIST, fontWeight: 500, fontSize: '20px', color: '#0f0f0f',
}

function getInitials(user: { firstName?: string | null; lastName?: string | null; primaryEmailAddress?: { emailAddress: string } | null }): string {
  const first = user.firstName?.[0] ?? ''
  const last  = user.lastName?.[0] ?? ''
  if (first || last) return `${first}${last}`.toUpperCase()
  return (user.primaryEmailAddress?.emailAddress?.[0] ?? '?').toUpperCase()
}

function NotificationBell({ hasNotifications, onClick }: { hasNotifications: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Notifications"
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', minWidth: '44px', minHeight: '44px' }}
    >
      <Image
        src={hasNotifications ? '/notification_on.svg' : '/notification_off.svg'}
        alt="notifications"
        width={24}
        height={24}
      />
    </button>
  )
}

function UserAvatar() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!user) return null

  const initials = getInitials(user)
  const email = user.primaryEmailAddress?.emailAddress ?? ''

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="User menu"
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(to bottom, rgba(31,33,20,0.9) 0%, rgba(15,16,10,0.9) 100%)',
          border: '2px solid #2b2b2b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#d9ff00')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2b2b2b')}
      >
        <span style={{ fontFamily: GEIST, fontWeight: 600, fontSize: '13px', color: '#ffffff', letterSpacing: '0.04em' }}>
          {initials}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 z-50"
          style={{ width: '220px', borderRadius: '8px', overflow: 'hidden', background: '#0F100A', border: '1px solid #2b2b2b', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        >
          <div className="flex flex-col px-4 py-3 gap-1">
            <span style={{ fontFamily: GEIST, fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>
              {user.fullName ?? initials}
            </span>
            <span style={{ fontFamily: GEIST, fontWeight: 400, fontSize: '11px', color: '#6b7280' }}>
              {email}
            </span>
          </div>
          <div style={{ height: '1px', background: '#2b2b2b' }} />
          <div className="py-1">
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="w-full flex items-center px-4 py-[9px] transition-colors"
              style={{ fontFamily: GEIST, fontSize: '13px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface SiteNavLoggedProps {
  background?: string
  position?: 'static' | 'absolute'
  zIndex?: number
}

export function SiteNavLogged({ background = '#0F100A', position = 'static', zIndex = 30 }: SiteNavLoggedProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profit, setProfit] = useState<NotifProfitData | null>(null)
  const [settled, setSettled] = useState<SettledMatch[]>([])
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [priceId, setPriceId] = useState('')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        setProfit(data.profit)
        setSettled(data.settled)
        setPlan(data.plan ?? 'free')
        setPriceId(data.monthlyPriceId ?? '')
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    function onOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMobileOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [mobileOpen])

  const hasNotifications = settled.length > 0
  const isPro = plan === 'pro'
  const navBg = mobileOpen ? '#0F100A' : background

  return (
    <>
      <nav
        ref={navRef}
        className="w-full"
        style={{ background: navBg, position, top: 0, left: 0, right: 0, zIndex, paddingLeft: '24px', paddingRight: '24px', transition: 'background 0.2s' }}
      >
        <div className="mx-auto flex items-center justify-between py-[24px]" style={{ maxWidth: '996px' }}>

          <Link href="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
            <Image src="/logo_lurkergg.gif" alt="lurker" width={187} height={48} priority />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-[12px]">
            <a href="/how-it-works" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>
              How it works
            </a>
            {!isPro && (
              <>
                <a href="/#pricing" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>
                  Pricing
                </a>
                <Link href={priceId ? `/checkout?plan=${priceId}` : '/checkout'}>
                  <button className="btn-yellow-lurker" style={btnYellow}>Upgrade to pro</button>
                </Link>
              </>
            )}
            <NotificationBell hasNotifications={hasNotifications} onClick={() => setPanelOpen(true)} />
            <UserAvatar />
          </div>

          {/* Mobile right: bell + avatar + hamburger */}
          <div className="flex md:hidden items-center gap-[4px]">
            <NotificationBell hasNotifications={hasNotifications} onClick={() => setPanelOpen(true)} />
            <UserAvatar />
            <button
              className="flex items-center justify-center"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', minWidth: '44px', minHeight: '44px', flexDirection: 'column', gap: '5px' }}
            >
              <span style={{ width: '24px', height: '2px', background: '#fff', display: 'block', transition: 'transform 0.25s', transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ width: '24px', height: '2px', background: '#fff', display: 'block', transition: 'opacity 0.25s', opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ width: '24px', height: '2px', background: '#fff', display: 'block', transition: 'transform 0.25s', transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>

        </div>

        {/* Mobile dropdown panel */}
        {mobileOpen && (
          <div
            className="flex flex-col md:hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}
          >
            <a
              href="/how-it-works"
              style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '18px', color: '#fff', textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </a>
            {!isPro && (
              <>
                <a
                  href="/#pricing"
                  style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '18px', color: '#fff', textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </a>
                <Link
                  href={priceId ? `/checkout?plan=${priceId}` : '/checkout'}
                  className="btn-yellow-lurker"
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: GEIST, fontWeight: 500, fontSize: '18px', color: '#0f0f0f', textDecoration: 'none', padding: '20px', marginTop: '16px' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Upgrade to pro
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <NotificationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        profit={profit}
        settled={settled}
      />
    </>
  )
}
