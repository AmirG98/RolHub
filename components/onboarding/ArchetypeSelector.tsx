'use client'

import { useState, useCallback, useRef } from 'react'
import { Archetype, Lore } from '@/lib/types/lore'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Sword, BookOpen, Shield, Zap, Heart, Eye, Target, Sparkles, Skull, Star, HelpCircle, Dices, User } from 'lucide-react'
import { useTranslations, useLanguage } from '@/lib/i18n'
import { getLocalized, getLocalizedArray } from '@/lib/i18n/localize'
import Link from 'next/link'
import { generateRandomDescription } from '@/lib/character/description-templates'
import { OnboardingProgressBar } from './OnboardingProgressBar'

// Agrupa items repetidos: ["daga", "daga", "daga"] -> ["daga x3"]
function groupInventoryItems(items: string[]): string[] {
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1
  }
  return Object.entries(counts).map(([item, count]) =>
    count > 1 ? `${item} x${count}` : item
  )
}

export interface CharacterCreationData {
  archetype: Archetype
  characterName: string
  characterDescription: string
  customStats?: {
    combat: number
    exploration: number
    social: number
    lore: number
  }
}

interface ArchetypeSelectorProps {
  archetypes: Archetype[]
  loreName?: string
  lore?: Lore
  onSelect: (data: CharacterCreationData) => void
  onBack: () => void
}

// Iconos para diferentes tipos de arquetipos
const getArchetypeIcon = (id: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    // LOTR
    ranger: <Target className="h-12 w-12" />,
    scholar: <BookOpen className="h-12 w-12" />,
    warrior: <Shield className="h-12 w-12" />,
    // Zombies
    medic: <Heart className="h-12 w-12" />,
    soldier: <Shield className="h-12 w-12" />,
    scavenger: <Eye className="h-12 w-12" />,
    // Isekai
    summoned_hero: <Star className="h-12 w-12" />,
    merchant_traveler: <Zap className="h-12 w-12" />,
    magic_student: <BookOpen className="h-12 w-12" />,
    // Vikingos
    berserker: <Sword className="h-12 w-12" />,
    skald: <BookOpen className="h-12 w-12" />,
    shieldmaiden: <Shield className="h-12 w-12" />,
    // space opera
    force_sensitive: <Sparkles className="h-12 w-12" />,
    smuggler: <Zap className="h-12 w-12" />,
    bounty_hunter: <Target className="h-12 w-12" />,
    // Cyberpunk
    solo: <Sword className="h-12 w-12" />,
    netrunner: <Eye className="h-12 w-12" />,
    fixer: <Zap className="h-12 w-12" />,
    // Lovecraft
    professor: <BookOpen className="h-12 w-12" />,
    detective: <Eye className="h-12 w-12" />,
    occultist: <Skull className="h-12 w-12" />,
    // Romantasy
    cortesano: <Sparkles className="h-12 w-12" />,
    'guerrera-alaria': <Sword className="h-12 w-12" />,
    'alta-dama': <Star className="h-12 w-12" />,
    // Cozy Witch
    'bruja-verde': <BookOpen className="h-12 w-12" />,
    'bruja-hogar': <Heart className="h-12 w-12" />,
    'bruja-mar': <Eye className="h-12 w-12" />,
  }
  return iconMap[id] || <Sword className="h-12 w-12" />
}

