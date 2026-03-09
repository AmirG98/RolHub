import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { broadcastTurn } from '@/hooks/useSessionRealtime'

interface DMTurnRequest {
  sessionId: string
  narration: string
  actionType: 'narrate' | 'damage' | 'heal' | 'event' | 'npc' | 'roll'
  isPrivate?: boolean
  targetPlayerIds?: string[]
  worldStateUpdates?: Record<string, any>
  damageHeal?: {
    type: 'damage' | 'heal'
    amount: number
    targetCharacterId: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body: DMTurnRequest = await req.json()
    const {
      sessionId,
      narration,
      actionType,
      isPrivate = false,
      targetPlayerIds,
      worldStateUpdates,
      damageHeal,
    } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'ID de sesión requerido' }, { status: 400 })
    }

    // Fetch session with campaign and participants
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        campaign: {
          include: {
            participants: {
              include: {
                user: { select: { id: true, username: true } },
                character: true,
              },
            },
            characters: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
    }

    // Check if user is the DM (owner or has DM role)
    const isOwner = session.campaign.userId === user.id
    const participant = session.campaign.participants.find(p => p.userId === user.id)
    const isDM = isOwner || participant?.role === 'DM'

    if (!isDM) {
      return NextResponse.json(
        { error: 'Solo el DM puede usar este endpoint' },
        { status: 403 }
      )
    }

    // Process damage/heal if applicable
    let worldStatePatch: Record<string, any> = {}
    let narrationContent = narration

    if (damageHeal && damageHeal.targetCharacterId && damageHeal.amount > 0) {
      const targetCharacter = session.campaign.characters.find(
        c => c.id === damageHeal.targetCharacterId
      )

      if (targetCharacter) {
        const currentWorldState = session.campaign.worldState as any
        const charStats = targetCharacter.stats as any
        const currentHP = currentWorldState?.party?.[targetCharacter.name]?.hp ||
          `${charStats?.hp || 20}/${charStats?.maxHp || 20}`

        const [current, max] = currentHP.split('/').map(Number)
        let newHP: number

        if (damageHeal.type === 'damage') {
          newHP = Math.max(0, current - damageHeal.amount)
          narrationContent = narration ||
            `${targetCharacter.name} recibe ${damageHeal.amount} puntos de daño.`
        } else {
          newHP = Math.min(max, current + damageHeal.amount)
          narrationContent = narration ||
            `${targetCharacter.name} recupera ${damageHeal.amount} puntos de vida.`
        }

        worldStatePatch = {
          party: {
            ...currentWorldState?.party,
            [targetCharacter.name]: {
              ...currentWorldState?.party?.[targetCharacter.name],
              hp: `${newHP}/${max}`,
            },
          },
        }
      }
    }

    // Apply additional world state updates
    if (worldStateUpdates) {
      worldStatePatch = {
        ...worldStatePatch,
        ...worldStateUpdates,
      }
    }

    // Update campaign world state if there are patches
    if (Object.keys(worldStatePatch).length > 0) {
      const currentWorldState = session.campaign.worldState as any
      await prisma.campaign.update({
        where: { id: session.campaign.id },
        data: {
          worldState: {
            ...currentWorldState,
            ...worldStatePatch,
          },
        },
      })
    }

    // Create the DM turn
    const dmTurn = await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: 'DM',
        content: narrationContent,
        worldStatePatch: Object.keys(worldStatePatch).length > 0 ? worldStatePatch : undefined,
        dmNotes: isPrivate ? JSON.stringify({ targetPlayerIds }) : undefined,
        // Mark as human DM turn
        characterName: 'DM',
        playerName: user.username,
      },
    })

    // Broadcast the turn to all connected players
    try {
      await broadcastTurn(sessionId, {
        id: dmTurn.id,
        sessionId: dmTurn.sessionId,
        role: dmTurn.role as 'USER' | 'DM' | 'SYSTEM',
        content: dmTurn.content,
        createdAt: dmTurn.createdAt.toISOString(),
        characterName: dmTurn.characterName || undefined,
        playerName: dmTurn.playerName || undefined,
      })
    } catch (broadcastError) {
      console.error('Error broadcasting turn:', broadcastError)
      // Continue even if broadcast fails
    }

    return NextResponse.json({
      turn: {
        id: dmTurn.id,
        content: dmTurn.content,
        role: dmTurn.role,
        createdAt: dmTurn.createdAt.toISOString(),
      },
      worldStateUpdated: Object.keys(worldStatePatch).length > 0,
    })
  } catch (error) {
    console.error('Error in DM turn:', error)
    return NextResponse.json(
      { error: 'Error al procesar el turno del DM' },
      { status: 500 }
    )
  }
}
