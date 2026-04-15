import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getPaddle, PADDLE_WEBHOOK_SECRET } from '@/lib/paddle'
import {
  EventName,
  type SubscriptionCreatedEvent,
  type SubscriptionUpdatedEvent,
  type SubscriptionCanceledEvent,
  type TransactionCompletedEvent,
} from '@paddle/paddle-node-sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('paddle-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: ReturnType<InstanceType<typeof import('@paddle/paddle-node-sdk').Paddle>['webhooks']['unmarshal']> extends Promise<infer T> ? T : never

  try {
    const paddle = getPaddle()
    event = await paddle.webhooks.unmarshal(body, PADDLE_WEBHOOK_SECRET, signature)
  } catch (err) {
    console.error('Paddle webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (!event) {
    return NextResponse.json({ error: 'Could not parse event' }, { status: 400 })
  }

  try {
    const eventType = event.eventType

    if (eventType === EventName.SubscriptionCreated || eventType === EventName.SubscriptionUpdated) {
      const data = event.data as SubscriptionCreatedEvent['data'] | SubscriptionUpdatedEvent['data']
      const userId = data.customData?.userId as string | undefined
      const paddleCustomerId = data.customerId

      if (!userId) {
        console.warn('[Paddle] No userId in custom_data, trying customer lookup')
        // Buscar por paddle customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: paddleCustomerId },
        })
        if (user && (data.status === 'active' || data.status === 'trialing')) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'PRO',
              stripeSubscriptionId: data.id,
              planExpiresAt: null,
            },
          })
        }
      } else {
        const updateData: Record<string, unknown> = {
          stripeCustomerId: paddleCustomerId,
          stripeSubscriptionId: data.id,
        }

        if (data.status === 'active' || data.status === 'trialing') {
          updateData.plan = 'PRO'
          updateData.planExpiresAt = null
        } else if (data.status === 'past_due') {
          console.warn(`[Paddle] Subscription ${data.id} is past_due for user ${userId}`)
        } else if (data.status === 'paused') {
          updateData.plan = 'FREE'
        }

        await prisma.user.update({
          where: { id: userId },
          data: updateData,
        })
      }
    }

    if (eventType === EventName.SubscriptionCanceled) {
      const data = event.data as SubscriptionCanceledEvent['data']
      const userId = data.customData?.userId as string | undefined
      const paddleCustomerId = data.customerId

      const user = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : await prisma.user.findFirst({ where: { stripeCustomerId: paddleCustomerId } })

      if (user) {
        // Paddle da acceso hasta el final del periodo pagado via scheduledChange
        const currentEnd = data.currentBillingPeriod?.endsAt
        const expiresAt = currentEnd ? new Date(currentEnd) : new Date()

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: expiresAt > new Date() ? 'PRO' : 'FREE', // Mantener PRO hasta que expire
            planExpiresAt: expiresAt > new Date() ? expiresAt : null,
            stripeSubscriptionId: null,
          },
        })
      }
    }

    if (eventType === EventName.TransactionCompleted) {
      const data = event.data as TransactionCompletedEvent['data']
      const userId = data.customData?.userId as string | undefined
      if (userId) {
        // Pago exitoso — asegurar que el plan está activo
        await prisma.user.update({
          where: { id: userId },
          data: { plan: 'PRO', planExpiresAt: null },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paddle webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
