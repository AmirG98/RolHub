'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface BackgroundMusicProps {
  src?: string
  initialVolume?: number
  autoPlay?: boolean
}

export function BackgroundMusic({
  src = '/assets/audio/epic-medieval.mp3',
  initialVolume = 0.3,
  autoPlay = false
}: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(initialVolume)
  const [hasInteracted, setHasInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume
    audioRef.current = audio

    // Cleanup on unmount
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [src])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = async () => {
    if (!audioRef.current) return

    setHasInteracted(true)

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.log('Audio playback failed:', error)
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {/* Volume slider - only show when playing */}
      {isPlaying && (
        <div className="glass-panel rounded-full px-3 py-2 flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-gold-dim rounded-lg appearance-none cursor-pointer accent-gold"
          />
        </div>
      )}

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className={`glass-panel rounded-full p-3 transition-all duration-300 hover:scale-110 ${
          isPlaying ? 'glow-effect text-gold-bright' : 'text-parchment/60 hover:text-gold'
        }`}
        title={isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {isPlaying ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </button>

      {/* First time hint */}
      {!hasInteracted && (
        <div className="absolute bottom-full right-0 mb-2 glass-panel-dark rounded-lg px-3 py-2 text-xs text-parchment/80 whitespace-nowrap animate-pulse">
          Click para música
        </div>
      )}
    </div>
  )
}
