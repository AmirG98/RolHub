import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import GameSession from '@/components/game/GameSession'

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
  if (!user || session.userId !== user.id) {
    redirect('/')
  }

  const character = session.campaign.characters[0] || null
  const worldState = (session.campaign.worldState as any) || {
    act: 1,
    current_scene: 'Inicio de la aventura',
    time_in_world: 'Amanecer',
    party: {},
  }

  // Serializar los turnos para el cliente
  const serializedTurns = session.turns.map((turn) => ({
    id: turn.id,
    role: turn.role as 'USER' | 'DM' | 'SYSTEM',
    content: turn.content,
    imageUrl: turn.imageUrl,
    createdAt: turn.createdAt.toISOString(),
  }))

  // Serializar el personaje
  const serializedCharacter = character
    ? {
        id: character.id,
        name: character.name,
        archetype: character.archetype,
        level: character.level,
        stats: character.stats as any,
      }
    : null

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
    />
  )
}
