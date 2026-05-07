'use client'

import { SignInButton } from '@clerk/nextjs'

interface SignInCTAProps {
  style?: React.CSSProperties
  className?: string
}

export function SignInCTA({ style, className }: SignInCTAProps) {
  return (
    <SignInButton mode="modal">
      <button style={style} className={className}>
        GET THE EDGE
      </button>
    </SignInButton>
  )
}
