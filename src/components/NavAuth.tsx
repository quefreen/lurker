'use client'

import { Show } from '@clerk/nextjs'
import { SignInCTA } from '@/components/SignInCTA'
import { UserMenu } from '@/components/UserMenu'

export function NavAuth() {
  return (
    <>
      <Show when="signed-out">
        <SignInCTA
          style={{
            fontFamily: 'var(--font-sora), sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#000',
            background: 'radial-gradient(426.59% 426.59% at 50% 91.18%, #FFF 0%, #000 100%), #F3FAF6',
            border: '2px solid #FFF',
            padding: '10px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        />
      </Show>
      <Show when="signed-in">
        <UserMenu />
      </Show>
    </>
  )
}
