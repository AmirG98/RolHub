'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Howl } from 'howler'

interface UseAmbientSoundOptions {
  lore: string
  mood: string
  enabled?: boolean
  volume?: number          // 0-1, default 0.20
  fadeInMs?: number        // Fade in duration, default 2000
  fadeOutMs?: number       // Fade out duration, default 1500
}

/**
 * Hook para reproducir sonidos ambientales generados por IA
 * - Se genera on-demand via /api/sfx/generate
 * - Se cachea en DB (primera vez es lenta, después instantánea)
 * - Crossfade entre moods
 * - Loop automático
 * - Volumen bajo para no tapar la voz
 */
export function useAmbientSound({
  lore,
  mood,
  enabled = true,
  volume = 0.20,
  fadeInMs = 2000,
  fadeOutMs = 1500,
}: UseAmbientSoundOptions) {
  const currentHowlRef = useRef<Howl | null>(null)
  const currentKeyRef = useRef<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Cargar y reproducir ambient sound
  const loadAndPlay = useCallback(async (loreName: string, moodName: string) => {
    const key = `${loreName}:${moodName}`

    // Si ya estamos reproduciendo este ambient, no hacer nada
    if (key === currentKeyRef.current && currentHowlRef.current) return

    setIsLoading(true)

    try {
      // Pedir al API (devuelve URL cacheada o genera nueva)
      const response = await fetch('/api/sfx/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lore: loreName, mood: moodName }),
      })

      if (!response.ok) {
        console.warn(`[AmbientSound] Failed to load: ${key}`)
        setIsLoading(false)
        return
      }

      const data = await response.json()
      if (!data.url) {
        setIsLoading(false)
        return
      }

      // Fade out el ambient actual
      if (currentHowlRef.current) {
        const oldHowl = currentHowlRef.current
        oldHowl.fade(oldHowl.volume(), 0, fadeOutMs)
        setTimeout(() => {
          oldHowl.stop()
          oldHowl.unload()
        }, fadeOutMs + 100)
      }

      // Crear nuevo Howl con el audio generado
      const newHowl = new Howl({
        src: [data.url],
        loop: true,
        volume: 0,
        html5: true, // Streaming — no cargar todo en memoria
        onplay: () => {
          setIsPlaying(true)
          setIsLoading(false)
        },
        onloaderror: (_id, err) => {
          console.warn('[AmbientSound] Load error:', err)
          setIsLoading(false)
        },
      })

      currentHowlRef.current = newHowl
      currentKeyRef.current = key

      // Reproducir y fade in
      newHowl.play()
      newHowl.fade(0, volume, fadeInMs)

    } catch (err) {
      console.warn('[AmbientSound] Error:', err)
      setIsLoading(false)
    }
  }, [volume, fadeInMs, fadeOutMs])

  // Reaccionar a cambios de mood/lore
  useEffect(() => {
    if (!enabled || !lore || !mood) {
      // Parar si está deshabilitado
      if (currentHowlRef.current) {
        currentHowlRef.current.fade(currentHowlRef.current.volume(), 0, fadeOutMs)
        setTimeout(() => {
          currentHowlRef.current?.stop()
          currentHowlRef.current?.unload()
          currentHowlRef.current = null
          currentKeyRef.current = ''
          setIsPlaying(false)
        }, fadeOutMs + 100)
      }
      return
    }

    loadAndPlay(lore, mood)
  }, [lore, mood, enabled, loadAndPlay, fadeOutMs])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (currentHowlRef.current) {
        currentHowlRef.current.stop()
        currentHowlRef.current.unload()
        currentHowlRef.current = null
      }
    }
  }, [])

  // Cambiar volumen externamente (e.g., bajar cuando habla el narrador)
  const setAmbientVolume = useCallback((newVolume: number) => {
    if (currentHowlRef.current) {
      currentHowlRef.current.fade(currentHowlRef.current.volume(), newVolume, 500)
    }
  }, [])

  return {
    isPlaying,
    isLoading,
    setAmbientVolume,
  }
}
