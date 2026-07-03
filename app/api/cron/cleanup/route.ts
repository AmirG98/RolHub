import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { cleanupExpiredAssets } from '@/lib/cache/asset-cache'
import { cleanupExpiredRateLimits } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Cron de limpieza (Vercel Cron — ver vercel.json).
 *
 * Borra:
 * 1. Usuarios guest con más de GUEST_RETENTION_DAYS días (default 14) y toda
 *    su data en cascada manual (turnos → checkpoints → sesiones → personajes
 *    → participaciones → campañas → usuario). Los guests son demos: sin esto,
 *    cada visitante deja registros huérfanos en la DB para siempre.
 * 2. Assets generados expirados (imagen/audio cacheados).
 * 3. Registros de rate limit viejos.
 *
 * Protegido por CRON_SECRET: Vercel Cron manda el header
 * "Authorization: Bearer <CRON_SECRET>" automáticamente si la env var existe.
 */
export async function GET(req: NextRequest) {
  // Verificar que la llamada venga de Vercel Cron
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const retentionDays = parseInt(process.env.GUEST_RETENTION_DAYS || '14', 10)
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

  const stats = {
    guestsDeleted: 0,
    campaignsDeleted: 0,
    sessionsDeleted: 0,
    turnsDeleted: 0,
    assetsDeleted: 0,
    rateLimitsDeleted: 0,
    errors: [] as string[],
  }

  try {
    // Guests viejos: clerkId con prefijo "guest_" (ver guest-create)
    const oldGuests = await prisma.user.findMany({
      where: {
        clerkId: { startsWith: 'guest_' },
        createdAt: { lt: cutoff },
      },
      select: { id: true },
      take: 200, // procesar en tandas — el cron corre a diario
    })

    for (const guest of oldGuests) {
      try {
        // Borrar en orden de dependencias (sin onDelete: Cascade en el schema,
        // hay que hacerlo manual)
        const sessions = await prisma.session.findMany({
          where: { userId: guest.id },
          select: { id: true },
        })
        const sessionIds = sessions.map((s: { id: string }) => s.id)

        if (sessionIds.length > 0) {
          const turns = await prisma.turn.deleteMany({ where: { sessionId: { in: sessionIds } } })
          stats.turnsDeleted += turns.count
          await prisma.summaryCheckpoint.deleteMany({ where: { sessionId: { in: sessionIds } } })
          await prisma.combatEncounter.deleteMany({ where: { sessionId: { in: sessionIds } } })
          const deletedSessions = await prisma.session.deleteMany({ where: { id: { in: sessionIds } } })
          stats.sessionsDeleted += deletedSessions.count
        }

        await prisma.campaignParticipant.deleteMany({ where: { userId: guest.id } })

        const campaigns = await prisma.campaign.findMany({
          where: { userId: guest.id },
          select: { id: true },
        })
        const campaignIds = campaigns.map((c: { id: string }) => c.id)
        if (campaignIds.length > 0) {
          await prisma.character.deleteMany({ where: { campaignId: { in: campaignIds } } })
          await prisma.campaignParticipant.deleteMany({ where: { campaignId: { in: campaignIds } } })
          await prisma.nPC.deleteMany({ where: { campaignId: { in: campaignIds } } })
          await prisma.scene.deleteMany({ where: { campaignId: { in: campaignIds } } })
          await prisma.playlist.deleteMany({ where: { campaignId: { in: campaignIds } } })
          await prisma.rollTable.deleteMany({ where: { campaignId: { in: campaignIds } } })
          await prisma.compendiumItem.deleteMany({ where: { campaignId: { in: campaignIds } } })
          await prisma.journal.deleteMany({ where: { campaignId: { in: campaignIds } } })
          const deletedCampaigns = await prisma.campaign.deleteMany({ where: { id: { in: campaignIds } } })
          stats.campaignsDeleted += deletedCampaigns.count
        }

        await prisma.character.deleteMany({ where: { userId: guest.id } })
        await prisma.journal.deleteMany({ where: { userId: guest.id } })
        await prisma.macro.deleteMany({ where: { userId: guest.id } })

        await prisma.user.delete({ where: { id: guest.id } })
        stats.guestsDeleted++
      } catch (err: any) {
        stats.errors.push(`guest ${guest.id}: ${err?.message || 'error'}`)
      }
    }
  } catch (err: any) {
    stats.errors.push(`guest cleanup: ${err?.message || 'error'}`)
  }

  try {
    stats.assetsDeleted = await cleanupExpiredAssets()
  } catch (err: any) {
    stats.errors.push(`assets: ${err?.message || 'error'}`)
  }

  try {
    stats.rateLimitsDeleted = await cleanupExpiredRateLimits()
  } catch (err: any) {
    stats.errors.push(`rate limits: ${err?.message || 'error'}`)
  }

  console.log('[cron/cleanup]', JSON.stringify(stats))
  return NextResponse.json({ ok: true, ...stats })
}
