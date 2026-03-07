'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoreSelector } from '@/components/onboarding/LoreSelector'
import { RunicButton } from '@/components/medieval/RunicButton'
import { useUser } from '@clerk/nextjs'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [selectedLore, setSelectedLore] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<'ONE_SHOT' | 'CAMPAIGN'>('CAMPAIGN')
  const [engine, setEngine] = useState<'STORY_MODE' | 'PBTA' | 'YEAR_ZERO' | 'DND_5E'>('STORY_MODE')
  const [characterName, setCharacterName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateCampaign = async () => {
    if (!selectedLore || !characterName || !user) return

    setLoading(true)
    try {
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lore: selectedLore,
          mode: gameMode,
          engine,
          characterName,
        }),
      })

      const data = await response.json()
      if (data.campaignId) {
        router.push(`/play/${data.sessionId}`)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen particle-bg py-12">
      <div className="max-w-6xl mx-auto content-wrapper px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-heading transition-all ${
                    step >= s
                      ? 'bg-gold text-shadow glow-effect'
                      : 'glass-panel text-parchment/50'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all ${
                      step > s ? 'bg-gold' : 'bg-parchment/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center font-ui text-parchment/60">
            {step === 1 && 'Elige tu mundo'}
            {step === 2 && 'Configura tu aventura'}
            {step === 3 && 'Crea tu héroe'}
          </p>
        </div>

        {/* Step 1: Lore Selection */}
        {step === 1 && (
          <div className="glass-panel-dark rounded-lg p-8">
            <h1 className="font-title text-4xl text-gold mb-2 text-center">
              ¿En qué mundo quieres aventurarte?
            </h1>
            <p className="font-body text-parchment/80 text-center mb-8">
              Cada mundo tiene su propia historia, criaturas y desafíos únicos
            </p>

            <LoreSelector selectedLore={selectedLore} onSelect={setSelectedLore} />

            <div className="mt-8 text-center">
              <RunicButton
                variant="primary"
                disabled={!selectedLore}
                onClick={() => setStep(2)}
                className="px-12 py-4"
              >
                Continuar →
              </RunicButton>
            </div>
          </div>
        )}

        {/* Step 2: Game Mode & Engine */}
        {step === 2 && (
          <div className="glass-panel-dark rounded-lg p-8 max-w-3xl mx-auto">
            <h1 className="font-title text-4xl text-gold mb-8 text-center">
              Configura tu Aventura
            </h1>

            {/* Game Mode */}
            <div className="mb-8">
              <label className="font-heading text-xl text-parchment mb-4 block">
                Tipo de Partida
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGameMode('CAMPAIGN')}
                  className={cn(
                    'glass-panel p-6 rounded-lg transition-all hover:scale-105',
                    gameMode === 'CAMPAIGN' && 'glow-effect ring-2 ring-gold'
                  )}
                >
                  <div className="text-3xl mb-2">📖</div>
                  <h3 className="font-heading text-lg text-parchment mb-1">Campaña</h3>
                  <p className="font-ui text-sm text-parchment/60">
                    Historia larga con múltiples sesiones
                  </p>
                </button>
                <button
                  onClick={() => setGameMode('ONE_SHOT')}
                  className={cn(
                    'glass-panel p-6 rounded-lg transition-all hover:scale-105',
                    gameMode === 'ONE_SHOT' && 'glow-effect ring-2 ring-gold'
                  )}
                >
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-heading text-lg text-parchment mb-1">One-Shot</h3>
                  <p className="font-ui text-sm text-parchment/60">
                    Aventura única de 1-2 horas
                  </p>
                </button>
              </div>
            </div>

            {/* Engine Selection */}
            <div className="mb-8">
              <label className="font-heading text-xl text-parchment mb-4 block">
                Sistema de Juego
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'STORY_MODE', name: 'Modo Historia', desc: 'Sin dados, narrativo', icon: '📚' },
                  { id: 'PBTA', name: 'Powered by Apocalypse', desc: '2d6, narrativo', icon: '🎲' },
                  { id: 'YEAR_ZERO', name: 'Year Zero', desc: 'Pool de d6, supervivencia', icon: '💀' },
                  { id: 'DND_5E', name: 'D&D 5e', desc: 'd20, reglas completas', icon: '🐉' },
                ].map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => setEngine(eng.id as any)}
                    className={cn(
                      'glass-panel p-4 rounded-lg transition-all hover:scale-105 text-left',
                      engine === eng.id && 'glow-effect ring-2 ring-neon-blue'
                    )}
                  >
                    <div className="text-2xl mb-1">{eng.icon}</div>
                    <h3 className="font-heading text-sm text-parchment mb-1">{eng.name}</h3>
                    <p className="font-ui text-xs text-parchment/60">{eng.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <RunicButton variant="secondary" onClick={() => setStep(1)}>
                ← Atrás
              </RunicButton>
              <RunicButton variant="primary" onClick={() => setStep(3)} className="px-12">
                Continuar →
              </RunicButton>
            </div>
          </div>
        )}

        {/* Step 3: Character Creation */}
        {step === 3 && (
          <div className="glass-panel-dark rounded-lg p-8 max-w-2xl mx-auto">
            <h1 className="font-title text-4xl text-gold mb-8 text-center">
              Nombra a tu Héroe
            </h1>

            <div className="mb-8">
              <label className="font-heading text-lg text-parchment mb-3 block">
                Nombre del Personaje
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Ej: Aragorn, Katniss, Luke Skywalker..."
                className="w-full glass-panel px-6 py-4 rounded-lg font-body text-parchment text-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div className="glass-panel p-6 rounded-lg mb-8">
              <h3 className="font-heading text-lg text-gold mb-4">Resumen de tu Aventura</h3>
              <div className="space-y-2 font-ui text-sm">
                <p className="text-parchment/80">
                  <span className="text-gold">Mundo:</span> {LORES.find(l => l.id === selectedLore)?.name}
                </p>
                <p className="text-parchment/80">
                  <span className="text-neon-blue">Modo:</span> {gameMode === 'CAMPAIGN' ? 'Campaña' : 'One-Shot'}
                </p>
                <p className="text-parchment/80">
                  <span className="text-neon-purple">Sistema:</span> {engine.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <RunicButton variant="secondary" onClick={() => setStep(2)} disabled={loading}>
                ← Atrás
              </RunicButton>
              <RunicButton
                variant="primary"
                onClick={handleCreateCampaign}
                disabled={!characterName || loading}
                className="px-12"
              >
                {loading ? 'Creando...' : '¡Comenzar Aventura! 🎮'}
              </RunicButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
