import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import Stripe from 'stripe'

// Desactivar body parsing — Stripe necesita el raw body para verificar firma
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id

        if (userId && subscriptionId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'PRO',
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id || undefined,
              planExpiresAt: null,
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            await prisma.user.update({
              where: { id: user.id },
              data: { plan: 'PRO', planExpiresAt: null },
            })
          } else if (subscription.status === 'past_due') {
            // Grace period — mantener PRO pero loggear
            console.warn(`[Stripe] User ${user.id} subscription past_due`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          // Dar acceso hasta el final del período pagado
          const subData = subscription as Stripe.Subscription & { current_period_end?: number }
          const periodEnd = subData.current_period_end
            ? new Date(subData.current_period_end * 1000)
            : new Date()

          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'FREE',
              planExpiresAt: periodEnd > new Date() ? periodEnd : null,
              stripeSubscriptionId: null,
            },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id

        if (customerId) {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          })
          if (user) {
            console.warn(`[Stripe] Payment failed for user ${user.id} (${user.email})`)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
