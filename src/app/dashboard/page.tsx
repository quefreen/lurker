import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserByClerkId } from '@/lib/userQueries'
import { SiteNavSmart } from '@/components/SiteNavSmart'

const GEIST = "'Geist', sans-serif"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/dashboard')

  const { payment } = await searchParams
  const user = await getUserByClerkId(userId)

  const isPro = user?.plan === 'pro'

  return (
    <main style={{ background: '#0F100A', minHeight: '100vh' }}>
      <SiteNavSmart />
      <div
        style={{
          maxWidth: '996px',
          margin: '0 auto',
          padding: '64px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {payment === 'success' && isPro && (
          <div style={{
            padding: '16px 24px',
            border: '1px solid #32E601',
            borderRadius: '4px',
            background: 'radial-gradient(518.75% 518.75% at 50% 0%, rgba(50,230,1,0.12) 0%, transparent 62.02%)',
          }}>
            <p style={{ fontFamily: GEIST, fontSize: '14px', color: '#32E601', margin: 0 }}>
              Payment confirmed. Welcome to Pro.
            </p>
          </div>
        )}

        <div>
          <p style={{ fontFamily: GEIST, fontWeight: 500, fontSize: '24px', color: '#6b7280', margin: '0 0 4px' }}>
            Dashboard
          </p>
          <p style={{ fontFamily: GEIST, fontWeight: 600, fontSize: '48px', color: '#ffffff', margin: 0, lineHeight: 1.1 }}>
            {isPro ? 'Pro access active.' : 'Free plan.'}
          </p>
        </div>

        {!isPro && (
          <a href="/#pricing" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            fontFamily: GEIST,
            fontWeight: 500,
            fontSize: '16px',
            color: '#0f0f0f',
            textDecoration: 'none',
            borderRadius: '4px',
            border: '2px solid #D9FF00',
            background: 'radial-gradient(518.75% 518.75% at 50% 0%, #D9FF00 0%, #17190F 62.02%)',
            width: 'fit-content',
          }}>
            Upgrade to Pro
          </a>
        )}
      </div>
    </main>
  )
}
