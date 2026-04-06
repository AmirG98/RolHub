'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronRight, X } from 'lucide-react'

export interface TourStep {
  targetId: string
  title: { es: string; en: string }
  description: { es: string; en: string }
  position: 'top' | 'bottom' | 'left' | 'right'
}

interface GameTutorialTourProps {
  steps: TourStep[]
  onComplete: () => void
  locale: 'es' | 'en'
}

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function GameTutorialTour({ steps, onComplete, locale }: GameTutorialTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const isEN = locale === 'en'

  const step = steps[currentStep]

  // Posicionar el spotlight sobre el elemento target
  const updateSpotlight = useCallback(() => {
    if (!step) return
    const el = document.getElementById(step.targetId)
    if (!el) {
      // Si el elemento no existe, saltar al siguiente step
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        onComplete()
      }
      return
    }

    const rect = el.getBoundingClientRect()
    const padding = 8
    setSpotlightRect({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    })

    // Scroll el elemento a la vista
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [step, currentStep, steps.length, onComplete])

  useEffect(() => {
    updateSpotlight()
    window.addEventListener('resize', updateSpotlight)
    return () => window.removeEventListener('resize', updateSpotlight)
  }, [updateSpotlight])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  if (!step || !spotlightRect) return null

  // Calcular posición del tooltip
  const getTooltipStyle = (): React.CSSProperties => {
    const margin = 16
    const pos = step.position

    if (pos === 'bottom') {
      return {
        position: 'absolute',
        top: spotlightRect.top + spotlightRect.height + margin,
        left: Math.max(16, Math.min(spotlightRect.left, window.innerWidth - 340)),
        maxWidth: 320,
      }
    }
    if (pos === 'top') {
      return {
        position: 'absolute',
        bottom: window.innerHeight - spotlightRect.top + margin + window.scrollY,
        left: Math.max(16, Math.min(spotlightRect.left, window.innerWidth - 340)),
        maxWidth: 320,
      }
    }
    if (pos === 'right') {
      return {
        position: 'absolute',
        top: spotlightRect.top,
        left: spotlightRect.left + spotlightRect.width + margin,
        maxWidth: 280,
      }
    }
    // left
    return {
      position: 'absolute',
      top: spotlightRect.top,
      right: window.innerWidth - spotlightRect.left + margin,
      maxWidth: 280,
    }
  }

  return (
    <div className="fixed inset-0 z-[60]" style={{ pointerEvents: 'none' }}>
      {/* Dark overlay con cutout para el spotlight */}
      <div
        className="absolute rounded-lg transition-all duration-300 ease-out"
        style={{
          top: spotlightRect.top,
          left: spotlightRect.left,
          width: spotlightRect.width,
          height: spotlightRect.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
          zIndex: 61,
          pointerEvents: 'none',
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{ ...getTooltipStyle(), zIndex: 62, pointerEvents: 'auto' }}
      >
        <div className="glass-panel-dark rounded-lg border border-gold/50 p-4 shadow-[0_0_30px_rgba(201,168,76,0.2)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-sm text-gold-bright">
              {isEN ? step.title.en : step.title.es}
            </h3>
            <button
              onClick={onComplete}
              className="text-parchment/40 hover:text-parchment/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Description */}
          <p className="font-body text-xs text-parchment/80 leading-relaxed mb-3">
            {isEN ? step.description.en : step.description.es}
          </p>

          {/* Footer: step counter + next */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-parchment/40">
              {currentStep + 1}/{steps.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onComplete}
                className="font-ui text-[10px] text-parchment/50 hover:text-parchment/80 transition"
              >
                {isEN ? 'Skip' : 'Saltar'}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3 py-1 rounded bg-gold/20 border border-gold/40 font-ui text-xs text-gold hover:bg-gold/30 transition"
              >
                {currentStep < steps.length - 1
                  ? (isEN ? 'Next' : 'Siguiente')
                  : (isEN ? 'Got it!' : '¡Entendido!')}
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Pasos del tutorial para la pantalla de juego
export const GAME_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'narrator-section',
    title: { es: 'El Narrador', en: 'The Narrator' },
    description: {
      es: 'Acá aparece la historia. El DM narra tu aventura en tiempo real, respondiendo a cada una de tus acciones.',
      en: 'This is where the story unfolds. The DM narrates your adventure in real time, responding to your every action.',
    },
    position: 'right',
  },
  {
    targetId: 'action-input',
    title: { es: 'Tu Acción', en: 'Your Action' },
    description: {
      es: 'Escribí qué hace tu personaje, o usá el micrófono para hablar. Podés elegir entre "Hacer" (acción física) o "Hablar" (diálogo).',
      en: 'Type what your character does, or use the microphone to speak. Choose between "Do" (physical action) or "Talk" (dialogue).',
    },
    position: 'top',
  },
  {
    targetId: 'suggested-actions',
    title: { es: 'Acciones Sugeridas', en: 'Suggested Actions' },
    description: {
      es: 'Si no sabés qué hacer, elegí una de estas opciones. El DM las actualiza según la situación.',
      en: "If you're not sure what to do, pick one of these options. The DM updates them based on the situation.",
    },
    position: 'top',
  },
  {
    targetId: 'character-header',
    title: { es: 'Tu Personaje', en: 'Your Character' },
    description: {
      es: 'Acá ves tu vida, nivel y stats. Tocá "Ver Hoja" para ver tu ficha completa con inventario y habilidades.',
      en: 'Here you see your health, level, and stats. Tap "View Sheet" to see your full character sheet with inventory and abilities.',
    },
    position: 'bottom',
  },
  {
    targetId: 'dice-button',
    title: { es: 'Dados', en: 'Dice' },
    description: {
      es: 'Cuando el juego pida una tirada, los dados aparecen automáticamente. También podés tirar dados manualmente desde acá.',
      en: 'When the game asks for a roll, the dice appear automatically. You can also roll dice manually from here.',
    },
    position: 'bottom',
  },
  {
    targetId: 'locations-panel',
    title: { es: 'Mapa y Ubicaciones', en: 'Map & Locations' },
    description: {
      es: 'Viajá entre lugares y explorá sub-locaciones dentro de cada ciudad. Necesitás raciones para viajar largas distancias.',
      en: 'Travel between locations and explore sub-locations within each city. You need rations for long-distance travel.',
    },
    position: 'left',
  },
  {
    targetId: 'inventory-panel',
    title: { es: 'Inventario', en: 'Inventory' },
    description: {
      es: 'Tus items aparecen acá. Los conseguís jugando — el DM puede darte objetos, armas, monedas y más.',
      en: 'Your items appear here. You get them by playing — the DM can give you objects, weapons, coins, and more.',
    },
    position: 'left',
  },
  {
    targetId: 'quests-section',
    title: { es: 'Misiones', en: 'Quests' },
    description: {
      es: 'Tus misiones activas y completadas. Explorá el mundo y hablá con NPCs para descubrir nuevas misiones.',
      en: 'Your active and completed quests. Explore the world and talk to NPCs to discover new quests.',
    },
    position: 'left',
  },
]
