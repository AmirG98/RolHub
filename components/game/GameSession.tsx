'use client'

import { useState, useRef, useEffect } from 'react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'

interface Turn {
  id: string
  role: 'USER' | 'DM' | 'SYSTEM'
  content: string
  imageUrl?: string | null
  createdAt: Date | string
}

interface Character {
  id: string
  name: string
  archetype: string
  level: number
  stats: any
}

interface GameSessionProps {
  sessionId: string
  campaignId: string
  campaignName: string
  lore: string
  engine: string
  mode: string
  initialTurns: Turn[]
  character: Character | null
  worldState: any
}

export default function GameSession({
  sessionId,
  campaignId,
  campaignName,
  lore,
  engine,
  mode,
  initialTurns,
  character,
  worldState: initialWorldState,
}: GameSessionProps) {
  const [turns, setTurns] = useState<Turn[]>(initialTurns)
  const [worldState, setWorldState] = useState(initialWorldState)
  const [action, setAction] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll cuando hay nuevos turnos
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!action.trim()) {
      setError('Debes escribir una acción')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Agregar turno del jugador inmediatamente (optimistic update)
    const playerTurn: Turn = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: action.trim(),
      createdAt: new Date().toISOString(),
    }
    setTurns(prev => [...prev, playerTurn])
    setAction('')

    try {
      const response = await fetch('/api/session/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          campaignId,
          action: action.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la acción')
      }

      // Agregar respuesta del DM
      const dmTurn: Turn = {
        id: `dm-${Date.now()}`,
        role: 'DM',
        content: data.narration,
        createdAt: new Date().toISOString(),
      }
      setTurns(prev => [...prev, dmTurn])

      // Actualizar world state si viene en la respuesta
      if (data.worldStateUpdates) {
        setWorldState((prev: any) => ({ ...prev, ...data.worldStateUpdates }))
      }
    } catch (err) {
      setError((err as Error).message)
      // Remover el turno optimista si falla
      setTurns(prev => prev.filter(t => t.id !== playerTurn.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestedActions = [
    'Examino el área en busca de peligros',
    'Intento hablar con alguien cercano',
    'Me muevo con cautela hacia adelante',
  ]

  return (
    <div className="min-h-screen particle-bg pb-4">
      {/* Header con información del personaje */}
      <div className="border-b border-gold-dim/30 glass-panel-dark p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Stack vertical */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-lg md:text-2xl text-gold-bright truncate">{campaignName}</h1>
              <p className="font-ui text-parchment text-xs md:text-sm truncate">
                {worldState.current_scene} • {worldState.time_in_world}
              </p>
            </div>

            {character && (
              <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                <div className="md:text-right">
                  <p className="font-heading text-sm md:text-lg text-parchment truncate max-w-[120px] md:max-w-none">{character.name}</p>
                  <p className="font-ui text-xs md:text-sm text-gold-dim">
                    {character.archetype} • Nv.{character.level}
                  </p>
                </div>
                <ParchmentPanel className="px-3 py-1.5 md:px-4 md:py-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="font-ui text-[10px] md:text-xs text-gold-dim">HP</span>
                    <span className="font-heading text-blood text-sm md:text-lg">
                      {worldState.party?.[character.name]?.hp ||
                        `${character.stats?.hp || 20}/${character.stats?.maxHp || 20}`}
                    </span>
                  </div>
                </ParchmentPanel>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-8 content-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Panel principal - Narración */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {/* NarratorPanel inline */}
            <OrnateFrame variant="gold">
              <ParchmentPanel variant="ornate" className="min-h-[300px] md:min-h-[400px] max-h-[50vh] md:max-h-[60vh]">
                <h2 className="font-title text-xl md:text-2xl text-ink text-center mb-3 md:mb-4">El Narrador</h2>

                <div ref={scrollRef} className="space-y-3 md:space-y-4 overflow-y-auto max-h-[calc(50vh-100px)] md:max-h-[calc(60vh-100px)] pr-1 md:pr-2">
                  {turns.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="font-body text-stone/60 italic">
                        La aventura está por comenzar...
                      </p>
                    </div>
                  ) : (
                    turns.map((turn) => (
                      <div
                        key={turn.id}
                        className={`p-3 md:p-4 rounded-lg glass-panel ${
                          turn.role === 'DM'
                            ? 'border-l-4 border-gold bg-gold/5'
                            : turn.role === 'USER'
                            ? 'border-l-4 border-emerald bg-emerald/5'
                            : 'border-l-4 border-gold-dim'
                        }`}
                      >
                        <div className="flex items-start gap-2 md:gap-3 mb-1.5 md:mb-2">
                          <div className="font-heading text-[10px] md:text-xs text-gold-dim uppercase tracking-wide">
                            {turn.role === 'DM'
                              ? '📖 Narrador'
                              : turn.role === 'USER'
                              ? '⚔️ Tú'
                              : '⚙️ Sistema'}
                          </div>
                        </div>
                        <p className="font-body text-sm md:text-base text-parchment leading-relaxed whitespace-pre-wrap">
                          {turn.content}
                        </p>
                        {turn.imageUrl && (
                          <img
                            src={turn.imageUrl}
                            alt="Scene"
                            className="mt-3 md:mt-4 rounded-lg w-full"
                          />
                        )}
                      </div>
                    ))
                  )}

                  {isSubmitting && (
                    <div className="p-4 rounded-lg glass-panel border-l-4 border-gold animate-pulse">
                      <div className="font-heading text-xs text-gold-dim uppercase tracking-wide mb-2">
                        📖 Narrador
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-gold rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className="w-2 h-2 bg-gold rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <span className="font-body text-parchment/60 ml-2">
                          El narrador está tejiendo la historia...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </ParchmentPanel>
            </OrnateFrame>

            {/* Action Input */}
            <ParchmentPanel variant="ornate">
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label htmlFor="action" className="font-heading text-ink text-base md:text-lg mb-1.5 md:mb-2 block">
                    ¿Qué haces?
                  </label>
                  <textarea
                    id="action"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Describe tu acción..."
                    className="w-full h-20 md:h-24 p-3 md:p-4 bg-parchment-dark/50 border-2 border-gold-dim/30 rounded-lg
                             font-body text-sm md:text-base text-ink placeholder:text-stone/50
                             focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20
                             disabled:opacity-50 disabled:cursor-not-allowed
                             resize-none"
                  />
                </div>

                {/* Acciones sugeridas */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {suggestedActions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAction(suggestion)}
                      disabled={isSubmitting}
                      className="px-2 md:px-3 py-1 text-xs md:text-sm font-ui text-gold-dim border border-gold-dim/30 rounded-full
                               hover:bg-gold/10 hover:border-gold transition-all disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="p-2 md:p-3 bg-blood/10 border border-blood/30 rounded-lg">
                    <p className="font-ui text-blood text-xs md:text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <RunicButton type="submit" disabled={isSubmitting || !action.trim()} variant="primary" className="text-sm md:text-base px-4 md:px-6">
                    {isSubmitting ? 'Enviando...' : 'Enviar →'}
                  </RunicButton>
                </div>
              </form>
            </ParchmentPanel>
          </div>

          {/* Panel lateral - Info del personaje - Colapsable en mobile */}
          <div className="space-y-3 md:space-y-4">
            {/* Mobile: Stats compactos en una fila */}
            <div className="lg:hidden">
              {character && character.stats && (
                <div className="glass-panel-dark rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm text-gold">{character.name}</span>
                      <span className="font-ui text-xs text-gold-dim">Nv.{character.level}</span>
                    </div>
                    <div className="flex gap-3 text-xs font-ui">
                      <div className="text-center">
                        <div className="text-parchment font-semibold">{character.stats.combat}</div>
                        <div className="text-gold-dim text-[10px]">COM</div>
                      </div>
                      <div className="text-center">
                        <div className="text-parchment font-semibold">{character.stats.exploration}</div>
                        <div className="text-gold-dim text-[10px]">EXP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-parchment font-semibold">{character.stats.social}</div>
                        <div className="text-gold-dim text-[10px]">SOC</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Panel completo */}
            <div className="hidden lg:block">
              {/* Character Stats */}
              {character && (
                <OrnateFrame variant="shadow">
                  <ParchmentPanel>
                    <h3 className="font-heading text-xl text-ink mb-4">{character.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-ui text-gold-dim">Arquetipo</span>
                        <span className="font-body text-stone">{character.archetype}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-ui text-gold-dim">Nivel</span>
                        <span className="font-body text-stone">{character.level}</span>
                      </div>
                      {character.stats && (
                        <>
                          <div className="border-t border-gold-dim/20 pt-3 mt-3">
                            <p className="font-ui text-xs text-gold-dim uppercase mb-2">Estadísticas</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-stone/60">Combate</span>
                                <span className="text-stone font-heading">{character.stats.combat}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone/60">Exploración</span>
                                <span className="text-stone font-heading">{character.stats.exploration}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone/60">Social</span>
                                <span className="text-stone font-heading">{character.stats.social}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone/60">Lore</span>
                                <span className="text-stone font-heading">{character.stats.lore}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </ParchmentPanel>
                </OrnateFrame>
              )}

              {/* Info de la campaña */}
              <OrnateFrame variant="shadow">
                <ParchmentPanel>
                  <h3 className="font-heading text-xl text-ink mb-4">Tu Aventura</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-ui text-gold-dim">Mundo</span>
                      <span className="font-body text-stone">{lore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-ui text-gold-dim">Modo</span>
                      <span className="font-body text-stone">{mode === 'CAMPAIGN' ? 'Campaña' : 'One-Shot'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-ui text-gold-dim">Sistema</span>
                      <span className="font-body text-stone">{engine.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-ui text-gold-dim">Acto</span>
                      <span className="font-body text-stone">{worldState.act || 1} / 5</span>
                    </div>
                  </div>
                </ParchmentPanel>
              </OrnateFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
