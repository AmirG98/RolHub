/**
 * Segmentación para los emails de seguimiento. Puro: recibe un snapshot del
 * usuario y devuelve qué plantilla le toca (o null). Una sola plantilla por
 * corrida; el cron manda la de mayor prioridad que no se haya mandado.
 *
 * Datos reales (2026-09-15, 43 registrados con mail): 13 no llegaron a jugar
 * (≤3 turnos), 15 abandonaron a mitad del trial, 10 llegaron al paywall y no
 * arrancaron el trial. Un email en cada punto de fuga.
 */

export type EmailTemplate = 'welcome_back' | 'come_back' | 'paywall_followup'

export const TEMPLATE_PRIORITY: readonly EmailTemplate[] = ['paywall_followup', 'come_back', 'welcome_back']

/** No molestar a nadie que se registró hace más de esto */
export const MAX_AGE_DAYS = 14
/** Ventana ampliada para una corrida puntual (?maxAgeDays=N en el cron) */
export const MAX_AGE_DAYS_HARD_LIMIT = 45
/** Espera mínima desde la última actividad antes de escribir */
export const MIN_IDLE_HOURS: Record<EmailTemplate, number> = {
  welcome_back: 3,
  come_back: 20,
  paywall_followup: 3,
}

export interface UserSnapshot {
  plan: string
  totalTurns: number
  createdAt: Date
  lastActiveAt: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  emailOptOut: boolean
  email: string
  /** plantillas ya enviadas */
  sent: readonly string[]
}

export function isRealEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !email.endsWith('@placeholder.local')
}

/** Qué plantilla le toca hoy a este usuario, o null si ninguna. */
export function pickTemplate(
  u: UserSnapshot,
  now: Date = new Date(),
  maxAgeDays: number = MAX_AGE_DAYS
): EmailTemplate | null {
  if (u.emailOptOut || !isRealEmail(u.email)) return null
  const ageDays = (now.getTime() - u.createdAt.getTime()) / 86400000
  if (ageDays > Math.min(maxAgeDays, MAX_AGE_DAYS_HARD_LIMIT)) return null
  // Con suscripción (trial o paga) o con checkout completado: no es un lead
  if (u.stripeSubscriptionId || u.stripeCustomerId || u.plan !== 'FREE') return null

  const idleHours = (now.getTime() - (u.lastActiveAt ?? u.createdAt).getTime()) / 3600000
  let candidate: EmailTemplate | null = null
  if (u.totalTurns >= 25) candidate = 'paywall_followup'
  else if (u.totalTurns >= 4) candidate = 'come_back'
  else candidate = 'welcome_back'

  if (u.sent.includes(candidate)) return null
  if (idleHours < MIN_IDLE_HOURS[candidate]) return null
  return candidate
}

/** Heurística de idioma a partir de la última narración del DM. */
export function detectLocale(sampleText: string | null | undefined): 'en' | 'es' {
  if (!sampleText) return 'en'
  const words = sampleText.split(/\s+/).length || 1
  const es = (sampleText.match(/\b(el|la|los|las|de|que|con|una|para|está|pero|hacia)\b/gi) || []).length
  return es / words > 0.05 ? 'es' : 'en'
}
