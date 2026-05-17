import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { upsertUser, updateUserPlan } from '@/lib/userQueries'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const clerkUserId = session.metadata?.clerk_user_id
    const customerEmail = session.customer_email ?? session.customer_details?.email ?? ''
    const stripeCustomerId = session.customer as string | undefined

    if (clerkUserId) {
      await upsertUser(clerkUserId, customerEmail)
      await updateUserPlan(clerkUserId, 'pro', stripeCustomerId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    // Find user by stripe_customer_id and downgrade
    try {
      const { db } = await import('@/lib/db')
      await db.execute({
        sql: `UPDATE users SET plan = 'free', updated_at = datetime('now')
              WHERE stripe_customer_id = ?`,
        args: [customerId],
      })
    } catch {
      // Non-fatal — log and continue
      console.error('Failed to downgrade user on subscription.deleted', customerId)
    }
  }

  return NextResponse.json({ received: true })
}
