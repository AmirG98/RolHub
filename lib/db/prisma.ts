import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar URL de la base de datos para serverless (Vercel + Supabase)
function getDatasourceUrl(): string {
  const url = process.env.DATABASE_URL || ''
  if (!url) return url

  try {
    const parsed = new URL(url)

    // Usar puerto 6543 (transaction pooling) en vez de 5432 (session mode)
    if (parsed.port === '5432' && parsed.hostname.includes('pooler.supabase.com')) {
      parsed.port = '6543'
    }

    // Parámetros optimizados para serverless
    if (!parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true')
    }
    // En serverless cada instancia solo necesita 1 conexión
    parsed.searchParams.set('connection_limit', '1')
    // Esperar hasta 15s por una conexión del pool antes de fallar
    parsed.searchParams.set('pool_timeout', '15')
    // Timeout de conexión inicial
    parsed.searchParams.set('connect_timeout', '10')

    return parsed.toString()
  } catch {
    // Si la URL no es parseable, devolverla tal cual
    return url
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatasourceUrl(),
  })

// Reutilizar instancia en TODOS los entornos (dev Y producción)
globalForPrisma.prisma = prisma

/**
 * Helper para ejecutar queries con retry automático en caso de pool timeout
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      const isPoolError = error?.message?.includes('pool') ||
        error?.message?.includes('connection') ||
        error?.message?.includes('timeout')
      if (!isPoolError || attempt === maxRetries) throw error
      console.warn(`[DB] Pool timeout, retrying (${attempt + 1}/${maxRetries})...`)
      await new Promise(r => setTimeout(r, delayMs * (attempt + 1)))
    }
  }
  throw lastError
}
