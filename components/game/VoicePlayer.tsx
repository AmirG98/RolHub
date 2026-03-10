'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Pause, Loader2 } from 'lucide-react'
import { RunicButton } from '@/components/medieval/RunicButton'
import { Lore } from '@prisma/client'
import { getRandomLoadingMessage, parseTextForVoices, getVoiceConfig, VoiceSegment, splitIntoSentences } from '@/lib/tts/voice-config'

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
 * Versión con auto-play ULTRA RÁPIDO
 * - Divide en segmentos (narración vs diálogos con voces diferentes)
 * - Genera primera oración con prioridad para mínima latencia
 * - Genera el resto en paralelo mientras reproduce
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
  const audioQueueRef = useRef<({ url: string; speaker?: string } | null)[]>([])
  const segmentsRef = useRef<VoiceSegment[]>([])
  const mountedRef = useRef(true)
  const currentIndexRef = useRef(0)
  const hasStartedPlayingRef = useRef(false)
  const generationCompleteRef = useRef(false)

  // Generar audio para un segmento con su voz específica
  const generateSegmentAudio = async (segment: VoiceSegment, index: number): Promise<void> => {
    try {
      const response = await fetch('/api/voice/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: segment.text,
          lore,
          locale,
          voice: segment.voice  // Voz específica para NPCs vs narrador
        })
      })

      if (!response.ok || !mountedRef.current) return

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)

      if (!mountedRef.current) {
        URL.revokeObjectURL(url)
        return
      }

      // Guardar en la posición correcta con info del speaker
      audioQueueRef.current[index] = { url, speaker: segment.speaker }

      // Si es el primero y no hemos empezado a reproducir, empezar inmediatamente
      if (index === 0 && !hasStartedPlayingRef.current) {
        hasStartedPlayingRef.current = true
        setIsLoading(false)
        playSegment(0)
      }
    } catch (err) {
      console.error(`[VoicePlayerAuto] Error generating segment ${index}:`, err)
    }
  }

  // Reproducir un segmento específico
  const playSegment = async (index: number) => {
    if (!mountedRef.current || isPaused) return

    const audio = audioRef.current
    if (!audio) return

    const segment = audioQueueRef.current[index]

    if (segment) {
      currentIndexRef.current = index
      setCurrentSegment(index + 1)
      setCurrentSpeaker(segment.speaker || null)

      audio.src = segment.url
      try {
        await audio.play()
        setIsPlaying(true)
        onPlayStateChange?.(true)
      } catch (err) {
        console.warn('[VoicePlayerAuto] Play error:', err)
        tryPlayNext(index + 1)
      }
    } else if (!generationCompleteRef.current) {
      // Audio aún no está listo, esperar y reintentar
      setTimeout(() => {
        if (mountedRef.current && !isPaused) {
          playSegment(index)
        }
      }, 50)
    } else {
      // Generación completa, no hay más audios
      setIsPlaying(false)
      setIsLoading(false)
      setCurrentSpeaker(null)
      onPlayStateChange?.(false)
    }
  }

  // Intentar reproducir el siguiente
  const tryPlayNext = (nextIndex: number) => {
    if (nextIndex < segmentsRef.current.length) {
      playSegment(nextIndex)
    } else {
      setIsPlaying(false)
      setIsLoading(false)
      setCurrentSpeaker(null)
      onPlayStateChange?.(false)
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

    // Parsear texto en segmentos (narración vs diálogos con voces diferentes)
    const segments = parseTextForVoices(text, narratorVoice, locale)
    segmentsRef.current = segments
    setTotalSegments(segments.length)

    // Inicializar array de audios
    audioQueueRef.current = new Array(segments.length).fill(null)
    currentIndexRef.current = 0
    hasStartedPlayingRef.current = false
    generationCompleteRef.current = false

    // Generar primera oración con prioridad máxima
    generateSegmentAudio(segments[0], 0)

    // Generar el resto en paralelo después de un pequeño delay
    if (segments.length > 1) {
      setTimeout(() => {
        segments.slice(1).forEach((segment, i) => {
          generateSegmentAudio(segment, i + 1)
        })
      }, 50)
    }

    // Marcar cuando todas terminen
    Promise.all(
      segments.map((_, index) =>
        new Promise<void>((resolve) => {
          const checkReady = () => {
            if (audioQueueRef.current[index] !== null || !mountedRef.current) {
              resolve()
            } else {
              setTimeout(checkReady, 100)
            }
          }
          checkReady()
        })
      )
    ).then(() => {
      generationCompleteRef.current = true
    })
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
      audioQueueRef.current.forEach(item => {
        if (item) URL.revokeObjectURL(item.url)
      })
    }
  }, [])

  // Manejar fin de audio actual
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      setIsPlaying(false)
      tryPlayNext(currentIndexRef.current + 1)
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
    } else if (audioQueueRef.current[currentIndexRef.current]) {
      playSegment(currentIndexRef.current)
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <audio ref={audioRef} preload="none" />
      <button
        onClick={togglePlay}
        disabled={isLoading && !hasStartedPlayingRef.current}
        className="p-1.5 rounded-lg glass-panel transition-all hover:bg-gold/10 disabled:opacity-50"
        title={isPlaying ? (locale === 'en' ? 'Pause' : 'Pausar') : (locale === 'en' ? 'Play' : 'Reproducir')}
      >
        {isLoading && !hasStartedPlayingRef.current ? (
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
