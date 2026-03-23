import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  })

// Reutilizar instancia en TODOS los entornos (dev Y producción)
// Esto evita agotar el pool de conexiones en serverless (Vercel)
globalForPrisma.prisma = prisma
