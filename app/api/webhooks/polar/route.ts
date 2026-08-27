import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

// Reconcilia el evento de Polar con nuestro User: primero por externalId
// (seteado como externalCustomerId en el checkout = user.id), luego por
// metadata.user_id, luego por el customerId de Polar guardado.
async function resolveUser(data: any) {
  const externalId: string | undefined = data?.customer?.externalId || data?.metadata?.user_id
  if (externalId) {
    const u = await prisma.user.findUnique({ where: { id: externalId } })
    if (u) return u
  }
  const polarCustomerId: string | undefined = data?.customerId
  if (polarCustomerId) {
    return prisma.user.findFirst({ where: { stripeCustomerId: polarCustomerId } })
  }
  return null
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const secret = process.env.POLAR_WEBHOOK_SECRET

  if (!secret) {
    console.error('[Polar] POLAR_WEBHOOK_SECRET no configurado')
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  // validateEvent verifica la firma (headers webhook-*) y parsea el payload.
  let event: any
  try {
    const headers: Record<string, string> = {}
    req.headers.forEach((v, k) => { headers[k] = v })
    event = validateEvent(rawBody, headers, secret)
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.error('[Polar] Firma de webhook inválida')
      return NextResponse.json({ error: 'invalid signature' }, { status: 403 })
    }
    console.error('[Polar] Error parseando webhook:', err)
    return NextResponse.json({ error: 'bad payload' }, { status: 400 })
  }

  try {
    const type: string = event.type
    const data: any = event.data

    // Activo / creado / actualizado → PRO mientras la suscripción esté activa
    if (
      type === 'subscription.active' ||
      type === 'subscription.created' ||
      type === 'subscription.updated' ||
      type === 'subscription.uncanceled' ||
      type === 'order.paid'
    ) {
      const user = await resolveUser(data)
      if (!user) {
        console.warn(`[Polar] ${type}: usuario no encontrado`)
        return NextResponse.json({ received: true, note: 'user not found' })
      }

      const status: string = data?.status
      const update: Record<string, unknown> = {
        stripeCustomerId: data?.customerId ?? user.stripeCustomerId,
        stripeSubscriptionId: data?.id ?? user.stripeSubscriptionId,
      }

      // order.paid no trae status de subscription → asumimos activo
      if (type === 'order.paid' || status === 'active' || status === 'trialing') {
        update.plan = 'PRO'
        update.planExpiresAt = null
      } else if (status === 'past_due') {
        console.warn(`[Polar] Suscripción ${data?.id} past_due para user ${user.id}`)
      } else if (status === 'canceled' || status === 'revoked' || status === 'unpaid') {
        update.plan = 'FREE'
        update.planExpiresAt = null
        update.stripeSubscriptionId = null
      }

      await prisma.user.update({ where: { id: user.id }, data: update })
    }

    // Cancelada: mantiene acceso hasta endsAt (fin del período pagado)
    else if (type === 'subscription.canceled') {
      const user = await resolveUser(data)
      if (user) {
        const endsAt = data?.endsAt ? new Date(data.endsAt) : new Date()
        const stillActive = endsAt > new Date()
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: stillActive ? 'PRO' : 'FREE',
            planExpiresAt: stillActive ? endsAt : null,
            stripeSubscriptionId: stillActive ? data?.id : null,
          },
        })
      }
    }

    // Revocada (acceso cortado ya) → FREE
    else if (type === 'subscription.revoked') {
      const user = await resolveUser(data)
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: 'FREE', planExpiresAt: null, stripeSubscriptionId: null },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Polar] webhook handler error:', error)
    return NextResponse.json({ error: 'handler failed' }, { status: 500 })
  }
}
