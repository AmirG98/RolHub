'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Pause, Loader2 } from 'lucide-react'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Lore } from '@prisma/client'
import { getRandomLoadingMessage, parseTextForVoices, getVoiceConfig, VoiceSegment } from '@/lib/tts/voice-config'

interface VoicePlayerProps {
  text: string
  lore: Lore
  locale: 'es' | 'en'
  autoPlay?: boolean
  className?: string
  useStreaming?: boolean // Usar streaming para menor latencia
}

/**
 * Componente reproductor de voz para las narraciones del DM
 * Usa Deepgram Aura-2 TTS - alta calidad, 90ms latencia
 * Con streaming: el audio empieza a reproducirse mientras se genera
 */
export function VoicePlayer({
  text,
  lore,
  locale,
  autoPlay = false,
  className = '',
  useStreaming = true // Streaming por defecto para menor latencia
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

  // Generar audio con streaming (más rápido)
  const generateAudioStreaming = async () => {
    if (audioUrl) {
      togglePlay()
      return
    }

    setIsLoading(true)
    setError(null)
    setLoadingMessage(getRandomLoadingMessage(locale))

    try {
      const response = await fetch('/api/voice/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lore, locale })
      })

      if (!response.ok) {
        throw new Error('Failed to generate voice')
      }

      // Crear blob URL del stream de audio
      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('[VoicePlayer] Streaming error:', err)
      // Fallback a método no-streaming
      await generateAudioFallback()
    } finally {
      setIsLoading(false)
    }
  }

  // Fallback: generar audio sin streaming
  const generateAudioFallback = async () => {
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lore, locale })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate voice')
      }

      const data = await response.json()
      setAudioUrl(data.audioUrl)

      if (audioRef.current) {
        audioRef.current.src = data.audioUrl
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('[VoicePlayer] Fallback error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Generar audio (usa streaming o fallback según config)
  const generateAudio = async () => {
    if (useStreaming) {
      await generateAudioStreaming()
    } else {
      setIsLoading(true)
      setError(null)
      setLoadingMessage(getRandomLoadingMessage(locale))
      await generateAudioFallback()
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

  // Eventos del audio
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

  // Auto-play
  useEffect(() => {
    if (autoPlay && !audioUrl && !isLoading) {
      generateAudio()
    }
  }, [autoPlay])

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
      <audio ref={audioRef} preload="none" />

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

      {isLoading && loadingMessage && (
        <span className="font-ui text-xs text-gold/60 italic animate-pulse">
          {loadingMessage}
        </span>
      )}
    </div>
  )
}

/**
 * Versión compacta solo con icono - usa Deepgram Aura-2 TTS con streaming
 */
export function VoicePlayerCompact({
  text,
  lore,
  locale,
  className = ''
}: Omit<VoicePlayerProps, 'autoPlay' | 'useStreaming'>) {
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
      // Usar streaming endpoint para menor latencia
      const response = await fetch('/api/voice/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lore, locale })
      })

      if (!response.ok) {
        throw new Error('Failed')
      }

      // Crear blob URL del stream
      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('[VoicePlayerCompact] Error:', err)
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

/**
 * Versión con auto-play y voces múltiples
 * - Narrador: voz del lore configurado
 * - NPCs: voces diferentes basadas en el nombre del personaje
 * Reproduce segmentos en secuencia con sus respectivas voces
 */
export function VoicePlayerAuto({
  text,
  lore,
  locale,
  onPlayStateChange,
  className = ''
}: Omit<VoicePlayerProps, 'autoPlay' | 'useStreaming'> & {
  onPlayStateChange?: (isPlaying: boolean) => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentSegment, setCurrentSegment] = useState(0)
  const [totalSegments, setTotalSegments] = useState(0)
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioQueueRef = useRef<{ url: string; speaker?: string }[]>([])
  const segmentsRef = useRef<VoiceSegment[]>([])
  const mountedRef = useRef(true)
  const isGeneratingRef = useRef(false)
  const currentIndexRef = useRef(0)

  // Generar audio para un segmento con su voz específica
  const generateSegmentAudio = async (segment: VoiceSegment): Promise<string | null> => {
    try {
      const response = await fetch('/api/voice/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: segment.text,
          lore,
          locale,
          voice: segment.voice  // Voz específica para este segmento
        })
      })

      if (!response.ok) return null

      const audioBlob = await response.blob()
      return URL.createObjectURL(audioBlob)
    } catch {
      return null
    }
  }

  // Reproducir siguiente audio de la cola
  const playNextFromQueue = async () => {
    if (!mountedRef.current || isPaused) return

    const audio = audioRef.current
    if (!audio) return

    // Si hay audio en la cola, reproducirlo
    if (audioQueueRef.current.length > 0) {
      const next = audioQueueRef.current.shift()!
      currentIndexRef.current++
      setCurrentSegment(currentIndexRef.current)
      setCurrentSpeaker(next.speaker || null)

      audio.src = next.url
      try {
        await audio.play()
        setIsPlaying(true)
        onPlayStateChange?.(true)
      } catch (err) {
        console.warn('[VoicePlayerAuto] Play error:', err)
        // Si falla, intentar con el siguiente
        playNextFromQueue()
      }
    } else if (currentIndexRef.current >= segmentsRef.current.length) {
      // Ya terminamos todos los segmentos
      setIsPlaying(false)
      setIsLoading(false)
      setCurrentSpeaker(null)
      onPlayStateChange?.(false)
    }
  }

  // Generar audios en paralelo con la reproducción
  const generateAllAudios = async () => {
    const segments = segmentsRef.current

    for (let i = 0; i < segments.length; i++) {
      if (!mountedRef.current) break

      const segment = segments[i]
      const url = await generateSegmentAudio(segment)

      if (url && mountedRef.current) {
        audioQueueRef.current.push({
          url,
          speaker: segment.speaker
        })

        // Si es el primer audio y no estamos reproduciendo, empezar
        if (i === 0 && !isGeneratingRef.current) {
          isGeneratingRef.current = true
          setIsLoading(false)
          playNextFromQueue()
        }
      }
    }
  }

  // Iniciar generación y reproducción
  const startPlayback = async () => {
    if (hasStarted) return
    setHasStarted(true)
    setIsLoading(true)

    // Obtener voz del narrador para este lore
    const narratorConfig = getVoiceConfig(lore, locale)
    const narratorVoice = narratorConfig.voice

    // Parsear texto en segmentos (narración vs diálogos)
    const segments = parseTextForVoices(text, narratorVoice, locale)
    segmentsRef.current = segments
    setTotalSegments(segments.length)
    audioQueueRef.current = []
    currentIndexRef.current = 0

    // Empezar a generar (la reproducción comienza cuando el primer audio está listo)
    generateAllAudios()
  }

  // Auto-start al montar
  useEffect(() => {
    mountedRef.current = true
    startPlayback()

    return () => {
      mountedRef.current = false
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      // Limpiar URLs
      audioQueueRef.current.forEach(item => URL.revokeObjectURL(item.url))
    }
  }, [])

  // Manejar fin de audio actual
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      setIsPlaying(false)
      // Reproducir siguiente de la cola
      playNextFromQueue()
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [isPaused])

  // Toggle pause/resume
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      setIsPaused(true)
      onPlayStateChange?.(false)
    } else if (isPaused) {
      audio.play()
      setIsPlaying(true)
      setIsPaused(false)
      onPlayStateChange?.(true)
    } else if (audioQueueRef.current.length > 0) {
      // Si hay audio en cola pero no reproduciendo, empezar
      playNextFromQueue()
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <audio ref={audioRef} preload="none" />
      <button
        onClick={togglePlay}
        disabled={isLoading && audioQueueRef.current.length === 0}
        className="p-1.5 rounded-lg glass-panel transition-all hover:bg-gold/10 disabled:opacity-50"
        title={isPlaying ? (locale === 'en' ? 'Pause' : 'Pausar') : (locale === 'en' ? 'Play' : 'Reproducir')}
      >
        {isLoading && audioQueueRef.current.length === 0 ? (
          <Loader2 className="h-4 w-4 text-gold animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4 text-gold" />
        ) : (
          <Volume2 className="h-4 w-4 text-gold/70 hover:text-gold" />
        )}
      </button>
      {/* Speaker indicator when NPC is talking */}
      {currentSpeaker && isPlaying && (
        <span className="text-[10px] text-gold/70 font-ui italic animate-pulse">
          {currentSpeaker}
        </span>
      )}
      {/* Progress indicator */}
      {totalSegments > 1 && hasStarted && !currentSpeaker && (
        <span className="text-[10px] text-gold/50 font-mono">
          {currentSegment}/{totalSegments}
        </span>
      )}
    </div>
  )
}
