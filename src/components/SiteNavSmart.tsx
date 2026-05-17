'use client'

import { useUser } from '@clerk/nextjs'
import { SiteNav } from '@/components/SiteNav'
import { SiteNavLogged } from '@/components/SiteNavLogged'

interface SiteNavSmartProps {
  background?: string
  position?: 'static' | 'absolute'
  zIndex?: number
}

export function SiteNavSmart({ background, position, zIndex }: SiteNavSmartProps) {
  const { isSignedIn, isLoaded } = useUser()

  // Before Clerk loads: render logged-out nav (matches SSR output, avoids hydration mismatch)
  if (!isLoaded || !isSignedIn) {
    return <SiteNav background={background} position={position} zIndex={zIndex} />
  }

  return <SiteNavLogged background={background} position={position} zIndex={zIndex} />
}
