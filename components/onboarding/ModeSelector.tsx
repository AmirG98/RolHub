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
    isMultiplayer: boolean
  }) => void
  onBack: () => void
}

const modes = [
  {
    id: 'ONE_SHOT' as GameMode,
    name: 'Misión Única',
    tagline: 'Aventura de una sola sesión',
    description: '45-60 minutos de acción concentrada',
    icon: '⚡',
    color: '#FFD93D',
  },
  {
    id: 'CAMPAIGN' as GameMode,
    name: 'Campaña',
    tagline: 'Historia larga y épica',
    description: 'Múltiples sesiones con evolución del personaje',
    icon: '📖',
    color: '#B026FF',
  },
]

const engines = [
  {
    id: 'STORY_MODE' as GameEngine,
    name: 'Modo Historia',
    tagline: 'Sin dados, narrativo puro',
    description: 'Todo se decide por la historia. Ideal para principiantes.',
    icon: '📚',
    color: '#00D9FF',
    recommended: true,
  },
  {
    id: 'PBTA' as GameEngine,
    name: 'Powered by Apocalypse',
    tagline: '2d6, fallos interesantes',
    description: 'Sistema simple. Los fallos avanzan la historia.',
    icon: '🎲',
    color: '#FFD93D',
    recommended: false,
  },
  {
    id: 'YEAR_ZERO' as GameEngine,
    name: 'Year Zero Engine',
    tagline: 'Pool de d6, supervivencia',
    description: 'Recursos escasos y decisiones difíciles.',
    icon: '💀',
    color: '#FF6B6B',
    recommended: false,
  },
  {
    id: 'DND_5E' as GameEngine,
    name: 'D&D 5e',
    tagline: 'd20, reglas clásicas',
    description: 'Sistema tradicional. Para veteranos de rol.',
    icon: '🐉',
    color: '#B026FF',
    recommended: false,
  },
]

const tutorialLevels = [
  {
    id: 'NOVICE' as TutorialLevel,
    name: 'Primera vez',
    description: 'Nunca jugué algo así - quiero un tutorial completo',
    icon: '🌱',
    color: '#39FF14',
  },
  {
    id: 'CASUAL' as TutorialLevel,
    name: 'Jugué RPGs',
    description: 'Jugué videojuegos RPG como Skyrim o Baldur\'s Gate',
    icon: '🎮',
    color: '#00D9FF',
  },
  {
    id: 'EXPERIENCED' as TutorialLevel,
    name: 'Jugué D&D',
    description: 'Jugué D&D o similar alguna vez',
    icon: '🎲',
    color: '#FFD93D',
  },
  {
    id: 'VETERAN' as TutorialLevel,
    name: 'Soy veterano',
    description: 'Juego rol regularmente, sé lo que hago',
    icon: '⚔️',
    color: '#B026FF',
  },
]

