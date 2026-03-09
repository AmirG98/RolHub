'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import { GuestWarningModal } from '@/components/guest/GuestWarningBanner'
import { useGuest, GuestCharacter } from '@/lib/guest'
import { useLanguage } from '@/lib/i18n'
import GuestGameSession from './GuestGameSession'
import { Play, Scroll, Swords, Map, MessageCircle, ChevronRight } from 'lucide-react'

// Lores disponibles para guest (simplificado)
const GUEST_LORES = [
  { id: 'LOTR', name: 'Tierras Medias', nameEn: 'Middle Earth', emoji: '🧙', description: 'Fantasía épica tolkieniana' },
  { id: 'ZOMBIES', name: 'Apocalipsis Zombie', nameEn: 'Zombie Apocalypse', emoji: '🧟', description: 'Supervivencia y horror' },
  { id: 'VIKINGOS', name: 'Vikingos', nameEn: 'Vikings', emoji: '⚔️', description: 'Épica nórdica' },
]

// Arquetipos simplificados para guest
const GUEST_ARCHETYPES: Record<string, { id: string; name: string; nameEn: string; stats: Record<string, number> }[]> = {
  LOTR: [
    { id: 'warrior', name: 'Guerrero', nameEn: 'Warrior', stats: { combat: 4, exploration: 2, social: 2, lore: 1 } },
    { id: 'ranger', name: 'Montaraz', nameEn: 'Ranger', stats: { combat: 3, exploration: 4, social: 1, lore: 2 } },
    { id: 'mage', name: 'Mago', nameEn: 'Mage', stats: { combat: 1, exploration: 2, social: 3, lore: 4 } },
  ],
  ZOMBIES: [
    { id: 'survivor', name: 'Superviviente', nameEn: 'Survivor', stats: { combat: 3, exploration: 3, social: 2, lore: 1 } },
    { id: 'medic', name: 'Médico', nameEn: 'Medic', stats: { combat: 1, exploration: 2, social: 3, lore: 4 } },
    { id: 'soldier', name: 'Soldado', nameEn: 'Soldier', stats: { combat: 4, exploration: 2, social: 2, lore: 1 } },
  ],
  VIKINGOS: [
    { id: 'berserker', name: 'Berserker', nameEn: 'Berserker', stats: { combat: 5, exploration: 2, social: 1, lore: 1 } },
    { id: 'skald', name: 'Skald', nameEn: 'Skald', stats: { combat: 2, exploration: 2, social: 4, lore: 3 } },
    { id: 'explorer', name: 'Explorador', nameEn: 'Explorer', stats: { combat: 2, exploration: 4, social: 2, lore: 2 } },
  ],
}

type Step = 'warning' | 'lore' | 'archetype' | 'name' | 'playing'

