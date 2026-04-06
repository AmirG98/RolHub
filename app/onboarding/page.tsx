'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { LoreSelector } from '@/components/onboarding/LoreSelector'
import { ModeSelector } from '@/components/onboarding/ModeSelector'
import { ArchetypeSelector, CharacterCreationData } from '@/components/onboarding/ArchetypeSelector'
import { DnD5eCharacterCreator } from '@/components/onboarding/DnD5eCharacterCreator'
import { DnDModeSelector } from '@/components/onboarding/DnDModeSelector'
import { Lore, GameMode, GameEngine, TutorialLevel, Archetype } from '@/lib/types/lore'
import { useLanguage } from '@/lib/i18n'

// Importar todos los lores
import lotrData from '@/data/lores/lotr.json'
import zombiesData from '@/data/lores/zombies.json'
import isekaiData from '@/data/lores/isekai.json'
import vikingosData from '@/data/lores/vikingos.json'
import starwarsData from '@/data/lores/starwars.json'
import cyberpunkData from '@/data/lores/cyberpunk.json'
import lovecraftData from '@/data/lores/lovecraft.json'
import dndClassicData from '@/data/lores/dnd-classic.json'

// Mapeo de lore a datos
const LORE_DATA: Record<string, any> = {
  LOTR: lotrData,
  ZOMBIES: zombiesData,
  ISEKAI: isekaiData,
  VIKINGOS: vikingosData,
  STAR_WARS: starwarsData,
  CYBERPUNK: cyberpunkData,
  LOVECRAFT_HORROR: lovecraftData,
  DND_CLASSIC: dndClassicData,
  CUSTOM: lotrData,
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const { locale } = useLanguage()
  const [step, setStep] = useState(1)
  const [selectedLore, setSelectedLore] = useState<Lore | null>(null)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [engine, setEngine] = useState<GameEngine | null>(null)
  const [tutorialLevel, setTutorialLevel] = useState<TutorialLevel | null>(null)
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(false)
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null)
  const [dndCreationMode, setDndCreationMode] = useState<'simple' | 'advanced' | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<'creating' | 'portrait' | 'finalizing'>('creating')
  const [error, setError] = useState<string | null>(null)

  const handleCreateCharacter = async (data: CharacterCreationData) => {
    const { archetype, characterName, characterDescription, customStats } = data
    console.log('handleCreateCharacter called', { selectedLore, gameMode, engine, tutorialLevel, user: !!user, archetype, characterName, characterDescription })

    if (!selectedLore || !gameMode || !engine || !tutorialLevel) {
      console.error('Missing required fields', { selectedLore, gameMode, engine, tutorialLevel })
      setError('Faltan datos requeridos. Por favor vuelve a empezar.')
      return
    }

    if (!user) {
      console.error('User not authenticated')
      setError('Debes iniciar sesión para comenzar una aventura.')
      return
    }

    setSelectedArchetype(archetype)
    setLoading(true)
    setLoadingPhase('creating')
    setError(null)

    try {
      // Cambiar a fase de retrato después de 1.5s
      setTimeout(() => setLoadingPhase('portrait'), 1500)

      // Timeout de seguridad: si tarda más de 20s, mostrar error
      const timeoutId = setTimeout(() => {
        setLoading(false)
        setError('La creación está tardando demasiado. Intenta de nuevo.')
      }, 20000)

      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lore: selectedLore,
          mode: gameMode,
          engine,
          tutorialLevel,
          archetypeId: archetype.id,
          characterName,
          characterDescription,
          isMultiplayer,
          customStats,
          locale,
        }),
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Error creando personaje')
      }

      console.log('[Onboarding] API response:', { sessionId: data.sessionId, avatarUrl: data.avatarUrl, initialSceneImageUrl: data.initialSceneImageUrl })

      if (data.sessionId) {
        if (isMultiplayer && data.campaignId) {
          router.push(`/lobby/${data.campaignId}`)
        } else {
          router.push(`/play/${data.sessionId}`)
        }
      } else {
        throw new Error('No se recibio ID de sesion')
      }
    } catch (err) {
      console.error('Error creating character:', err)
      setError((err as Error).message)
      setLoading(false)
    }
  }

  // Handler para personajes D&D 5e creados con el creador completo
  const handleDnD5eCharacterCreate = async (character: {
    name: string
    description: string
    archetypeId: string
    archetypeName: string
    stats: Record<string, unknown>
    inventory: string[]
    level: number
    subclass?: { id: string; name: string }
  }) => {
    console.log('handleDnD5eCharacterCreate called', { selectedLore, gameMode, engine, tutorialLevel, user: !!user, character })

    if (!selectedLore || !gameMode || !engine || !tutorialLevel) {
      console.error('Missing required fields', { selectedLore, gameMode, engine, tutorialLevel })
      setError('Faltan datos requeridos. Por favor vuelve a empezar.')
      return
    }

    if (!user) {
      console.error('User not authenticated')
      setError('Debes iniciar sesión para comenzar una aventura.')
      return
    }

    setLoading(true)
    setLoadingPhase('creating')
    setError(null)

    try {
      setTimeout(() => setLoadingPhase('portrait'), 1500)

      const timeoutId = setTimeout(() => {
        setLoading(false)
        setError('La creación está tardando demasiado. Intenta de nuevo.')
      }, 20000)

      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lore: selectedLore,
          mode: gameMode,
          engine,
          tutorialLevel,
          archetypeId: character.archetypeId,
          characterName: character.name,
          characterDescription: character.description,
          isMultiplayer,
          isDnD5eCharacter: true,
          dnd5eStats: character.stats,
          dnd5eInventory: character.inventory,
          dnd5eLevel: character.level,
          dnd5eSubclass: character.subclass,
        }),
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Error creando personaje')
      }

      console.log('[Onboarding] API response:', { sessionId: data.sessionId, avatarUrl: data.avatarUrl, initialSceneImageUrl: data.initialSceneImageUrl })

      if (data.sessionId) {
        if (isMultiplayer && data.campaignId) {
          router.push(`/lobby/${data.campaignId}`)
        } else {
          router.push(`/play/${data.sessionId}`)
        }
      } else {
        throw new Error('No se recibio ID de sesion')
      }
    } catch (err) {
      console.error('Error creating D&D 5e character:', err)
      setError((err as Error).message)
      setLoading(false)
    }
  }

  // Cargar los arquetipos segun el lore seleccionado
  const getArchetypes = (): Archetype[] => {
    if (!selectedLore) return []

    const loreData = LORE_DATA[selectedLore]
    if (!loreData?.archetypes) {
      console.error(`No archetypes found for lore: ${selectedLore}`)
      return []
    }

    return loreData.archetypes as Archetype[]
  }

  // Obtener el nombre del lore para mostrar
  const getLoreName = (): string => {
    if (!selectedLore) return ''
    const name = LORE_DATA[selectedLore]?.name
    if (!name) return selectedLore
    return typeof name === 'string' ? name : name[locale as 'es' | 'en'] || name.es || selectedLore
  }

  if (loading) {
    const loadingMessages = {
      creating: {
        icon: '📜',
        title: 'Creando tu personaje...',
        subtitle: `Inscribiendo tu destino en ${getLoreName()}`,
      },
      portrait: {
        icon: '🎨',
        title: 'Generando tu retrato...',
        subtitle: 'Un artista mágico dibuja tu semblante',
      },
      finalizing: {
        icon: '✨',
        title: 'Entrando al mundo...',
        subtitle: 'Tu aventura comienza',
      },
    }

    const { icon, title, subtitle } = loadingMessages[loadingPhase]

    return (
      <div className="min-h-screen particle-bg flex items-center justify-center">
        <div className="text-center content-wrapper">
          <div className="candlelight text-gold-bright text-6xl mb-4">{icon}</div>
          <p className="font-heading text-gold-bright text-2xl glow-effect">{title}</p>
          <p className="font-body text-parchment/80 mt-2">{subtitle}</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          {/* Progress indicator */}
          <div className="mt-6 flex justify-center gap-1">
            <div className={`w-8 h-1 rounded-full transition-all ${loadingPhase === 'creating' || loadingPhase === 'portrait' || loadingPhase === 'finalizing' ? 'bg-gold' : 'bg-gold/30'}`} />
            <div className={`w-8 h-1 rounded-full transition-all ${loadingPhase === 'portrait' || loadingPhase === 'finalizing' ? 'bg-gold' : 'bg-gold/30'}`} />
            <div className={`w-8 h-1 rounded-full transition-all ${loadingPhase === 'finalizing' ? 'bg-gold' : 'bg-gold/30'}`} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center">
        <div className="text-center content-wrapper glass-panel-dark p-8 rounded-lg max-w-md">
          <div className="text-blood text-6xl mb-4">⚠️</div>
          <h2 className="font-heading text-blood text-2xl mb-4">Error al crear personaje</h2>
          <p className="font-body text-parchment/80 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setStep(3)
            }}
            className="px-6 py-3 bg-gold hover:bg-gold-bright text-shadow font-heading rounded transition-all"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  const stepLabels = locale === 'en'
    ? ['World', 'Setup', 'Character']
    : ['Mundo', 'Configuración', 'Personaje']

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-shadow/90 backdrop-blur-sm border-b border-gold-dim/20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center gap-3">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1
            const isActive = step >= stepNum
            const isCurrent = step === stepNum
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-px ${isActive ? 'bg-gold' : 'bg-gold-dim/30'}`} />}
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-heading border transition-all ${
                    isCurrent ? 'bg-gold text-shadow border-gold-bright' : isActive ? 'bg-gold-dim/40 text-gold border-gold-dim' : 'bg-transparent text-parchment/40 border-parchment/20'
                  }`}>
                    {stepNum}
                  </div>
                  <span className={`text-xs font-ui hidden sm:inline ${isCurrent ? 'text-gold-bright' : isActive ? 'text-gold-dim' : 'text-parchment/30'}`}>
                    {label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Spacer for fixed progress bar */}
      <div className="h-12" />

      {/* Paso 1: Seleccion de Lore */}
      {step === 1 && <LoreSelector onSelect={(lore) => { setSelectedLore(lore); setStep(2) }} />}

      {/* Paso 2: Modo, Engine y Tutorial Level */}
      {step === 2 && (
        <ModeSelector
          selectedTutorialLevel={tutorialLevel}
          onSelect={(data) => {
            setGameMode(data.mode)
            setEngine(data.engine)
            setTutorialLevel(data.tutorialLevel)
            setIsMultiplayer(data.isMultiplayer)
            setStep(3)
          }}
          onBack={() => setStep(1)}
        />
      )}

      {/* Paso 3: Selector de modo D&D (si aplica) o Arquetipo */}
      {step === 3 && selectedLore && selectedLore === 'DND_CLASSIC' && !dndCreationMode && (
        <DnDModeSelector
          onSelect={(mode) => {
            setDndCreationMode(mode)
            if (mode === 'advanced') {
              setEngine('DND_5E' as GameEngine)
            }
          }}
          onBack={() => setStep(2)}
        />
      )}

      {step === 3 && selectedLore && (selectedLore !== 'DND_CLASSIC' || dndCreationMode) && (
        selectedLore === 'DND_CLASSIC' && (engine === 'DND_5E' || dndCreationMode === 'advanced') ? (
          <DnD5eCharacterCreator
            onComplete={handleDnD5eCharacterCreate}
            onBack={() => {
              if (selectedLore === 'DND_CLASSIC') {
                setDndCreationMode(null)
                setEngine('STORY_MODE' as GameEngine)
              } else {
                setStep(2)
              }
            }}
            lore={selectedLore}
          />
        ) : (
          <ArchetypeSelector
            archetypes={getArchetypes()}
            loreName={getLoreName()}
            lore={selectedLore}
            onSelect={handleCreateCharacter}
            onBack={() => {
              if (selectedLore === 'DND_CLASSIC') {
                setDndCreationMode(null)
              } else {
                setStep(2)
              }
            }}
          />
        )
      )}
    </>
  )
}
