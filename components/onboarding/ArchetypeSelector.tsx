'use client'

import { useState } from 'react'
import { Archetype } from '@/lib/types/lore'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Sword, BookOpen, Shield, Zap, Heart, Eye, Target, Sparkles, Skull, Star } from 'lucide-react'

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
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null)

  if (archetypes.length === 0) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center p-8">
        <div className="text-center content-wrapper glass-panel-dark p-8 rounded-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="font-heading text-blood text-2xl mb-4">No hay arquetipos disponibles</h2>
          <p className="font-body text-parchment/80 mb-6">
            Este mundo no tiene personajes configurados todavia.
          </p>
          <RunicButton variant="secondary" onClick={onBack}>
            Volver
          </RunicButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-8">
      <div className="max-w-6xl w-full content-wrapper">
        <h1 className="font-title text-4xl md:text-5xl text-gold-bright text-center mb-2 ink-reveal glow-effect-on-hover">
          Elegi Quien Sos
        </h1>
        {loreName && (
          <p className="font-heading text-gold/80 text-center mb-2 text-lg">
            en {loreName}
          </p>
        )}
        <p className="font-ui text-parchment/80 text-center mb-12">
          Tu arquetipo define tus habilidades y tu rol en la historia
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {archetypes.map((archetype) => (
            <div
              key={archetype.id}
              className={`glass-panel rounded-lg p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedArchetype?.id === archetype.id ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => setSelectedArchetype(archetype)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icono */}
                <div className="text-gold-bright">
                  {getArchetypeIcon(archetype.id)}
                </div>

                {/* Nombre */}
                <h3 className="font-heading text-2xl text-gold">{archetype.name}</h3>

                {/* Descripcion simple */}
                <p className="font-body text-parchment/80 text-sm leading-relaxed">
                  {archetype.simple_description || archetype.description}
                </p>

                {/* Stats visuales */}
                {archetype.starting_stats && (
                  <div className="w-full pt-4 border-t border-gold-dim/30">
                    <div className="grid grid-cols-2 gap-2 text-xs font-ui">
                      <div>
                        <span className="text-gold-dim">Vida:</span>{' '}
                        <span className="text-parchment font-semibold">{archetype.starting_stats.maxHp}</span>
                      </div>
                      <div>
                        <span className="text-gold-dim">Combate:</span>{' '}
                        <span className="text-parchment font-semibold">{archetype.starting_stats.combat}</span>
                      </div>
                      <div>
                        <span className="text-gold-dim">Exploracion:</span>{' '}
                        <span className="text-parchment font-semibold">{archetype.starting_stats.exploration}</span>
                      </div>
                      <div>
                        <span className="text-gold-dim">Social:</span>{' '}
                        <span className="text-parchment font-semibold">{archetype.starting_stats.social}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Habilidad especial */}
                {archetype.special_ability && (
                  <div className="w-full pt-2">
                    <p className="text-xs font-ui text-emerald font-semibold">
                      {archetype.special_ability}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Panel de detalles cuando hay seleccion */}
        {selectedArchetype && selectedArchetype.starting_inventory && (
          <div className="glass-panel-dark rounded-lg p-6 mb-8 ink-reveal">
            <h3 className="font-heading text-xl text-gold mb-4">Equipamiento Inicial</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {selectedArchetype.starting_inventory.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 font-body text-parchment/80 text-sm">
                  <span className="text-gold-dim">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de navegacion */}
        <div className="flex justify-between items-center">
          <RunicButton variant="secondary" onClick={onBack}>
            Volver
          </RunicButton>

          <RunicButton
            variant="primary"
            disabled={!selectedArchetype}
            onClick={() => selectedArchetype && onSelect(selectedArchetype)}
            className="px-12"
          >
            Comenzar Aventura
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
