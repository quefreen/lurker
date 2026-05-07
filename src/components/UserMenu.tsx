'use client'

import { useRef, useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import Image from 'next/image'

export function UserMenu() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? 'Usuário'
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  const avatar = user.imageUrl

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[#d9ff00] transition-all"
        style={{ width: '36px', height: '36px' }}
        aria-label="Menu do usuário"
      >
        <Image
          src={avatar}
          alt={name}
          width={36}
          height={36}
          className="object-cover w-full h-full"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-[220px] rounded-[8px] overflow-hidden z-50"
          style={{ background: '#0d0e17', border: '1px solid #1e2028', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Image
              src={avatar}
              alt={name}
              width={32}
              height={32}
              className="rounded-full shrink-0 object-cover"
            />
            <div className="flex flex-col min-w-0">
              <span
                className="truncate text-white text-[13px] font-medium leading-tight"
                style={{ fontFamily: 'var(--font-sora), sans-serif' }}
              >
                {name}
              </span>
              <span
                className="truncate text-[11px] leading-tight"
                style={{ fontFamily: "'Inter', sans-serif", color: '#5a626b' }}
              >
                {email}
              </span>
            </div>
          </div>

          <div className="border-t" style={{ borderColor: '#1e2028' }} />

          {/* Sign out */}
          <div className="py-1">
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="w-full flex items-center px-4 py-[9px] text-[13px] transition-colors hover:bg-red-500/10"
              style={{ fontFamily: "'Inter', sans-serif", color: '#f87171' }}
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
