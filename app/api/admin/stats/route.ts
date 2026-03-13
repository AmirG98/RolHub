import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Tu email de admin - cambiar si es diferente
const ADMIN_EMAILS = ['amir@example.com', 'amirgomez@gmail.com', 'amir.gomez@icloud.com']

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si es admin
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'No tienes permisos de admin' }, { status: 403 })
    }

    // Obtener estadísticas
    const [
      totalUsers,
      totalCampaigns,
      totalSessions,
      totalTurns,
      totalCharacters,
      usersByPlan,
      usersByTutorialLevel,
      campaignsByLore,
      campaignsByEngine,
      recentUsers,
      activeCampaigns,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.session.count(),
      prisma.turn.count(),
      prisma.character.count(),
      prisma.user.groupBy({
        by: ['plan'],
        _count: { plan: true }
      }),
      prisma.user.groupBy({
        by: ['tutorialLevel'],
        _count: { tutorialLevel: true }
      }),
      prisma.campaign.groupBy({
        by: ['lore'],
        _count: { lore: true }
      }),
      prisma.campaign.groupBy({
        by: ['engine'],
        _count: { engine: true }
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          plan: true,
          createdAt: true,
          _count: {
            select: {
              campaigns: true,
              sessions: true,
              characters: true
            }
          }
        }
      }),
      prisma.campaign.count({
        where: { status: 'ACTIVE' }
      })
    ])

    // Calcular stats de engagement
    const usersWithSessions = await prisma.user.count({
      where: {
        sessions: {
          some: {}
        }
      }
    })

    const avgSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0
    const avgTurnsPerSession = totalSessions > 0 ? totalTurns / totalSessions : 0

    return NextResponse.json({
      overview: {
        totalUsers,
        totalCampaigns,
        totalSessions,
        totalTurns,
        totalCharacters,
        activeCampaigns,
        usersWithSessions,
        conversionRate: totalUsers > 0 ? ((usersWithSessions / totalUsers) * 100).toFixed(1) : 0,
        avgSessionsPerUser: avgSessionsPerUser.toFixed(1),
        avgTurnsPerSession: avgTurnsPerSession.toFixed(1),
      },
      distributions: {
        usersByPlan: usersByPlan.map(p => ({ plan: p.plan, count: p._count.plan })),
        usersByTutorialLevel: usersByTutorialLevel.map(t => ({ level: t.tutorialLevel, count: t._count.tutorialLevel })),
        campaignsByLore: campaignsByLore.map(l => ({ lore: l.lore, count: l._count.lore })),
        campaignsByEngine: campaignsByEngine.map(e => ({ engine: e.engine, count: e._count.engine })),
      },
      recentUsers,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
