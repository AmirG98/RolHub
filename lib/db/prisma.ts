import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Agregar pgbouncer=true y connection_limit a la URL si no los tiene
function getDatasourceUrl(): string {
  const url = process.env.DATABASE_URL || ''
  if (!url) return url

  const parsed = new URL(url)

  // Usar puerto 6543 (transaction pooling) en vez de 5432 (session mode)
  if (parsed.port === '5432' && parsed.hostname.includes('pooler.supabase.com')) {
    parsed.port = '6543'
  }

  // Agregar pgbouncer y connection_limit si no están
  if (!parsed.searchParams.has('pgbouncer')) {
    parsed.searchParams.set('pgbouncer', 'true')
  }
  if (!parsed.searchParams.has('connection_limit')) {
    parsed.searchParams.set('connection_limit', '5')
  }

  return parsed.toString()
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatasourceUrl(),
  })

// Reutilizar instancia en TODOS los entornos (dev Y producción)
// Esto evita agotar el pool de conexiones en serverless (Vercel)
globalForPrisma.prisma = prisma
