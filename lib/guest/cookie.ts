import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Firma HMAC para la cookie guest_user_id.
 *
 * Formato firmado: "<userId>.<hmac-sha256-hex-truncado>"
 * Evita que un ID de usuario filtrado (logs, errores) sea directamente
 * una sesión secuestrable: sin el secret no se puede fabricar la firma.
 *
 * Compatibilidad: verifyGuestCookie acepta cookies legacy sin firma
 * (formato viejo: solo el cuid) durante la transición — las cookies
 * duran 7 días, después de eso se puede endurecer a solo-firmadas
 * seteando GUEST_COOKIE_STRICT=true.
 */

const SIGNATURE_LENGTH = 32

function getSecret(): string | null {
  return process.env.GUEST_COOKIE_SECRET || process.env.CLERK_SECRET_KEY || null
}

function computeSignature(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(userId).digest('hex').slice(0, SIGNATURE_LENGTH)
}

/** Firma un userId para guardarlo en la cookie. */
export function signGuestId(userId: string): string {
  const secret = getSecret()
  if (!secret) {
    console.warn('[guest-cookie] No GUEST_COOKIE_SECRET ni CLERK_SECRET_KEY — cookie sin firmar')
    return userId
  }
  return `${userId}.${computeSignature(userId, secret)}`
}

/**
 * Verifica el valor de la cookie y devuelve el userId, o null si es inválida.
 */
export function verifyGuestCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null

  const secret = getSecret()
  const strict = process.env.GUEST_COOKIE_STRICT === 'true'

  const dotIndex = cookieValue.lastIndexOf('.')

  // Formato legacy sin firma (cuid plano)
  if (dotIndex === -1) {
    if (strict) return null
    return cookieValue
  }

  const userId = cookieValue.slice(0, dotIndex)
  const signature = cookieValue.slice(dotIndex + 1)

  if (!secret) {
    // Sin secret no podemos verificar — fail-open al userId
    return userId
  }

  const expected = computeSignature(userId, secret)
  if (signature.length !== expected.length) return null

  try {
    const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    return valid ? userId : null
  } catch {
    return null
  }
}