export function ArchetypeSelector({ archetypes, loreName, lore, onSelect, onBack }: ArchetypeSelectorProps) {
  const t = useTranslations()
  const { locale } = useLanguage()
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null)
  const [characterName, setCharacterName] = useState('')
  const [characterDescription, setCharacterDescription] = useState('')
  const [showCharacterForm, setShowCharacterForm] = useState(false)
  const [showPointBuy, setShowPointBuy] = useState(false)
  const [customStats, setCustomStats] = useState<{ combat: number; exploration: number; social: number; lore: number } | null>(null)
  const characterFormRef = useRef<HTMLDivElement>(null)

  // Point buy: total de puntos del arquetipo (combat + exploration + social + lore)
  const getStatTotal = useCallback((stats: { combat: number; exploration: number; social: number; lore: number }) => {
    return stats.combat + stats.exploration + stats.social + stats.lore
  }, [])

  const defaultStats = selectedArchetype?.starting_stats
    ? { combat: selectedArchetype.starting_stats.combat, exploration: selectedArchetype.starting_stats.exploration, social: selectedArchetype.starting_stats.social, lore: selectedArchetype.starting_stats.lore }
    : null

  const activeStats = customStats || defaultStats
  const statTotal = defaultStats ? getStatTotal(defaultStats) : 0
  const currentTotal = activeStats ? getStatTotal(activeStats) : 0
  const pointsRemaining = statTotal - currentTotal

  const handleStatChange = useCallback((stat: 'combat' | 'exploration' | 'social' | 'lore', delta: number) => {
    if (!defaultStats) return
    const current = customStats || { ...defaultStats }
    const newValue = current[stat] + delta
    if (newValue < 0 || newValue > 6) return
    const newStats = { ...current, [stat]: newValue }
    const newTotal = getStatTotal(newStats)
    if (newTotal > statTotal) return
    setCustomStats(newStats)
  }, [customStats, defaultStats, statTotal, getStatTotal])

  const handleResetStats = useCallback(() => {
    setCustomStats(null)
    setShowPointBuy(false)
  }, [])

  // Generar descripcion aleatoria (respeta el locale activo)
  const handleGenerateDescription = useCallback(() => {
    const description = generateRandomDescription(lore || 'CUSTOM', undefined, undefined, locale as 'es' | 'en')
    setCharacterDescription(description)
  }, [lore, locale])

  // Confirmar seleccion de arquetipo y mostrar formulario
  const handleArchetypeConfirm = useCallback(() => {
    if (selectedArchetype) {
      setShowCharacterForm(true)
      // Sugerir nombre del arquetipo como placeholder
      if (!characterName) {
        setCharacterName('')
      }
    }
  }, [selectedArchetype, characterName])

  // Enviar datos completos
  const handleSubmit = useCallback(() => {
    if (selectedArchetype && characterName.trim()) {
      onSelect({
        archetype: selectedArchetype,
        characterName: characterName.trim(),
        characterDescription: characterDescription.trim(),
        customStats: customStats || undefined,
      })
    }
  }, [selectedArchetype, characterName, characterDescription, customStats, onSelect])

  // Validar si puede continuar
  const canContinue = selectedArchetype && characterName.trim().length >= 2

  if (archetypes.length === 0) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center p-8">
        <div className="text-center content-wrapper glass-panel-dark p-8 rounded-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="font-heading text-blood text-2xl mb-4">{t.archetypeSelector.noArchetypes}</h2>
          <p className="font-body text-parchment/80 mb-6">
            {t.archetypeSelector.noArchetypesDesc}
          </p>
          <RunicButton variant="secondary" onClick={onBack}>
            {t.common.back}
          </RunicButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full content-wrapper pb-24 md:pb-8">
        <OnboardingProgressBar step={3} />
        <h1 className="font-title text-2xl sm:text-3xl md:text-5xl text-gold-bright text-center mb-1 md:mb-2 ink-reveal glow-effect-on-hover">
          {t.archetypeSelector.chooseWhoYouAre}
        </h1>
        {loreName && (
          <p className="font-heading text-gold/80 text-center mb-1 md:mb-2 text-sm md:text-lg">
            {t.archetypeSelector.inWorld} {loreName}
          </p>
        )}
        <p className="font-ui text-sm md:text-base text-parchment/80 text-center mb-4 md:mb-8">
          {t.archetypeSelector.archetypeDefines}
        </p>
        <div className="text-center mb-4 md:mb-8">
          <Link href="/guias/crear-personaje" className="inline-flex items-center gap-2 font-ui text-xs md:text-sm text-emerald hover:text-emerald/80 transition">
            <HelpCircle size={14} />
            {t.archetypeSelector.needHelpChoosing} {t.archetypeSelector.readOurGuide}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {archetypes.map((archetype) => (
            <div
              key={archetype.id}
              className={`glass-panel rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedArchetype?.id === archetype.id ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => {
                setSelectedArchetype(archetype); setCustomStats(null); setShowPointBuy(false)
                setTimeout(() => { characterFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 300)
              }}
            >
              <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-0 sm:space-y-2">
                {/* Icono */}
                <div className="text-gold-bright flex-shrink-0 [&>svg]:h-8 [&>svg]:w-8 md:[&>svg]:h-10 md:[&>svg]:w-10">
                  {getArchetypeIcon(archetype.id)}
                </div>

                <div className="flex-1 sm:flex-none sm:w-full">
                  {/* Nombre */}
                  <h3 className="font-heading text-base md:text-xl text-gold mb-1 sm:mb-0">{getLocalized(archetype.name, locale as 'es' | 'en')}</h3>

                  {/* Descripcion simple */}
                  <p className="font-body text-parchment/80 text-xs md:text-sm leading-snug line-clamp-3 sm:mt-1.5">
                    {getLocalized(archetype.simple_description, locale as 'es' | 'en') || getLocalized(archetype.description, locale as 'es' | 'en')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Panel de detalles cuando hay seleccion - Adaptado para mobile */}
        {selectedArchetype && (
          <div className="glass-panel-dark rounded-lg p-4 md:p-6 mb-6 md:mb-8 ink-reveal">
            {/* Stats en mobile */}
            {selectedArchetype.starting_stats && (
              <div className="sm:hidden mb-4 pb-4 border-b border-gold-dim/30">
                <h3 className="font-heading text-base text-gold mb-2">{t.archetypeSelector.stats}</h3>
                <div className="grid grid-cols-4 gap-2 text-xs font-ui text-center">
                  <div>
                    <div className="text-parchment font-semibold text-lg">{selectedArchetype.starting_stats.maxHp}</div>
                    <div className="text-gold">{t.archetypeSelector.hp}</div>
                  </div>
                  <div>
                    <div className="text-parchment font-semibold text-lg">{selectedArchetype.starting_stats.combat}</div>
                    <div className="text-gold">{t.archetypeSelector.combat}</div>
                  </div>
                  <div>
                    <div className="text-parchment font-semibold text-lg">{selectedArchetype.starting_stats.exploration}</div>
                    <div className="text-gold">{t.archetypeSelector.exploration}</div>
                  </div>
                  <div>
                    <div className="text-parchment font-semibold text-lg">{selectedArchetype.starting_stats.social}</div>
                    <div className="text-gold">{t.archetypeSelector.social}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Habilidad especial en mobile */}
            {selectedArchetype.special_ability && (
              <div className="sm:hidden mb-4 pb-4 border-b border-gold-dim/30">
                <h3 className="font-heading text-base text-gold mb-2">{t.archetypeSelector.specialAbility}</h3>
                <p className="text-xs font-ui text-emerald font-semibold">
                  {selectedArchetype.special_ability}
                </p>
              </div>
            )}

            {/* Personalizar Stats (Point Buy narrativo) */}
            {selectedArchetype.starting_stats && (
              <div className="mb-4 pb-4 border-b border-gold-dim/30">
                {!showPointBuy ? (
                  <button
                    type="button"
                    onClick={() => setShowPointBuy(true)}
                    className="flex items-center gap-2 font-ui text-sm text-emerald hover:text-emerald/80 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Personalizar stats
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-heading text-base text-gold">Redistribuir Puntos</h3>
                      <div className="flex items-center gap-3">
                        <span className="font-ui text-xs text-parchment/80">
                          Puntos restantes: <span className={`font-mono text-sm ${pointsRemaining > 0 ? 'text-emerald' : pointsRemaining < 0 ? 'text-red-400' : 'text-gold-bright'}`}>{pointsRemaining}</span>
                          <span className="text-parchment/50"> / {statTotal}</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleResetStats}
                          className="font-ui text-xs text-parchment/60 hover:text-parchment transition-colors underline"
                        >
                          Resetear
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['combat', 'exploration', 'social', 'lore'] as const).map((stat) => {
                        const labels: Record<string, string> = {
                          combat: t.archetypeSelector.combat,
                          exploration: t.archetypeSelector.exploration,
                          social: t.archetypeSelector.social,
                          lore: 'Lore',
                        }
                        const value = activeStats ? activeStats[stat] : 0
                        return (
                          <div key={stat} className="flex items-center justify-between glass-panel rounded-lg px-3 py-2">
                            <span className="font-ui text-xs text-gold">{labels[stat]}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatChange(stat, -1)}
                                disabled={value <= 0}
                                className="w-6 h-6 rounded bg-shadow border border-gold-dim/50 text-parchment font-mono text-sm hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                -
                              </button>
                              <span className="font-mono text-parchment font-semibold w-4 text-center">{value}</span>
                              <button
                                type="button"
                                onClick={() => handleStatChange(stat, 1)}
                                disabled={value >= 6 || pointsRemaining <= 0}
                                className="w-6 h-6 rounded bg-shadow border border-gold-dim/50 text-parchment font-mono text-sm hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="font-ui text-xs text-parchment/50 mt-2">
                      Redistribuí los puntos como quieras. El total se mantiene igual.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedArchetype.starting_inventory && (
              <>
                <details className="mb-2">
                  <summary className="font-heading text-sm text-gold cursor-pointer hover:text-gold-bright transition flex items-center gap-2">
                    {t.archetypeSelector.startingEquipment} ({getLocalizedArray(selectedArchetype.starting_inventory, locale as 'es' | 'en').length} items)
                  </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2 mt-2">
                  {groupInventoryItems(getLocalizedArray(selectedArchetype.starting_inventory, locale as 'es' | 'en')).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 font-body text-parchment/80 text-xs md:text-sm">
                      <span className="text-gold-dim">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                </details>
              </>
            )}
          </div>
        )}

        {/* Formulario de personaje - aparece despues de seleccionar arquetipo */}
        {selectedArchetype && (
          <div ref={characterFormRef} className="glass-panel-dark rounded-lg p-4 md:p-6 mb-6 md:mb-8 ink-reveal">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gold" />
              <h3 className="font-heading text-lg md:text-xl text-gold">
                {t.archetypeSelector.createCharacterTitle}
              </h3>
            </div>

            <p className="font-body text-sm text-parchment/70 mb-4">
              {t.archetypeSelector.youChosePrefix} <span className="text-gold">{getLocalized(selectedArchetype.name, locale as 'es' | 'en')}</span>. {t.archetypeSelector.addNameAndPersonality}
            </p>

            {/* Nombre del personaje */}
            <div className="mb-4">
              <label className="block font-ui text-sm text-gold mb-2">
                {t.archetypeSelector.characterNameLabel} *
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder={getLocalized(selectedArchetype.name, locale as 'es' | 'en')}
                className="w-full px-4 py-3 bg-shadow border border-gold-dim/50 rounded-lg
                         font-body text-parchment placeholder:text-parchment/30
                         focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50
                         transition-colors"
                maxLength={50}
              />
              <p className="text-xs text-parchment/50 mt-1">
                {t.archetypeSelector.minTwoChars}
              </p>
            </div>

            {/* Descripcion del personaje */}
            <div className="mb-4">
              <label className="block font-ui text-sm text-gold mb-2">
                {t.archetypeSelector.describeCharacterLabel}
                <span className="text-parchment/50 ml-1">({t.archetypeSelector.optional})</span>
              </label>
              <textarea
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value)}
                placeholder={t.archetypeSelector.descriptionPlaceholder}
                className="w-full px-4 py-3 bg-shadow border border-gold-dim/50 rounded-lg
                         font-body text-parchment placeholder:text-parchment/30
                         focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50
                         transition-colors resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-parchment/50">
                  {t.archetypeSelector.descriptionPortraitHint}
                </p>
                <span className="text-xs text-parchment/40">{characterDescription.length}/500</span>
              </div>
            </div>

            {/* Boton generar descripcion aleatoria */}
            <button
              type="button"
              onClick={handleGenerateDescription}
              className="flex items-center gap-2 px-4 py-2 bg-emerald/20 hover:bg-emerald/30
                       border border-emerald/50 rounded-lg text-emerald font-ui text-sm
                       transition-colors group"
            >
              <Dices className="w-4 h-4 group-hover:animate-spin" />
              {t.archetypeSelector.generateRandomDescription}
            </button>
          </div>
        )}

        {/* Botones de navegacion - fixed en mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:relative bg-shadow/95 md:bg-transparent p-4 md:p-0 border-t border-gold/20 md:border-0 flex justify-between items-center z-40">
          <RunicButton variant="secondary" onClick={onBack} className="text-sm md:text-base px-4 md:px-6">
            {t.archetypeSelector.back}
          </RunicButton>

          <RunicButton
            variant="primary"
            onClick={() => {
              if (canContinue) {
                handleSubmit()
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="text-sm md:text-base px-4 md:px-12"
          >
            {canContinue ? t.archetypeSelector.startAdventure : t.onboarding.buttons.completeFirst}
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
