'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import type React from 'react'

interface PricingButtonProps {
  priceId: string
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}

export function PricingButton({ priceId, style, className, children }: PricingButtonProps) {
  const { isSignedIn } = useUser()
  const router = useRouter()

  const handleClick = () => {
    if (isSignedIn) {
      router.push(`/checkout?plan=${priceId}`)
    } else {
      router.push(`/sign-in?redirect_url=/checkout?plan=${priceId}`)
    }
  }

  return (
    <button onClick={handleClick} style={style} className={className}>
      {children}
    </button>
  )
}
