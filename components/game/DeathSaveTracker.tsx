'use client'

import { Skull, Heart, Shield } from 'lucide-react'

interface DeathSaveTrackerProps {
  successes: number
  failures: number
  locale?: 'es' | 'en'
}

export function DeathSaveTracker({ successes, failures, locale = 'es' }: DeathSaveTrackerProps) {
  const isEs = locale === 'es'

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="glass-panel-dark rounded-lg border border-blood/50 px-6 py-4 pointer-events-auto">
        <p className="font-heading text-sm text-blood text-center mb-3 uppercase tracking-wider">
          {isEs ? 'Tiradas de Salvación de Muerte' : 'Death Saving Throws'}
        </p>

        <div className="flex items-center justify-center gap-6">
          {/* Successes */}
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-gold-dim" />
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={`s-${i}`}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    i < successes
                      ? 'bg-gold border-gold-bright shadow-[0_0_8px_rgba(201,168,76,0.5)]'
                      : 'border-gold-dim/40 bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-parchment/20" />

          {/* Failures */}
          <div className="flex items-center gap-2">
            <Skull size={14} className="text-blood" />
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={`f-${i}`}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    i < failures
                      ? 'bg-blood border-blood shadow-[0_0_8px_rgba(139,26,26,0.5)]'
                      : 'border-blood/30 bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
