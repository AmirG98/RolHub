import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Prisma Configuration Safety', () => {
  const prismaFile = fs.readFileSync(
    path.resolve(__dirname, '../../lib/db/prisma.ts'),
    'utf-8'
  )

  it('uses connection_limit in the URL builder', () => {
    expect(prismaFile).toContain('connection_limit')
  })

  it('uses singleton pattern (globalForPrisma)', () => {
    expect(prismaFile).toContain('globalForPrisma')
  })

  it('does NOT hardcode port 6543 in code (only in comments is ok)', () => {
    // Buscar 6543 fuera de comentarios
    const codeLines = prismaFile.split('\n').filter(l => !l.trim().startsWith('//'))
    const codeOnly = codeLines.join('\n')
    expect(codeOnly).not.toContain('6543')
  })

  it('exports withRetry helper', () => {
    expect(prismaFile).toContain('export async function withRetry')
  })
})

describe('Database URL in .env', () => {
  it('.env.local uses port 5432 (session mode)', () => {
    const envPath = path.resolve(__dirname, '../../.env.local')
    if (!fs.existsSync(envPath)) return // Skip if no .env.local (CI)
    const env = fs.readFileSync(envPath, 'utf-8')
    const dbUrl = env.match(/DATABASE_URL=(.+)/)?.[1]
    if (dbUrl) {
      expect(dbUrl).toContain(':5432/')
      expect(dbUrl).not.toContain(':6543/')
    }
  })
})
