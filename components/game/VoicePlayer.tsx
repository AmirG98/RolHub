'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Lore } from '@prisma/client'
import { getRandomLoadingMessage } from '@/lib/tts/voice-config'

interface VoicePlayerProps {
  text: string
  lore: Lore
  locale: 'es' | 'en'
  autoPlay?: boolean
  className?: string
}

/**
 * Componente reproductor de voz para las narraciones del DM
 * Genera audio TTS on-demand y lo reproduce
 */
export function VoicePlayer({
  text,
  lore,
  locale,
  autoPlay = false,
  className = ''
}: VoicePlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const labels = locale === 'en' ? {
    listen: 'Listen',
    pause: 'Pause',
    generating: 'Generating...',
    error: 'Voice unavailable'
  } : {
    listen: 'Escuchar',
    pause: 'Pausar',
    generating: 'Generando...',
    error: 'Voz no disponible'
  }

  // Generar audio si se solicita
  const generateAudio = async () => {
    if (audioUrl) {
      // Ya tenemos audio, solo reproducir
      togglePlay()
      return
    }

    setIsLoading(true)
    setError(null)
    setLoadingMessage(getRandomLoadingMessage(locale))

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, lore, locale })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate voice')
      }

      const data = await response.json()
      setAudioUrl(data.audioUrl)

      // Auto-play después de generar
      if (audioRef.current) {
        audioRef.current.src = data.audioUrl
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('[VoicePlayer] Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle play/pause
  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (err) {
        console.error('[VoicePlayer] Play error:', err)
      }
    }
  }

  // Manejar eventos del audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      setError(labels.error)
      setIsPlaying(false)
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [labels.error])

  // Auto-play si está habilitado
  useEffect(() => {
    if (autoPlay && !audioUrl && !isLoading) {
      generateAudio()
    }
  }, [autoPlay])

  // Si hay error, mostrar estado de error
  if (error) {
    return (
      <div className={`flex items-center gap-2 text-blood/70 ${className}`}>
        <VolumeX className="h-4 w-4" />
        <span className="font-ui text-xs">{labels.error}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Audio element oculto */}
      <audio ref={audioRef} preload="none" />

      {/* Botón principal */}
      <RunicButton
        variant="secondary"
        onClick={generateAudio}
        disabled={isLoading}
        className="px-3 py-1.5 text-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            <span className="hidden sm:inline">{labels.generating}</span>
          </>
        ) : isPlaying ? (
          <>
            <Pause className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">{labels.pause}</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">{labels.listen}</span>
          </>
        )}
      </RunicButton>

      {/* Mensaje de carga */}
      {isLoading && loadingMessage && (
        <span className="font-ui text-xs text-gold/60 italic animate-pulse">
          {loadingMessage}
        </span>
      )}
    </div>
  )
}

/**
 * Versión compacta solo con icono
 */
export function VoicePlayerCompact({
  text,
  lore,
  locale,
  className = ''
}: Omit<VoicePlayerProps, 'autoPlay'>) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleClick = async () => {
    if (isLoading) return

    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lore, locale })
      })

      if (!response.ok) throw new Error('Failed')

      const data = await response.json()
      setAudioUrl(data.audioUrl)

      if (audioRef.current) {
        audioRef.current.src = data.audioUrl
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch {
      // Silenciar errores en versión compacta
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setIsPlaying(false)
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`p-1.5 rounded-lg glass-panel transition-all hover:bg-gold/10 disabled:opacity-50 ${className}`}
      title={locale === 'en' ? 'Listen' : 'Escuchar'}
    >
      <audio ref={audioRef} preload="none" />
      {isLoading ? (
        <Loader2 className="h-4 w-4 text-gold animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4 text-gold" />
      ) : (
        <Volume2 className="h-4 w-4 text-gold/70 hover:text-gold" />
      )}
    </button>
  )
}
