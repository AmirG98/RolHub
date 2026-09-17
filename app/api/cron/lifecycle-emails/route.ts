import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { pickTemplate, detectLocale, MAX_AGE_DAYS, MAX_AGE_DAYS_HARD_LIMIT, TEMPLATE_PRIORITY, type EmailTemplate } from '@/lib/email/segments'
import { renderEmail, extractHook } from '@/lib/email/templates'
import { sendEmail, isEmailConfigured } from '@/lib/email/send'
import { unsubscribeToken } from '@/lib/email/unsubscribe-token'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

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
/**
 * Tope por corrida. Con un dominio SIN reputación de envío, mandar decenas
 * de mails de golpe es la peor señal posible para Gmail (los 3 de prueba
 * cayeron en spam el 17/9 con DKIM+SPF+DMARC correctos: el dominio nunca
 * había enviado). Se calienta de a poco: EMAIL_DAILY_CAP en Vercel, o
 * ?cap=N para una corrida puntual. Plan sugerido: 5/día la primera semana,
 * 10/día la segunda, y recién después sin tope.
 */
const DEFAULT_DAILY_CAP = 5
const MAX_PER_RUN = 60

/**
 * Pausa entre envíos. Mandar N mails en el mismo segundo es una ráfaga que
 * los filtros leen como automatizada; el correo legítimo sale espaciado.
 * EMAIL_SEND_DELAY_MS en Vercel, o ?delayMs=N por corrida.
 */
const DEFAULT_SEND_DELAY_MS = 20_000
/** Margen para que la función no se corte a la mitad de una tanda */
const RUN_BUDGET_MS = (maxDuration - 45) * 1000

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
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

  // Tope de envíos de esta corrida (calentamiento del dominio)
  const requestedCap = Number(req.nextUrl.searchParams.get('cap'))
  const envCap = Number(process.env.EMAIL_DAILY_CAP)
  const dailyCap = Math.min(
    Number.isFinite(requestedCap) && requestedCap > 0 ? requestedCap
      : Number.isFinite(envCap) && envCap > 0 ? envCap
      : DEFAULT_DAILY_CAP,
    MAX_PER_RUN
  )

  // Pausa entre envíos y tope efectivo según el tiempo disponible
  const requestedDelay = Number(req.nextUrl.searchParams.get('delayMs'))
  const envDelay = Number(process.env.EMAIL_SEND_DELAY_MS)
  const delayMs = Math.max(
    0,
    Number.isFinite(requestedDelay) && requestedDelay >= 0 ? requestedDelay
      : Number.isFinite(envDelay) && envDelay >= 0 ? envDelay
      : DEFAULT_SEND_DELAY_MS
  )
  // Con pausas, el límite real lo pone el timeout de la función, no el cap
  const capByTime = delayMs > 0 ? Math.max(1, Math.floor(RUN_BUDGET_MS / delayMs)) : MAX_PER_RUN
  const effectiveCap = Math.min(dailyCap, capByTime)

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

  // Resolver la plantilla de cada candidato y ORDENAR por prioridad antes de
  // aplicar el tope diario: con cap=5 tienen que salir primero los del
  // paywall (el segmento más valioso), no los primeros 5 por fecha.
  const candidates = users
    .map((u) => ({ u, template: pickTemplate({ ...u, sent: u.emailLogs.map((l) => l.template) }, new Date(), maxAgeDays) }))
    .filter((c): c is { u: typeof users[number]; template: EmailTemplate } => c.template !== null)
    .sort((a, b) => TEMPLATE_PRIORITY.indexOf(a.template) - TEMPLATE_PRIORITY.indexOf(b.template))

  for (const { u, template } of candidates) {
    if (plan.length >= effectiveCap) break
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

    // Espaciar: pausa ANTES de cada envío salvo el primero
    if (results.length > 0 && delayMs > 0) await sleep(delayMs)

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
    dailyCap,
    effectiveCap,
    delayMs,
    configured: isEmailConfigured(),
    candidates: plan.length,
    byTemplate: plan.reduce<Record<string, number>>((a, p) => ((a[p.template] = (a[p.template] || 0) + 1), a), {}),
    plan: dry ? plan.map((p) => ({ ...p, to: p.to.replace(/^(.{2}).*(@.*)$/, '$1***$2') })) : undefined,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).map((r) => ({ userId: r.userId, template: r.template, error: r.error })),
  })
}
