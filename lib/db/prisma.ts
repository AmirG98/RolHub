import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Usar la DATABASE_URL tal como viene de Supabase (session mode, puerto 5432)
// NO cambiar al puerto 6543 — transaction mode NO soporta Prisma interactive transactions
// Solo limitar conexiones para serverless
function buildUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildUrl(),
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
        error?.message?.includes('timeout') ||
        error?.message?.includes('MaxClients') ||
        error?.message?.includes('max clients')
      if (!isPoolError || attempt === maxRetries) throw error
      console.warn(`[DB] Pool timeout, retrying (${attempt + 1}/${maxRetries})...`)
      await new Promise(r => setTimeout(r, delayMs * (attempt + 1)))
    }
  }
  throw lastError
}
