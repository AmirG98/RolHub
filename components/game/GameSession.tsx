'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { DiceRoller } from '@/components/medieval/DiceRoller'
import { ActionInputWithVoice } from '@/components/game/ActionInputWithVoice'
import { MissionSelector } from '@/components/game/MissionSelector'
import { ParticipantList } from '@/components/game/ParticipantList'
import { useSessionRealtime, broadcastTurn } from '@/hooks/useSessionRealtime'
import { useParticipantPresence } from '@/hooks/useParticipantPresence'
import { useLanguage, useTranslations } from '@/lib/i18n'
import { BookOpen, Heart, Scroll, Dices, Users, Wifi, Crown, Swords, MessageSquare } from 'lucide-react'
import DMPanel from '@/components/game/DMPanel'
import { GameMapPanel } from '@/components/game/GameMapPanel'
import { InventoryPanel } from '@/components/game/InventoryPanel'
import { type Lore as LoreType } from '@/lib/maps/map-config'
import { VoicePlayerCompact, VoicePlayerAuto } from '@/components/game/VoicePlayer'
// import { DynamicMusicPlayer, useDynamicMusic } from '@/components/audio/DynamicMusicPlayer' // DISABLED
import { GameEngine } from '@/lib/engines/types'
import { Lore } from '@prisma/client'
// Immersion system
import { TypewriterText } from '@/components/ui/TypewriterText'
import { SceneTransition, useSceneTransition } from '@/components/ui/SceneTransition'
import { SceneImage } from '@/components/game/SceneImage'
import { useAmbientSound } from '@/hooks/useAmbientSound'
import { type UIMood, getUIMood, getMoodConfig } from '@/lib/game/ui-mood'
// Combat system (simplified — narrative combat, no tactical grid)
import { CombatState, CombatTrigger, DEFAULT_COMBAT_STATE } from '@/lib/types/combat-state'
// Character stats panel and narrator orb
import { CharacterStatsPanel } from '@/components/game/CharacterStatsPanel'
import { PortraitSplash } from '@/components/game/PortraitSplash'
import { StatsBarSummary, StoryModeStatsBar } from '@/components/game/StatsBarSummary'
import { DnD5eCharacterSheet } from '@/components/game/DnD5eCharacterSheet'
import {
  GameNotifications,
  type GameNotificationData,
  createItemNotification,
  createRemoveItemNotification,
  createQuestNotification,
  createQuestCompletedNotification,
  createXPNotification,
  createLevelUpNotification,
} from '@/components/game/GameNotification'
import { DeathSaveTracker } from '@/components/game/DeathSaveTracker'
import { LevelUpModal } from '@/components/game/LevelUpModal'
import { GameTutorialTour } from '@/components/game/GameTutorialTour'
import dynamic from 'next/dynamic'

// Dynamic import for 3D orb (SSR-safe)
const NarratorOrb3D = dynamic(
  () => import('@/components/game/NarratorOrb3D').then(mod => mod.NarratorOrb3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-20 h-20 rounded-full animate-pulse bg-gradient-to-br from-gold/30 to-gold/10" />
    )
  }
)

