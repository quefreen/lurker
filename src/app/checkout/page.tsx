import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const VALID_PRICE_IDS = [
  process.env.STRIPE_PRICE_ID_MONTHLY,
  process.env.STRIPE_PRICE_ID_ANNUAL,
]

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/checkout')

  const { plan } = await searchParams
  const priceId = plan || process.env.STRIPE_PRICE_ID_MONTHLY

  if (!priceId || !VALID_PRICE_IDS.includes(priceId)) {
    redirect('/')
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

  redirect(session.url!)
}
