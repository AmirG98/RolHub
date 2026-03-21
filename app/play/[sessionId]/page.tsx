import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import GameSession from '@/components/game/GameSession'
import { createCampaignMapState } from '@/lib/maps/map-init'
import { type Lore } from '@/lib/types/lore'

interface PlayPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { sessionId } = await params
  const { userId } = await auth()

  if (!userId) {
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
                  stats: true,
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

  if (!session) {
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

  // Verificar que el usuario tiene acceso a esta sesión
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    redirect('/')
  }

  // Check if user is a participant in multiplayer campaigns or the owner
  const isOwner = session.userId === user.id
  const isParticipant = session.campaign.participants.some(p => p.userId === user.id)

  if (!isOwner && !isParticipant) {
    redirect('/')
  }

  // Get current user's character in this campaign
  const currentParticipant = session.campaign.participants.find(p => p.userId === user.id)
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
    <GameSession
      sessionId={session.id}
      campaignId={session.campaign.id}
      campaignName={session.campaign.name}
      lore={session.campaign.lore}
      engine={session.campaign.engine}
      mode={session.campaign.mode}
      initialTurns={serializedTurns}
      character={serializedCharacter}
      worldState={worldState}
      isMultiplayer={session.campaign.isMultiplayer}
      initialParticipants={serializedParticipants}
      currentUserId={user.id}
      inviteCode={session.campaign.inviteCode}
      dmMode={(session.campaign as any).dmMode || 'AI'}
    />
  )
}
