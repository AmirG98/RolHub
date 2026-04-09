import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import {
  ACHIEVEMENTS,
  getAchievementById,
  getAchievementHint,
  levelFromXp,
  xpForNextLevel,
  xpWithinCurrentLevel,
  xpProgressPercent,
  type AchievementStats,
  type UnlockedAchievement,
} from '@/lib/game/user-progress'

/**
 * GET /api/user/progress
 *
 * Devuelve el estado completo de progreso meta del usuario logueado:
 * nivel, XP, racha, achievements (unlocked + locked con hints) y actividad
 * reciente para un mini-heatmap.
 */
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        xp: true,
        level: true,
        streakDays: true,
        longestStreak: true,
        lastActiveAt: true,
        achievements: true,
        totalTurns: true,
        totalSessions: true,
        completedCampaigns: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Counts extras que no están cached
    const [totalCampaigns, totalCharacters, distinctLoresResult] = await Promise.all([
      prisma.campaign.count({ where: { userId: dbUser.id } }),
      prisma.character.count({ where: { userId: dbUser.id } }),
      prisma.$queryRawUnsafe<{ lore: string }[]>(
        `SELECT DISTINCT lore FROM "Character" WHERE "userId" = $1`,
        dbUser.id
      ),
    ])
    const distinctLores = distinctLoresResult.length

    // Actividad de los últimos 14 días — turnos USER por día del usuario
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setUTCHours(0, 0, 0, 0)
    fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 13)

    const rawActivity = await prisma.$queryRawUnsafe<Array<{ day: string; count: bigint }>>(
      `
      SELECT to_char("createdAt"::date, 'YYYY-MM-DD') AS day, COUNT(*)::bigint AS count
      FROM "Turn" t
      INNER JOIN "Session" s ON s.id = t."sessionId"
      WHERE s."userId" = $1
        AND t."createdAt" >= $2
        AND t.role = 'USER'
      GROUP BY day
      ORDER BY day
      `,
      dbUser.id,
      fourteenDaysAgo
    )

    // Normalizar en un array de 14 días (rellenar con 0 los faltantes)
    const activityMap = new Map<string, number>()
    for (const row of rawActivity) {
      activityMap.set(row.day, Number(row.count))
    }
    const recentActivity: Array<{ date: string; turns: number }> = []
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo)
      d.setUTCDate(d.getUTCDate() + i)
      const key = d.toISOString().slice(0, 10)
      recentActivity.push({ date: key, turns: activityMap.get(key) || 0 })
    }

    // Achievements — separar unlocked vs locked
    const unlockedList: UnlockedAchievement[] = Array.isArray(dbUser.achievements)
      ? (dbUser.achievements as any[])
      : []
    const unlockedMap = new Map(unlockedList.map((a) => [a.id, a.unlockedAt]))

    const statsForHints: AchievementStats = {
      totalTurns: dbUser.totalTurns,
      streakDays: dbUser.streakDays,
      longestStreak: dbUser.longestStreak,
      campaigns: totalCampaigns,
      completedCampaigns: dbUser.completedCampaigns,
      characters: totalCharacters,
      distinctLores,
      level: dbUser.level,
    }

    const unlocked = ACHIEVEMENTS.filter((def) => unlockedMap.has(def.id)).map((def) => ({
      id: def.id,
      tier: def.tier,
      xpBonus: def.xpBonus,
      unlockedAt: unlockedMap.get(def.id),
    }))

    const locked = ACHIEVEMENTS.filter((def) => !unlockedMap.has(def.id)).map((def) => ({
      id: def.id,
      tier: def.tier,
      xpBonus: def.xpBonus,
      hint: getAchievementHint(def, statsForHints),
    }))

    // Is playing today?
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const isPlayingToday = dbUser.lastActiveAt
      ? new Date(dbUser.lastActiveAt).toISOString().slice(0, 10) === today.toISOString().slice(0, 10)
      : false

    // Days since registered
    const msSinceRegister = Date.now() - new Date(dbUser.createdAt).getTime()
    const daysSinceRegistered = Math.floor(msSinceRegister / (24 * 60 * 60 * 1000))

    return NextResponse.json({
      user: {
        username: dbUser.username,
        level: dbUser.level,
        xp: dbUser.xp,
        xpWithinLevel: xpWithinCurrentLevel(dbUser.xp),
        xpForNextLevel: xpForNextLevel(dbUser.level),
        xpProgress: xpProgressPercent(dbUser.xp),
        streakDays: dbUser.streakDays,
        longestStreak: dbUser.longestStreak,
        lastActiveAt: dbUser.lastActiveAt?.toISOString() || null,
        isPlayingToday,
      },
      stats: {
        totalTurns: dbUser.totalTurns,
        totalSessions: dbUser.totalSessions,
        totalCampaigns,
        completedCampaigns: dbUser.completedCampaigns,
        totalCharacters,
        distinctLores,
        daysSinceRegistered,
      },
      achievements: {
        unlocked,
        locked,
        totalCount: ACHIEVEMENTS.length,
      },
      recentActivity,
    })
  } catch (error) {
    console.error('[/api/user/progress] error:', error)
    return NextResponse.json(
      { error: 'Error al obtener progreso', details: (error as Error).message },
      { status: 500 }
    )
  }
}
