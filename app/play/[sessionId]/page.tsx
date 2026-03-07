import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'

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
            <OrnateFrame variant="gold">
              <ParchmentPanel variant="ornate" className="min-h-[600px]">
                <h2 className="font-title text-3xl text-ink text-center mb-6">
                  El Narrador
                </h2>

                <div className="space-y-4">
                  {session.turns.map((turn) => (
                    <div
                      key={turn.id}
                      className={`p-4 rounded-lg glass-panel ${
                        turn.role === 'DM'
                          ? 'border-l-2 border-gold'
                          : turn.role === 'USER'
                          ? 'border-l-2 border-neon-blue'
                          : 'border-l-2 border-gold-dim'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="font-heading text-xs text-gold-dim uppercase tracking-wide">
                          {turn.role === 'DM' ? 'Narrador' : turn.role === 'USER' ? character?.name : 'Sistema'}
                        </div>
                      </div>
                      <p className="font-body text-parchment mt-2 leading-relaxed ink-reveal">
                        {turn.content}
                      </p>
                      {turn.imageUrl && (
                        <img
                          src={turn.imageUrl}
                          alt="Scene"
                          className="mt-4 rounded-lg w-full ink-reveal"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Placeholder para próxima implementación: input del jugador */}
                <div className="mt-6 p-4 border-2 border-dashed border-gold-dim/30 rounded-lg text-center glass-panel">
                  <p className="font-ui text-parchment/60 text-sm">
                    Próximamente: Aquí podrás escribir tus acciones y el DM responderá
                  </p>
                </div>
              </ParchmentPanel>
            </OrnateFrame>
          </div>

          {/* Panel lateral - Info del personaje */}
          <div className="space-y-4">
            <OrnateFrame variant="shadow">
              <ParchmentPanel>
                <h3 className="font-heading text-xl text-ink mb-4">Tu Personaje</h3>

                {character && (
                  <div className="space-y-3">
                    <div>
                      <p className="font-ui text-xs text-gold-dim uppercase tracking-wide">Nombre</p>
                      <p className="font-heading text-lg text-ink">{character.name}</p>
                    </div>

                    <div>
                      <p className="font-ui text-xs text-gold-dim uppercase tracking-wide">Arquetipo</p>
                      <p className="font-body text-stone">{character.archetype}</p>
                    </div>

                    <div className="pt-3 border-t border-gold-dim/30">
                      <p className="font-ui text-xs text-gold-dim uppercase tracking-wide mb-2">Estadísticas</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-ui text-gold-dim">Combate:</span>{' '}
                          <span className="font-heading text-ink">{(character.stats as any)?.combat || 1}</span>
                        </div>
                        <div>
                          <span className="font-ui text-gold-dim">Exploración:</span>{' '}
                          <span className="font-heading text-ink">{(character.stats as any)?.exploration || 1}</span>
                        </div>
                        <div>
                          <span className="font-ui text-gold-dim">Social:</span>{' '}
                          <span className="font-heading text-ink">{(character.stats as any)?.social || 1}</span>
                        </div>
                        <div>
                          <span className="font-ui text-gold-dim">Lore:</span>{' '}
                          <span className="font-heading text-ink">{(character.stats as any)?.lore || 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gold-dim/30">
                      <p className="font-ui text-xs text-gold-dim uppercase tracking-wide mb-2">Inventario</p>
                      <div className="space-y-1">
                        {(character.inventory as string[]).slice(0, 5).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 font-body text-stone text-xs">
                            <span className="text-gold-dim">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </ParchmentPanel>
            </OrnateFrame>

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