export function ModeSelector({ onSelect, onBack }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<GameEngine | null>(null)
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialLevel | null>(null)
  const [isMultiplayer, setIsMultiplayer] = useState<boolean | null>(null)

  const canContinue = selectedMode && selectedEngine && selectedTutorial && isMultiplayer !== null

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full space-y-8 md:space-y-12 content-wrapper pb-24 md:pb-8">
        {/* Paso 0: Solo o con amigos */}
        <div>
          <h2 className="font-title text-2xl md:text-4xl text-gold-bright text-center mb-2 md:mb-4 ink-reveal">
            ¿Cómo Querés Jugar?
          </h2>
          <p className="font-ui text-sm md:text-base text-parchment text-center mb-4 md:mb-8">
            Elegí si querés jugar solo o invitar amigos
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-2xl mx-auto">
            <button
              className={`glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-105 text-center ${
                isMultiplayer === false ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => setIsMultiplayer(false)}
            >
              <div className="text-4xl md:text-6xl mb-2 md:mb-3">🧙</div>
              <h3 className="font-heading text-lg md:text-2xl text-parchment mb-1 md:mb-2">Solo</h3>
              <p className="font-ui text-xs md:text-sm text-gold-dim mb-1">
                Aventura en solitario
              </p>
              <p className="font-body text-xs text-parchment/60 hidden md:block">
                Tú y el DM virtual. Perfecto para aprender.
              </p>
            </button>

            <button
              className={`glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-105 text-center ${
                isMultiplayer === true ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => setIsMultiplayer(true)}
            >
              <div className="text-4xl md:text-6xl mb-2 md:mb-3">👥</div>
              <h3 className="font-heading text-lg md:text-2xl text-parchment mb-1 md:mb-2">Con Amigos</h3>
              <p className="font-ui text-xs md:text-sm text-emerald mb-1">
                Hasta 8 jugadores
              </p>
              <p className="font-body text-xs text-parchment/60 hidden md:block">
                Invita a tus amigos con un código o link.
              </p>
            </button>
          </div>
        </div>

        {/* Paso 1: Modo de juego */}
        <div>
          <h2 className="font-title text-2xl md:text-4xl text-gold-bright text-center mb-2 md:mb-4">
            Duración de la Aventura
          </h2>
          <p className="font-ui text-sm md:text-base text-parchment text-center mb-4 md:mb-8">
            Elegí el tipo de experiencia que buscás
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {modes.map((mode) => (
              <button
                key={mode.id}
                className={`glass-panel rounded-lg p-3 md:p-6 cursor-pointer transition-all duration-300 hover:scale-105 text-left ${
                  selectedMode === mode.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className="text-3xl md:text-5xl mb-2 md:mb-3">{mode.icon}</div>
                <h3 className="font-heading text-base md:text-2xl text-parchment mb-1 md:mb-2">{mode.name}</h3>
                <p className="font-ui text-xs md:text-sm mb-1 md:mb-2 line-clamp-2" style={{ color: mode.color }}>
                  {mode.tagline}
                </p>
                <p className="font-body text-xs text-parchment/60 hidden md:block">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Paso 2: Motor de reglas */}
        <div>
          <h2 className="font-title text-2xl md:text-4xl text-gold-bright text-center mb-2 md:mb-4">
            Motor de Reglas
          </h2>
          <p className="font-ui text-sm md:text-base text-parchment text-center mb-4 md:mb-8">
            Define cómo se resuelven las acciones
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {engines.map((engine) => (
              <button
                key={engine.id}
                className={`glass-panel rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-300 hover:scale-105 text-left relative ${
                  selectedEngine === engine.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                }`}
                onClick={() => setSelectedEngine(engine.id)}
              >
                {engine.recommended && (
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-emerald text-parchment px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-ui font-semibold">
                    ★
                  </div>
                )}
                <div className="text-2xl md:text-4xl mb-1 md:mb-2">{engine.icon}</div>
                <h3 className="font-heading text-sm md:text-lg text-parchment mb-0.5 md:mb-1 line-clamp-1">{engine.name}</h3>
                <p className="font-ui text-[10px] md:text-xs mb-1 md:mb-2 line-clamp-1" style={{ color: engine.color }}>
                  {engine.tagline}
                </p>
                <p className="font-body text-xs text-parchment/60 hidden md:block">{engine.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Paso 3: Nivel de experiencia */}
        <div>
          <h2 className="font-title text-2xl md:text-4xl text-gold-bright text-center mb-2 md:mb-4">
            Tu Experiencia
          </h2>
          <p className="font-ui text-sm md:text-base text-parchment text-center mb-4 md:mb-8">
            Ajustamos tutoriales según tu nivel
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {tutorialLevels.map((level) => (
              <button
                key={level.id}
                className={`glass-panel rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-300 hover:scale-105 text-left ${
                  selectedTutorial === level.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                }`}
                onClick={() => setSelectedTutorial(level.id)}
              >
                <div className="text-2xl md:text-4xl mb-1 md:mb-2">{level.icon}</div>
                <h3 className="font-heading text-sm md:text-lg text-parchment mb-0.5 md:mb-1">{level.name}</h3>
                <p className="font-body text-[10px] md:text-xs text-parchment/60 line-clamp-2">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Botones de navegación - fixed en mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:relative bg-shadow/95 md:bg-transparent p-4 md:p-0 border-t border-gold/20 md:border-0 flex justify-between items-center md:pt-6 z-40">
          <RunicButton variant="secondary" onClick={onBack} className="text-sm md:text-base px-4 md:px-6">
            ← Volver
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
                isMultiplayer: isMultiplayer,
              })
            }
            className="text-sm md:text-base px-6 md:px-12"
          >
            Continuar →
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
