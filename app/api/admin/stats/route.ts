import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

const ADMIN_EMAILS = ['amir.gomez.14@gmail.com']

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase() || ''

    if (!ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'No tienes permisos de admin' }, { status: 403 })
    }

    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // === OVERVIEW ===
    const [
      totalUsers, totalCampaigns, totalSessions, totalTurns, totalCharacters,
      usersByPlan, usersByTutorialLevel,
      campaignsByLore, campaignsByEngine, campaignsByMode,
      activeCampaigns, recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.session.count(),
      prisma.turn.count(),
      prisma.character.count(),
      prisma.user.groupBy({ by: ['plan'], _count: { plan: true } }),
      prisma.user.groupBy({ by: ['tutorialLevel'], _count: { tutorialLevel: true } }),
      prisma.campaign.groupBy({ by: ['lore'], _count: { lore: true }, orderBy: { _count: { lore: 'desc' } } }),
      prisma.campaign.groupBy({ by: ['engine'], _count: { engine: true }, orderBy: { _count: { engine: 'desc' } } }),
      prisma.campaign.groupBy({ by: ['mode'], _count: { mode: true } }),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.user.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, email: true, plan: true, createdAt: true,
          _count: { select: { campaigns: true, sessions: true, characters: true } } },
      }),
    ])

    // === ENGAGEMENT & RETENTION ===
    const [
      usersWithCampaigns, usersWithSessions, usersWithMultipleSessions,
      dau, wau, mau,
      campaignsWithNoTurns,
      sessionsLast7d, sessionsLast30d,
      recentCampaignsByLore,
    ] = await Promise.all([
      prisma.user.count({ where: { campaigns: { some: {} } } }),
      prisma.user.count({ where: { sessions: { some: {} } } }),
      prisma.user.count({ where: { sessions: { some: { turns: { some: { createdAt: { gte: last7d } } } } } } }),
      // DAU: distinct users with turns in last 24h
      prisma.turn.findMany({
        where: { createdAt: { gte: last24h }, role: 'USER' },
        select: { session: { select: { userId: true } } },
        distinct: ['sessionId'],
      }),
      // WAU: sessions in last 7d
      prisma.session.count({ where: { startedAt: { gte: last7d } } }),
      // MAU: sessions in last 30d
      prisma.session.count({ where: { startedAt: { gte: last30d } } }),
      // Churn: campaigns with 0 sessions
      prisma.campaign.count({ where: { sessions: { none: {} } } }),
      // Recent sessions
      prisma.session.count({ where: { startedAt: { gte: last7d } } }),
      prisma.session.count({ where: { startedAt: { gte: last30d } } }),
      // Trend: campaigns created in last 30d by lore
      prisma.campaign.groupBy({
        by: ['lore'], where: { createdAt: { gte: last30d } },
        _count: { lore: true }, orderBy: { _count: { lore: 'desc' } },
      }),
    ])

    // DAU unique user count
    const dauUsers = new Set(dau.map(t => t.session?.userId).filter(Boolean)).size

    // Session engagement funnel: cuántas sesiones se quedan en cada nivel de profundidad
    const sessionFunnelRaw = await prisma.$queryRawUnsafe<Array<{ bucket: string; count: string }>>(`
      SELECT bucket, COUNT(*)::text AS count
      FROM (
        SELECT
          CASE
            WHEN turn_count = 0 THEN 'no_turns'
            WHEN turn_count = 1 THEN 'saw_opening'
            WHEN turn_count BETWEEN 2 AND 3 THEN 'played_one_turn'
            WHEN turn_count BETWEEN 4 AND 10 THEN 'short_session'
            WHEN turn_count BETWEEN 11 AND 30 THEN 'medium_session'
            WHEN turn_count > 30 THEN 'long_session'
          END AS bucket
        FROM (
          SELECT s.id, COUNT(t.id) AS turn_count
          FROM "Session" s
          LEFT JOIN "Turn" t ON t."sessionId" = s.id
          GROUP BY s.id
        ) counts
      ) buckets
      GROUP BY bucket
      ORDER BY bucket
    `)
    const sessionFunnel: Record<string, number> = {}
    for (const row of sessionFunnelRaw) {
      if (row.bucket) sessionFunnel[row.bucket] = parseInt(row.count, 10)
    }

    // Session duration stats
    const sessionsWithDuration = await prisma.session.findMany({
      where: { endedAt: { not: null } },
      select: { startedAt: true, endedAt: true, _count: { select: { turns: true } } },
      take: 500, orderBy: { startedAt: 'desc' },
    })

    const durations = sessionsWithDuration
      .map(s => (new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime()) / 60000)
      .filter(d => d > 0 && d < 600) // filtrar sesiones > 10h (probablemente no cerradas)
    const avgDurationMin = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
    const turnCounts = sessionsWithDuration.map(s => s._count.turns)
    const avgTurns = turnCounts.length > 0 ? turnCounts.reduce((a, b) => a + b, 0) / turnCounts.length : 0
    const medianTurns = turnCounts.length > 0 ? turnCounts.sort((a, b) => a - b)[Math.floor(turnCounts.length / 2)] : 0

    // Power users (top 10 by turn count)
    const powerUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { sessions: { _count: 'desc' } },
      select: { username: true, email: true, _count: { select: { sessions: true, campaigns: true } } },
    })

    // === NARRATIVE ROUTES ===
    const [
      archetypesByLore,
      charactersByLevel,
    ] = await Promise.all([
      prisma.character.groupBy({
        by: ['archetype', 'lore'],
        _count: { archetype: true },
        orderBy: { _count: { archetype: 'desc' } },
        take: 30,
      }),
      prisma.character.groupBy({
        by: ['level'],
        _count: { level: true },
        orderBy: { level: 'asc' },
      }),
    ])

    // Quest stats from worldState (sample campaigns)
    const campaignsWithWorldState = await prisma.campaign.findMany({
      take: 100, orderBy: { updatedAt: 'desc' },
      select: { lore: true, engine: true, worldState: true },
    })

    let totalActiveQuests = 0, totalCompletedQuests = 0, totalFailedQuests = 0
    const locationCounts: Record<string, number> = {}

    for (const c of campaignsWithWorldState) {
      const ws = c.worldState as any
      if (!ws) continue
      totalActiveQuests += (ws.active_quests?.length || 0)
      totalCompletedQuests += (ws.completed_quests?.length || 0)
      totalFailedQuests += (ws.failed_quests?.length || 0)
      if (ws.current_scene) {
        locationCounts[ws.current_scene] = (locationCounts[ws.current_scene] || 0) + 1
      }
    }

    const totalQuestsEver = totalActiveQuests + totalCompletedQuests + totalFailedQuests
    const questCompletionRate = totalQuestsEver > 0 ? ((totalCompletedQuests / totalQuestsEver) * 100).toFixed(1) : '0'

    // Top locations
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }))

    // Session length by lore
    const sessionsByLore = await prisma.session.findMany({
      where: { endedAt: { not: null } },
      select: {
        startedAt: true, endedAt: true,
        campaign: { select: { lore: true } },
        _count: { select: { turns: true } },
      },
      take: 500, orderBy: { startedAt: 'desc' },
    })

    const loreDurations: Record<string, number[]> = {}
    for (const s of sessionsByLore) {
      const dur = (new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime()) / 60000
      if (dur > 0 && dur < 600) {
        const lore = s.campaign.lore
        if (!loreDurations[lore]) loreDurations[lore] = []
        loreDurations[lore].push(dur)
      }
    }
    const avgDurationByLore = Object.entries(loreDurations).map(([lore, durs]) => ({
      lore,
      avgMinutes: Math.round(durs.reduce((a, b) => a + b, 0) / durs.length),
      avgTurns: 0, // calculated below
      sessions: durs.length,
    }))

    // === BUILD RESPONSE ===
    const avgSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0
    const avgTurnsPerSession = totalSessions > 0 ? totalTurns / totalSessions : 0

    return NextResponse.json({
      overview: {
        totalUsers, totalCampaigns, totalSessions, totalTurns, totalCharacters,
        activeCampaigns, usersWithSessions,
        conversionRate: totalUsers > 0 ? ((usersWithSessions / totalUsers) * 100).toFixed(1) : '0',
        avgSessionsPerUser: avgSessionsPerUser.toFixed(1),
        avgTurnsPerSession: avgTurnsPerSession.toFixed(1),
      },
      distributions: {
        usersByPlan: usersByPlan.map(p => ({ plan: p.plan, count: p._count.plan })),
        usersByTutorialLevel: usersByTutorialLevel.map(t => ({ level: t.tutorialLevel, count: t._count.tutorialLevel })),
        campaignsByLore: campaignsByLore.map(l => ({ lore: l.lore, count: l._count.lore })),
        campaignsByEngine: campaignsByEngine.map(e => ({ engine: e.engine, count: e._count.engine })),
        campaignsByMode: campaignsByMode.map(m => ({ mode: m.mode, count: m._count.mode })),
      },
      engagement: {
        funnel: {
          totalUsers,
          usersWithCampaigns,
          usersWithSessions,
          usersReturning: usersWithMultipleSessions,
        },
        sessionFunnel: {
          sawOpening: sessionFunnel['saw_opening'] || 0,
          playedOneTurn: sessionFunnel['played_one_turn'] || 0,
          shortSession: sessionFunnel['short_session'] || 0,
          mediumSession: sessionFunnel['medium_session'] || 0,
          longSession: sessionFunnel['long_session'] || 0,
          totalSessions: totalSessions,
        },
        retention: {
          dau: dauUsers,
          sessionsLast7d,
          sessionsLast30d,
        },
        sessionStats: {
          avgDurationMinutes: Math.round(avgDurationMin),
          avgTurnsPerSession: Math.round(avgTurns),
          medianTurnsPerSession: medianTurns,
        },
        churn: {
          campaignsNeverPlayed: campaignsWithNoTurns,
          churnRate: totalCampaigns > 0 ? ((campaignsWithNoTurns / totalCampaigns) * 100).toFixed(1) : '0',
        },
        powerUsers: powerUsers.map(u => ({
          username: u.username, email: u.email,
          sessions: u._count.sessions, campaigns: u._count.campaigns,
        })),
      },
      narrative: {
        archetypes: archetypesByLore.map(a => ({ archetype: a.archetype, lore: a.lore, count: a._count.archetype })),
        levelDistribution: charactersByLevel.map(l => ({ level: l.level, count: l._count.level })),
        quests: {
          active: totalActiveQuests, completed: totalCompletedQuests, failed: totalFailedQuests,
          completionRate: questCompletionRate,
        },
        topLocations,
        sessionLengthByLore: avgDurationByLore,
        trendLast30d: recentCampaignsByLore.map(l => ({ lore: l.lore, count: l._count.lore })),
      },
      recentUsers,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
