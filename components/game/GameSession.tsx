'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import { DiceRoller } from '@/components/medieval/DiceRoller'
import { ParticipantList } from '@/components/game/ParticipantList'
import { useSessionRealtime, broadcastTurn } from '@/hooks/useSessionRealtime'
import { useParticipantPresence } from '@/hooks/useParticipantPresence'
import { useLanguage, useTranslations } from '@/lib/i18n'
import { Sword, Shield, Map, MessageCircle, BookOpen, Heart, Backpack, Scroll, Dices, Users, Wifi, Crown, Cog, Swords } from 'lucide-react'
import DMPanel from '@/components/game/DMPanel'
import { EnginePanel } from '@/components/engines/EnginePanel'
import { GameMapPanel } from '@/components/game/GameMapPanel'
import { type Lore as LoreType } from '@/lib/maps/map-config'
import { VoicePlayerCompact, VoicePlayerAuto } from '@/components/game/VoicePlayer'
// import { DynamicMusicPlayer, useDynamicMusic } from '@/components/audio/DynamicMusicPlayer' // DISABLED
import { GameEngine, DiceRoll as EngineDiceRoll, Locale, CharacterContext } from '@/lib/engines/types'
import { Lore } from '@prisma/client'
// Immersion system
import { TypewriterText } from '@/components/ui/TypewriterText'
import { SceneTransition, useSceneTransition } from '@/components/ui/SceneTransition'
import { SceneImage } from '@/components/game/SceneImage'
import { type UIMood, getUIMood, getMoodConfig } from '@/lib/game/ui-mood'
// Combat system
import { TacticalCombatPanel } from '@/components/game/TacticalCombatPanel'
import { CombatState, CombatTrigger, DEFAULT_COMBAT_STATE, CombatActionRequest, CombatActionResponse } from '@/lib/types/combat-state'
import { initializeCombat, checkCombatEnd } from '@/lib/tactical/combat-init'
// Character stats panel and narrator mage
import { CharacterStatsPanel } from '@/components/game/CharacterStatsPanel'
import { NarratorMage, NarratorMageSimple } from '@/components/game/NarratorMage'

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
  avatarUrl?: string | null
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

  // Combat system state
  const [combatState, setCombatState] = useState<CombatState>(DEFAULT_COMBAT_STATE)
  const [combatTransitioning, setCombatTransitioning] = useState(false)

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

  // Immersion system state
  const [uiMood, setUiMood] = useState<UIMood>('exploration')
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [typewriterTurnId, setTypewriterTurnId] = useState<string | null>(null) // Track which turn is animating
  const { isTransitioning, triggerTransition, transitionProps } = useSceneTransition({ type: 'fade', duration: 600 })
  const isImagesEnabled = process.env.NEXT_PUBLIC_ENABLE_IMAGES === 'true'

  // DM Orb state - derived from other states
  const getDMOrbState = (): 'idle' | 'speaking' | 'thinking' | 'combat' => {
    if (combatState.inCombat) return 'combat'
    if (isSubmitting) return 'thinking'
    if (typewriterTurnId) return 'speaking'
    return 'idle'
  }

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

  // Parse current HP from worldState or character stats (moved up for combat handlers)
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

  // ============================================================================
  // COMBAT SYSTEM HANDLERS
  // ============================================================================

  // Initialize combat from a trigger
  const initiateCombat = useCallback((trigger: CombatTrigger) => {
    if (!character) return

    setCombatTransitioning(true)

    // Create character context for combat initialization
    const playerCharacter: CharacterContext = {
      name: character.name,
      archetype: character.archetype,
      level: character.level,
      stats: character.stats as Record<string, number>,
      inventory: worldState.party?.[character.name]?.inventory || character.inventory || [],
      conditions: worldState.party?.[character.name]?.conditions || [],
      hp: hp.current,
      maxHp: hp.max,
    }

    // Initialize combat with tactical map
    const newCombatState = initializeCombat({
      trigger,
      playerCharacters: [playerCharacter], // Single player for now
      gridType: 'square',
      cellSizeInFeet: 5,
    })

    // Short delay for transition effect
    setTimeout(() => {
      setCombatState(newCombatState)
      setUiMood('combat')
      setCombatTransitioning(false)
    }, 500)
  }, [character, worldState, hp])

  // Handle combat state updates
  const handleCombatUpdate = useCallback((newState: CombatState) => {
    setCombatState(newState)

    // Check if combat ended
    const checkedState = checkCombatEnd(newState)
    if (checkedState.result !== 'ongoing') {
      setCombatState(checkedState)
    }
  }, [])

  // Handle combat end
  const handleCombatEnd = useCallback((finalState: CombatState) => {
    setCombatTransitioning(true)

    // Add combat result to turns
    const resultText = finalState.result === 'victory'
      ? '¡Victoria! Has derrotado a todos los enemigos.'
      : finalState.result === 'defeat'
      ? 'Has caído en combate...'
      : finalState.result === 'fled'
      ? 'Has escapado del combate.'
      : 'Se ha acordado una tregua.'

    const systemTurn: Turn = {
      id: `combat-end-${Date.now()}`,
      sessionId,
      role: 'SYSTEM',
      content: `⚔️ ${resultText}`,
      createdAt: new Date().toISOString(),
    }
    setLocalTurns(prev => [...prev, systemTurn])

    // Update world state with combat results
    if (finalState.result === 'victory') {
      // Could add XP, loot, etc. here
    }

    // Reset combat state after short delay
    setTimeout(() => {
      setCombatState(DEFAULT_COMBAT_STATE)
      setUiMood('exploration')
      setCombatTransitioning(false)
    }, 1000)
  }, [sessionId])

  // Handle combat action (called from TacticalCombatPanel)
  const handleCombatAction = useCallback(async (request: CombatActionRequest): Promise<CombatActionResponse> => {
    // In the future, this could call the DM API for action resolution
    // For now, return a basic response
    return {
      success: true,
      narration: `${request.action} ejecutado`,
      combatLog: {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        round: combatState.roundNumber,
        tokenId: request.tokenId,
        tokenName: combatState.tacticalMap?.tokens.find(t => t.id === request.tokenId)?.name || 'Unknown',
        actionType: request.action,
        description: `Acción ${request.action}`,
        success: true,
      },
    }
  }, [combatState])

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

      // Check for combat trigger from DM
      if (data.combat_trigger) {
        initiateCombat(data.combat_trigger as CombatTrigger)
      }

      // === IMMERSION SYSTEM ===
      // Set typewriter animation for this turn
      setTypewriterTurnId(dmTurnId)

      // Update UI mood
      if (data.moodHint) {
        setUiMood(data.moodHint as UIMood)
      } else {
        // Derive mood from world state lock reason
        const lockReason = data.worldStateUpdates?.map_state?.lockReason || worldState.map_state?.lockReason
        setUiMood(getUIMood(lockReason, data.narration))
      }

      // Trigger scene transition if scene changed
      if (data.sceneChange) {
        triggerTransition(() => {
          // This runs at the midpoint of the transition
        })
      }

      // Generate scene image if requested (via API)
      if (data.generateImage && data.imagePrompt && isImagesEnabled) {
        setIsImageLoading(true)
        setImageError(null)

        try {
          const imgResponse = await fetch('/api/session/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: data.imagePrompt,
              lore: lore,
              mood: data.moodHint || uiMood,
              locationName: data.worldStateUpdates?.current_scene || worldState.current_scene,
            }),
          })

          const imgData = await imgResponse.json()

          if (imgData.success && imgData.url) {
            setSceneImageUrl(imgData.url)
          }
        } catch (imgError) {
          console.error('Failed to generate scene image:', imgError)
          setImageError('La visión se desvanece...')
        } finally {
          setIsImageLoading(false)
        }
      }
      // === END IMMERSION SYSTEM ===
    } catch (err) {
      setError((err as Error).message)
      // Remover el turno optimista si falla
      setLocalTurns(prev => prev.filter(t => t.id !== playerTurn.id))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get mood config for styling
  const moodConfig = getMoodConfig(uiMood)

  // ============================================================================
  // COMBAT VIEW
  // ============================================================================
  if (combatState.inCombat && combatState.tacticalMap) {
    return (
      <div className="min-h-screen bg-shadow flex flex-col">
        {/* Combat transition overlay */}
        {combatTransitioning && (
          <div className="fixed inset-0 bg-blood/50 z-50 flex items-center justify-center">
            <div className="text-center">
              <Swords className="w-16 h-16 text-gold animate-pulse mx-auto mb-4" />
              <h2 className="font-heading text-2xl text-gold">¡Combate!</h2>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 glass-panel-dark border-b border-blood/30">
          <div className="flex items-center gap-3">
            <Swords className="w-5 h-5 text-blood" />
            <span className="font-heading text-gold">{campaignName}</span>
          </div>
          {character && (
            <div className="flex items-center gap-3">
              <span className="font-ui text-parchment text-sm">{character.name}</span>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-blood" />
                <span className="font-heading text-sm text-parchment">
                  {hp.current}/{hp.max}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tactical Combat Panel */}
        <div className="flex-1">
          <TacticalCombatPanel
            combatState={combatState}
            playerCharacters={character ? [{
              name: character.name,
              archetype: character.archetype,
              level: character.level,
              stats: character.stats as Record<string, number>,
              inventory: character.inventory || [],
              conditions: [],
              hp: hp.current,
              maxHp: hp.max,
            }] : []}
            sessionId={sessionId}
            onCombatUpdate={handleCombatUpdate}
            onCombatEnd={handleCombatEnd}
            onCombatAction={handleCombatAction}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // NORMAL VIEW (Exploration, etc.)
  // ============================================================================
  return (
    <div className={`min-h-screen particle-bg pb-4 ${moodConfig.cssClass}`}>
      {/* Combat transition overlay */}
      {combatTransitioning && (
        <div className="fixed inset-0 bg-blood/50 z-50 flex items-center justify-center">
          <div className="text-center">
            <Swords className="w-16 h-16 text-gold animate-pulse mx-auto mb-4" />
            <h2 className="font-heading text-2xl text-gold">¡Combate!</h2>
          </div>
        </div>
      )}

      {/* Scene Transition Overlay */}
      <SceneTransition {...transitionProps} />

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

      {/* Barra horizontal de stats/acciones rápidas */}
      <div className="border-b border-gold-dim/20 glass-panel-dark">
        <div className="max-w-[1800px] mx-auto px-3 md:px-4 lg:px-6 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Tab buttons - ahora horizontales */}
            <button
              onClick={() => setActiveTab('engine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all ${
                activeTab === 'engine' ? 'bg-gold/20 text-gold border border-gold/40' : 'text-parchment/60 hover:text-parchment hover:bg-white/5'
              }`}
            >
              <Cog className="w-3.5 h-3.5" />
              {locale === 'en' ? 'Engine' : 'Motor'}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all ${
                activeTab === 'stats' ? 'bg-gold/20 text-gold border border-gold/40' : 'text-parchment/60 hover:text-parchment hover:bg-white/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all ${
                activeTab === 'inventory' ? 'bg-gold/20 text-gold border border-gold/40' : 'text-parchment/60 hover:text-parchment hover:bg-white/5'
              }`}
            >
              <Backpack className="w-3.5 h-3.5" />
              Inv
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all ${
                activeTab === 'quests' ? 'bg-gold/20 text-gold border border-gold/40' : 'text-parchment/60 hover:text-parchment hover:bg-white/5'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              Quests
            </button>
            {isMultiplayer && (
              <button
                onClick={() => setActiveTab('party')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all ${
                  activeTab === 'party' ? 'bg-gold/20 text-gold border border-gold/40' : 'text-parchment/60 hover:text-parchment hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Grupo
              </button>
            )}

            {/* Separador */}
            <div className="w-px h-6 bg-gold-dim/30 mx-1" />

            {/* Quick stats display */}
            {character && character.stats && (
              <>
                <div className="flex items-center gap-1 px-2 py-1 bg-blood/10 rounded text-xs">
                  <Sword className="w-3 h-3 text-blood" />
                  <span className="text-parchment font-semibold">{character.stats.combat}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald/10 rounded text-xs">
                  <Map className="w-3 h-3 text-emerald" />
                  <span className="text-parchment font-semibold">{character.stats.exploration}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-gold/10 rounded text-xs">
                  <MessageCircle className="w-3 h-3 text-gold" />
                  <span className="text-parchment font-semibold">{character.stats.social}</span>
                </div>
              </>
            )}

            {/* Dice roller button */}
            <button
              onClick={() => setShowDiceRoller(true)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-auto text-xs font-ui text-gold border border-gold/40 rounded-lg
                       hover:bg-gold/10 transition-all disabled:opacity-50"
            >
              <Dices className="w-3.5 h-3.5" />
              Dados
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor principal - 2 columnas */}
      <div className="max-w-[1800px] mx-auto p-3 md:p-4 lg:p-6 content-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          {/* Panel izquierdo - Narración (8/12) */}
          <div className="lg:col-span-8 space-y-3 md:space-y-4">

            {/* NarratorPanel inline */}
            <OrnateFrame variant="gold">
              <ParchmentPanel variant="ornate" className="min-h-[400px] md:min-h-[500px] max-h-[60vh] md:max-h-[70vh]">
                {/* Header with Narrator Mage */}
                <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
                  {/* Hooded Mage - visible on larger screens */}
                  <div className="hidden md:block">
                    <NarratorMage state={getDMOrbState()} size={80} />
                  </div>
                  {/* Simple mage for mobile */}
                  <div className="md:hidden">
                    <NarratorMageSimple state={getDMOrbState()} size={50} />
                  </div>
                  <h2 className="font-title text-xl md:text-2xl text-ink">El Narrador</h2>
                </div>

                <div ref={scrollRef} className="space-y-3 md:space-y-4 overflow-y-auto max-h-[calc(60vh-100px)] md:max-h-[calc(70vh-100px)] pr-1 md:pr-2">
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
                        className={`p-3 md:p-4 rounded-lg glass-panel transition-all duration-300 ${
                          turn.role === 'DM'
                            ? `border-l-4 ${turn.id === typewriterTurnId ? moodConfig.borderClass : 'border-gold'} bg-gold/5 ${turn.id === typewriterTurnId ? moodConfig.glowClass : ''}`
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
                        {/* DM narrations use typewriter for latest turn */}
                        {turn.role === 'DM' && turn.id === typewriterTurnId ? (
                          <TypewriterText
                            text={turn.content}
                            variant="narration"
                            speed={25}
                            onComplete={() => setTypewriterTurnId(null)}
                            skipOnClick={true}
                            className="text-base md:text-lg"
                          />
                        ) : (
                          <p className="font-body text-base md:text-lg text-parchment leading-relaxed whitespace-pre-wrap">
                            {turn.content}
                          </p>
                        )}
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

                {/* Suggested actions */}
                <div className="flex flex-wrap items-center gap-2">
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

            {/* Character Stats Panel - below action input */}
            {character && (
              <CharacterStatsPanel
                name={characterName}
                archetype={character.archetype}
                avatarUrl={character.avatarUrl || undefined}
                engine={engine as GameEngine}
                stats={{
                  hp: hp.current,
                  maxHp: hp.max,
                  level: character.level,
                  experience: worldState.party?.[character.name]?.experience || 0,
                  // Story Mode stats
                  combat: character.stats?.combat,
                  exploration: character.stats?.exploration,
                  social: character.stats?.social,
                  knowledge: character.stats?.knowledge || character.stats?.lore,
                  // D&D 5e stats
                  ac: character.stats?.ac,
                  STR: character.stats?.STR,
                  DEX: character.stats?.DEX,
                  CON: character.stats?.CON,
                  INT: character.stats?.INT,
                  WIS: character.stats?.WIS,
                  CHA: character.stats?.CHA,
                  proficiencyBonus: character.stats?.proficiencyBonus,
                  speed: character.stats?.speed,
                  className: character.stats?.className,
                  raceName: character.stats?.raceName,
                }}
                conditions={worldState.party?.[character.name]?.conditions || []}
              />
            )}

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

          {/* Panel derecho - Mapa + Imagen de escena (4/12) */}
          <div className="lg:col-span-4 space-y-3 md:space-y-4 order-1 lg:order-2">
            {/* Mapa */}
            <GameMapPanel
              lore={lore as LoreType}
              worldState={worldState}
              onTravelRequest={(actionText, toLocationId) => {
                setAction(actionText)
              }}
              onError={(message) => {
                setError(message)
                setTimeout(() => setError(null), 3000)
              }}
              locale={locale as 'es' | 'en'}
            />

            {/* Imagen de escena - debajo del mapa */}
            {(sceneImageUrl || isImageLoading) && (
              <div className={`rounded-lg overflow-hidden border ${moodConfig.borderClass} transition-all duration-500`}>
                <SceneImage
                  imageUrl={sceneImageUrl}
                  isLoading={isImageLoading}
                  lore={lore as LoreType}
                  error={imageError}
                  onRetry={async () => {
                    setImageError(null)
                  }}
                  aspectRatio="16:9"
                  showFullscreenButton={true}
                />
              </div>
            )}

            {/* Panel de contenido expandido cuando se selecciona un tab */}
            {activeTab !== 'engine' && (
              <div className="glass-panel-dark rounded-lg p-4 border border-gold-dim/20">
                {activeTab === 'stats' && character && (
                  <div>
                    <h3 className="font-heading text-lg text-gold mb-3">{characterName}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-ui text-parchment/60">Arquetipo</span>
                        <p className="font-body text-parchment">{character.archetype}</p>
                      </div>
                      <div>
                        <span className="font-ui text-parchment/60">Nivel</span>
                        <p className="font-body text-parchment">{character.level}</p>
                      </div>
                    </div>
                    {character.stats && (
                      <div className="mt-3 pt-3 border-t border-gold-dim/20">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center p-2 bg-blood/10 rounded">
                            <Sword className="w-4 h-4 text-blood mx-auto mb-1" />
                            <span className="text-xs text-parchment">{character.stats.combat}</span>
                          </div>
                          <div className="text-center p-2 bg-emerald/10 rounded">
                            <Map className="w-4 h-4 text-emerald mx-auto mb-1" />
                            <span className="text-xs text-parchment">{character.stats.exploration}</span>
                          </div>
                          <div className="text-center p-2 bg-gold/10 rounded">
                            <MessageCircle className="w-4 h-4 text-gold mx-auto mb-1" />
                            <span className="text-xs text-parchment">{character.stats.social}</span>
                          </div>
                          <div className="text-center p-2 bg-stone/20 rounded">
                            <BookOpen className="w-4 h-4 text-stone mx-auto mb-1" />
                            <span className="text-xs text-parchment">{character.stats.lore}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div>
                    <h3 className="font-heading text-lg text-gold mb-3">
                      <Backpack className="w-4 h-4 inline-block mr-2" />
                      Inventario
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {(worldState.party?.[character?.name || '']?.inventory || character?.inventory || []).length > 0 ? (
                        (worldState.party?.[character?.name || '']?.inventory || character?.inventory || []).map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                            <span className="text-gold-dim">📦</span>
                            <span className="font-body text-parchment text-sm">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-parchment/50 italic text-center py-2">Tu bolsa está vacía</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'quests' && (
                  <div>
                    <h3 className="font-heading text-lg text-gold mb-3">
                      <Scroll className="w-4 h-4 inline-block mr-2" />
                      Misiones
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {(worldState.active_quests || []).map((quest: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-gold/10 rounded border border-gold/20">
                          <div className="w-2 h-2 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                          <span className="font-body text-parchment text-sm">{quest}</span>
                        </div>
                      ))}
                      {(worldState.completed_quests || []).map((quest: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-emerald/10 rounded border border-emerald/20">
                          <div className="w-2 h-2 bg-emerald rounded-full mt-1.5 flex-shrink-0" />
                          <span className="font-body text-parchment/60 text-sm line-through">{quest}</span>
                        </div>
                      ))}
                      {(worldState.active_quests || []).length === 0 && (worldState.completed_quests || []).length === 0 && (
                        <p className="text-parchment/50 italic text-center py-2">Sin misiones activas</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'party' && isMultiplayer && (
                  <ParticipantList
                    participants={participants}
                    currentUserId={currentUserId}
                    isMultiplayer={isMultiplayer}
                  />
                )}
              </div>
            )}

            {/* Engine Panel - se muestra cuando está activo */}
            {activeTab === 'engine' && character && (
              <OrnateFrame variant="shadow">
                <div className="glass-panel-dark rounded-lg p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
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
