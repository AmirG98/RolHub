import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; ms?: number; error?: string }> = {}

  // Check DB connection
  const dbStart = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: 'ok', ms: Date.now() - dbStart }
  } catch (err) {
    checks.database = { status: 'error', ms: Date.now() - dbStart, error: (err as Error).message }
  }

  // Check Claude API key exists
  checks.claude_api = {
    status: process.env.ANTHROPIC_API_KEY ? 'ok' : 'error',
    ...(process.env.ANTHROPIC_API_KEY ? {} : { error: 'ANTHROPIC_API_KEY not set' }),
  }

  // Check Fal.ai key exists
  checks.fal_ai = {
    status: process.env.FAL_KEY ? 'ok' : 'error',
    ...(process.env.FAL_KEY ? {} : { error: 'FAL_KEY not set' }),
  }

  const allOk = Object.values(checks).every(c => c.status === 'ok')

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      checks,
      // Flag operativo (no sensible): permite verificar desde afuera si el
      // paywall está activo sin necesidad de una cuenta autenticada.
      billing_enforced: process.env.BILLING_ENFORCED === 'true',
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  )
}
