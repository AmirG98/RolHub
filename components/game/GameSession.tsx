'use client'

import { useState, useRef, useEffect } from 'react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import { DiceRoller } from '@/components/medieval/DiceRoller'
import { ParticipantList } from '@/components/game/ParticipantList'
import { useSessionRealtime, broadcastTurn } from '@/hooks/useSessionRealtime'
import { useParticipantPresence } from '@/hooks/useParticipantPresence'
import { useLanguage, useTranslations } from '@/lib/i18n'
import { Sword, Shield, Map, MessageCircle, BookOpen, Heart, Backpack, Scroll, Dices, Users, Wifi, Crown, Cog } from 'lucide-react'
import DMPanel from '@/components/game/DMPanel'
import { EnginePanel } from '@/components/engines/EnginePanel'
import { GameMapPanel } from '@/components/game/GameMapPanel'
import { type Lore as LoreType } from '@/lib/maps/map-config'
import { VoicePlayerCompact, VoicePlayerAuto } from '@/components/game/VoicePlayer'
// import { DynamicMusicPlayer, useDynamicMusic } from '@/components/audio/DynamicMusicPlayer' // DISABLED
import { GameEngine, DiceRoll as EngineDiceRoll, Locale } from '@/lib/engines/types'
import { Lore } from '@prisma/client'

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
  const [activeTab, setActiveTab] = useState<'engine' | 'stats' | 'inventory' | 'quests' | 'party'>('engine')

  // i18n
  const { locale } = useLanguage()
  const t = useTranslations()

  // Voice feature flag - forzado a true para testing
  const isVoiceEnabled = true // process.env.NEXT_PUBLIC_ENABLE_VOICE === 'true'

  // Character name with fallback
  const characterName = character?.name || (locale === 'en' ? 'Traveler' : 'Viajero')

  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    locale === 'en' ? 'I examine the area for dangers' : 'Examino el área en busca de peligros',
    locale === 'en' ? 'I try to talk to someone nearby' : 'Intento hablar con alguien cercano',
    locale === 'en' ? 'I move cautiously forward' : 'Me muevo con cautela hacia adelante',
  ])

  // Track the latest DM turn ID for auto-playing voice
  const [latestDMTurnId, setLatestDMTurnId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Multiplayer hooks - only active when isMultiplayer is true
  const {
    turns: realtimeTurns,
    participants: realtimeParticipants,
    isConnected,
  } = useSessionRealtime(sessionId, campaignId, { enabled: isMultiplayer })

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

  // Dynamic music - DISABLED
  // const { onNarration } = useDynamicMusic()
  const onNarration = (_text: string) => {} // No-op

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

  // Handler for EnginePanel dice rolls
  const handleEngineDiceRoll = (roll: EngineDiceRoll) => {
    setLastDiceRoll({
      formula: roll.formula,
      result: roll.total + (roll.modifier || 0),
      rolls: roll.results
    })
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
          locale, // Pass language preference for DM narration
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la acción')
      }

      // Agregar respuesta del DM
      const dmTurnId = `dm-${Date.now()}`
      const dmTurn: Turn = {
        id: dmTurnId,
        sessionId,
        role: 'DM',
        content: data.narration,
        createdAt: new Date().toISOString(),
      }
      setLocalTurns(prev => [...prev, dmTurn])
      // Mark this as the latest DM turn for auto-play
      setLatestDMTurnId(dmTurnId)

      // Analizar narración para cambiar mood de la música
      onNarration(data.narration)

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
                  <p className="font-heading text-sm md:text-lg text-parchment truncate max-w-[120px] md:max-w-none">{characterName}</p>
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
      <div className="max-w-[1800px] mx-auto p-3 md:p-4 lg:p-6 content-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          {/* Panel principal - Narración (6/12 = 50%) */}
          <div className="lg:col-span-6 space-y-3 md:space-y-4">
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
                        <div className="flex items-center justify-between gap-2 md:gap-3 mb-1.5 md:mb-2">
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
                          {/* Voice player for DM narrations */}
                          {turn.role === 'DM' && isVoiceEnabled && (
                            turn.id === latestDMTurnId ? (
                              // Auto-play voice for the latest DM turn
                              <VoicePlayerAuto
                                key={`voice-auto-${turn.id}`}
                                text={turn.content}
                                lore={lore as Lore}
                                locale={locale as 'es' | 'en'}
                              />
                            ) : (
                              // Manual play for older turns
                              <VoicePlayerCompact
                                text={turn.content}
                                lore={lore as Lore}
                                locale={locale as 'es' | 'en'}
                              />
                            )
                          )}
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

          {/* Panel del Mapa (4/12 = 33%) */}
          <div className="lg:col-span-4 space-y-3 md:space-y-4 order-3 lg:order-2">
            <GameMapPanel
              lore={lore as LoreType}
              worldState={worldState}
              onTravelRequest={(actionText, toLocationId) => {
                // Establecer la acción de viaje como la acción actual
                setAction(actionText)
                // Opcionalmente enviar automáticamente
                // handleSubmit(new Event('submit') as any)
              }}
              onError={(message) => {
                setError(message)
                // Limpiar error después de 3 segundos
                setTimeout(() => setError(null), 3000)
              }}
              locale={locale as 'es' | 'en'}
            />
          </div>

          {/* Panel lateral compacto - Info del personaje (2/12 = 17%) */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4 order-2 lg:order-3">
            {/* Mobile: Stats compactos en una fila */}
            <div className="lg:hidden">
              {character && character.stats && (
                <div className="glass-panel-dark rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm text-gold">{characterName}</span>
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
                  onClick={() => setActiveTab('engine')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-ui text-sm transition-all ${
                    activeTab === 'engine' ? 'bg-gold/20 text-gold' : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  <Cog className="w-4 h-4" />
                  {locale === 'en' ? 'Engine' : 'Motor'}
                </button>
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
              {activeTab === 'engine' && character && (
                <OrnateFrame variant="shadow">
                  <div className="glass-panel-dark rounded-lg p-4 max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar">
                    <EnginePanel
                      engine={engine as GameEngine}
                      character={{
                        name: characterName,
                        archetype: character.archetype,
                        level: character.level,
                        stats: character.stats as Record<string, number>,
                        inventory: worldState.party?.[character.name]?.inventory || character.inventory || [],
                        conditions: worldState.party?.[character.name]?.conditions || [],
                        hp: hp.current,
                        maxHp: hp.max
                      }}
                      worldState={{
                        currentScene: worldState.current_scene,
                        activeQuests: worldState.active_quests,
                        weather: worldState.weather,
                        timeOfDay: worldState.time_in_world
                      }}
                      locale={locale as Locale}
                      onDiceRoll={handleEngineDiceRoll}
                      disabled={isSubmitting}
                    />
                  </div>
                </OrnateFrame>
              )}

              {activeTab === 'stats' && character && (
                <OrnateFrame variant="shadow">
                  <ParchmentPanel>
                    <h3 className="font-heading text-xl text-ink mb-4">{characterName}</h3>

                    {/* HP Bar in stats */}
                    <div className="mb-4 p-3 bg-ink/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-blood" />
                          <span className="font-ui text-ink/70">Puntos de Vida</span>
                        </div>
                        <span className="font-heading text-lg text-blood">{hp.current}/{hp.max}</span>
                      </div>
                      <div className="h-3 bg-ink/20 rounded-full overflow-hidden border border-ink/10">
                        <div
                          className={`h-full ${hpColor} transition-all duration-500`}
                          style={{ width: `${hpPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-ui text-ink/60">Arquetipo</span>
                        <span className="font-body text-ink">{character.archetype}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-ui text-ink/60">Nivel</span>
                        <span className="font-body text-ink">{character.level}</span>
                      </div>
                      {character.stats && (
                        <div className="border-t border-ink/10 pt-3 mt-3">
                          <p className="font-ui text-xs text-ink/60 uppercase mb-3">Estadísticas</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Sword className="w-4 h-4 text-blood" />
                              <span className="text-ink/80 flex-1">Combate</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < character.stats.combat ? 'bg-blood' : 'bg-ink/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Map className="w-4 h-4 text-emerald" />
                              <span className="text-ink/80 flex-1">Exploración</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < character.stats.exploration ? 'bg-emerald' : 'bg-ink/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-gold-dim" />
                              <span className="text-ink/80 flex-1">Social</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < character.stats.social ? 'bg-gold-dim' : 'bg-ink/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-stone" />
                              <span className="text-ink/80 flex-1">Lore</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < character.stats.lore ? 'bg-stone' : 'bg-ink/20'
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
                          <div key={i} className="flex items-center gap-2 p-2 bg-ink/10 rounded-lg">
                            <div className="w-8 h-8 bg-gold/20 rounded flex items-center justify-center text-gold-dim">
                              📦
                            </div>
                            <span className="font-body text-ink text-sm">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-ink/50 italic text-center py-4">Tu bolsa está vacía</p>
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
                      <span className="font-ui text-ink/60">Mundo</span>
                      <span className="font-body text-ink">{lore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-ui text-ink/60">Modo</span>
                      <span className="font-body text-ink">{mode === 'CAMPAIGN' ? 'Campaña' : 'One-Shot'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-ui text-ink/60">Sistema</span>
                      <span className="font-body text-ink">{engine.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-ui text-ink/60">Acto</span>
                      <span className="font-body text-ink">{worldState.act || 1} / 5</span>
                    </div>
                  </div>
                </ParchmentPanel>
              </OrnateFrame>
            </div>
          </div>
        </div>
      </div>

{/* Dynamic Music Player - Deshabilitado por ahora para no interferir con TTS
      <DynamicMusicPlayer
        initialMood="exploration"
        showMoodIndicator={true}
        position="bottom-right"
      />
      */}
    </div>
  )
}
