'use client'

import { useState } from 'react'
import { GameMode, GameEngine, TutorialLevel } from '@/lib/types/lore'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Clock, Calendar, Book, Dices, Sword, Users } from 'lucide-react'

interface ModeSelectorProps {
  onSelect: (data: {
    mode: GameMode
    engine: GameEngine
    tutorialLevel: TutorialLevel
  }) => void
  onBack: () => void
}

const modes = [
  {
    id: 'ONE_SHOT' as GameMode,
    name: 'Misión Única',
    description: '45-60 minutos. Una aventura autoconclusiva que termina en una sola sesión',
    icon: <Clock className="h-12 w-12" />,
  },
  {
    id: 'CAMPAIGN' as GameMode,
    name: 'Campaña',
    description: 'Múltiples sesiones. Tu personaje evoluciona a través de una historia épica',
    icon: <Calendar className="h-12 w-12" />,
  },
]

const engines = [
  {
    id: 'STORY_MODE' as GameEngine,
    name: 'Modo Historia',
    description: 'Sin dados ni números. Todo se decide narrativamente. Ideal para principiantes.',
    icon: <Book className="h-12 w-12" />,
    recommended: true,
  },
  {
    id: 'PBTA' as GameEngine,
    name: 'Powered by Apocalypse',
    description: 'Sistema simple con 2d6. Los fallos siempre avanzan la historia.',
    icon: <Dices className="h-12 w-12" />,
    recommended: false,
  },
  {
    id: 'YEAR_ZERO' as GameEngine,
    name: 'Year Zero Engine',
    description: 'Recursos escasos y decisiones difíciles. Pool de d6 con mecánica de empujar.',
    icon: <Sword className="h-12 w-12" />,
    recommended: false,
  },
  {
    id: 'DND_5E' as GameEngine,
    name: 'D&D 5e (SRD)',
    description: 'Sistema clásico con d20, clases, niveles y spell slots. Para veteranos.',
    icon: <Users className="h-12 w-12" />,
    recommended: false,
  },
]

const tutorialLevels = [
  {
    id: 'NOVICE' as TutorialLevel,
    name: 'Primera vez',
    description: 'Nunca jugué algo así - quiero un tutorial completo',
  },
  {
    id: 'CASUAL' as TutorialLevel,
    name: 'Jugué RPGs',
    description: 'Jugué videojuegos RPG como Skyrim o Baldur\'s Gate',
  },
  {
    id: 'EXPERIENCED' as TutorialLevel,
    name: 'Jugué D&D',
    description: 'Jugué D&D o similar alguna vez',
  },
  {
    id: 'VETERAN' as TutorialLevel,
    name: 'Soy veterano',
    description: 'Juego rol regularmente, sé lo que hago',
  },
]

export function ModeSelector({ onSelect, onBack }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<GameEngine | null>(null)
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialLevel | null>(null)

  const canContinue = selectedMode && selectedEngine && selectedTutorial

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-12 content-wrapper">
        {/* Paso 1: Modo de juego */}
        <div>
          <h2 className="font-title text-4xl text-gold-bright text-center mb-4 ink-reveal">
            ¿Cómo Querés Jugar?
          </h2>
          <p className="font-ui text-parchment text-center mb-8">
            Elegí el tipo de experiencia que buscás
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className={`glass-panel rounded-lg p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedMode === mode.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="text-gold-bright">{mode.icon}</div>
                  <h3 className="font-heading text-2xl text-gold">{mode.name}</h3>
                  <p className="font-body text-parchment/80 text-sm">{mode.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paso 2: Motor de reglas */}
        <div>
          <h2 className="font-title text-4xl text-gold-bright text-center mb-4">
            Motor de Reglas
          </h2>
          <p className="font-ui text-parchment text-center mb-8">
            Define cómo se resuelven las acciones en el juego
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {engines.map((engine) => (
              <div
                key={engine.id}
                className={`glass-panel rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-105 relative ${
                  selectedEngine === engine.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                }`}
                onClick={() => setSelectedEngine(engine.id)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="text-gold-bright">{engine.icon}</div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-xl text-parchment">{engine.name}</h3>
                    {engine.recommended && (
                      <span className="bg-emerald text-parchment px-2 py-0.5 rounded-full text-xs font-ui font-semibold">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="font-body text-parchment/70 text-xs">{engine.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paso 3: Nivel de experiencia */}
        <div>
          <h2 className="font-title text-4xl text-gold-bright text-center mb-4">
            Tu Experiencia
          </h2>
          <p className="font-ui text-parchment text-center mb-8">
            Esto nos ayuda a ajustar los tutoriales y la dificultad
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {tutorialLevels.map((level) => (
              <div
                key={level.id}
                className={`glass-panel rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedTutorial === level.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                }`}
                onClick={() => setSelectedTutorial(level.id)}
              >
                <div className="text-center space-y-2">
                  <h3 className="font-heading text-lg text-parchment">{level.name}</h3>
                  <p className="font-body text-parchment/70 text-xs">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center pt-6">
          <RunicButton variant="secondary" onClick={onBack}>
            Volver
          </RunicButton>

          <RunicButton
            variant="primary"
            disabled={!canContinue}
            onClick={() =>
              canContinue &&
              onSelect({
                mode: selectedMode,
                engine: selectedEngine,
                tutorialLevel: selectedTutorial,
              })
            }
            className="px-12"
          >
            Continuar
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
