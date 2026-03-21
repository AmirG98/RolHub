'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { LoreSelector } from '@/components/onboarding/LoreSelector'
import { ModeSelector } from '@/components/onboarding/ModeSelector'
import { ArchetypeSelector, CharacterCreationData } from '@/components/onboarding/ArchetypeSelector'
import { DnD5eCharacterCreator } from '@/components/onboarding/DnD5eCharacterCreator'
import { Lore, GameMode, GameEngine, TutorialLevel, Archetype } from '@/lib/types/lore'

// Importar todos los lores
import lotrData from '@/data/lores/lotr.json'
import zombiesData from '@/data/lores/zombies.json'
import isekaiData from '@/data/lores/isekai.json'
import vikingosData from '@/data/lores/vikingos.json'
import starwarsData from '@/data/lores/starwars.json'
import cyberpunkData from '@/data/lores/cyberpunk.json'
import lovecraftData from '@/data/lores/lovecraft.json'

// Mapeo de lore a datos
const LORE_DATA: Record<Lore, any> = {
  LOTR: lotrData,
  ZOMBIES: zombiesData,
  ISEKAI: isekaiData,
  VIKINGOS: vikingosData,
  STAR_WARS: starwarsData,
  CYBERPUNK: cyberpunkData,
  LOVECRAFT_HORROR: lovecraftData,
  CUSTOM: lotrData, // Fallback
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [selectedLore, setSelectedLore] = useState<Lore | null>(null)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [engine, setEngine] = useState<GameEngine | null>(null)
  const [tutorialLevel, setTutorialLevel] = useState<TutorialLevel | null>(null)
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(false)
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateCharacter = async (data: CharacterCreationData) => {
    const { archetype, characterName, characterDescription } = data
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
    setError(null)

    try {
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Error creando personaje')
      }

      if (data.sessionId) {
        // Si es multijugador, ir al lobby para esperar jugadores
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
    stats: Record<string, number | string>
    inventory: string[]
    level: number
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
    setError(null)

    try {
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
          // D&D 5e specific fields
          isDnD5eCharacter: true,
          dnd5eStats: character.stats,
          dnd5eInventory: character.inventory,
          dnd5eLevel: character.level,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Error creando personaje')
      }

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
    return LORE_DATA[selectedLore]?.name || selectedLore
  }

  if (loading) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center">
        <div className="text-center content-wrapper">
          <div className="candlelight text-gold-bright text-6xl mb-4">⏳</div>
          <p className="font-heading text-gold-bright text-2xl glow-effect">Preparando tu aventura...</p>
          <p className="font-body text-parchment/60 mt-2">Creando tu personaje en {getLoreName()}</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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

  return (
    <>
      {/* Paso 1: Seleccion de Lore */}
      {step === 1 && <LoreSelector onSelect={(lore) => { setSelectedLore(lore); setStep(2) }} />}

      {/* Paso 2: Modo, Engine y Tutorial Level */}
      {step === 2 && (
        <ModeSelector
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

      {/* Paso 3: Seleccion de Arquetipo o Creador D&D 5e */}
      {step === 3 && selectedLore && (
        engine === 'DND_5E' ? (
          <DnD5eCharacterCreator
            onComplete={handleDnD5eCharacterCreate}
            onBack={() => setStep(2)}
            lore={selectedLore}
          />
        ) : (
          <ArchetypeSelector
            archetypes={getArchetypes()}
            loreName={getLoreName()}
            lore={selectedLore}
            onSelect={handleCreateCharacter}
            onBack={() => setStep(2)}
          />
        )
      )}
    </>
  )
}
