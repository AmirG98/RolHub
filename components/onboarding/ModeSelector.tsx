'use client'

import { useState } from 'react'
import { GameMode, GameEngine, TutorialLevel } from '@/lib/types/lore'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { RunicButton } from '@/components/medieval/RunicButton'
import { useTranslations } from '@/lib/i18n'
import { Clock, Calendar, Book, Dices, Sword, Users, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface ModeSelectorProps {
  onSelect: (data: {
    mode: GameMode
    engine: GameEngine
    tutorialLevel: TutorialLevel
    isMultiplayer: boolean
  }) => void
  onBack: () => void
}


export function ModeSelector({ onSelect, onBack }: ModeSelectorProps) {
  const t = useTranslations()
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<GameEngine | null>(null)
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialLevel | null>(null)
  const [isMultiplayer, setIsMultiplayer] = useState<boolean | null>(null)

  const canContinue = selectedMode && selectedEngine && selectedTutorial && isMultiplayer !== null

  // Dynamic content based on translations
  const modes = [
    {
      id: 'ONE_SHOT' as GameMode,
      name: t.onboarding.duration.oneShot,
      tagline: t.onboarding.duration.oneShotDesc,
      description: t.onboarding.duration.oneShotDetail,
      icon: '⚡',
      color: '#FFD93D',
    },
    {
      id: 'CAMPAIGN' as GameMode,
      name: t.onboarding.duration.campaign,
      tagline: t.onboarding.duration.campaignDesc,
      description: t.onboarding.duration.campaignDetail,
      icon: '📖',
      color: '#B026FF',
    },
  ]

  const engines = [
    {
      id: 'STORY_MODE' as GameEngine,
      name: t.onboarding.engine.storyMode,
      tagline: t.onboarding.engine.storyModeDesc,
      description: t.onboarding.engine.storyModeDetail,
      icon: '📚',
      color: '#00D9FF',
      recommended: true,
      comingSoon: false,
    },
    {
      id: 'DND_5E' as GameEngine,
      name: t.onboarding.engine.dnd,
      tagline: t.onboarding.engine.dndDesc,
      description: t.onboarding.engine.dndDetail,
      icon: '🐉',
      color: '#B026FF',
      recommended: false,
      comingSoon: false,
    },
    {
      id: 'PBTA' as GameEngine,
      name: t.onboarding.engine.pbta,
      tagline: t.onboarding.engine.pbtaDesc,
      description: t.onboarding.engine.pbtaDetail,
      icon: '🎲',
      color: '#FFD93D',
      recommended: false,
      comingSoon: true,
    },
    {
      id: 'YEAR_ZERO' as GameEngine,
      name: t.onboarding.engine.yearZero,
      tagline: t.onboarding.engine.yearZeroDesc,
      description: t.onboarding.engine.yearZeroDetail,
      icon: '💀',
      color: '#FF6B6B',
      recommended: false,
      comingSoon: true,
    },
  ]

  const tutorialLevels = [
    {
      id: 'NOVICE' as TutorialLevel,
      name: t.onboarding.experience.novice,
      description: t.onboarding.experience.noviceDesc,
      icon: '🌱',
      color: '#39FF14',
    },
    {
      id: 'CASUAL' as TutorialLevel,
      name: t.onboarding.experience.casual,
      description: t.onboarding.experience.casualDesc,
      icon: '🎮',
      color: '#00D9FF',
    },
    {
      id: 'EXPERIENCED' as TutorialLevel,
      name: t.onboarding.experience.experienced,
      description: t.onboarding.experience.experiencedDesc,
      icon: '🎲',
      color: '#FFD93D',
    },
    {
      id: 'VETERAN' as TutorialLevel,
      name: t.onboarding.experience.veteran,
      description: t.onboarding.experience.veteranDesc,
      icon: '⚔️',
      color: '#B026FF',
    },
  ]

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full space-y-8 md:space-y-12 content-wrapper pb-24 md:pb-8">
        {/* Paso 0: Solo o con amigos */}
        <div>
          <h2 className="font-title text-2xl md:text-4xl text-gold-bright text-center mb-2 md:mb-4 ink-reveal">
            {t.onboarding.chooseMode.title}
          </h2>
          <p className="font-ui text-sm md:text-base text-parchment text-center mb-4 md:mb-8">
            {t.onboarding.chooseMode.subtitle}
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-2xl mx-auto">
            <button
              className={`glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-105 text-center ${
                isMultiplayer === false ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => setIsMultiplayer(false)}
            >
              <div className="text-4xl md:text-6xl mb-2 md:mb-3">🧙</div>
              <h3 className="font-heading text-lg md:text-2xl text-parchment mb-1 md:mb-2">{t.onboarding.chooseMode.solo}</h3>
              <p className="font-ui text-xs md:text-sm text-gold-dim mb-1">
                {t.onboarding.chooseMode.soloDesc}
              </p>
              <p className="font-body text-xs text-parchment/60 hidden md:block">
                {t.onboarding.chooseMode.soloDetail}
              </p>
            </button>

            <button
              className={`glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-105 text-center ${
                isMultiplayer === true ? 'glow-effect ring-2 ring-gold-bright' : ''
              }`}
              onClick={() => setIsMultiplayer(true)}
            >
              <div className="text-4xl md:text-6xl mb-2 md:mb-3">👥</div>
              <h3 className="font-heading text-lg md:text-2xl text-parchment mb-1 md:mb-2">{t.onboarding.chooseMode.withFriends}</h3>
              <p className="font-ui text-xs md:text-sm text-emerald mb-1">
                {t.onboarding.chooseMode.withFriendsDesc}
              </p>
              <p className="font-body text-xs text-parchment/60 hidden md:block">
                {t.onboarding.chooseMode.withFriendsDetail}
              </p>
            </button>
          </div>
        </div>

        {/* Paso 1: Modo de juego */}
        <div>
          <h2 className="font-title text-2xl md:text-4xl text-gold-bright text-center mb-2 md:mb-4">
            {t.onboarding.duration.title}
          </h2>
          <p className="font-ui text-sm md:text-base text-parchment text-center mb-4 md:mb-8">
            {t.onboarding.duration.subtitle}
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
            {t.onboarding.engine.title}
          </h2>
          <p className="font-ui text-sm md:text-base text-parchment text-center mb-4 md:mb-8">
            {t.onboarding.engine.subtitle}
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {engines.map((engine) => (
              <button
                key={engine.id}
                className={`glass-panel rounded-lg p-3 md:p-4 transition-all duration-300 text-left relative ${
                  engine.comingSoon
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-105'
                } ${
                  selectedEngine === engine.id && !engine.comingSoon ? 'glow-effect ring-2 ring-gold-bright' : ''
                }`}
                onClick={() => !engine.comingSoon && setSelectedEngine(engine.id)}
                disabled={engine.comingSoon}
              >
                {engine.recommended && (
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-emerald text-parchment px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-ui font-semibold">
                    ★ {t.onboarding.engine.recommended}
                  </div>
                )}
                {engine.comingSoon && (
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-gold/80 text-shadow px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-ui font-semibold">
                    Próximamente
                  </div>
                )}
                <div className="text-2xl md:text-4xl mb-1 md:mb-2">{engine.icon}</div>
                <h3 className="font-heading text-sm md:text-lg text-parchment mb-0.5 md:mb-1 line-clamp-1">{engine.name}</h3>
                <p className="font-ui text-[10px] md:text-xs mb-1 md:mb-2 line-clamp-1" style={{ color: engine.comingSoon ? '#888' : engine.color }}>
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
            {t.onboarding.experience.title}
          </h2>
          <p className="font-ui text-sm md:text-base text-parchment text-center mb-4 md:mb-6">
            {t.onboarding.experience.subtitle}
          </p>
          <div className="text-center mb-4 md:mb-6">
            <Link href="/guias/como-jugar" className="inline-flex items-center gap-2 font-ui text-xs md:text-sm text-emerald hover:text-emerald/80 transition">
              <HelpCircle size={14} />
              Primera vez jugando rol? Te explicamos paso a paso
            </Link>
          </div>

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
            {t.onboarding.buttons.back}
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
            {t.onboarding.buttons.continue}
          </RunicButton>
        </div>
      </div>
    </div>
  )
}
