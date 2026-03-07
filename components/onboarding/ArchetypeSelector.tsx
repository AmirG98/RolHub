'use client'

import { useState } from 'react'
import { Archetype } from '@/lib/types/lore'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Sword, BookOpen, Shield } from 'lucide-react'

interface ArchetypeSelectorProps {
  archetypes: Archetype[]
  onSelect: (archetype: Archetype) => void
  onBack: () => void
}

const archetypeIcons: Record<string, React.ReactNode> = {
  ranger: <Sword className="h-12 w-12" />,
  scholar: <BookOpen className="h-12 w-12" />,
  warrior: <Shield className="h-12 w-12" />,
}

export function ArchetypeSelector({ archetypes, onSelect, onBack }: ArchetypeSelectorProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null)

  return (
    <div className="min-h-screen bg-shadow flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <h1 className="font-title text-4xl md:text-5xl text-gold-bright text-center mb-4 ink-reveal">
          Elegí Quién Sos
        </h1>
        <p className="font-ui text-parchment text-center mb-12 text-lg">
          Tu arquetipo define tus habilidades y tu rol en la historia
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {archetypes.map((archetype) => (
            <ParchmentPanel
              key={archetype.id}
              variant={selectedArchetype?.id === archetype.id ? 'ornate' : 'default'}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedArchetype?.id === archetype.id ? 'ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => setSelectedArchetype(archetype)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icono */}
                <div className="text-gold-bright">
                  {archetypeIcons[archetype.id] || <Sword className="h-12 w-12" />}
                </div>

                {/* Nombre */}
                <h3 className="font-heading text-2xl text-ink">{archetype.name}</h3>

                {/* Descripción simple */}
                <p className="font-body text-stone text-sm leading-relaxed">
                  {archetype.simple_description}
                </p>

                {/* Stats visuales */}
                <div className="w-full pt-4 border-t border-gold-dim/30">
                  <div className="grid grid-cols-2 gap-2 text-xs font-ui">
                    <div>
                      <span className="text-gold-dim">Vida:</span>{' '}
                      <span className="text-ink font-semibold">{archetype.starting_stats.maxHp}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Combate:</span>{' '}
                      <span className="text-ink font-semibold">{archetype.starting_stats.combat}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Exploración:</span>{' '}
                      <span className="text-ink font-semibold">{archetype.starting_stats.exploration}</span>
                    </div>
                    <div>
                      <span className="text-gold-dim">Social:</span>{' '}
                      <span className="text-ink font-semibold">{archetype.starting_stats.social}</span>
                    </div>
                  </div>
                </div>

                {/* Habilidad especial */}
                <div className="w-full pt-2">
                  <p className="text-xs font-ui text-emerald font-semibold">
                    {archetype.special_ability}
                  </p>
                </div>
              </div>
            </ParchmentPanel>
          ))}
        </div>

        {/* Panel de detalles cuando hay selección */}
        {selectedArchetype && (
          <ParchmentPanel variant="ornate" className="mb-8 ink-reveal">
            <h3 className="font-heading text-xl text-ink mb-4">Equipamiento Inicial</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {selectedArchetype.starting_inventory.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 font-body text-stone text-sm">
                  <span className="text-gold-dim">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </ParchmentPanel>
        )}

        {/* Botones de navegación */}
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