export default function PlayGuestPage() {
  const router = useRouter()
  const { locale } = useLanguage()
  const { isGuest, session, startGuestSession, setGuestCharacter } = useGuest()
  const isEnglish = locale === 'en'

  const [step, setStep] = useState<Step>('warning')
  const [selectedLore, setSelectedLore] = useState<string | null>(null)
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null)
  const [characterName, setCharacterName] = useState('')

  // Si ya hay sesión de guest activa, ir directo a jugar
  useEffect(() => {
    if (isGuest && session?.character) {
      setStep('playing')
    }
  }, [isGuest, session])

  const labels = isEnglish ? {
    selectWorld: 'Choose Your World',
    selectArchetype: 'Choose Your Class',
    nameCharacter: 'Name Your Character',
    namePlaceholder: 'Enter a name...',
    startAdventure: 'Start Adventure',
    back: 'Back',
    continue: 'Continue'
  } : {
    selectWorld: 'Elegí tu Mundo',
    selectArchetype: 'Elegí tu Clase',
    nameCharacter: 'Nombrá a tu Personaje',
    namePlaceholder: 'Ingresá un nombre...',
    startAdventure: 'Comenzar Aventura',
    back: 'Volver',
    continue: 'Continuar'
  }

  const handleContinueAsGuest = () => {
    setStep('lore')
  }

  const handleSelectLore = (loreId: string) => {
    setSelectedLore(loreId)
    startGuestSession(loreId, 'STORY_MODE', 'ONE_SHOT')
    setStep('archetype')
  }

  const handleSelectArchetype = (archetypeId: string) => {
    setSelectedArchetype(archetypeId)
    setStep('name')
  }

  const handleStartGame = () => {
    if (!selectedLore || !selectedArchetype || !characterName.trim()) return

    const archetype = GUEST_ARCHETYPES[selectedLore]?.find(a => a.id === selectedArchetype)
    if (!archetype) return

    const character: GuestCharacter = {
      name: characterName.trim(),
      archetype: isEnglish ? archetype.nameEn : archetype.name,
      level: 1,
      stats: archetype.stats,
      inventory: []
    }

    setGuestCharacter(character)
    setStep('playing')
  }

  // Render según el paso actual
  if (step === 'warning') {
    return (
      <GuestWarningModal
        locale={locale as 'es' | 'en'}
        onContinue={handleContinueAsGuest}
      />
    )
  }

  if (step === 'playing' && session?.character) {
    return <GuestGameSession />
  }

  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <OrnateFrame variant="gold">
          <ParchmentPanel variant="ornate" className="p-6 md:p-8">
            {/* Step: Select Lore */}
            {step === 'lore' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="font-title text-3xl text-ink mb-2">{labels.selectWorld}</h1>
                  <p className="font-ui text-ink/60 text-sm">
                    {isEnglish ? 'Each world has its own stories and dangers' : 'Cada mundo tiene sus propias historias y peligros'}
                  </p>
                </div>

                <div className="grid gap-4">
                  {GUEST_LORES.map((lore) => (
                    <button
                      key={lore.id}
                      onClick={() => handleSelectLore(lore.id)}
                      className="flex items-center gap-4 p-4 bg-ink/5 hover:bg-gold/10 border-2 border-transparent hover:border-gold/50 rounded-xl transition-all group"
                    >
                      <div className="text-4xl">{lore.emoji}</div>
                      <div className="flex-1 text-left">
                        <h3 className="font-heading text-lg text-ink group-hover:text-gold transition-colors">
                          {isEnglish ? lore.nameEn : lore.name}
                        </h3>
                        <p className="font-ui text-sm text-ink/60">{lore.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-ink/30 group-hover:text-gold transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Select Archetype */}
            {step === 'archetype' && selectedLore && (
              <div className="space-y-6">
                <button
                  onClick={() => setStep('lore')}
                  className="flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors"
                >
                  ← {labels.back}
                </button>

                <div className="text-center">
                  <h1 className="font-title text-3xl text-ink mb-2">{labels.selectArchetype}</h1>
                </div>

                <div className="grid gap-4">
                  {GUEST_ARCHETYPES[selectedLore]?.map((archetype) => (
                    <button
                      key={archetype.id}
                      onClick={() => handleSelectArchetype(archetype.id)}
                      className="flex items-center gap-4 p-4 bg-ink/5 hover:bg-gold/10 border-2 border-transparent hover:border-gold/50 rounded-xl transition-all group"
                    >
                      <div className="flex-1 text-left">
                        <h3 className="font-heading text-lg text-ink group-hover:text-gold transition-colors">
                          {isEnglish ? archetype.nameEn : archetype.name}
                        </h3>
                        {/* Stats preview */}
                        <div className="flex gap-4 mt-2 text-xs text-ink/60">
                          <span className="flex items-center gap-1">
                            <Swords className="h-3 w-3" /> {archetype.stats.combat}
                          </span>
                          <span className="flex items-center gap-1">
                            <Map className="h-3 w-3" /> {archetype.stats.exploration}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> {archetype.stats.social}
                          </span>
                          <span className="flex items-center gap-1">
                            <Scroll className="h-3 w-3" /> {archetype.stats.lore}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-ink/30 group-hover:text-gold transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Name Character */}
            {step === 'name' && (
              <div className="space-y-6">
                <button
                  onClick={() => setStep('archetype')}
                  className="flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors"
                >
                  ← {labels.back}
                </button>

                <div className="text-center">
                  <h1 className="font-title text-3xl text-ink mb-2">{labels.nameCharacter}</h1>
                </div>

                <div className="max-w-sm mx-auto">
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder={labels.namePlaceholder}
                    maxLength={30}
                    className="w-full p-4 text-center font-heading text-xl bg-parchment-dark/50 border-2 border-gold-dim/30 rounded-lg
                             text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                    autoFocus
                  />
                </div>

                <div className="flex justify-center">
                  <RunicButton
                    onClick={handleStartGame}
                    disabled={!characterName.trim()}
                    variant="primary"
                    className="px-8"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {labels.startAdventure}
                  </RunicButton>
                </div>
              </div>
            )}
          </ParchmentPanel>
        </OrnateFrame>
      </div>
    </div>
  )
}
