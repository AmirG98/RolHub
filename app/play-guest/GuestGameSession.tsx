'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import { DiceRoller } from '@/components/medieval/DiceRoller'
import { GuestWarningBanner } from '@/components/guest/GuestWarningBanner'
import { useGuest } from '@/lib/guest'
import { useLanguage } from '@/lib/i18n'
// import { DynamicMusicPlayer, useDynamicMusic } from '@/components/audio/DynamicMusicPlayer' // DISABLED
import {
  Sword, Shield, Map, MessageCircle, BookOpen, Heart,
  Backpack, Scroll, Dices, LogOut, UserPlus, Play
} from 'lucide-react'
import Link from 'next/link'

interface GuestTurnDisplay {
  id: string
  role: 'USER' | 'DM' | 'SYSTEM'
  content: string
  diceRoll?: { formula: string; result: number; rolls: number[] }
  createdAt: string
}

export default function GuestGameSession() {
  const router = useRouter()
  const { locale } = useLanguage()
  const { session, addGuestTurn, updateWorldState, endGuestSession } = useGuest()
  // const { onNarration } = useDynamicMusic() // DISABLED
  const onNarration = (_text: string) => {} // No-op
  const isEnglish = locale === 'en'

  const [action, setAction] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [lastDiceRoll, setLastDiceRoll] = useState<{ formula: string; result: number; rolls: number[] } | null>(null)
  const [showEndModal, setShowEndModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Convert session turns to display format
  const turns: GuestTurnDisplay[] = (session?.turns || []).map(turn => ({
    id: turn.id,
    role: turn.role,
    content: turn.content,
    diceRoll: turn.diceRoll,
    createdAt: turn.createdAt
  }))

  // World state for guest (simplified)
  const worldState = session?.worldState || {
    current_scene: isEnglish ? 'The adventure begins...' : 'La aventura comienza...',
    time_in_world: isEnglish ? 'Dawn' : 'Amanecer',
    act: 1,
    active_quests: [],
    completed_quests: []
  }

  const character = session?.character

  // HP calculation
  const hp = {
    current: character?.stats?.hp || 20,
    max: character?.stats?.maxHp || 20
  }
  const hpPercentage = (hp.current / hp.max) * 100
  const hpColor = hpPercentage > 60 ? 'bg-emerald' : hpPercentage > 30 ? 'bg-gold' : 'bg-blood'

  // Labels
  const labels = isEnglish ? {
    narrator: 'The Narrator',
    adventureBegins: 'The adventure is about to begin...',
    whatDoYouDo: 'What do you do?',
    describeAction: 'Describe your action...',
    rollDice: 'Roll Dice',
    sending: 'Sending...',
    send: 'Send',
    yourAdventure: 'Your Adventure',
    world: 'World',
    mode: 'Mode',
    system: 'System',
    act: 'Act',
    oneShot: 'One-Shot',
    campaign: 'Campaign',
    stats: 'Stats',
    combat: 'Combat',
    exploration: 'Exploration',
    social: 'Social',
    lore: 'Lore',
    inventory: 'Inventory',
    emptyBag: 'Your bag is empty',
    quests: 'Quests',
    active: 'Active',
    completed: 'Completed',
    noQuests: 'No active quests',
    endSession: 'End Session',
    endSessionTitle: 'End Guest Session?',
    endSessionWarning: 'Your progress will be lost. Want to register to save it?',
    registerToSave: 'Register to Save',
    endAnyway: 'End Anyway',
    cancel: 'Cancel',
    discard: 'Discard',
    narratorThinking: 'The narrator is weaving the story...',
    you: 'You',
    systemLabel: 'System'
  } : {
    narrator: 'El Narrador',
    adventureBegins: 'La aventura está por comenzar...',
    whatDoYouDo: '¿Qué hacés?',
    describeAction: 'Describí tu acción...',
    rollDice: 'Tirar Dados',
    sending: 'Enviando...',
    send: 'Enviar',
    yourAdventure: 'Tu Aventura',
    world: 'Mundo',
    mode: 'Modo',
    system: 'Sistema',
    act: 'Acto',
    oneShot: 'One-Shot',
    campaign: 'Campaña',
    stats: 'Estadísticas',
    combat: 'Combate',
    exploration: 'Exploración',
    social: 'Social',
    lore: 'Lore',
    inventory: 'Inventario',
    emptyBag: 'Tu bolsa está vacía',
    quests: 'Misiones',
    active: 'Activas',
    completed: 'Completadas',
    noQuests: 'Sin misiones activas',
    endSession: 'Terminar Sesión',
    endSessionTitle: '¿Terminar sesión de invitado?',
    endSessionWarning: 'Tu progreso se perderá. ¿Querés registrarte para guardarlo?',
    registerToSave: 'Registrarme para Guardar',
    endAnyway: 'Terminar Igual',
    cancel: 'Cancelar',
    discard: 'Descartar',
    narratorThinking: 'El narrador está tejiendo la historia...',
    you: 'Vos',
    systemLabel: 'Sistema'
  }

  const suggestedActions = isEnglish ? [
    'I examine the area for dangers',
    'I try to talk to someone nearby',
    'I move cautiously forward'
  ] : [
    'Examino el área en busca de peligros',
    'Intento hablar con alguien cercano',
    'Me muevo con cautela hacia adelante'
  ]

  // Auto-scroll when new turns
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
      setError(isEnglish ? 'You must write an action' : 'Debés escribir una acción')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Add player turn immediately
    const playerTurn = {
      role: 'USER' as const,
      content: action.trim(),
      diceRoll: lastDiceRoll || undefined
    }
    addGuestTurn(playerTurn)

    const submittedAction = action.trim()
    setAction('')
    const submittedDiceRoll = lastDiceRoll
    setLastDiceRoll(null)

    try {
      // Call guest API endpoint
      const response = await fetch('/api/session/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: submittedAction,
          diceRoll: submittedDiceRoll,
          lore: session?.lore,
          engine: session?.engine,
          character: session?.character,
          worldState,
          previousTurns: turns.slice(-6), // Last 6 turns for context
          locale
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || (isEnglish ? 'Error sending action' : 'Error al enviar la acción'))
      }

      // Add DM response
      addGuestTurn({
        role: 'DM',
        content: data.narration
      })

      // Analyze narration for music mood
      onNarration(data.narration)

      // Update world state if present
      if (data.worldStateUpdates) {
        updateWorldState(data.worldStateUpdates)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEndSession = () => {
    endGuestSession()
    router.push('/')
  }

  if (!session?.character) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center p-4">
        <ParchmentPanel variant="ornate" className="max-w-md p-8 text-center">
          <p className="font-body text-ink mb-4">
            {isEnglish ? 'No character found. Please start a new session.' : 'No se encontró personaje. Por favor iniciá una nueva sesión.'}
          </p>
          <Link href="/play-guest">
            <RunicButton variant="primary">
              <Play className="w-4 h-4 mr-2" />
              {isEnglish ? 'Start New Session' : 'Iniciar Nueva Sesión'}
            </RunicButton>
          </Link>
        </ParchmentPanel>
      </div>
    )
  }

  return (
    <div className="min-h-screen particle-bg pb-4">
      {/* Guest Warning Banner */}
      <GuestWarningBanner locale={locale as 'es' | 'en'} />

      {/* Header */}
      <div className="border-b border-gold-dim/30 glass-panel-dark p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg md:text-2xl text-gold-bright truncate">
                  {isEnglish ? 'Guest Adventure' : 'Aventura de Invitado'}
                </h1>
                <div className="px-2 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold">
                  GUEST
                </div>
              </div>
              <p className="font-ui text-parchment text-xs md:text-sm truncate">
                {worldState.current_scene} • {worldState.time_in_world}
              </p>
            </div>

            {character && (
              <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                <div className="md:text-right">
                  <p className="font-heading text-sm md:text-lg text-parchment truncate max-w-[120px] md:max-w-none">
                    {character.name}
                  </p>
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

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-8 content-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main panel - Narration */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            <OrnateFrame variant="gold">
              <ParchmentPanel variant="ornate" className="min-h-[300px] md:min-h-[400px] max-h-[50vh] md:max-h-[60vh]">
                <h2 className="font-title text-xl md:text-2xl text-ink text-center mb-3 md:mb-4">
                  {labels.narrator}
                </h2>

                <div ref={scrollRef} className="space-y-3 md:space-y-4 overflow-y-auto max-h-[calc(50vh-100px)] md:max-h-[calc(60vh-100px)] pr-1 md:pr-2">
                  {turns.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="font-body text-stone/60 italic">
                        {labels.adventureBegins}
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
                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                          <div className="font-heading text-[10px] md:text-xs text-gold-dim uppercase tracking-wide">
                            {turn.role === 'DM' ? `📖 ${labels.narrator}` :
                             turn.role === 'USER' ? `⚔️ ${labels.you}` :
                             `⚙️ ${labels.systemLabel}`}
                          </div>
                        </div>
                        <p className="font-body text-sm md:text-base text-parchment leading-relaxed whitespace-pre-wrap">
                          {turn.content}
                        </p>
                        {turn.diceRoll && (
                          <div className="mt-2 flex items-center gap-2 p-2 bg-gold/10 rounded-lg border border-gold/30">
                            <Dices className="w-4 h-4 text-gold" />
                            <span className="font-mono text-xs text-gold-dim">{turn.diceRoll.formula}</span>
                            <span className="font-heading text-gold-bright">→ {turn.diceRoll.result}</span>
                            <span className="text-xs text-parchment/60">({turn.diceRoll.rolls.join(', ')})</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isSubmitting && (
                    <div className="p-4 rounded-lg glass-panel border-l-4 border-gold animate-pulse">
                      <div className="font-heading text-xs text-gold-dim uppercase tracking-wide mb-2">
                        📖 {labels.narrator}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="font-body text-parchment/60 ml-2">
                          {labels.narratorThinking}
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
                    {labels.whatDoYouDo}
                  </label>
                  <textarea
                    id="action"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    disabled={isSubmitting}
                    placeholder={labels.describeAction}
                    className="w-full h-20 md:h-24 p-3 md:p-4 bg-parchment-dark/50 border-2 border-gold-dim/30 rounded-lg
                             font-body text-sm md:text-base text-ink placeholder:text-stone/50
                             focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20
                             disabled:opacity-50 disabled:cursor-not-allowed
                             resize-none"
                  />
                </div>

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
                      {labels.discard}
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDiceRoller(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-ui text-gold border border-gold/50 rounded-lg
                             hover:bg-gold/10 hover:border-gold transition-all disabled:opacity-50"
                  >
                    <Dices className="w-4 h-4" />
                    {labels.rollDice}
                  </button>

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
                  <RunicButton type="submit" disabled={isSubmitting || !action.trim()} variant="primary">
                    {isSubmitting ? labels.sending : `${labels.send} →`}
                  </RunicButton>
                </div>
              </form>
            </ParchmentPanel>
          </div>

          {/* Side panel */}
          <div className="space-y-3 md:space-y-4">
            {/* Character Stats */}
            {character && character.stats && (
              <OrnateFrame variant="shadow">
                <ParchmentPanel>
                  <h3 className="font-heading text-xl text-ink mb-4">{character.name}</h3>

                  {/* HP Bar */}
                  <div className="mb-4 p-3 bg-ink/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-blood" />
                        <span className="font-ui text-ink/70">HP</span>
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
                      <span className="font-ui text-ink/60">{isEnglish ? 'Archetype' : 'Arquetipo'}</span>
                      <span className="font-body text-ink">{character.archetype}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-ui text-ink/60">{isEnglish ? 'Level' : 'Nivel'}</span>
                      <span className="font-body text-ink">{character.level}</span>
                    </div>

                    <div className="border-t border-ink/10 pt-3 mt-3">
                      <p className="font-ui text-xs text-ink/60 uppercase mb-3">{labels.stats}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sword className="w-4 h-4 text-blood" />
                          <span className="text-ink/80 flex-1">{labels.combat}</span>
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
                          <span className="text-ink/80 flex-1">{labels.exploration}</span>
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
                          <span className="text-ink/80 flex-1">{labels.social}</span>
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
                          <span className="text-ink/80 flex-1">{labels.lore}</span>
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
                  </div>
                </ParchmentPanel>
              </OrnateFrame>
            )}

            {/* Adventure info */}
            <OrnateFrame variant="shadow">
              <ParchmentPanel>
                <h3 className="font-heading text-xl text-ink mb-4">{labels.yourAdventure}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-ui text-ink/60">{labels.world}</span>
                    <span className="font-body text-ink">{session?.lore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-ui text-ink/60">{labels.mode}</span>
                    <span className="font-body text-ink">
                      {session?.mode === 'CAMPAIGN' ? labels.campaign : labels.oneShot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-ui text-ink/60">{labels.system}</span>
                    <span className="font-body text-ink">{session?.engine?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-ui text-ink/60">{labels.act}</span>
                    <span className="font-body text-ink">{worldState.act || 1} / 5</span>
                  </div>
                </div>
              </ParchmentPanel>
            </OrnateFrame>

            {/* Session actions */}
            <div className="space-y-2">
              <Link href="/register" className="block">
                <RunicButton variant="primary" className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {labels.registerToSave}
                </RunicButton>
              </Link>
              <button
                onClick={() => setShowEndModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-ui text-blood/80
                         border border-blood/30 rounded-lg hover:bg-blood/10 hover:border-blood transition-all"
              >
                <LogOut className="w-4 h-4" />
                {labels.endSession}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-dark border border-gold/30 rounded-xl max-w-md w-full p-6">
            <h3 className="font-title text-xl text-gold-bright mb-3">{labels.endSessionTitle}</h3>
            <p className="font-ui text-parchment/70 text-sm mb-6">{labels.endSessionWarning}</p>

            <div className="space-y-3">
              <Link href="/register" className="block">
                <RunicButton variant="primary" className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {labels.registerToSave}
                </RunicButton>
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-2 px-4 font-ui text-sm text-parchment border border-gold/30 rounded-lg hover:bg-gold/10"
                >
                  {labels.cancel}
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 py-2 px-4 font-ui text-sm text-blood border border-blood/30 rounded-lg hover:bg-blood/10"
                >
                  {labels.endAnyway}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Dynamic Music Player - Deshabilitado para no interferir con TTS
      <DynamicMusicPlayer
        initialMood="exploration"
        showMoodIndicator={true}
        position="bottom-right"
      />
      */}
    </div>
  )
}
