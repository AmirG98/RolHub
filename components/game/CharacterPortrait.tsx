'use client'

import { useState } from 'react'
import Image from 'next/image'
import { RefreshCw, User, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CharacterPortraitProps {
  /** URL del retrato actual (si existe) */
  portraitUrl?: string | null
  /** Nombre del personaje */
  name: string
  /** Arquetipo del personaje */
  archetype: string
  /** Lore del personaje */
  lore: string
  /** Si se puede regenerar el retrato */
  canRegenerate?: boolean
  /** Tamaño del retrato */
  size?: 'sm' | 'md' | 'lg'
  /** Callback cuando se genera nuevo retrato */
  onPortraitGenerated?: (url: string) => void
  /** Clase adicional */
  className?: string
}

export function CharacterPortrait({
  portraitUrl,
  name,
  archetype,
  lore,
  canRegenerate = true,
  size = 'md',
  onPortraitGenerated,
  className,
}: CharacterPortraitProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(portraitUrl)
  const [error, setError] = useState<string | null>(null)

  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-32 h-48',
    lg: 'w-48 h-72',
  }

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/character/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          archetype,
          lore,
          quality: 'standard',
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        setCurrentUrl(data.url)
        onPortraitGenerated?.(data.url)
      } else {
        setError(data.error || 'Error al generar retrato')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Portrait container */}
      <div
        className={cn(
          'relative rounded-lg overflow-hidden border-2 border-gold-dim/50',
          'bg-gradient-to-b from-shadow to-shadow-mid',
          sizeClasses[size],
        )}
      >
        {currentUrl ? (
          // Show portrait image
          <Image
            src={currentUrl}
            alt={`Retrato de ${name}`}
            fill
            className="object-cover"
            unoptimized // External URLs from Fal.ai
          />
        ) : (
          // Placeholder
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gold-dim/50">
            <User className={iconSizes[size]} />
            <span className="text-xs mt-1 font-ui">Sin retrato</span>
          </div>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-shadow/80 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <span className="text-xs text-gold mt-2 font-ui">Generando...</span>
          </div>
        )}

        {/* Error overlay */}
        {error && !isGenerating && (
          <div className="absolute inset-0 bg-blood/80 flex flex-col items-center justify-center p-2">
            <span className="text-xs text-parchment text-center font-ui">{error}</span>
          </div>
        )}

        {/* Regenerate button overlay */}
        {canRegenerate && !isGenerating && (
          <div className="absolute inset-0 bg-shadow/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleGenerate}
              className="flex flex-col items-center gap-1 px-3 py-2 bg-gold/20 hover:bg-gold/30 rounded-lg border border-gold/50 transition-colors"
            >
              {currentUrl ? (
                <>
                  <RefreshCw className="w-5 h-5 text-gold" />
                  <span className="text-xs text-gold font-ui">Regenerar</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-gold" />
                  <span className="text-xs text-gold font-ui">Generar</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Character name below */}
      <div className="mt-2 text-center">
        <p className="font-heading text-gold text-sm truncate">{name}</p>
        <p className="font-ui text-gold-dim text-xs truncate">{archetype}</p>
      </div>
    </div>
  )
}

/**
 * Versión compacta para usar en la ficha de personaje
 */
export function CharacterPortraitCompact({
  portraitUrl,
  name,
  archetype,
  lore,
  onPortraitGenerated,
  className,
}: Omit<CharacterPortraitProps, 'size' | 'canRegenerate'>) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(portraitUrl)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/character/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, archetype, lore, quality: 'draft' }),
      })
      const data = await response.json()
      if (data.success && data.url) {
        setCurrentUrl(data.url)
        onPortraitGenerated?.(data.url)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Small portrait */}
      <div className="relative w-12 h-16 rounded overflow-hidden border border-gold-dim/30 bg-shadow flex-shrink-0">
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="w-6 h-6 text-gold-dim/50" />
          </div>
        )}
        {isGenerating && (
          <div className="absolute inset-0 bg-shadow/80 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-gold animate-spin" />
          </div>
        )}
      </div>

      {/* Info + button */}
      <div className="flex-1 min-w-0">
        <p className="font-heading text-gold text-sm truncate">{name}</p>
        <p className="font-ui text-gold-dim text-xs truncate">{archetype}</p>
        {!currentUrl && !isGenerating && (
          <button
            onClick={handleGenerate}
            className="mt-1 text-xs text-gold hover:text-gold-bright font-ui flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Generar retrato
          </button>
        )}
      </div>
    </div>
  )
}