const NarratorOrbSimple = dynamic(
  () => import('@/components/game/NarratorOrb3D').then(mod => mod.NarratorOrbSimple),
  {
    ssr: false,
    loading: () => (
      <div className="w-12 h-12 rounded-full animate-pulse bg-gradient-to-br from-gold/30 to-gold/10" />
    )
  }
)

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [showDamageHalo, setShowDamageHalo] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [pendingLevelUp, setPendingLevelUp] = useState<{
    newLevel: number; hpIncrease: number; statOptions: string[]; statBonus: number
  } | null>(initialWorldState?.pendingLevelUp ? {
    newLevel: initialWorldState.pendingLevelUp.newLevel,
    hpIncrease: initialWorldState.pendingLevelUp.hpIncrease,
    statOptions: initialWorldState.pendingLevelUp.statOptions,
    statBonus: initialWorldState.pendingLevelUp.statBonus,
  } : null)
  const damageHaloTimeout = useRef<NodeJS.Timeout | null>(null)
  const [lastDiceRoll, setLastDiceRoll] = useState<{ formula: string; result: number; rolls: number[] } | null>(null)
  // Notificaciones de items/misiones
  const [notifications, setNotifications] = useState<GameNotificationData[]>([])
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  // DM-prompted dice roll request
  const [pendingDiceRequest, setPendingDiceRequest] = useState<{
    reason: string
    formula: string
    type: string
    difficulty?: number
    stat?: string
    on_success?: string
    on_failure?: string
  } | null>(null)
  // Scroll helpers for quick navigation
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Character sheet and portrait state
  const [showPortraitSplash, setShowPortraitSplash] = useState(false)
  const [isCharacterSheetExpanded, setIsCharacterSheetExpanded] = useState(false)

  // Combat system state
  const [combatState, setCombatState] = useState<CombatState>(DEFAULT_COMBAT_STATE)

  // Exit dialog
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [pendingExitUrl, setPendingExitUrl] = useState<string | null>(null)

  // Interceptar TODAS las formas de salir de la partida
  useEffect(() => {
    // 1. Cierre de pestaña / refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    // 2. Clicks en links (Navbar, etc.) — interceptar navegación client-side
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return
      // No interceptar links dentro del juego (acciones, dados, etc.)
      if (href.includes('/play/')) return
      // Interceptar navegación fuera del juego
      e.preventDefault()
      e.stopPropagation()
      setPendingExitUrl(href)
      setShowExitDialog(true)
    }

    // 3. Browser back button
    const handlePopState = () => {
      // Pushear el state de vuelta para evitar la navegación
      window.history.pushState(null, '', window.location.href)
      setShowExitDialog(true)
    }

    // Pushear un state extra para poder interceptar el back button
    window.history.pushState(null, '', window.location.href)

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleLinkClick, true) // capture phase
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleLinkClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // i18n
  const { locale } = useLanguage()
  const t = useTranslations()

  // Voice feature flag - forzado a true para testing
  const isVoiceEnabled = true // process.env.NEXT_PUBLIC_ENABLE_VOICE === 'true'

  // Character name with fallback
  const characterName = character?.name || (locale === 'en' ? 'Traveler' : 'Viajero')

  const [prefillAction, setPrefillAction] = useState<string | null>(null)
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    locale === 'en' ? 'I examine the area for dangers' : 'Examino el área en busca de peligros',
    locale === 'en' ? 'I try to talk to someone nearby' : 'Intento hablar con alguien cercano',
    locale === 'en' ? 'I move cautiously forward' : 'Me muevo con cautela hacia adelante',
  ])

  // Track the latest DM turn ID for auto-playing voice
  const [latestDMTurnId, setLatestDMTurnId] = useState<string | null>(null)
  // Voces de NPC simplificadas — sin cache, solo detección de género determinística
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastScrollTime = useRef(0)
  const handleTypewriterScroll = useCallback(() => {
    const now = Date.now()
    if (now - lastScrollTime.current > 150 && scrollRef.current) {
      // Solo auto-scroll si el usuario está cerca del fondo (no si scrolleó hacia arriba)
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150
      if (isNearBottom) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
      lastScrollTime.current = now
    }
  }, [])

  // Immersion system state
  const [uiMood, setUiMood] = useState<UIMood>('exploration')
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(initialWorldState?.last_scene_image || null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [typewriterTurnId, setTypewriterTurnId] = useState<string | null>(null) // Track which turn is animating
  const { isTransitioning, triggerTransition, transitionProps } = useSceneTransition({ type: 'fade', duration: 600 })

  // Sonido ambiental — se reproduce en loop a bajo volumen según mood y escena
  const { setAmbientVolume, setPlaybackRate } = useAmbientSound({
    lore: lore as string,
    mood: uiMood,
    scene: worldState.current_scene || '',
    enabled: isVoiceEnabled,
    volume: 0.18,
  })
  const isImagesEnabled = process.env.NEXT_PUBLIC_ENABLE_IMAGES === 'true'

  // Acelerar música en combate
  useEffect(() => {
    setPlaybackRate(uiMood === 'combat' ? 1.15 : 1.0)
  }, [uiMood, setPlaybackRate])

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

  // Death system state
  const characterConditions: string[] = worldState.party?.[character?.name || '']?.conditions || []
  const characterDeathSaves = worldState.party?.[character?.name || '']?.deathSaves
  const isUnconscious = characterConditions.includes('inconsciente')
  const isDead = characterConditions.includes('muerto')

  // ============================================================================
  // COMBAT SYSTEM HANDLERS
  // ============================================================================

  // Initialize combat from a trigger — simplified narrative combat (no tactical grid)
  const initiateCombat = useCallback((trigger: CombatTrigger) => {
    setCombatState({
      ...DEFAULT_COMBAT_STATE,
      inCombat: true,
      enemies: trigger.enemies?.map(e => ({
        name: e.name,
        type: e.type,
        hp: e.hp || 10,
        maxHp: e.hp || 10,
        count: e.count || 1,
      })) || [],
      result: 'ongoing',
    })
    setUiMood('combat')
    setSuggestedActions([
      locale === 'en' ? 'Attack the nearest enemy' : 'Atacar al enemigo más cercano',
      locale === 'en' ? 'Defend and prepare' : 'Defenderse y prepararse',
      locale === 'en' ? 'Try to flee' : 'Intentar huir del combate',
      locale === 'en' ? 'Use an item' : 'Usar un item del inventario',
    ])
  }, [locale])

  // Combat is now handled narratively — no separate handlers needed
  // The DM narrates combat actions and results through the normal turn system

  // Auto-scroll cuando hay nuevos turnos (no en carga inicial)
  const initialTurnCount = useRef(turns.length)
  useEffect(() => {
    if (scrollRef.current && turns.length > initialTurnCount.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns])

  // Portrait splash on session start
  useEffect(() => {
    if (character?.avatarUrl && sessionId) {
      const splashKey = `portrait_splash_${sessionId}`
      if (!sessionStorage.getItem(splashKey)) {
        setShowPortraitSplash(true)
        sessionStorage.setItem(splashKey, 'shown')
      }
    }
  }, [character?.avatarUrl, sessionId])

  // Tutorial: mostrar solo la primera vez
  useEffect(() => {
    const done = localStorage.getItem('rolhub-tutorial-done')
    if (!done) {
      // Delay para que el DOM se renderice completamente
      setTimeout(() => setShowTutorial(true), 1500)
    }
  }, [])

  const completeTutorial = useCallback(() => {
    setShowTutorial(false)
    localStorage.setItem('rolhub-tutorial-done', 'true')
  }, [])

  // Load persisted UI state from worldState + initial turns
  useEffect(() => {
    // Cargar suggested_actions persistidas en worldState (sobreviven recargas)
    if (initialWorldState.last_suggested_actions?.length > 0) {
      setSuggestedActions(initialWorldState.last_suggested_actions)
    } else if (initialTurns.length > 0) {
      const firstTurn = initialTurns[0]
      if (firstTurn.diceRolls?.suggested_actions && Array.isArray(firstTurn.diceRolls.suggested_actions)) {
        setSuggestedActions(firstTurn.diceRolls.suggested_actions)
      }
    }

    // Cargar imagen de escena persistida en worldState
    if (initialWorldState.last_scene_image) {
      setSceneImageUrl(initialWorldState.last_scene_image)
    } else if (initialTurns.length > 0) {
      const firstDMTurn = initialTurns.find(t => t.role === 'DM')
      if (firstDMTurn?.imageUrl) {
        setSceneImageUrl(firstDMTurn.imageUrl)
      }
    }

    // Auto-play voice + typewriter for the latest DM turn when session loads
    if (initialTurns.length > 0) {
      const lastDMTurn = [...initialTurns].reverse().find(t => t.role === 'DM')
      if (lastDMTurn && initialTurns.length <= 2) {
        setLatestDMTurnId(lastDMTurn.id)
        setTypewriterTurnId(lastDMTurn.id)
      }
    }
  }, [initialTurns])

  // Detect if we're in mission selection mode (first turn with mission options)
  const isMissionSelectionMode = turns.length <= 1 &&
    suggestedActions.some(a => a.startsWith('Elegir:'))

  const handleDiceRoll = (result: { total: number; rolls: number[]; formula: string }) => {
    const rollData = { formula: result.formula, result: result.total, rolls: result.rolls }
    setLastDiceRoll(rollData)
    setShowDiceRoller(false)

    // Si hay un dice request pendiente del DM, auto-enviar el resultado
    if (pendingDiceRequest) {
      const rollDescription = pendingDiceRequest.reason || 'Tirada de dados'
      setPendingDiceRequest(null)
      // Pequeño delay para que el jugador vea el resultado
      setTimeout(() => {
        setLastDiceRoll(rollData) // Asegurar que se envía con la acción
        handleSubmit(`[Tirada: ${result.formula} = ${result.total}] ${rollDescription}`, 'do')
      }, 800)
    }
  }

  const handleSubmit = async (action: string, actionType: 'do' | 'talk' = 'talk') => {
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
          actionType, // 'do' for physical actions, 'talk' for dialogue
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
          // Deep merge per character to avoid losing HP/conditions when only inventory changes
          party: Object.keys(data.worldStateUpdates.party || {}).reduce((merged: any, charName: string) => {
            merged[charName] = { ...(merged[charName] || {}), ...data.worldStateUpdates.party[charName] }
            return merged
          }, { ...(prev.party || {}) }),
        }))
      }

      // Voces de NPC: no necesita cache — getNPCVoice es determinístico por género

      // Halo rojo al recibir daño
      if (data.worldStateUpdates?.party && character) {
        const newHP = data.worldStateUpdates.party[character.name]?.hp
        if (newHP) {
          const [newCurrent] = String(newHP).split('/').map(Number)
          const [oldCurrent] = String(worldState.party?.[character.name]?.hp || '0/0').split('/').map(Number)
          if (newCurrent < oldCurrent) {
            if (damageHaloTimeout.current) clearTimeout(damageHaloTimeout.current)
            setShowDamageHalo(true)
            damageHaloTimeout.current = setTimeout(() => setShowDamageHalo(false), 3000)
          } else if (newCurrent > oldCurrent) {
            setShowDamageHalo(false)
            if (damageHaloTimeout.current) clearTimeout(damageHaloTimeout.current)
          }
        }
      }

      // Notificaciones didácticas de items y misiones
      if (data.newItem) {
        setNotifications(prev => [...prev, createItemNotification(data.newItem, locale)])
      }
      if (data.removeItem) {
        setNotifications(prev => [...prev, createRemoveItemNotification(data.removeItem, locale)])
      }
      if (data.newQuest) {
        const questName = typeof data.newQuest === 'object' ? (data.newQuest as any).title || JSON.stringify(data.newQuest) : String(data.newQuest)
        setNotifications(prev => [...prev, createQuestNotification(questName, locale)])
      }
      if (data.questCompleted) {
        setNotifications(prev => [...prev, createQuestCompletedNotification(data.questCompleted, locale)])
      }
      if (data.xpReward && data.xpReward > 0) {
        setNotifications(prev => [...prev, createXPNotification(data.xpReward, locale)])
      }
      if (data.levelUp) {
        if (data.levelUp.needsChoice && data.levelUp.statOptions?.length > 0) {
          setPendingLevelUp(data.levelUp)
        } else {
          setNotifications(prev => [...prev, createLevelUpNotification(data.levelUp.newLevel, { maxHp: data.levelUp.hpIncrease }, locale)])
        }
      }

      // Actualizar acciones sugeridas si vienen
      if (data.suggestedActions && data.suggestedActions.length > 0) {
        setSuggestedActions(data.suggestedActions)
      }

      // Check for combat trigger from DM
      if (data.combat_trigger) {
        initiateCombat(data.combat_trigger as CombatTrigger)
      } else if (combatState.inCombat) {
        // Si estamos en combate pero el DM no envía combat_trigger,
        // y navigation no está locked, el combate terminó
        const isStillLocked = data.worldStateUpdates?.map_state?.navigationLocked
          ?? worldState.map_state?.navigationLocked
        if (!isStillLocked) {
          setCombatState(DEFAULT_COMBAT_STATE)
          setUiMood('exploration')
        }
      }

      // Handle DM dice request — defer until typewriter finishes
      if (data.diceRequest) {
        setPendingDiceRequest(data.diceRequest)
        // Modal se abrirá automáticamente cuando el typewriter termine
      } else {
        setPendingDiceRequest(null)
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
            // Persistir en worldState para sobrevivir recargas
            fetch('/api/campaign/update-ui', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ campaignId, lastSceneImage: imgData.url }),
            }).catch(() => {}) // Fire and forget
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
  // NORMAL VIEW (with inline combat banner when in combat)
  // ============================================================================
  return (
    <div className={`min-h-screen particle-bg pb-4 ${moodConfig.cssClass}`}>
      {/* Halo rojo al recibir daño — dura 3 segundos */}
      {showDamageHalo && <div className="combat-halo" />}

      {/* Vignette oscura cuando inconsciente */}
      {isUnconscious && !isDead && <div className="unconscious-vignette" />}

      {/* Death save tracker */}
      {characterDeathSaves && (
        <DeathSaveTracker
          successes={characterDeathSaves.successes}
          failures={characterDeathSaves.failures}
          locale={locale}
        />
      )}

      {/* Pantalla de muerte */}
      {isDead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-shadow/90">
          <div className="glass-panel-dark rounded-lg border border-blood/50 p-8 max-w-md w-full text-center">
            <p className="text-5xl mb-4">💀</p>
            <h2 className="font-title text-2xl text-blood mb-2">
              {locale === 'en' ? 'You Have Fallen' : 'Has Caído'}
            </h2>
            <p className="font-body text-parchment/70 mb-6">
              {locale === 'en'
                ? `The story of ${character?.name || 'the adventurer'} has come to an end.`
                : `La historia de ${character?.name || 'el aventurero'} ha llegado a su fin.`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/onboarding'}
                className="px-4 py-2 rounded font-ui text-sm text-parchment bg-gold-dim/80 hover:bg-gold-dim border border-gold/30"
              >
                {locale === 'en' ? 'New Character' : 'Nuevo Personaje'}
              </button>
              <button
                onClick={() => window.location.href = '/campaigns'}
                className="px-4 py-2 rounded font-ui text-sm text-parchment bg-shadow-mid hover:bg-shadow border border-gold-dim/30"
              >
                {locale === 'en' ? 'My Campaigns' : 'Mis Campañas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level-up modal con elección de stat */}
      {pendingLevelUp && character && (
        <LevelUpModal
          newLevel={pendingLevelUp.newLevel}
          hpIncrease={pendingLevelUp.hpIncrease}
          statOptions={pendingLevelUp.statOptions}
          statBonus={pendingLevelUp.statBonus}
          characterName={character.name}
          campaignId={campaignId}
          locale={locale}
          onComplete={(chosenStat, bonus) => {
            setPendingLevelUp(null)
            setNotifications(prev => [...prev, createLevelUpNotification(
              pendingLevelUp.newLevel,
              { [chosenStat]: bonus, maxHp: pendingLevelUp.hpIncrease },
              locale
            )])
            // Actualizar worldState local con el stat elegido
            setWorldState((prev: any) => ({
              ...prev,
              pendingLevelUp: undefined,
              party: {
                ...prev.party,
                [character.name]: {
                  ...prev.party?.[character.name],
                  [chosenStat]: (prev.party?.[character.name]?.[chosenStat] || 0) + bonus,
                },
              },
            }))
          }}
        />
      )}

      {/* Tutorial carousel — solo primera vez */}
      {showTutorial && (
        <GameTutorialTour
          onComplete={completeTutorial}
          locale={locale}
        />
      )}

      {/* Notificaciones de items y misiones */}
      <GameNotifications notifications={notifications} onDismiss={dismissNotification} locale={locale} />

      {/* Exit dialog — intercepta todas las formas de salir */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-shadow/80 z-50 flex items-center justify-center p-4" onClick={() => { setShowExitDialog(false); setPendingExitUrl(null) }}>
          <div className="glass-panel-dark rounded-lg p-6 max-w-sm w-full border border-gold-dim/30" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-gold mb-3">Salir de la partida</h3>
            <p className="font-body text-sm text-parchment/80 mb-4">
              Tu progreso será guardado automáticamente. Si volver atrás no funciona, dirígete a la página de campañas para continuar tu última partida.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowExitDialog(false); setPendingExitUrl(null) }}
                className="flex-1 px-4 py-2 rounded font-ui text-sm text-parchment bg-shadow-mid hover:bg-shadow border border-gold-dim/30"
              >
                Seguir jugando
              </button>
              <button
                onClick={() => { window.location.href = pendingExitUrl || '/campaigns' }}
                className="flex-1 px-4 py-2 rounded font-ui text-sm text-parchment bg-gold-dim/80 hover:bg-gold-dim"
              >
                {pendingExitUrl ? 'Salir' : 'Ir a Campañas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portrait Splash on session start */}
      {showPortraitSplash && character && (
        <PortraitSplash
          avatarUrl={character.avatarUrl || ''}
          characterName={character.name}
          archetype={`${character.stats?.raceName || ''} ${character.stats?.className || character.archetype}`.trim()}
          level={character.level}
          onComplete={() => setShowPortraitSplash(false)}
        />
      )}

      {/* Scene Transition Overlay */}
      <SceneTransition {...transitionProps} />

      {/* Header con información del personaje */}
      <div id="character-header" className="border-b border-gold-dim/30 glass-panel-dark p-3 md:p-4">
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
              <div
                className="flex items-center gap-3 md:gap-4 cursor-pointer hover:opacity-90 transition rounded-lg border border-gold-dim/30 bg-shadow/40 px-3 py-2"
                onClick={() => scrollToSection('character-sheet-section')}
                title="Ver hoja de personaje completa"
              >
                {/* Avatar */}
                {character.avatarUrl && (
                  <div className="hidden md:block w-10 h-10 rounded border border-gold-dim/50 overflow-hidden flex-shrink-0">
                    <img src={character.avatarUrl} alt={characterName} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Nombre + Nivel + HP */}
                <div className="flex-shrink-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading text-sm text-parchment uppercase">{characterName}</span>
                    <span className="font-ui text-[10px] text-gold-dim">Nv.{character.level}</span>
                  </div>
                  <p className="font-ui text-[10px] text-gold-dim/70">{character.archetype}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Heart className="w-3 h-3 text-blood" />
                    <div className="w-16 h-1.5 bg-shadow rounded-full overflow-hidden border border-gold-dim/20">
                      <div className={`h-full ${hpColor}`} style={{ width: `${hpPercentage}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-parchment/70">{hp.current}/{hp.max}</span>
                    {engine === 'DND_5E' && (
                      <>
                        <span className="text-[10px] text-gold-dim ml-1">AC {(character.stats as any)?.ac || 10}</span>
                        <span className="text-[10px] text-gold-dim">Prof +{(character.stats as any)?.proficiencyBonus || 2}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats compactos — solo desktop */}
                <div className="hidden lg:flex items-center gap-2 ml-2">
                  {engine === 'DND_5E' ? (
                    // D&D 5e: 6 ability scores
                    <div className="flex gap-2">
                      {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map(stat => {
                        const val = (character.stats as any)?.[stat] || 10
                        const mod = Math.floor((val - 10) / 2)
                        return (
                          <div key={stat} className="text-center">
                            <div className="text-[9px] text-gold-dim/60 font-ui">{stat}</div>
                            <div className="text-xs font-heading text-parchment">{val}</div>
                            <div className="text-[9px] text-gold-dim font-mono">{mod >= 0 ? `+${mod}` : mod}</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    // Story mode: combat/exploration/social/knowledge
                    <div className="flex gap-3">
                      {[
                        { label: 'COM', val: (character.stats as any)?.combat || 0 },
                        { label: 'EXP', val: (character.stats as any)?.exploration || 0 },
                        { label: 'SOC', val: (character.stats as any)?.social || 0 },
                        { label: 'SAB', val: (character.stats as any)?.knowledge || (character.stats as any)?.lore || 0 },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <div className="text-[9px] text-gold-dim/60 font-ui">{s.label}</div>
                          <div className="text-xs font-heading text-parchment">{s.val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ver Hoja button */}
                <div className="hidden md:flex items-center gap-1 ml-2 px-2 py-1 rounded border border-gold-dim/30 text-[10px] font-ui text-gold-dim hover:text-gold hover:border-gold transition flex-shrink-0">
                  <BookOpen className="w-3 h-3" />
                  <span>Ver Hoja</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra horizontal de navegación rápida */}
      <div className="sticky top-0 z-40 border-b border-gold-dim/20 glass-panel-dark">
        <div className="max-w-[1800px] mx-auto px-3 md:px-4 lg:px-6 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Navigation buttons - scroll to sections */}
            <button
              onClick={() => scrollToSection('narrator-section')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all
                       text-parchment/80 hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/30"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {t.game.tabNarrator}
            </button>
            <button
              onClick={() => scrollToSection('character-sheet-section')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all
                       text-parchment/80 hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/30"
            >
              <Scroll className="w-3.5 h-3.5" />
              {t.game.tabCharSheet}
            </button>
            <button
              onClick={() => scrollToSection('quests-section')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all
                       text-parchment/80 hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/30"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t.game.tabQuests}
            </button>

            {isMultiplayer && (
              <button
                onClick={() => scrollToSection('party-section')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui text-xs whitespace-nowrap transition-all
                         text-parchment/80 hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/30"
              >
                <Users className="w-3.5 h-3.5" />
                {t.game.tabParty}
              </button>
            )}

            {/* Dice roller button */}
            <button
              id="dice-button"
              onClick={() => setShowDiceRoller(true)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-auto text-xs font-ui text-gold border border-gold/40 rounded-lg
                       hover:bg-gold/10 transition-all disabled:opacity-50"
            >
              <Dices className="w-3.5 h-3.5" />
              {t.game.tabDice}
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor principal - 2 columnas */}
      <div className="max-w-[1800px] mx-auto p-3 md:p-4 lg:p-6 content-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          {/* Panel izquierdo - Narración (8/12) */}
          <div className="lg:col-span-8 space-y-3 md:space-y-4">

            {/* Location/Time/Weather banner + exit button */}
            {worldState && (
              <div className="flex flex-wrap items-center gap-2 md:gap-4 px-3 py-2 rounded-lg bg-shadow/60 border border-gold-dim/30 font-ui text-xs md:text-sm text-parchment/80">
                <button
                  onClick={() => setShowExitDialog(true)}
                  className="text-parchment/50 hover:text-gold transition mr-1"
                  title="Salir de la partida"
                >
                  ←
                </button>
                {worldState.current_scene && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">📍</span> {worldState.current_scene}
                  </span>
                )}
                {worldState.time_in_world && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">🕐</span> {worldState.time_in_world}
                  </span>
                )}
                {worldState.weather && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">🌤️</span> {worldState.weather}
                  </span>
                )}
              </div>
            )}

            {/* Combat Banner — inline, no separate screen */}
            {combatState.inCombat && (
              <div className="bg-blood/15 border border-blood/40 rounded-lg p-3 mb-3 flex items-center gap-3 ink-reveal">
                <Swords className="w-5 h-5 text-blood flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-heading text-sm text-blood tracking-wide">COMBATE</span>
                  <div className="font-body text-xs text-parchment/70 mt-0.5 truncate">
                    {(combatState as any).enemies?.map((e: any) =>
                      `${e.name}${e.count > 1 ? ` ×${e.count}` : ''}`
                    ).join(', ') || 'Enemigos'}
                  </div>
                </div>
              </div>
            )}

            {/* NarratorPanel inline */}
            <div id="narrator-section" className="scroll-mt-4">
            <OrnateFrame variant="gold">
              <ParchmentPanel variant="ornate" className="min-h-[400px] md:min-h-[500px] max-h-[60vh] md:max-h-[70vh] flex flex-col">
                {/* Header with 3D Narrator Orb */}
                <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
                  {/* 3D Orb - visible on larger screens */}
                  <div className="hidden md:block">
                    <NarratorOrb3D state={getDMOrbState()} size={100} />
                  </div>
                  {/* Simple orb for mobile */}
                  <div className="md:hidden">
                    <NarratorOrbSimple state={getDMOrbState()} size={60} />
                  </div>
                  <h2 className="font-title text-xl md:text-2xl text-ink">{t.game.narratorTitle}</h2>
                </div>

                <div ref={scrollRef} className="space-y-3 md:space-y-4 overflow-y-auto flex-1 min-h-0 pr-1 md:pr-2">
                  {turns.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="font-body text-stone/60 italic">
                        {t.game.narratorEmpty}
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
                              `📖 ${t.game.narratorLabel}`
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
                                `⚔️ ${t.game.youLabel}`
                              )
                            ) : (
                              `⚙️ ${t.game.systemLabel}`
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
                            onComplete={() => {
                              setTypewriterTurnId(null)
                              // Si hay dice request pendiente, abrir modal ahora que la narración terminó
                              if (pendingDiceRequest) {
                                setTimeout(() => setShowDiceRoller(true), 300)
                              }
                            }}
                            onUpdate={handleTypewriterScroll}
                            skipOnClick={true}
                            className="text-base md:text-lg"
                          />
                        ) : (
                          <p className="font-body text-base md:text-lg text-parchment leading-relaxed whitespace-pre-wrap">
                            {turn.content}
                          </p>
                        )}
                        {/* Show dice roll if present */}
                        {turn.diceRoll && turn.diceRoll.formula && (
                          <div className="mt-2 flex items-center gap-2 p-2 bg-gold/10 rounded-lg border border-gold/30">
                            <Dices className="w-4 h-4 text-gold" />
                            <span className="font-mono text-xs text-gold-dim">{turn.diceRoll.formula}</span>
                            <span className="font-heading text-gold-bright">→ {turn.diceRoll.result}</span>
                            {Array.isArray(turn.diceRoll.rolls) && (
                              <span className="text-xs text-parchment/60">({turn.diceRoll.rolls.join(', ')})</span>
                            )}
                          </div>
                        )}
                        {/* Imagen de escena movida al panel derecho — no duplicar acá */}
                      </div>
                    ))
                  )}

                  {isSubmitting && (
                    <div className="p-4 rounded-lg glass-panel border-l-4 border-gold animate-pulse">
                      <div className="font-heading text-xs text-gold-dim uppercase tracking-wide mb-2">
                        📖 {t.game.narratorLabel}
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
                          {t.game.narratorThinking}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </ParchmentPanel>
            </OrnateFrame>
            </div>

            {/* Dice Roller Modal */}
            {showDiceRoller && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                <div className="relative max-w-md w-full">
                  <button
                    onClick={() => {
                      setShowDiceRoller(false)
                      if (!pendingDiceRequest) setPendingDiceRequest(null)
                    }}
                    className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-blood rounded-full flex items-center justify-center text-parchment hover:bg-blood/80"
                  >
                    ✕
                  </button>
                  {/* DM dice request context */}
                  {pendingDiceRequest && (
                    <div className="mb-3 p-3 rounded-lg bg-gold/10 border border-gold/30 text-center">
                      <p className="font-heading text-gold text-sm uppercase tracking-wide mb-1">
                        🎲 ¡El DM pide una tirada!
                      </p>
                      <p className="font-body text-parchment text-sm">
                        {pendingDiceRequest.reason}
                      </p>
                      <p className="font-mono text-gold-bright text-lg mt-1">
                        {pendingDiceRequest.formula}
                      </p>
                      {pendingDiceRequest.difficulty && (
                        <p className="font-ui text-parchment/60 text-xs mt-1">
                          Dificultad: {pendingDiceRequest.difficulty}
                        </p>
                      )}
                    </div>
                  )}
                  <DiceRoller
                    onRoll={handleDiceRoll}
                    defaultFormula={pendingDiceRequest?.formula}
                  />
                </div>
              </div>
            )}

            {/* Prompted dice request banner - shown when DM requests a roll */}
            {pendingDiceRequest && !showDiceRoller && (
              <div
                className="glass-panel-dark rounded-lg p-3 border border-gold animate-pulse cursor-pointer hover:bg-gold/10 transition-all"
                onClick={() => setShowDiceRoller(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎲</div>
                  <div className="flex-1">
                    <p className="font-heading text-gold text-sm">¡Tirada requerida!</p>
                    <p className="font-body text-parchment/80 text-xs">{pendingDiceRequest.reason}</p>
                  </div>
                  <div className="font-mono text-gold-bright text-lg">{pendingDiceRequest.formula}</div>
                </div>
              </div>
            )}

            {/* Mission Selector for first turn OR Action Input */}
            {isMissionSelectionMode ? (
              <MissionSelector
                missions={suggestedActions}
                onSelect={(mission) => handleSubmit(mission, 'do')}
                disabled={isSubmitting}
              />
            ) : (
              <div id="action-input">
                <ActionInputWithVoice
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting || !!pendingDiceRequest}
                  suggestedActions={suggestedActions}
                  lastDiceRoll={lastDiceRoll}
                  onClearDiceRoll={() => setLastDiceRoll(null)}
                  error={error}
                  locale={locale as 'es' | 'en'}
                  prefillAction={prefillAction}
                />
              </div>
            )}

            {/* Character Stats Bar + Expandable Sheet */}
            {character && (
              <div id="character-sheet-section" className="space-y-3 scroll-mt-4">
                {/* Stats Summary Bar */}
                {engine === 'DND_5E' ? (
                  <StatsBarSummary
                    name={characterName}
                    archetype={`${character.stats?.raceName || ''} ${character.stats?.className || character.archetype}`.trim()}
                    avatarUrl={character.avatarUrl || undefined}
                    level={character.level}
                    hp={hp.current}
                    maxHp={hp.max}
                    ac={character.stats?.ac || 10}
                    proficiencyBonus={character.stats?.proficiencyBonus || 2}
                    abilities={{
                      STR: character.stats?.STR || 10,
                      DEX: character.stats?.DEX || 10,
                      CON: character.stats?.CON || 10,
                      INT: character.stats?.INT || 10,
                      WIS: character.stats?.WIS || 10,
                      CHA: character.stats?.CHA || 10,
                    }}
                    isExpanded={isCharacterSheetExpanded}
                    onToggleExpand={() => setIsCharacterSheetExpanded(!isCharacterSheetExpanded)}
                    isDnD5e={true}
                  />
                ) : (
                  <StoryModeStatsBar
                    name={characterName}
                    archetype={character.archetype}
                    avatarUrl={character.avatarUrl || undefined}
                    level={character.level}
                    hp={hp.current}
                    maxHp={hp.max}
                    combat={character.stats?.combat || 0}
                    exploration={character.stats?.exploration || 0}
                    social={character.stats?.social || 0}
                    knowledge={character.stats?.knowledge || character.stats?.lore || 0}
                    isExpanded={isCharacterSheetExpanded}
                    onToggleExpand={() => setIsCharacterSheetExpanded(!isCharacterSheetExpanded)}
                  />
                )}

                {/* Expanded Character Sheet (D&D 5e only) */}
                {isCharacterSheetExpanded && engine === 'DND_5E' && (
                  <DnD5eCharacterSheet
                    name={characterName}
                    archetype={character.archetype}
                    avatarUrl={character.avatarUrl || undefined}
                    stats={{
                      hp: hp.current,
                      maxHp: hp.max,
                      ac: character.stats?.ac || 10,
                      level: character.level,
                      proficiencyBonus: character.stats?.proficiencyBonus || 2,
                      speed: character.stats?.speed || 30,
                      STR: character.stats?.STR || 10,
                      DEX: character.stats?.DEX || 10,
                      CON: character.stats?.CON || 10,
                      INT: character.stats?.INT || 10,
                      WIS: character.stats?.WIS || 10,
                      CHA: character.stats?.CHA || 10,
                      className: character.stats?.className,
                      raceName: character.stats?.raceName,
                      subrace: character.stats?.subrace,
                      hitDice: character.stats?.hitDice || `${character.level}d10`,
                      experience: worldState.party?.[character.name]?.experience || 0,
                      experienceToNext: character.stats?.experienceToNext || 300,
                      savingThrowProficiencies: character.stats?.savingThrowProficiencies || [],
                      skillProficiencies: character.stats?.skillProficiencies || [],
                      features: character.stats?.features || [],
                    }}
                    inventory={character.inventory || []}
                    conditions={worldState.party?.[character.name]?.conditions || []}
                    gold={character.stats?.gold || 0}
                    tutorialLevel="novice"
                  />
                )}

                {/* Expanded Story Mode Stats */}
                {isCharacterSheetExpanded && engine !== 'DND_5E' && (
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
                      combat: character.stats?.combat,
                      exploration: character.stats?.exploration,
                      social: character.stats?.social,
                      knowledge: character.stats?.knowledge || character.stats?.lore,
                    }}
                    conditions={worldState.party?.[character.name]?.conditions || []}
                  />
                )}
              </div>
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
            {/* Imagen de escena */}
            {(sceneImageUrl || isImageLoading) && (
              <div>
                <h3 className="font-heading text-xs text-gold-dim uppercase tracking-widest mb-2 px-1">Escena</h3>
              <SceneImage
                imageUrl={sceneImageUrl}
                isLoading={isImageLoading}
                lore={lore as LoreType}
                error={imageError}
                className="rounded-lg overflow-hidden"
              />
              </div>
            )}

            {/* Ubicaciones */}
            <div id="locations-panel">
            <h3 className="font-heading text-xs text-gold-dim uppercase tracking-widest mb-2 px-1">{t.game.locations}</h3>
            <GameMapPanel
              lore={lore as LoreType}
              worldState={worldState}
              onTravelRequest={(actionText, toLocationId) => {
                // City-to-city travel: submit directly
                handleSubmit(actionText, 'do')
              }}
              onPrefillAction={(actionText) => {
                // Sub-location click: prefill input, let player decide when to send
                setPrefillAction(actionText)
              }}
              onError={(message) => {
                setError(message)
                setTimeout(() => setError(null), 3000)
              }}
              locale={locale as 'es' | 'en'}
            />
            </div>

            {/* Inventario */}
            <div id="inventory-panel">
            <h3 className="font-heading text-xs text-gold-dim uppercase tracking-widest mb-2 px-1">{t.game.inventory}</h3>
            <div className="glass-panel-dark rounded-lg border border-gold-dim/20">
              <InventoryPanel
                inventory={worldState.party?.[characterName]?.inventory || character?.inventory || []}
                characterName={characterName}
                locale={locale as 'es' | 'en'}
              />
            </div>
            </div>

            {/* Quests Section */}
            <div id="quests-section" className="glass-panel-dark rounded-lg p-4 border border-gold-dim/20 scroll-mt-4">
              <h3 className="font-heading text-lg text-gold mb-3">
                <Scroll className="w-4 h-4 inline-block mr-2" />
                Misiones
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {(worldState.active_quests || []).map((quest: any, i: number) => {
                  const questText = typeof quest === 'string' ? quest : (quest?.title || JSON.stringify(quest))
                  return (
                    <div key={i} className="flex items-start gap-2 p-2 bg-gold/10 rounded border border-gold/20">
                      <div className="w-2 h-2 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                      <span className="font-body text-parchment text-sm">{questText}</span>
                    </div>
                  )
                })}
                {(worldState.completed_quests || []).map((quest: any, i: number) => {
                  const questText = typeof quest === 'string' ? quest : (quest?.title || JSON.stringify(quest))
                  return (
                    <div key={`completed-${i}`} className="flex items-start gap-2 p-2 bg-emerald/10 rounded border border-emerald/20">
                      <div className="w-2 h-2 bg-emerald rounded-full mt-1.5 flex-shrink-0" />
                      <span className="font-body text-parchment/60 text-sm line-through">{questText}</span>
                    </div>
                  )
                })}
                {(worldState.active_quests || []).length === 0 && (worldState.completed_quests || []).length === 0 && (
                  <p className="text-parchment/50 italic text-center py-2">Sin misiones activas</p>
                )}
              </div>
            </div>

            {/* Party Section - Multiplayer only */}
            {isMultiplayer && (
              <div id="party-section" className="scroll-mt-4">
                <ParticipantList
                  participants={participants}
                  currentUserId={currentUserId}
                  isMultiplayer={isMultiplayer}
                />
              </div>
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
