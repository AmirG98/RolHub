'use client'

import { useState } from 'react'
import { Archetype } from '@/lib/types/lore'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Sword, BookOpen, Shield, Zap, Heart, Eye, Target, Sparkles, Skull, Star } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface ArchetypeSelectorProps {
  archetypes: Archetype[]
  loreName?: string
  onSelect: (archetype: Archetype) => void
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
    // Star Wars
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
  }
  return iconMap[id] || <Sword className="h-12 w-12" />
}

export function ArchetypeSelector({ archetypes, loreName, onSelect, onBack }: ArchetypeSelectorProps) {
  const t = useTranslations()
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null)

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
        <h1 className="font-title text-2xl sm:text-3xl md:text-5xl text-gold-bright text-center mb-1 md:mb-2 ink-reveal glow-effect-on-hover">
          {t.archetypeSelector.chooseWhoYouAre}
        </h1>
        {loreName && (
          <p className="font-heading text-gold/80 text-center mb-1 md:mb-2 text-sm md:text-lg">
            {t.archetypeSelector.inWorld} {loreName}
          </p>
        )}
        <p className="font-ui text-sm md:text-base text-parchment/80 text-center mb-6 md:mb-12">
          {t.archetypeSelector.archetypeDefines}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {archetypes.map((archetype) => (
            <div
              key={archetype.id}
              className={`glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedArchetype?.id === archetype.id ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => setSelectedArchetype(archetype)}
            >
              <div className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-0 sm:space-y-4">
                {/* Icono */}
                <div className="text-gold-bright flex-shrink-0 [&>svg]:h-10 [&>svg]:w-10 md:[&>svg]:h-12 md:[&>svg]:w-12">
                  {getArchetypeIcon(archetype.id)}
                </div>

                <div className="flex-1 sm:flex-none sm:w-full">
                  {/* Nombre */}
                  <h3 className="font-heading text-lg md:text-2xl text-gold mb-1 sm:mb-0">{archetype.name}</h3>

                  {/* Descripcion simple */}
                  <p className="font-body text-parchment/80 text-xs md:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none sm:mt-2">
                    {archetype.simple_description || archetype.description}
                  </p>

                  {/* Stats visuales - solo desktop */}
                  {archetype.starting_stats && (
                    <div className="hidden sm:block w-full pt-4 border-t border-gold-dim/30 mt-4">
                      <div className="grid grid-cols-2 gap-2 text-xs font-ui">
                        <div>
                          <span className="text-gold-dim">{t.archetypeSelector.hp}:</span>{' '}
                          <span className="text-parchment font-semibold">{archetype.starting_stats.maxHp}</span>
                        </div>
                        <div>
                          <span className="text-gold-dim">{t.archetypeSelector.combat}:</span>{' '}
                          <span className="text-parchment font-semibold">{archetype.starting_stats.combat}</span>
                        </div>
                        <div>
                          <span className="text-gold-dim">{t.archetypeSelector.exploration}:</span>{' '}
                          <span className="text-parchment font-semibold">{archetype.starting_stats.exploration}</span>
                        </div>
                        <div>
                          <span className="text-gold-dim">{t.archetypeSelector.social}:</span>{' '}
                          <span className="text-parchment font-semibold">{archetype.starting_stats.social}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Habilidad especial - solo desktop */}
                  {archetype.special_ability && (
                    <div className="hidden sm:block w-full pt-2">
                      <p className="text-xs font-ui text-emerald font-semibold line-clamp-2">
                        {archetype.special_ability}
                      </p>
                    </div>
                  )}
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
                    <div className="text-gold-dim">{t.archetypeSelector.hp}</div>
                  </div>
                  <div>
                    <div className="text-parchment font-semibold text-lg">{selectedArchetype.starting_stats.combat}</div>
                    <div className="text-gold-dim">{t.archetypeSelector.combat}</div>
                  </div>
                  <div>
                    <div className="text-parchment font-semibold text-lg">{selectedArchetype.starting_stats.exploration}</div>
                    <div className="text-gold-dim">{t.archetypeSelector.exploration}</div>
                  </div>
                  <div>
                    <div className="text-parchment font-semibold text-lg">{selectedArchetype.starting_stats.social}</div>
                    <div className="text-gold-dim">{t.archetypeSelector.social}</div>
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

            {selectedArchetype.starting_inventory && (
              <>
                <h3 className="font-heading text-base md:text-xl text-gold mb-3 md:mb-4">{t.archetypeSelector.startingEquipment}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
                  {selectedArchetype.starting_inventory.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 font-body text-parchment/80 text-xs md:text-sm">
                      <span className="text-gold-dim">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Botones de navegacion - fixed en mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:relative bg-shadow/95 md:bg-transparent p-4 md:p-0 border-t border-gold/20 md:border-0 flex justify-between items-center z-40">
          <RunicButton variant="secondary" onClick={onBack} className="text-sm md:text-base px-4 md:px-6">
            {t.archetypeSelector.back}
          </RunicButton>

          <RunicButton
            variant="primary"
            disabled={!selectedArchetype}
            onClick={() => selectedArchetype && onSelect(selectedArchetype)}
            className="text-sm md:text-base px-4 md:px-12"
          >
            {t.archetypeSelector.startAdventure}
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
