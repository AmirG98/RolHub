import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getSubscription } from '@lemonsqueezy/lemonsqueezy.js'
import { ensureLemonSqueezy } from '@/lib/lemonsqueezy'

// Lemon Squeezy provee URLs de gestión (update_payment_method, customer_portal)
// dentro de cada suscripción. Las devolvemos para que el usuario gestione o
// cancele su plan.
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No tienes una suscripción activa' }, { status: 400 })
    }

    ensureLemonSqueezy()
    const sub = await getSubscription(user.stripeSubscriptionId)

    if (sub.error) {
      console.error('[portal] LS error:', sub.error)
      return NextResponse.json({ error: 'Error al obtener la suscripción' }, { status: 502 })
    }

    const attrs = sub.data?.data.attributes
    return NextResponse.json({
      subscriptionId: user.stripeSubscriptionId,
      status: attrs?.status,
      // URLs firmadas de LS para gestionar/cancelar (válidas 24h)
      customerPortalUrl: attrs?.urls?.customer_portal ?? null,
      updatePaymentUrl: attrs?.urls?.update_payment_method ?? null,
      renewsAt: attrs?.renews_at ?? null,
      endsAt: attrs?.ends_at ?? null,
    })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Error al obtener info de suscripción' }, { status: 500 })
  }
}
