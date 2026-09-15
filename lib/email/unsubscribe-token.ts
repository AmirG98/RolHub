/**
 * Token de baja: HMAC del user.id con EMAIL_UNSUBSCRIBE_SECRET (fallback
 * CRON_SECRET). El link del mail no necesita sesión: cualquiera con el
 * token puede dar de baja a ESE usuario, y nada más.
 */
import { createHmac, timingSafeEqual } from 'crypto'

function secret(): string | null {
  return process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || null
}

export function unsubscribeToken(userId: string): string | null {
  const s = secret()
  if (!s) return null
  return createHmac('sha256', s).update(`unsub:${userId}`).digest('base64url')
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = unsubscribeToken(userId)
  if (!expected || !token) return false
  const a = Buffer.from(expected), b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}
