import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth, currentUser } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const VALID_PRICE_IDS = [
  process.env.STRIPE_PRICE_ID_MONTHLY,
  process.env.STRIPE_PRICE_ID_ANNUAL,
]

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId } = await req.json()

  if (!priceId || !VALID_PRICE_IDS.includes(priceId)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const user = await currentUser()

  const session = await stripe.checkout.sessions.create({
    customer_email: user?.emailAddresses[0]?.emailAddress,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    metadata: { clerk_user_id: userId },
    success_url: `${BASE_URL}/dashboard?payment=success`,
    cancel_url: `${BASE_URL}/?payment=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
