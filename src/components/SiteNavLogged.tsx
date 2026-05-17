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
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
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
  const [profit, setProfit] = useState<NotifProfitData | null>(null)
  const [settled, setSettled] = useState<SettledMatch[]>([])
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [priceId, setPriceId] = useState('')

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

  const hasNotifications = settled.length > 0
  const isPro = plan === 'pro'

  return (
    <>
      <nav
        className="w-full"
        style={{ background, position, top: 0, left: 0, right: 0, zIndex, paddingLeft: '24px', paddingRight: '24px' }}
      >
        <div className="mx-auto flex items-center justify-between py-[24px]" style={{ maxWidth: '996px' }}>
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo_lurkergg.gif" alt="lurker" width={187} height={48} priority />
          </Link>

          <div className="flex items-center gap-[12px]">
            <a href="/how-it-works" className="nav-link px-[24px] py-[12px]" style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '20px' }}>
              How it works
            </a>

            {/* Free plan only: Pricing + upgrade CTA */}
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
        </div>
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
