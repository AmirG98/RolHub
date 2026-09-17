/**
 * Plantillas de los emails de seguimiento. Puras: devuelven subject + html +
 * text. Tono: el Narrador le escribe al jugador; corto; un solo CTA.
 */
import type { EmailTemplate } from './segments'

export interface EmailContext {
  locale: 'en' | 'es'
  characterName: string | null
  worldName: string | null
  /** escena actual (worldState.current_scene) */
  scene: string | null
  /** última frase de la última narración del DM, como gancho */
  hook: string | null
  /** link para volver a la partida (o al onboarding si no hay) */
  playUrl: string
  pricingUrl: string
  unsubscribeUrl: string
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function layout(title: string, paragraphs: string[], cta: { label: string; url: string }, footer: string, unsubscribeUrl: string, unsubscribeLabel: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0d0a05;font-family:Georgia,'Times New Roman',serif;color:#f4e8c1">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0d0a05"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#1a1208;border:1px solid #8b6914;border-radius:8px">
<tr><td style="padding:28px 28px 8px;font-size:12px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase">RolHub</td></tr>
<tr><td style="padding:0 28px 8px;font-size:22px;line-height:1.3;color:#f5c842">${esc(title)}</td></tr>
${paragraphs.map((p) => `<tr><td style="padding:6px 28px;font-size:16px;line-height:1.55;color:#f4e8c1">${p}</td></tr>`).join('')}
<tr><td style="padding:20px 28px 8px"><a href="${cta.url}" style="display:inline-block;background:#c9a84c;color:#0d0a05;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:6px;font-size:15px">${esc(cta.label)}</a></td></tr>
<tr><td style="padding:12px 28px 28px;font-size:13px;line-height:1.5;color:#d4b896">${footer}</td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;font-size:11px;color:#8b6914;text-align:center"><a href="${unsubscribeUrl}" style="color:#8b6914">${esc(unsubscribeLabel)}</a></p>
</td></tr></table></body></html>`
}

function hookLine(ctx: EmailContext): string {
  return ctx.hook ? `<em style="color:#d4b896">“${esc(ctx.hook)}”</em>` : ''
}

export function renderEmail(template: EmailTemplate, ctx: EmailContext): RenderedEmail {
  const en = ctx.locale === 'en'
  const name = ctx.characterName ? esc(ctx.characterName) : en ? 'your character' : 'tu personaje'
  const world = ctx.worldName ? esc(ctx.worldName) : en ? 'the world you chose' : 'el mundo que elegiste'
  const scene = ctx.scene ? esc(ctx.scene) : null
  const unsub = en ? 'Stop receiving these emails' : 'No recibir más estos emails'

  if (template === 'welcome_back') {
    const subject = en ? `${ctx.characterName ?? 'Your hero'} is still waiting at the start` : `${ctx.characterName ?? 'Tu héroe'} sigue esperando en el inicio`
    const paragraphs = en
      ? [`You created <strong>${name}</strong> in <strong>${world}</strong> and the story never got past its first scene.`, `No setup, no rules to learn: type what you want to do and the Narrator answers in a few seconds. Your first 25 turns are free.`, hookLine(ctx)]
      : [`Creaste a <strong>${name}</strong> en <strong>${world}</strong> y la historia no pasó de la primera escena.`, `Sin preparación ni reglas que aprender: escribí qué querés hacer y el Narrador responde en segundos. Tus primeros 25 turnos son gratis.`, hookLine(ctx)]
    const html = layout(en ? 'Your adventure is one sentence away' : 'Tu aventura está a una frase de distancia', paragraphs.filter(Boolean), { label: en ? 'Take your first turn' : 'Jugar el primer turno', url: ctx.playUrl }, en ? 'Reply to this email if something did not work. A human reads it.' : 'Respondé este mail si algo no funcionó. Lo lee una persona.', ctx.unsubscribeUrl, unsub)
    const text = en
      ? `You created ${ctx.characterName ?? 'your character'} in ${ctx.worldName ?? 'RolHub'} and the story never got past its first scene. Your first 25 turns are free.\n\nTake your first turn: ${ctx.playUrl}\n\nStop receiving these emails: ${ctx.unsubscribeUrl}`
      : `Creaste a ${ctx.characterName ?? 'tu personaje'} en ${ctx.worldName ?? 'RolHub'} y la historia no pasó de la primera escena. Tus primeros 25 turnos son gratis.\n\nJugar el primer turno: ${ctx.playUrl}\n\nNo recibir más estos emails: ${ctx.unsubscribeUrl}`
    return { subject, html, text }
  }

  if (template === 'come_back') {
    const subject = en ? `${ctx.characterName ?? 'Your character'} is still standing in ${ctx.scene ?? 'the same place'}` : `${ctx.characterName ?? 'Tu personaje'} sigue parado en ${ctx.scene ?? 'el mismo lugar'}`
    const paragraphs = en
      ? [`Last time we saw <strong>${name}</strong>${scene ? ` in <strong>${scene}</strong>` : ''}, this was happening:`, hookLine(ctx), `The Narrator kept everything exactly where you left it. Your free turns are still there.`]
      : [`La última vez que vimos a <strong>${name}</strong>${scene ? ` en <strong>${scene}</strong>` : ''}, pasaba esto:`, hookLine(ctx), `El Narrador dejó todo exactamente donde lo dejaste. Tus turnos gratis siguen ahí.`]
    const html = layout(en ? 'The story paused. It did not end.' : 'La historia se pausó. No terminó.', paragraphs.filter(Boolean), { label: en ? 'Continue the story' : 'Seguir la historia', url: ctx.playUrl }, en ? 'Reply to this email if something did not work. A human reads it.' : 'Respondé este mail si algo no funcionó. Lo lee una persona.', ctx.unsubscribeUrl, unsub)
    const text = en
      ? `Last time we saw ${ctx.characterName ?? 'your character'}${ctx.scene ? ` in ${ctx.scene}` : ''}: ${ctx.hook ?? ''}\n\nThe Narrator kept everything where you left it. Continue: ${ctx.playUrl}\n\nStop receiving these emails: ${ctx.unsubscribeUrl}`
      : `La última vez que vimos a ${ctx.characterName ?? 'tu personaje'}${ctx.scene ? ` en ${ctx.scene}` : ''}: ${ctx.hook ?? ''}\n\nEl Narrador dejó todo donde lo dejaste. Seguir: ${ctx.playUrl}\n\nNo recibir más estos emails: ${ctx.unsubscribeUrl}`
    return { subject, html, text }
  }

  // paywall_followup
  const subject = en ? `Your free chapter ended. Here is what comes next for ${ctx.characterName ?? 'your character'}` : `Tu capítulo gratis terminó. Esto es lo que sigue para ${ctx.characterName ?? 'tu personaje'}`
  const paragraphs = en
    ? [`You played the whole free chapter with <strong>${name}</strong> in <strong>${world}</strong>. That is 25 turns most people never finish.`, hookLine(ctx), `The next chapter is ready. Adventurer is <strong>$8.99 a month</strong>, unlimited turns and worlds, and you can cancel in two clicks from your account.`]
    : [`Jugaste el capítulo gratis completo con <strong>${name}</strong> en <strong>${world}</strong>. Son 25 turnos que la mayoría no termina.`, hookLine(ctx), `El próximo capítulo está listo. Aventurero cuesta <strong>US$8.99 por mes</strong>, turnos y mundos ilimitados, y se cancela en dos clics desde tu cuenta.`]
  const html = layout(en ? 'The Narrator saved your place' : 'El Narrador te guardó el lugar', paragraphs.filter(Boolean), { label: en ? 'Continue the story' : 'Continuar la historia', url: ctx.pricingUrl }, en ? 'Not sure? Reply and tell us what held you back. A human reads it.' : '¿No te convence? Respondé y contanos qué te frenó. Lo lee una persona.', ctx.unsubscribeUrl, unsub)
  const text = en
    ? `You played the whole free chapter with ${ctx.characterName ?? 'your character'} in ${ctx.worldName ?? 'RolHub'}. The next chapter is ready: Adventurer is $8.99/month, unlimited, cancel anytime.\n\nContinue: ${ctx.pricingUrl}\n\nStop receiving these emails: ${ctx.unsubscribeUrl}`
    : `Jugaste el capítulo gratis completo con ${ctx.characterName ?? 'tu personaje'} en ${ctx.worldName ?? 'RolHub'}. El próximo capítulo está listo: Aventurero US$8.99/mes, ilimitado, cancelás cuando quieras.\n\nContinuar: ${ctx.pricingUrl}\n\nNo recibir más estos emails: ${ctx.unsubscribeUrl}`
  return { subject, html, text }
}

/** Última oración "útil" de una narración, como gancho (sin JSON ni markdown pesado). */
export function extractHook(narration: string | null | undefined, max = 160): string | null {
  if (!narration) return null
  const clean = narration.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim()
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean]
  const last = sentences.map((s) => s.trim()).filter((s) => s.length > 20).at(-1)
  if (!last) return null
  return last.length > max ? last.slice(0, max - 1).trimEnd() + '…' : last
}
