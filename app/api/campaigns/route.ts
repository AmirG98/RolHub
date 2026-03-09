import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ campaigns: [] })
    }

    const campaigns = await prisma.campaign.findMany({
      where: { userId: user.id },
      include: {
        sessions: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
          },
          orderBy: { startedAt: 'desc' }
        },
        characters: {
          select: {
            id: true,
            name: true,
            archetype: true,
            level: true,
            stats: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Enrich campaigns with additional info
    const enrichedCampaigns = campaigns.map(campaign => {
      const worldState = campaign.worldState as any
      const lastSession = campaign.sessions[0]
      const character = campaign.characters[0]

      return {
        ...campaign,
        lastPlayedAt: lastSession?.startedAt || campaign.createdAt,
        currentScene: worldState?.current_scene || 'Inicio',
        currentAct: worldState?.act || 1,
        characterName: character?.name || 'Sin personaje',
        characterLevel: character?.level || 1,
        hp: worldState?.party?.[character?.name]?.hp || `${(character?.stats as any)?.hp || 20}/${(character?.stats as any)?.maxHp || 20}`,
        activeQuests: worldState?.active_quests?.length || 0,
        completedQuests: worldState?.completed_quests?.length || 0,
      }
    })

    return NextResponse.json({ campaigns: enrichedCampaigns })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
