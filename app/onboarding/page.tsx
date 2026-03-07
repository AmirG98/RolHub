'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { LoreSelector } from '@/components/onboarding/LoreSelector'
import { ModeSelector } from '@/components/onboarding/ModeSelector'
import { ArchetypeSelector } from '@/components/onboarding/ArchetypeSelector'
import { Lore, GameMode, GameEngine, TutorialLevel, Archetype } from '@/lib/types/lore'
import lotrData from '@/data/lores/lotr.json'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [selectedLore, setSelectedLore] = useState<Lore | null>(null)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [engine, setEngine] = useState<GameEngine | null>(null)
  const [tutorialLevel, setTutorialLevel] = useState<TutorialLevel | null>(null)
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateCharacter = async (archetype: Archetype) => {
    if (!selectedLore || !gameMode || !engine || !tutorialLevel || !user) return

    setSelectedArchetype(archetype)
    setLoading(true)

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
          characterName: archetype.name, // Por defecto usa el nombre del arquetipo, se puede personalizar después
        }),
      })

      const data = await response.json()
      if (data.sessionId) {
        router.push(`/play/${data.sessionId}`)
      } else {
        throw new Error(data.error || 'Error creando personaje')
      }
    } catch (error) {
      console.error('Error creating character:', error)
      alert('Hubo un error al crear tu personaje. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Cargar los arquetipos según el lore seleccionado
  const getArchetypes = (): Archetype[] => {
    // Por ahora solo tenemos LOTR, en el futuro cargar dinámicamente según selectedLore
    return lotrData.archetypes as Archetype[]
  }

  if (loading) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center">
        <div className="text-center content-wrapper">
          <div className="candlelight text-gold-bright text-6xl mb-4">⏳</div>
          <p className="font-heading text-gold-bright text-2xl glow-effect">Preparando tu aventura...</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gold-bright rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Paso 1: Selección de Lore */}
      {step === 1 && <LoreSelector onSelect={(lore) => { setSelectedLore(lore); setStep(2) }} />}

      {/* Paso 2: Modo, Engine y Tutorial Level */}
      {step === 2 && (
        <ModeSelector
          onSelect={(data) => {
            setGameMode(data.mode)
            setEngine(data.engine)
            setTutorialLevel(data.tutorialLevel)
            setStep(3)
          }}
          onBack={() => setStep(1)}
        />
      )}

      {/* Paso 3: Selección de Arquetipo */}
      {step === 3 && (
        <ArchetypeSelector
          archetypes={getArchetypes()}
          onSelect={handleCreateCharacter}
          onBack={() => setStep(2)}
        />
      )}
    </>
  )
}
