import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import NarratorPanel from '@/components/game/NarratorPanel'
import PartyTracker from '@/components/game/PartyTracker'
import ActionInput from '@/components/game/ActionInput'

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
  if (session.userId !== (await prisma.user.findUnique({ where: { clerkId: userId } }))?.id) {
    redirect('/')
  }

  const character = session.campaign.characters[0]
  const worldState = session.campaign.worldState as any
  const campaign = session.campaign

  return (
    <div className="min-h-screen particle-bg">
      {/* Header con información del personaje */}
      <div className="border-b border-gold-dim/30 glass-panel-dark p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl text-gold-bright">{campaign.name}</h1>
            <p className="font-ui text-parchment text-sm">
              {worldState.current_scene} • {worldState.time_in_world}
            </p>
          </div>

          {character && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-heading text-lg text-parchment">{character.name}</p>
                <p className="font-ui text-sm text-gold-dim">
                  {character.archetype} • Nivel {character.level}
                </p>
              </div>
              <ParchmentPanel className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-ui text-xs text-gold-dim">HP</span>
                  <span className="font-heading text-blood text-lg">
                    {worldState.party[character.name]?.hp || `${(character.stats as any)?.hp || 20}/${(character.stats as any)?.maxHp || 20}`}
                  </span>
                </div>
              </ParchmentPanel>
            </div>
          )}
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto p-8 content-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel principal - Narración */}
          <div className="lg:col-span-2 space-y-4">
            <NarratorPanel
              turns={session.turns}
              campaignName={session.campaign.name}
              lore={session.campaign.lore}
            />

            <ActionInput
              sessionId={session.id}
              campaignId={session.campaign.id}
            />
          </div>

          {/* Panel lateral - Info del personaje */}
          <div className="space-y-4">
            <PartyTracker
              characters={session.campaign.characters}
              worldState={worldState}
            />

            {/* Info de la campaña */}
            <OrnateFrame variant="shadow">
              <ParchmentPanel>
                <h3 className="font-heading text-xl text-ink mb-4">Tu Aventura</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-ui text-gold-dim">Mundo:</span>{' '}
                    <span className="font-body text-stone">{session.campaign.lore}</span>
                  </div>
                  <div>
                    <span className="font-ui text-gold-dim">Modo:</span>{' '}
                    <span className="font-body text-stone">{session.campaign.mode}</span>
                  </div>
                  <div>
                    <span className="font-ui text-gold-dim">Sistema:</span>{' '}
                    <span className="font-body text-stone">{session.campaign.engine}</span>
                  </div>
                  <div>
                    <span className="font-ui text-gold-dim">Acto:</span>{' '}
                    <span className="font-body text-stone">{worldState.act} / 5</span>
                  </div>
                </div>
              </ParchmentPanel>
            </OrnateFrame>
          </div>
        </div>
      </div>
    </div>
  )
}
