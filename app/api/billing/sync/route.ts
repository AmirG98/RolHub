import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import {
  getPolar,
  isPolarConfigured,
  pickActiveSubscription,
  planFieldsFromActiveSubscription,
  type PolarSubscriptionLike,
} from '@/lib/polar'

export const dynamic = 'force-dynamic'

// Sincroniza el plan del usuario consultando a Polar directamente (pull).
//
// Por qué existe: la activación normal llega por webhook (push), pero Polar
// redirige al usuario a /checkout/success ANTES de que el webhook aterrice.
// Sin esto, el pagador podía volver a jugar y toparse con el paywall recién
// pagado. También cubre el caso de webhook perdido: si el usuario pagó, acá
// lo activamos igual. Idempotente: si ya está PRO no toca nada.
export async function POST() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, plan: true, planExpiresAt: true, stripeSubscriptionId: true, stripeCustomerId: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const isPaidPlan = user.plan === 'PRO' || user.plan === 'GUILD'
    const notExpired = !user.planExpiresAt || new Date(user.planExpiresAt) > new Date()
    if (isPaidPlan && notExpired) {
      return NextResponse.json({
        plan: user.plan, active: true, source: 'db', subscriptionId: user.stripeSubscriptionId,
      })
    }

    if (!isPolarConfigured()) {
      return NextResponse.json({ plan: user.plan, active: false, source: 'none' })
    }

    let subs: PolarSubscriptionLike[] = []
    let polarCustomerId: string | null = null
    try {
      const state = await getPolar().customers.getStateExternal({ externalId: user.id })
      polarCustomerId = state.id
      subs = ('activeSubscriptions' in state ? state.activeSubscriptions : []) as PolarSubscriptionLike[]
    } catch (err) {
      // 404 = el usuario nunca llegó a ser customer en Polar (no pagó). No es error.
      if ((err as { statusCode?: number })?.statusCode === 404) {
        return NextResponse.json({ plan: user.plan, active: false, source: 'none' })
      }
      console.error('[billing/sync] Polar error:', err)
      return NextResponse.json({ error: 'sync failed' }, { status: 502 })
    }

    const sub = pickActiveSubscription(subs)
    if (!sub) {
      return NextResponse.json({ plan: user.plan, active: false, source: 'none' })
    }

    const fields = planFieldsFromActiveSubscription(sub)
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { ...fields, stripeCustomerId: polarCustomerId ?? user.stripeCustomerId },
      })
    } catch (err) {
      // stripeCustomerId es @unique: si por algún motivo ya está tomado no
      // debe impedir activar al pagador. Guardamos el plan sin el customer id.
      console.warn('[billing/sync] update con customerId falló, reintentando sin él:', err)
      await prisma.user.update({ where: { id: user.id }, data: fields })
    }

    return NextResponse.json({ plan: 'PRO', active: true, source: 'polar', subscriptionId: sub.id })
  } catch (error) {
    console.error('[billing/sync] error:', error)
    return NextResponse.json({ error: 'sync failed' }, { status: 500 })
  }
}
