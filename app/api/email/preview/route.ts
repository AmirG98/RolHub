import { NextRequest, NextResponse } from 'next/server'
import { renderEmail, extractHook } from '@/lib/email/templates'
import { sendEmail, isEmailConfigured } from '@/lib/email/send'
import { TEMPLATE_PRIORITY, type EmailTemplate } from '@/lib/email/segments'

export const dynamic = 'force-dynamic'

/**
 * Previsualización de los emails de seguimiento. Dos usos:
 *  - ?template=come_back            → devuelve el HTML para verlo en el browser
 *  - ?to=alguien@dominio.com        → manda las 3 plantillas a esa dirección
 *
 * Protegida por CRON_SECRET (igual que el cron): no es un endpoint público de
 * envío. Los datos son de ejemplo, no toca la DB ni registra en EmailLog.
 */
const SAMPLE = {
  characterName: 'Xelorian',
  worldName: 'Adventure in Isekai World',
  scene: 'Ashfen Marshes — edge of the void',
  narration:
    'You close your eyes for just a heartbeat and let Wild Sense bloom outward. The marsh breathes around you in rings. Something enormous waits to the northeast — not moving, waiting.',
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://rol-hub.com'
  const locale = req.nextUrl.searchParams.get('locale') === 'es' ? 'es' : 'en'
  const ctxFor = (template: EmailTemplate) => ({
    locale: locale as 'en' | 'es',
    characterName: SAMPLE.characterName,
    worldName: SAMPLE.worldName,
    scene: SAMPLE.scene,
    hook: extractHook(SAMPLE.narration),
    playUrl: `${base}/play/preview?utm_source=email&utm_campaign=${template}`,
    pricingUrl: `${base}/pricing?utm_source=email&utm_campaign=${template}`,
    unsubscribeUrl: `${base}/api/email/unsubscribe?u=preview&t=preview`,
  })

  // Ver una plantilla en el browser
  const wanted = req.nextUrl.searchParams.get('template') as EmailTemplate | null
  if (wanted && TEMPLATE_PRIORITY.includes(wanted)) {
    const { html } = renderEmail(wanted, ctxFor(wanted))
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  // Mandar las 3 a una dirección de prueba
  const to = req.nextUrl.searchParams.get('to')
  if (!to) {
    return NextResponse.json({
      configured: isEmailConfigured(),
      usage: {
        verHtml: '?template=welcome_back|come_back|paywall_followup[&locale=es]',
        enviarPrueba: '?to=tu@mail.com[&locale=es]',
      },
      templates: TEMPLATE_PRIORITY,
    })
  }

  const results: Array<{ template: EmailTemplate; subject: string; ok: boolean; id?: string; error?: string }> = []
  for (const template of TEMPLATE_PRIORITY) {
    const ctx = ctxFor(template)
    const rendered = renderEmail(template, ctx)
    const sent = await sendEmail(to, { ...rendered, subject: `[TEST] ${rendered.subject}` }, ctx.unsubscribeUrl)
    results.push({ template, subject: rendered.subject, ok: sent.ok, id: sent.id, error: sent.error ?? sent.skipped })
  }
  return NextResponse.json({ to, sent: results.filter((r) => r.ok).length, results })
}
