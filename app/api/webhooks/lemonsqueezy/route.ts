import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

// Verificación de firma HMAC-SHA256 (Lemon Squeezy firma el body crudo con el
// webhook secret y lo manda en el header X-Signature). Leemos el secret en
// runtime (no en import) para no capturar un valor stale.
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!signature || !secret) return false
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

// Shape mínimo del payload que consumimos (LS manda mucho más).
interface LSPayload {
  meta: {
    event_name: string
    custom_data?: { user_id?: string; clerk_id?: string }
  }
  data: {
    id: string
    attributes: {
      status: string // 'active' | 'past_due' | 'paused' | 'cancelled' | 'expired' | ...
      customer_id?: number
      ends_at?: string | null
      renews_at?: string | null
    }
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature')

  if (!verifySignature(rawBody, signature)) {
    console.error('[LS] Firma de webhook inválida')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: LSPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = payload.meta?.event_name
  const userId = payload.meta?.custom_data?.user_id
  const attrs = payload.data?.attributes
  const subId = payload.data?.id
  const customerId = attrs?.customer_id ? String(attrs.customer_id) : undefined

  try {
    // Resolver el usuario: por custom_data (checkout) o por customer id (fallback)
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : customerId
        ? await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
        : null

    if (!user) {
      // Aún respondemos 200 para que LS no reintente indefinidamente
      console.warn(`[LS] ${eventName}: usuario no encontrado (userId=${userId}, customer=${customerId})`)
      return NextResponse.json({ received: true, note: 'user not found' })
    }

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed':
      case 'subscription_unpaused': {
        const status = attrs.status
        const data: Record<string, unknown> = {
          stripeCustomerId: customerId ?? user.stripeCustomerId,
          stripeSubscriptionId: subId,
        }
        if (status === 'active' || status === 'on_trial') {
          data.plan = 'PRO'
          data.planExpiresAt = null
        } else if (status === 'past_due') {
          console.warn(`[LS] Suscripción ${subId} past_due para user ${user.id}`)
        } else if (status === 'paused') {
          data.plan = 'FREE'
        } else if (status === 'expired') {
          data.plan = 'FREE'
          data.planExpiresAt = null
          data.stripeSubscriptionId = null
        }
        await prisma.user.update({ where: { id: user.id }, data })
        break
      }

      case 'subscription_cancelled': {
        // Cancelada pero con acceso hasta ends_at (fin del período pagado)
        const endsAt = attrs.ends_at ? new Date(attrs.ends_at) : new Date()
        const stillActive = endsAt > new Date()
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: stillActive ? 'PRO' : 'FREE',
            planExpiresAt: stillActive ? endsAt : null,
            stripeSubscriptionId: stillActive ? subId : null,
          },
        })
        break
      }

      case 'subscription_expired': {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: 'FREE', planExpiresAt: null, stripeSubscriptionId: null },
        })
        break
      }

      case 'order_created': {
        // Pago puntual exitoso — asegurar PRO activo
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: 'PRO', planExpiresAt: null, stripeCustomerId: customerId ?? user.stripeCustomerId },
        })
        break
      }

      default:
        // Otros eventos (payment_success, etc.) — no requieren acción
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[LS] webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
