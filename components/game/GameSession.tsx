'use client'

import { useState, useRef, useEffect } from 'react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import { DiceRoller } from '@/components/medieval/DiceRoller'
import { ParticipantList } from '@/components/game/ParticipantList'
import { useSessionRealtime, broadcastTurn } from '@/hooks/useSessionRealtime'
import { useParticipantPresence } from '@/hooks/useParticipantPresence'
import { Sword, Shield, Map, MessageCircle, BookOpen, Heart, Backpack, Scroll, Dices, Users, Wifi, Crown } from 'lucide-react'
import DMPanel from '@/components/game/DMPanel'

interface Turn {
  id: string
  sessionId: string
  role: 'USER' | 'DM' | 'SYSTEM'
  content: string
  imageUrl?: string
  audioUrl?: string
  diceRoll?: { formula: string; result: number; rolls: number[] }
  diceRolls?: any
  activeEffects?: any
  worldStatePatch?: any
  createdAt: string
  // Multiplayer fields
  characterName?: string
  playerName?: string
  participantId?: string
  characterId?: string
}

interface Character {
  id: string
  name: string
  archetype: string
  level: number
  stats: any
  inventory?: string[]
}

interface Participant {
  id: string
  role: 'OWNER' | 'DM' | 'PLAYER' | 'SPECTATOR'
  isOnline: boolean
  user?: {
    id: string
    username: string
  }
  character?: {
    id: string
    name: string
    archetype: string
    hp?: string
  } | null
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
  // Multiplayer props
  isMultiplayer?: boolean
  initialParticipants?: Participant[]
  currentUserId?: string
  inviteCode?: string | null
  // DM mode props
  dmMode?: 'AI' | 'HUMAN'
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
  // Multiplayer props
  isMultiplayer = false,
  initialParticipants = [],
  currentUserId,
  inviteCode,
  // DM mode props
  dmMode = 'AI',
}: GameSessionProps) {
  const [localTurns, setLocalTurns] = useState<Turn[]>(initialTurns)
  const [worldState, setWorldState] = useState(initialWorldState)
  const [action, setAction] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [lastDiceRoll, setLastDiceRoll] = useState<{ formula: string; result: number; rolls: number[] } | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'quests' | 'party'>('stats')
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    'Examino el área en busca de peligros',
    'Intento hablar con alguien cercano',
    'Me muevo con cautela hacia adelante',
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Multiplayer hooks - only active when isMultiplayer is true
  const {
    turns: realtimeTurns,
    participants: realtimeParticipants,
    isConnected,
  } = useSessionRealtime(sessionId, campaignId)

  // Use realtime data when available in multiplayer, otherwise use local state
  const turns = isMultiplayer && realtimeTurns.length > 0 ? realtimeTurns : localTurns
  const participants = isMultiplayer && realtimeParticipants.length > 0 ? realtimeParticipants : initialParticipants

  // Presence tracking for multiplayer
  useParticipantPresence(campaignId, { enabled: isMultiplayer })

  // Check if current user is the DM (owner or has DM role)
  const currentParticipant = participants.find(p => p.user?.id === currentUserId)
  const isUserDM = isMultiplayer && dmMode === 'HUMAN' && (
    currentParticipant?.role === 'OWNER' || currentParticipant?.role === 'DM'
  )

  // State for showing DM panel
  const [showDMPanel, setShowDMPanel] = useState(false)

  // Parse current HP from worldState or character stats
  const getCurrentHP = () => {
    if (!character) return { current: 0, max: 0 }
    const partyHP = worldState.party?.[character.name]?.hp
    if (partyHP) {
      const [current, max] = partyHP.split('/').map(Number)
      return { current, max }
    }
    return {
      current: character.stats?.hp || 20,
      max: character.stats?.maxHp || 20
    }
  }

  const hp = getCurrentHP()
  const hpPercentage = (hp.current / hp.max) * 100
  const hpColor = hpPercentage > 60 ? 'bg-emerald' : hpPercentage > 30 ? 'bg-gold' : 'bg-blood'

  // Auto-scroll cuando hay nuevos turnos
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns])

  const handleDiceRoll = (result: { total: number; rolls: number[]; formula: string }) => {
    setLastDiceRoll({ formula: result.formula, result: result.total, rolls: result.rolls })
    setShowDiceRoller(false)
  }

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
      sessionId,
      role: 'USER',
      content: action.trim(),
      diceRoll: lastDiceRoll || undefined,
      createdAt: new Date().toISOString(),
      // Add multiplayer info
      characterName: character?.name,
      playerName: participants.find(p => p.user?.id === currentUserId)?.user?.username,
    }
    setLocalTurns(prev => [...prev, playerTurn])
    const submittedAction = action.trim()
    setAction('')
    const submittedDiceRoll = lastDiceRoll
    setLastDiceRoll(null)

    try {
      const response = await fetch('/api/session/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          campaignId,
          action: submittedAction,
          diceRoll: submittedDiceRoll,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la acción')
      }

      // Agregar respuesta del DM
      const dmTurn: Turn = {
        id: `dm-${Date.now()}`,
        sessionId,
        role: 'DM',
        content: data.narration,
        createdAt: new Date().toISOString(),
      }
      setLocalTurns(prev => [...prev, dmTurn])

      // Broadcast turns to other players in multiplayer
      if (isMultiplayer) {
        broadcastTurn(sessionId, playerTurn)
        broadcastTurn(sessionId, dmTurn)
      }

      // Actualizar world state si viene en la respuesta
      if (data.worldStateUpdates) {
        setWorldState((prev: any) => ({
          ...prev,
          ...data.worldStateUpdates,
          party: {
            ...prev.party,
            ...data.worldStateUpdates.party,
          },
        }))
      }

      // Actualizar acciones sugeridas si vienen
      if (data.suggestedActions && data.suggestedActions.length > 0) {
        setSuggestedActions(data.suggestedActions)
      }
    } catch (err) {
      setError((err as Error).message)
      // Remover el turno optimista si falla
      setLocalTurns(prev => prev.filter(t => t.id !== playerTurn.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen particle-bg pb-4">
      {/* Header con información del personaje */}
      <div className="border-b border-gold-dim/30 glass-panel-dark p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Stack vertical */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg md:text-2xl text-gold-bright truncate">{campaignName}</h1>
                {isMultiplayer && (
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                      isConnected ? 'bg-emerald/20 text-emerald' : 'bg-blood/20 text-blood'
                    }`}>
                      <Wifi className="w-3 h-3" />
                      {isConnected ? 'En vivo' : 'Desconectado'}
                    </div>
                    {isUserDM && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold">
                        <Crown className="w-3 h-3" />
                        DM
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="font-ui text-parchment text-xs md:text-sm truncate">
                {worldState.current_scene} • {worldState.time_in_world}
                {isMultiplayer && ` • ${participants.filter(p => p.isOnline).length} jugadores`}
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
                {/* HP Bar */}
                <div className="flex-shrink-0 min-w-[120px] md:min-w-[150px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-blood" />
                    <span className="font-heading text-blood text-sm md:text-lg">
                      {hp.current}/{hp.max}
                    </span>
                  </div>
                  <div className="h-2 bg-shadow rounded-full overflow-hidden border border-gold-dim/30">
                    <div
                      className={`h-full ${hpColor} transition-all duration-500`}
                      style={{ width: `${hpPercentage}%` }}
                    />
                  </div>
                </div>
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
                            {turn.role === 'DM' ? (
                              '📖 Narrador'
                            ) : turn.role === 'USER' ? (
                              isMultiplayer && turn.characterName ? (
                                <span>
                                  ⚔️ <span className="text-emerald">{turn.characterName}</span>
                                  {turn.playerName && (
                                    <span className="text-parchment/50 font-ui normal-case ml-1">
                                      ({turn.playerName})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                '⚔️ Tú'
                              )
                            ) : (
                              '⚙️ Sistema'
                            )}
                          </div>
                        </div>
                        <p className="font-body text-sm md:text-base text-parchment leading-relaxed whitespace-pre-wrap">
                          {turn.content}
                        </p>
                        {/* Show dice roll if present */}
                        {turn.diceRoll && (
                          <div className="mt-2 flex items-center gap-2 p-2 bg-gold/10 rounded-lg border border-gold/30">
                            <Dices className="w-4 h-4 text-gold" />
                            <span className="font-mono text-xs text-gold-dim">{turn.diceRoll.formula}</span>
                            <span className="font-heading text-gold-bright">→ {turn.diceRoll.result}</span>
                            <span className="text-xs text-parchment/60">({turn.diceRoll.rolls.join(', ')})</span>
                          </div>
                        )}
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

            {/* Dice Roller Modal */}
            {showDiceRoller && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                <div className="relative max-w-md w-full">
                  <button
                    onClick={() => setShowDiceRoller(false)}
                    className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-blood rounded-full flex items-center justify-center text-parchment hover:bg-blood/80"
                  >
                    ✕
                  </button>
                  <DiceRoller onRoll={handleDiceRoll} />
                </div>
              </div>
            )}

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

                {/* Show current dice roll if any */}
                {lastDiceRoll && (
                  <div className="flex items-center gap-2 p-2 bg-gold/10 rounded-lg border border-gold/30">
                    <Dices className="w-4 h-4 text-gold" />
                    <span className="font-mono text-sm text-gold-dim">{lastDiceRoll.formula}</span>
                    <span className="font-heading text-lg text-gold-bright">→ {lastDiceRoll.result}</span>
                    <button
                      type="button"
                      onClick={() => setLastDiceRoll(null)}
                      className="ml-auto text-xs text-blood hover:text-blood/80"
                    >
                      Descartar
                    </button>
                  </div>
                )}

                {/* Actions bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Dice roller button */}
                  <button
                    type="button"
                    onClick={() => setShowDiceRoller(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-ui text-gold border border-gold/50 rounded-lg
                             hover:bg-gold/10 hover:border-gold transition-all disabled:opacity-50"
                  >
                    <Dices className="w-4 h-4" />
                    Tirar Dados
                  </button>

                  {/* Suggested actions */}
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

            {/* DM Panel Toggle Button - Only for Human DMs */}
            {isUserDM && (
              <div className="mt-4">
                <button
                  onClick={() => setShowDMPanel(!showDMPanel)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-heading transition-all ${
                    showDMPanel
                      ? 'bg-gold/20 text-gold border-2 border-gold/50'
                      : 'bg-shadow/50 text-gold-dim border border-gold/30 hover:bg-gold/10 hover:text-gold'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  {showDMPanel ? 'Ocultar Panel DM' : 'Abrir Panel DM'}
                </button>
              </div>
            )}

            {/* DM Panel */}
            {isUserDM && showDMPanel && (
              <div className="mt-4">
                <DMPanel
                  sessionId={sessionId}
                  campaignId={campaignId}
                  worldState={worldState}
                  participants={participants}
                  onNarrationSent={() => {
                    // Refresh turns after DM sends narration
                  }}
                />
              </div>
            )}
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
            <div className="hidden lg:block space-y-4">
              {/* Tab navigation */}
              <div className="flex gap-1 p-1 bg-shadow/50 rounded-lg">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-ui text-sm transition-all ${
                    activeTab === 'stats' ? 'bg-gold/20 text-gold' : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Stats
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-ui text-sm transition-all ${
                    activeTab === 'inventory' ? 'bg-gold/20 text-gold' : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  <Backpack className="w-4 h-4" />
                  Inv
                </button>
                <button
                  onClick={() => setActiveTab('quests')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-ui text-sm transition-all ${
                    activeTab === 'quests' ? 'bg-gold/20 text-gold' : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  <Scroll className="w-4 h-4" />
                  Quests
                </button>
                {isMultiplayer && (
                  <button
                    onClick={() => setActiveTab('party')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-ui text-sm transition-all ${
                      activeTab === 'party' ? 'bg-gold/20 text-gold' : 'text-parchment/60 hover:text-parchment'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Grupo
                  </button>
                )}
              </div>

              {/* Tab content */}
              {activeTab === 'stats' && character && (
                <OrnateFrame variant="shadow">
                  <ParchmentPanel>
                    <h3 className="font-heading text-xl text-ink mb-4">{character.name}</h3>

                    {/* HP Bar in stats */}
                    <div className="mb-4 p-3 bg-shadow/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-blood" />
                          <span className="font-ui text-gold-dim">Puntos de Vida</span>
                        </div>
                        <span className="font-heading text-lg text-blood">{hp.current}/{hp.max}</span>
                      </div>
                      <div className="h-3 bg-shadow rounded-full overflow-hidden border border-gold-dim/30">
                        <div
                          className={`h-full ${hpColor} transition-all duration-500`}
                          style={{ width: `${hpPercentage}%` }}
                        />
                      </div>
                    </div>

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
                        <div className="border-t border-gold-dim/20 pt-3 mt-3">
                          <p className="font-ui text-xs text-gold-dim uppercase mb-3">Estadísticas</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Sword className="w-4 h-4 text-blood" />
                              <span className="text-stone/80 flex-1">Combate</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < character.stats.combat ? 'bg-blood' : 'bg-stone/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Map className="w-4 h-4 text-emerald" />
                              <span className="text-stone/80 flex-1">Exploración</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < character.stats.exploration ? 'bg-emerald' : 'bg-stone/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-gold" />
                              <span className="text-stone/80 flex-1">Social</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < character.stats.social ? 'bg-gold' : 'bg-stone/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-parchment" />
                              <span className="text-stone/80 flex-1">Lore</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < character.stats.lore ? 'bg-parchment' : 'bg-stone/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ParchmentPanel>
                </OrnateFrame>
              )}

              {activeTab === 'inventory' && (
                <OrnateFrame variant="shadow">
                  <ParchmentPanel>
                    <h3 className="font-heading text-xl text-ink mb-4">
                      <Backpack className="w-5 h-5 inline-block mr-2" />
                      Inventario
                    </h3>
                    <div className="space-y-2">
                      {(worldState.party?.[character?.name || '']?.inventory || character?.inventory || []).length > 0 ? (
                        (worldState.party?.[character?.name || '']?.inventory || character?.inventory || []).map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-shadow/20 rounded-lg">
                            <div className="w-8 h-8 bg-gold/10 rounded flex items-center justify-center text-gold">
                              📦
                            </div>
                            <span className="font-body text-stone text-sm">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone/60 italic text-center py-4">Tu bolsa está vacía</p>
                      )}
                    </div>
                  </ParchmentPanel>
                </OrnateFrame>
              )}

              {activeTab === 'quests' && (
                <OrnateFrame variant="shadow">
                  <ParchmentPanel>
                    <h3 className="font-heading text-xl text-ink mb-4">
                      <Scroll className="w-5 h-5 inline-block mr-2" />
                      Misiones
                    </h3>
                    <div className="space-y-3">
                      {/* Active quests */}
                      {(worldState.active_quests || []).length > 0 && (
                        <div>
                          <p className="font-ui text-xs text-gold uppercase mb-2 font-semibold">Activas</p>
                          {worldState.active_quests.map((quest: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-gold/20 rounded-lg mb-2 border border-gold/30">
                              <div className="w-2 h-2 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                              <span className="font-body text-ink text-sm font-medium">{quest}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Completed quests */}
                      {(worldState.completed_quests || []).length > 0 && (
                        <div>
                          <p className="font-ui text-xs text-emerald uppercase mb-2 font-semibold">Completadas</p>
                          {worldState.completed_quests.map((quest: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-emerald/20 rounded-lg mb-2 border border-emerald/30">
                              <div className="w-2 h-2 bg-emerald rounded-full mt-1.5 flex-shrink-0" />
                              <span className="font-body text-ink/70 text-sm line-through">{quest}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(worldState.active_quests || []).length === 0 && (worldState.completed_quests || []).length === 0 && (
                        <p className="text-ink/50 italic text-center py-4">Sin misiones activas</p>
                      )}
                    </div>
                  </ParchmentPanel>
                </OrnateFrame>
              )}

              {/* Party tab for multiplayer */}
              {activeTab === 'party' && isMultiplayer && (
                <ParticipantList
                  participants={participants}
                  currentUserId={currentUserId}
                  isMultiplayer={isMultiplayer}
                />
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
