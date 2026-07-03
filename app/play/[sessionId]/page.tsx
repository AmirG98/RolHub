import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import GameSession from '@/components/game/GameSession'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { createCampaignMapState } from '@/lib/maps/map-init'
import { type Lore } from '@/lib/types/lore'
import { verifyGuestCookie } from '@/lib/guest/cookie'

interface PlayPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { sessionId } = await params
  const { userId: clerkUserId } = await auth()

  // Permitir acceso: Clerk auth O cookie de guest
  let dbUserId: string | null = null

  if (clerkUserId) {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
    dbUserId = user?.id || null
  }

  if (!dbUserId) {
    // Intentar cookie de guest
    const cookieStore = await cookies()
    const guestUserId = verifyGuestCookie(cookieStore.get('guest_user_id')?.value)
    if (guestUserId) {
      dbUserId = guestUserId
    }
  }

  if (!dbUserId) {
    redirect('/login')
  }

  // Buscar la sesión y datos relacionados
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      campaign: {
        include: {
          characters: true,
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
              character: {
                select: {
                  id: true,
                  name: true,
                  archetype: true,
                  level: true,
                  stats: true,
                  inventory: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
      turns: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  // Detectar si es guest (cookie present, sin Clerk auth)
  const isGuest = !clerkUserId

  if (!session) {
    // Safety net: para guests, volver al onboarding en vez de mostrar error
    if (isGuest) {
      redirect('/play-guest')
    }
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center p-8">
        <div className="glass-panel-dark rounded-lg p-8 max-w-2xl content-wrapper">
          <h1 className="font-title text-3xl text-blood text-center mb-4">
            Sesión No Encontrada
          </h1>
          <p className="font-body text-parchment/80 text-center">
            La sesión que buscas no existe o no tienes acceso a ella.
          </p>
        </div>
      </div>
    )
  }

  // Verificar acceso — usuario autenticado o guest
  const isOwner = session.userId === dbUserId
  const isParticipant = session.campaign.participants.some(p => p.userId === dbUserId)

  if (!isOwner && !isParticipant) {
    if (isGuest) {
      redirect('/play-guest')
    }
    redirect('/')
  }

  // Get current user's character in this campaign
  const currentParticipant = session.campaign.participants.find(p => p.userId === dbUserId)
  const character = currentParticipant?.character || session.campaign.characters[0] || null

  // Obtener worldState con fallbacks robustos
  const rawWorldState = (session.campaign.worldState as any) || {}

  // Crear map_state si no existe (para campañas antiguas)
  const campaignLore = session.campaign.lore as Lore
  const defaultMapState = createCampaignMapState(campaignLore)

  const worldState = {
    act: rawWorldState.act || 1,
    current_scene: rawWorldState.current_scene || 'Inicio de la aventura',
    time_in_world: rawWorldState.time_in_world || 'Amanecer',
    weather: rawWorldState.weather || 'Despejado',
    party: rawWorldState.party || {},
    active_quests: rawWorldState.active_quests || [],
    completed_quests: rawWorldState.completed_quests || [],
    failed_quests: rawWorldState.failed_quests || [],
    quests: rawWorldState.quests || [],
    map_state: rawWorldState.map_state || defaultMapState,
    world_flags: rawWorldState.world_flags || {},
    npc_states: rawWorldState.npc_states || {},
    faction_relations: rawWorldState.faction_relations || {},
    narrative_anchors_hit: rawWorldState.narrative_anchors_hit || [],
    lore: rawWorldState.lore || session.campaign.lore,
    engine: rawWorldState.engine || session.campaign.engine,
    session_count: rawWorldState.session_count || 0,
    campaign_id: rawWorldState.campaign_id || session.campaign.id,
    last_scene_image: rawWorldState.last_scene_image || null,
    last_suggested_actions: rawWorldState.last_suggested_actions || [],
    pendingLevelUp: rawWorldState.pendingLevelUp || null,
  }

  // Serializar los turnos para el cliente con multiplayer fields
  const serializedTurns = session.turns.map((turn) => ({
    id: turn.id,
    sessionId: turn.sessionId,
    role: turn.role as 'USER' | 'DM' | 'SYSTEM',
    content: turn.content,
    imageUrl: turn.imageUrl || undefined,
    createdAt: turn.createdAt.toISOString(),
    characterName: turn.characterName || undefined,
    playerName: turn.playerName || undefined,
    participantId: turn.participantId || undefined,
  }))

  // Serializar el personaje
  const serializedCharacter = character
    ? {
        id: character.id,
        name: character.name,
        archetype: character.archetype,
        level: (character as any).level || 1,
        stats: character.stats as any,
        inventory: (character as any).inventory as string[] || [],
        avatarUrl: (character as any).avatarUrl || null,
      }
    : null

  // Serializar participantes para multiplayer
  const serializedParticipants = session.campaign.participants.map(p => {
    const charStats = p.character?.stats as any
    const charHP = worldState.party?.[p.character?.name || '']?.hp ||
      (charStats ? `${charStats.hp || 20}/${charStats.maxHp || 20}` : undefined)

    return {
      id: p.id,
      role: p.role as 'OWNER' | 'DM' | 'PLAYER' | 'SPECTATOR',
      isOnline: p.isOnline,
      user: p.user,
      character: p.character ? {
        id: p.character.id,
        name: p.character.name,
        archetype: p.character.archetype,
        hp: charHP,
      } : null,
    }
  })

  return (
    <ErrorBoundary>
      <GameSession
        sessionId={session.id}
        campaignId={session.campaign.id}
        campaignName={session.campaign.name}
        lore={session.campaign.lore}
        engine={session.campaign.engine}
        mode={session.campaign.mode}
        initialTurns={serializedTurns}
        character={serializedCharacter || { id: '', name: 'Viajero', archetype: 'Aventurero', level: 1, stats: {}, inventory: [], avatarUrl: null }}
        worldState={worldState}
        isMultiplayer={session.campaign.isMultiplayer}
        initialParticipants={serializedParticipants}
        currentUserId={dbUserId}
        inviteCode={session.campaign.inviteCode}
        dmMode={(session.campaign as any).dmMode || 'AI'}
      />
    </ErrorBoundary>
  )
}
