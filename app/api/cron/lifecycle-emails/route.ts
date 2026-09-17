import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { pickTemplate, detectLocale, MAX_AGE_DAYS, MAX_AGE_DAYS_HARD_LIMIT, type EmailTemplate } from '@/lib/email/segments'
import { renderEmail, extractHook } from '@/lib/email/templates'
import { sendEmail, isEmailConfigured } from '@/lib/email/send'
import { unsubscribeToken } from '@/lib/email/unsubscribe-token'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Cron diario de emails de seguimiento (ver vercel.json).
 *
 * Tres emails, uno por punto de fuga del embudo, cada uno UNA sola vez por
 * usuario (EmailLog @@unique(userId, template)):
 *  - welcome_back: se registró y no llegó a jugar (≤3 turnos)
 *  - come_back: abandonó a mitad del trial (4-24 turnos)
 *  - paywall_followup: agotó los 25 turnos y no arrancó el trial
 *
 * ?dry=1 → no manda ni registra: devuelve a quién le tocaría qué. Sin
 * RESEND_API_KEY también corre en seco. Protegido por CRON_SECRET.
 */
const MAX_PER_RUN = 60
const BASE_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'https://rol-hub.com'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const dry = req.nextUrl.searchParams.get('dry') === '1' || !isEmailConfigured()
  // Ventana de edad: por defecto 14 días; ?maxAgeDays=N la amplía para una
  // corrida puntual (tope duro de 45 para no escribirle a gente muy vieja).
  const requestedAge = Number(req.nextUrl.searchParams.get('maxAgeDays'))
  const maxAgeDays = Number.isFinite(requestedAge) && requestedAge > 0
    ? Math.min(requestedAge, MAX_AGE_DAYS_HARD_LIMIT)
    : MAX_AGE_DAYS

  const since = new Date(Date.now() - (maxAgeDays + 1) * 86400000)
  const users = await prisma.user.findMany({
    where: { createdAt: { gt: since }, NOT: { clerkId: { startsWith: 'guest' } } },
    select: {
      id: true, email: true, plan: true, totalTurns: true, createdAt: true, lastActiveAt: true,
      stripeCustomerId: true, stripeSubscriptionId: true, emailOptOut: true,
      emailLogs: { select: { template: true } },
      characters: { orderBy: { createdAt: 'desc' }, take: 1, select: { name: true } },
      campaigns: {
        orderBy: { createdAt: 'desc' }, take: 1,
        select: {
          name: true, lore: true, worldState: true,
          sessions: { orderBy: { startedAt: 'desc' }, take: 1, select: { id: true, turns: { where: { role: 'DM' }, orderBy: { createdAt: 'desc' }, take: 1, select: { content: true } } } },
        },
      },
    },
  })

  const plan: Array<{ userId: string; template: EmailTemplate; locale: 'en' | 'es'; to: string }> = []
  const results: Array<{ userId: string; template: EmailTemplate; ok: boolean; id?: string; error?: string }> = []

  for (const u of users) {
    if (plan.length >= MAX_PER_RUN) break
    const template = pickTemplate({ ...u, sent: u.emailLogs.map((l) => l.template) }, new Date(), maxAgeDays)
    if (!template) continue
    const campaign = u.campaigns[0]
    const session = campaign?.sessions[0]
    const lastNarration = session?.turns[0]?.content ?? null
    const locale = detectLocale(lastNarration)
    const token = unsubscribeToken(u.id)
    const base = BASE_URL()
    const ws = (campaign?.worldState ?? {}) as { current_scene?: string }
    const rendered = renderEmail(template, {
      locale,
      characterName: u.characters[0]?.name ?? null,
      worldName: campaign?.name ?? null,
      scene: ws.current_scene ?? null,
      hook: extractHook(lastNarration),
      playUrl: session ? `${base}/play/${session.id}?utm_source=email&utm_campaign=${template}` : `${base}/onboarding?utm_source=email&utm_campaign=${template}`,
      pricingUrl: `${base}/pricing?utm_source=email&utm_campaign=${template}`,
      unsubscribeUrl: token ? `${base}/api/email/unsubscribe?u=${u.id}&t=${token}` : `${base}/pricing`,
    })
    plan.push({ userId: u.id, template, locale, to: u.email })
    if (dry) continue

    const sent = await sendEmail(u.email, rendered, token ? `${base}/api/email/unsubscribe?u=${u.id}&t=${token}` : `${base}`)
    results.push({ userId: u.id, template, ok: sent.ok, id: sent.id, error: sent.error })
    if (sent.ok) {
      await prisma.emailLog.create({ data: { userId: u.id, template, providerId: sent.id ?? null } })
    } else {
      console.error(`[lifecycle-emails] fallo ${template} → ${u.id}: ${sent.error}`)
    }
  }

  console.log(`[lifecycle-emails] ${dry ? 'DRY RUN' : 'sent'}: ${plan.length} candidatos, ${results.filter((r) => r.ok).length} enviados, ${results.filter((r) => !r.ok).length} fallidos`)
  return NextResponse.json({
    dry,
    maxAgeDays,
    configured: isEmailConfigured(),
    candidates: plan.length,
    byTemplate: plan.reduce<Record<string, number>>((a, p) => ((a[p.template] = (a[p.template] || 0) + 1), a), {}),
    plan: dry ? plan.map((p) => ({ ...p, to: p.to.replace(/^(.{2}).*(@.*)$/, '$1***$2') })) : undefined,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).map((r) => ({ userId: r.userId, template: r.template, error: r.error })),
  })
}
