import { prisma } from '@/lib/db/prisma'
import type { NextRequest } from 'next/server'

/**
 * Rate limiting DB-backed con ventana fija (fixed window).
 *
 * Sin servicios externos: usa la tabla RateLimit en Postgres.
 * Es "fail-open": si la DB falla, permite la request (preferimos no
 * bloquear jugadores reales por un error nuestro). Para tráfico serio,
 * migrar a @upstash/ratelimit (Redis) — la interfaz es compatible.
 *
 * Nota: la ventana fija tiene una carrera teórica en el borde de la
 * ventana (puede permitir hasta 2x el límite en el peor caso). Para
 * prevención de abuso de costos es más que suficiente.
 */

export interface RateLimitResult {
  allowed: boolean
  /** Requests restantes en la ventana actual (aprox) */
  remaining: number
  /** Segundos hasta que se resetea la ventana */
  retryAfterSeconds: number
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date()
  const windowMs = windowSeconds * 1000

  try {
    // Crear el registro si no existe (count arranca en 1 = esta request)
    const record = await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: {}, // no-op: si existe, lo manejamos abajo
    })

    const windowAge = now.getTime() - record.windowStart.getTime()

    // Registro recién creado en este upsert → primera request de la ventana
    if (record.count === 1 && windowAge < 1000) {
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: windowSeconds }
    }

    // Ventana vencida → resetear
    if (windowAge >= windowMs) {
      await prisma.rateLimit.update({
        where: { key },
        data: { count: 1, windowStart: now },
      })
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: windowSeconds }
    }

    const retryAfterSeconds = Math.ceil((windowMs - windowAge) / 1000)

    // Límite alcanzado
    if (record.count >= limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds }
    }

    // Incrementar y permitir
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    })
    return {
      allowed: updated.count <= limit,
      remaining: Math.max(0, limit - updated.count),
      retryAfterSeconds,
    }
  } catch (error) {
    console.error('[rate-limit] DB error, failing open:', error)
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 }
  }
}

/**
 * Extrae la IP del cliente en Vercel/proxies estándar.
 * En Vercel, x-forwarded-for viene seteado por la plataforma y el primer
 * valor es la IP real del cliente.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Respuesta 429 estándar con Retry-After.
 */
export function rateLimitResponse(result: RateLimitResult, message?: string) {
  return new Response(
    JSON.stringify({
      error: message || 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.',
      retryAfterSeconds: result.retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSeconds),
      },
    }
  )
}

/**
 * Limpieza de registros viejos de rate limit (llamar desde el cron).
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
  const result = await prisma.rateLimit.deleteMany({
    where: { windowStart: { lt: cutoff } },
  })
  return result.count
}
