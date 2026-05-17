import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getProfitCardData } from '@/lib/queries'
import { getUserByClerkId } from '@/lib/userQueries'
import { db } from '@/lib/db'

function computePeriod(firstResolved: string | null): string {
  if (!firstResolved) return 'All time'
  const weeks = Math.round((Date.now() - new Date(firstResolved).getTime()) / (1000 * 60 * 60 * 24 * 7))
  if (weeks <= 1) return '1 week'
  if (weeks < 52) return `${weeks} weeks`
  const years = Math.round(weeks / 52)
  return `${years} year${years > 1 ? 's' : ''}`
}

export async function GET() {
  try {
    const { userId } = await auth()

    const [profit, matchesResult, firstResult, user] = await Promise.all([
      getProfitCardData(),
      db.execute(`
        SELECT slug, team_a, team_b, tournament
        FROM matches WHERE status = 'balance'
        ORDER BY id DESC LIMIT 20
      `),
      db.execute(`
        SELECT MIN(COALESCE(resolved_at, created_at)) AS first_resolved
        FROM entries WHERE status IN ('green', 'red')
      `),
      userId ? getUserByClerkId(userId) : Promise.resolve(null),
    ])

    const settled = (matchesResult.rows as any[]).map(r => ({
      slug: r.slug,
      teamA: r.team_a,
      teamB: r.team_b,
      tournament: r.tournament,
    }))

    const winRate = profit.totalResolved > 0
      ? Math.round((profit.greens / profit.totalResolved) * 100)
      : 0

    const firstResolved = (firstResult.rows[0] as any)?.first_resolved ?? null
    const period = computePeriod(firstResolved)

    return NextResponse.json({
      profit: { ...profit, winRate, period },
      settled,
      plan: user?.plan ?? 'free',
      monthlyPriceId: process.env.STRIPE_PRICE_ID_MONTHLY ?? '',
    })
  } catch {
    return NextResponse.json({
      profit: { balance: 0, greens: 0, totalResolved: 0, lastUpdated: null, winRate: 0, period: 'All time' },
      settled: [],
      plan: 'free',
      monthlyPriceId: '',
    })
  }
}
