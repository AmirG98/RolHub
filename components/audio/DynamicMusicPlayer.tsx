'use client'

import { useState, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Music, Loader2 } from 'lucide-react'
import { MusicMood, MusicPlayerState, DEFAULT_MUSIC_VOLUME } from '@/lib/audio/types'

// Importamos el manager dinámicamente para evitar SSR issues
let musicManagerInstance: typeof import('@/lib/audio/music-manager').musicManager | null = null

interface DynamicMusicPlayerProps {
  /** Mood inicial al montar el componente */
  initialMood?: MusicMood
  /** Callback cuando cambia el mood */
  onMoodChange?: (mood: MusicMood) => void
  /** Muestra indicador del mood actual */
  showMoodIndicator?: boolean
  /** Posición del player */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const MOOD_LABELS: Record<MusicMood, { es: string; en: string; emoji: string }> = {
  exploration: { es: 'Exploración', en: 'Exploration', emoji: '🗺️' },
  tension: { es: 'Tensión', en: 'Tension', emoji: '⚠️' },
  combat: { es: 'Combate', en: 'Combat', emoji: '⚔️' },
  dramatic: { es: 'Dramático', en: 'Dramatic', emoji: '🎭' },
  peaceful: { es: 'Paz', en: 'Peaceful', emoji: '🏠' },
  horror: { es: 'Horror', en: 'Horror', emoji: '👻' },
  victory: { es: 'Victoria', en: 'Victory', emoji: '🏆' },
  ambient: { es: 'Ambiente', en: 'Ambient', emoji: '🎵' },
}

const POSITION_CLASSES: Record<string, string> = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-20 right-4',
  'top-left': 'top-20 left-4',
}

export function DynamicMusicPlayer({
  initialMood = 'exploration',
  onMoodChange,
  showMoodIndicator = true,
  position = 'bottom-right'
}: DynamicMusicPlayerProps) {
  const [state, setState] = useState<MusicPlayerState>({
    currentMood: initialMood,
    currentTrack: null,
    isPlaying: false,
    volume: DEFAULT_MUSIC_VOLUME,
    isMuted: false,
    isTransitioning: false
  })
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // Inicializar en cliente
  useEffect(() => {
    setIsClient(true)

    // Importar dinámicamente el music manager
    import('@/lib/audio/music-manager').then(({ musicManager }) => {
      musicManagerInstance = musicManager

      // Suscribirse a cambios de estado
      const unsubscribe = musicManager.subscribe((newState) => {
        setState(newState)
        if (newState.currentMood !== state.currentMood) {
          onMoodChange?.(newState.currentMood)
        }
      })

      return () => unsubscribe()
    })
  }, [])

  // Cambiar mood inicial si se especifica
  useEffect(() => {
    if (musicManagerInstance && initialMood && !state.isPlaying) {
      // Solo cambiar si no está reproduciendo
    }
  }, [initialMood])

  const togglePlay = useCallback(async () => {
    if (!musicManagerInstance) return

    setHasInteracted(true)

    if (state.isPlaying) {
      musicManagerInstance.pause()
    } else {
      await musicManagerInstance.play(initialMood)
    }
  }, [state.isPlaying, initialMood])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!musicManagerInstance) return
    const newVolume = parseFloat(e.target.value)
    musicManagerInstance.setVolume(newVolume)
  }, [])

  const toggleMute = useCallback(() => {
    if (!musicManagerInstance) return
    musicManagerInstance.toggleMute()
  }, [])

  // No renderizar en SSR
  if (!isClient) return null

  const moodInfo = MOOD_LABELS[state.currentMood]
  const positionClass = POSITION_CLASSES[position]

  return (
    <div className={`fixed ${positionClass} z-50 flex items-center gap-2`}>
      {/* Mood indicator */}
      {showMoodIndicator && state.isPlaying && (
        <div
          className="glass-panel rounded-full px-3 py-1.5 flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity cursor-default"
          title={`Mood: ${moodInfo.es}`}
        >
          <span className="text-sm">{moodInfo.emoji}</span>
          <span className="font-ui text-xs text-parchment/80 hidden sm:inline">
            {moodInfo.es}
          </span>
          {state.isTransitioning && (
            <Loader2 className="h-3 w-3 animate-spin text-gold" />
          )}
        </div>
      )}

      {/* Volume slider - show on hover/click */}
      {state.isPlaying && showVolumeSlider && (
        <div
          className="glass-panel rounded-full px-3 py-2 flex items-center gap-2"
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={toggleMute}
            className="text-parchment/60 hover:text-gold transition-colors"
          >
            {state.isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.isMuted ? 0 : state.volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gold-dim rounded-lg appearance-none cursor-pointer accent-gold"
          />
        </div>
      )}

      {/* Main play button */}
      <button
        onClick={togglePlay}
        onMouseEnter={() => state.isPlaying && setShowVolumeSlider(true)}
        className={`glass-panel rounded-full p-3 transition-all duration-300 hover:scale-110 ${
          state.isPlaying
            ? 'glow-effect text-gold-bright'
            : 'text-parchment/60 hover:text-gold'
        }`}
        title={state.isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {state.isTransitioning ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : state.isPlaying ? (
          <Music className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </button>

      {/* First time hint */}
      {!hasInteracted && (
        <div className="absolute bottom-full right-0 mb-2 glass-panel-dark rounded-lg px-3 py-2 text-xs text-parchment/80 whitespace-nowrap animate-pulse">
          🎵 Click para música
        </div>
      )}
    </div>
  )
}

/**
 * Hook para controlar la música desde cualquier componente
 */
export function useDynamicMusic() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    import('@/lib/audio/music-manager').then(({ musicManager }) => {
      musicManagerInstance = musicManager
      setIsReady(true)
    })
  }, [])

  const setMood = useCallback((mood: MusicMood) => {
    if (musicManagerInstance) {
      musicManagerInstance.setMood(mood)
    }
  }, [])

  const onNarration = useCallback((narration: string) => {
    if (musicManagerInstance) {
      musicManagerInstance.onNarration(narration)
    }
  }, [])

  const play = useCallback((mood?: MusicMood) => {
    if (musicManagerInstance) {
      musicManagerInstance.play(mood)
    }
  }, [])

  const pause = useCallback(() => {
    if (musicManagerInstance) {
      musicManagerInstance.pause()
    }
  }, [])

  const stop = useCallback(() => {
    if (musicManagerInstance) {
      musicManagerInstance.stop()
    }
  }, [])

  return {
    isReady,
    setMood,
    onNarration,
    play,
    pause,
    stop
  }
}
