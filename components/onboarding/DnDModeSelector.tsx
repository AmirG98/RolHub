'use client'

import { ParchmentPanel } from '@/components/medieval/ParchmentPanel'
import { OrnateFrame } from '@/components/medieval/OrnateFrame'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Zap, Dices, ChevronLeft } from 'lucide-react'

interface DnDModeSelectorProps {
  onSelect: (mode: 'simple' | 'advanced') => void
  onBack: () => void
}

export function DnDModeSelector({ onSelect, onBack }: DnDModeSelectorProps) {
  return (
    <div className="min-h-screen particle-bg flex items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full content-wrapper">
        <h1 className="font-title text-2xl sm:text-3xl md:text-4xl text-gold mb-2 text-center">
          ¿Cómo querés crear tu personaje?
        </h1>
        <p className="font-body text-sm md:text-base text-parchment/80 text-center mb-8 px-2">
          Reinos de Valdrun usa las reglas de Dungeons & Dragons 5ª edición
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Opción Rápida */}
          <button
            onClick={() => onSelect('simple')}
            className="glass-panel p-6 md:p-8 rounded-lg text-left transition-all duration-300 hover:scale-[1.02] hover:ring-2 hover:ring-gold group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald" />
              </div>
              <div>
                <h2 className="font-heading text-xl text-gold-bright">Creación Rápida</h2>
                <p className="font-ui text-xs text-parchment/60">~30 segundos</p>
              </div>
            </div>

            <p className="font-body text-sm text-parchment/80 mb-4">
              Elegí un arquetipo y empezá a jugar al instante. El sistema crea tu personaje automáticamente con stats optimizados.
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-parchment/60">
                <span className="text-emerald">✓</span> 3 arquetipos pre-armados
              </div>
              <div className="flex items-center gap-2 text-xs text-parchment/60">
                <span className="text-emerald">✓</span> Stats y equipo automáticos
              </div>
              <div className="flex items-center gap-2 text-xs text-parchment/60">
                <span className="text-emerald">✓</span> Ideal para primera vez
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gold/10">
              <span className="font-heading text-xs text-emerald uppercase tracking-wider">
                Recomendado para novatos
              </span>
            </div>
          </button>

          {/* Opción Completa */}
          <button
            onClick={() => onSelect('advanced')}
            className="glass-panel p-6 md:p-8 rounded-lg text-left transition-all duration-300 hover:scale-[1.02] hover:ring-2 hover:ring-gold group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <Dices className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h2 className="font-heading text-xl text-gold-bright">Creación Completa D&D 5e</h2>
                <p className="font-ui text-xs text-parchment/60">~3-5 minutos</p>
              </div>
            </div>

            <p className="font-body text-sm text-parchment/80 mb-4">
              Elegí raza, clase, atributos, nivel, subclase y equipo. Todo como en una mesa de D&D real.
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-parchment/60">
                <span className="text-gold">✓</span> 9 razas + 12 clases
              </div>
              <div className="flex items-center gap-2 text-xs text-parchment/60">
                <span className="text-gold">✓</span> Point Buy o Standard Array
              </div>
              <div className="flex items-center gap-2 text-xs text-parchment/60">
                <span className="text-gold">✓</span> Subclases, equipo, nivel inicial
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gold/10">
              <span className="font-heading text-xs text-gold uppercase tracking-wider">
                Para jugadores de D&D
              </span>
            </div>
          </button>
        </div>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="font-ui text-sm text-parchment/60 hover:text-gold transition flex items-center gap-1 mx-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}
