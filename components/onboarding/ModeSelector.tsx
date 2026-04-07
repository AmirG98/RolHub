'use client'

import { useState, useRef } from 'react'
import { GameMode, GameEngine, TutorialLevel } from '@/lib/types/lore'
import { RunicButton } from '@/components/medieval/RunicButton'
import { useTranslations, useLanguage } from '@/lib/i18n'
import { OnboardingProgressBar } from './OnboardingProgressBar'

interface ModeSelectorProps {
  selectedTutorialLevel?: TutorialLevel | null
  onSelect: (data: {
    mode: GameMode
    engine: GameEngine
    tutorialLevel: TutorialLevel
    isMultiplayer: boolean
  }) => void
  onBack: () => void
}

export function ModeSelector({ selectedTutorialLevel, onSelect, onBack }: ModeSelectorProps) {
  const t = useTranslations()
  const { locale } = useLanguage()
  const isEN = locale === 'en'
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<GameEngine | null>(null)
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialLevel | null>(selectedTutorialLevel || null)
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(false)

  const engineRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
  }

  const isNovice = selectedTutorial === 'NOVICE'

  // Para novatos: auto-seleccionar Story Mode
  const effectiveEngine = isNovice ? 'STORY_MODE' as GameEngine : selectedEngine
  const canContinue = selectedMode && selectedTutorial && (isNovice || selectedEngine)

  const handleTutorialSelect = (level: TutorialLevel) => {
    setSelectedTutorial(level)
    if (level === 'NOVICE') {
      setSelectedEngine('STORY_MODE' as GameEngine)
      // Si ya eligió modo, auto-avanzar
      if (selectedMode) {
        setTimeout(() => onSelect({
          mode: selectedMode,
          engine: 'STORY_MODE' as GameEngine,
          tutorialLevel: level,
          isMultiplayer,
        }), 400)
      }
    } else {
      scrollTo(engineRef)
    }
  }

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full space-y-6 md:space-y-8 content-wrapper pb-24 md:pb-8">
        <OnboardingProgressBar step={2} />

        {/* Sección 1: Experiencia */}
        <div>
          <h2 className="font-title text-xl md:text-3xl text-gold-bright text-center mb-1">
            {t.onboarding.experience.title}
          </h2>
          <p className="font-ui text-xs md:text-sm text-parchment/60 text-center mb-4">
            {isEN ? 'This helps us tailor the experience for you' : 'Esto nos ayuda a adaptar la experiencia para vos'}
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            <button
              className={`glass-panel rounded-lg p-3 md:p-4 transition-all duration-200 hover:scale-[1.03] text-center ${
                selectedTutorial === 'NOVICE' ? 'glow-effect ring-2 ring-emerald' : ''
              }`}
              onClick={() => handleTutorialSelect('NOVICE')}
            >
              <div className="text-2xl md:text-3xl mb-1">🌱</div>
              <h3 className="font-heading text-sm md:text-base text-parchment">{isEN ? 'Beginner' : 'Novato'}</h3>
              <p className="font-ui text-[10px] md:text-xs text-parchment/60">{isEN ? 'First time with RPGs' : 'Primera vez con RPGs'}</p>
            </button>
            <button
              className={`glass-panel rounded-lg p-3 md:p-4 transition-all duration-200 hover:scale-[1.03] text-center ${
                selectedTutorial === 'VETERAN' ? 'glow-effect ring-2 ring-gold' : ''
              }`}
              onClick={() => handleTutorialSelect('VETERAN')}
            >
              <div className="text-2xl md:text-3xl mb-1">⚔️</div>
              <h3 className="font-heading text-sm md:text-base text-parchment">{isEN ? 'I know RPGs' : 'Conozco RPGs'}</h3>
              <p className="font-ui text-[10px] md:text-xs text-parchment/60">{isEN ? 'I have experience' : 'Tengo experiencia'}</p>
            </button>
          </div>
        </div>

        {/* Sección 2: Duración */}
        <div>
          <h2 className="font-title text-xl md:text-3xl text-gold-bright text-center mb-1">
            {t.onboarding.duration.title}
          </h2>
          <p className="font-ui text-xs md:text-sm text-parchment/60 text-center mb-4">
            {t.onboarding.duration.subtitle}
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            <button
              className={`glass-panel rounded-lg p-3 md:p-4 transition-all duration-200 hover:scale-[1.03] text-center ${
                selectedMode === 'ONE_SHOT' ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => {
                setSelectedMode('ONE_SHOT')
                if (isNovice && selectedTutorial) {
                  setTimeout(() => onSelect({
                    mode: 'ONE_SHOT',
                    engine: 'STORY_MODE' as GameEngine,
                    tutorialLevel: selectedTutorial,
                    isMultiplayer,
                  }), 400)
                } else if (selectedTutorial === 'VETERAN') {
                  scrollTo(engineRef)
                }
              }}
            >
              <div className="text-2xl md:text-3xl mb-1">⚡</div>
              <h3 className="font-heading text-sm md:text-base text-parchment">{t.onboarding.duration.oneShot}</h3>
              <p className="font-ui text-[10px] md:text-xs text-gold-dim">{t.onboarding.duration.oneShotDesc}</p>
            </button>
            <button
              className={`glass-panel rounded-lg p-3 md:p-4 transition-all duration-200 hover:scale-[1.03] text-center ${
                selectedMode === 'CAMPAIGN' ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => {
                setSelectedMode('CAMPAIGN')
                if (isNovice && selectedTutorial) {
                  setTimeout(() => onSelect({
                    mode: 'CAMPAIGN',
                    engine: 'STORY_MODE' as GameEngine,
                    tutorialLevel: selectedTutorial,
                    isMultiplayer,
                  }), 400)
                } else if (selectedTutorial === 'VETERAN') {
                  scrollTo(engineRef)
                }
              }}
            >
              <div className="text-2xl md:text-3xl mb-1">📖</div>
              <h3 className="font-heading text-sm md:text-base text-parchment">{t.onboarding.duration.campaign}</h3>
              <p className="font-ui text-[10px] md:text-xs text-neon-purple">{t.onboarding.duration.campaignDesc}</p>
            </button>
          </div>
        </div>

        {/* Sección 3: Engine — SOLO para veteranos */}
        {selectedTutorial === 'VETERAN' && (
          <div ref={engineRef}>
            <h2 className="font-title text-xl md:text-3xl text-gold-bright text-center mb-1">
              {isEN ? 'Game System' : 'Sistema de Juego'}
            </h2>
            <p className="font-ui text-xs md:text-sm text-parchment/60 text-center mb-4">
              {isEN ? 'Choose how dice and rules work' : 'Elegí cómo funcionan los dados y las reglas'}
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {[
                { id: 'STORY_MODE' as GameEngine, icon: '📚', name: isEN ? 'Pure Narrative' : 'Narrativo Puro', desc: isEN ? 'No complex rules' : 'Sin reglas complejas', color: 'text-neon-blue' },
                { id: 'DND_5E' as GameEngine, icon: '🐉', name: isEN ? 'Classic D&D' : 'D&D Clásico', desc: isEN ? 'd20 + ability scores' : 'd20 + habilidades', color: 'text-neon-purple' },
                { id: 'PBTA' as GameEngine, icon: '🎲', name: isEN ? 'Simple Dice' : 'Dados Simples', desc: isEN ? '2d6, partial successes' : '2d6, éxitos parciales', color: 'text-gold' },
                { id: 'YEAR_ZERO' as GameEngine, icon: '💀', name: isEN ? 'Survival' : 'Supervivencia', desc: isEN ? 'Scarce resources, push your luck' : 'Recursos escasos, arriesgá', color: 'text-blood' },
              ].map(eng => (
                <button
                  key={eng.id}
                  className={`glass-panel rounded-lg p-3 transition-all duration-200 hover:scale-[1.03] text-center ${
                    selectedEngine === eng.id ? 'glow-effect ring-2 ring-gold-bright' : ''
                  }`}
                  onClick={() => {
                    setSelectedEngine(eng.id)
                    if (selectedMode) {
                      setTimeout(() => onSelect({
                        mode: selectedMode,
                        engine: eng.id,
                        tutorialLevel: 'VETERAN',
                        isMultiplayer,
                      }), 400)
                    }
                  }}
                >
                  <div className="text-2xl mb-1">{eng.icon}</div>
                  <h3 className="font-heading text-sm text-parchment">{eng.name}</h3>
                  <p className={`font-ui text-[10px] ${eng.color}`}>{eng.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Novato hint */}
        {isNovice && selectedMode && (
          <div className="text-center p-3 glass-panel-dark rounded-lg border border-emerald/30 max-w-lg mx-auto">
            <p className="font-ui text-xs text-emerald">
              ✨ {isEN ? 'Story Mode selected automatically — no complex rules, just pure narrative adventure!' : 'Story Mode seleccionado automáticamente — sin reglas complejas, ¡pura aventura narrativa!'}
            </p>
          </div>
        )}

        {/* Botones */}
        <div ref={buttonsRef} className="fixed bottom-0 left-0 right-0 md:relative bg-shadow/95 md:bg-transparent p-4 md:p-0 border-t border-gold/20 md:border-0 flex justify-between items-center md:pt-4 z-40">
          <RunicButton variant="secondary" onClick={onBack} className="text-sm px-4">
            {t.onboarding.buttons.back}
          </RunicButton>

          <RunicButton
            variant="primary"
            onClick={() => {
              if (canContinue) {
                onSelect({
                  mode: selectedMode!,
                  engine: effectiveEngine!,
                  tutorialLevel: selectedTutorial!,
                  isMultiplayer,
                })
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="text-sm px-6 md:px-12"
          >
            {canContinue ? t.onboarding.buttons.continue : t.onboarding.buttons.completeFirst}
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
