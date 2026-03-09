/**
 * Music Manager - Controla la música ambiental dinámica
 * Usa Howler.js para reproducción con crossfade suave
 */

import { Howl, Howler } from 'howler'
import {
  MusicMood,
  MusicTrack,
  MusicPlayerState,
  CROSSFADE_DURATION,
  DEFAULT_MUSIC_VOLUME,
  detectMoodFromNarration
} from './types'
import { getRandomTrackForMood, getDefaultTrack } from './tracks'

/**
 * Clase singleton para manejar la música del juego
 */
class MusicManager {
  private static instance: MusicManager | null = null

  private currentHowl: Howl | null = null
  private nextHowl: Howl | null = null
  private state: MusicPlayerState = {
    currentMood: 'exploration',
    currentTrack: null,
    isPlaying: false,
    volume: DEFAULT_MUSIC_VOLUME,
    isMuted: false,
    isTransitioning: false
  }

  // Callbacks para notificar cambios de estado
  private stateListeners: Set<(state: MusicPlayerState) => void> = new Set()

  private constructor() {
    // Configuración global de Howler
    Howler.autoUnlock = true
    Howler.html5PoolSize = 10
  }

  /**
   * Obtiene la instancia singleton
   */
  static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager()
    }
    return MusicManager.instance
  }

  /**
   * Suscribirse a cambios de estado
   */
  subscribe(listener: (state: MusicPlayerState) => void): () => void {
    this.stateListeners.add(listener)
    // Notificar estado actual inmediatamente
    listener(this.state)
    // Retornar función para desuscribirse
    return () => this.stateListeners.delete(listener)
  }

  /**
   * Notifica a todos los listeners del cambio de estado
   */
  private notifyStateChange() {
    this.stateListeners.forEach(listener => listener({ ...this.state }))
  }

  /**
   * Obtiene el estado actual
   */
  getState(): MusicPlayerState {
    return { ...this.state }
  }

  /**
   * Inicia la música con el mood inicial
   */
  async play(mood?: MusicMood): Promise<void> {
    const targetMood = mood || this.state.currentMood
    await this.changeMood(targetMood)
  }

  /**
   * Pausa la música actual
   */
  pause(): void {
    if (this.currentHowl) {
      this.currentHowl.pause()
      this.state.isPlaying = false
      this.notifyStateChange()
    }
  }

  /**
   * Reanuda la música
   */
  resume(): void {
    if (this.currentHowl) {
      this.currentHowl.play()
      this.state.isPlaying = true
      this.notifyStateChange()
    }
  }

  /**
   * Toggle play/pause
   */
  toggle(): void {
    if (this.state.isPlaying) {
      this.pause()
    } else {
      if (this.currentHowl) {
        this.resume()
      } else {
        this.play()
      }
    }
  }

  /**
   * Detiene completamente la música
   */
  stop(): void {
    if (this.currentHowl) {
      this.currentHowl.stop()
      this.currentHowl.unload()
      this.currentHowl = null
    }
    if (this.nextHowl) {
      this.nextHowl.stop()
      this.nextHowl.unload()
      this.nextHowl = null
    }
    this.state.isPlaying = false
    this.state.currentTrack = null
    this.notifyStateChange()
  }

  /**
   * Ajusta el volumen (0-1)
   */
  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume))
    if (this.currentHowl) {
      this.currentHowl.volume(this.state.volume * (this.state.currentTrack?.volume || 1))
    }
    this.notifyStateChange()
  }

  /**
   * Mute/unmute
   */
  toggleMute(): void {
    this.state.isMuted = !this.state.isMuted
    Howler.mute(this.state.isMuted)
    this.notifyStateChange()
  }

  /**
   * Cambia el mood de la música con crossfade
   */
  async changeMood(newMood: MusicMood): Promise<void> {
    // Si es el mismo mood y ya está sonando, no hacer nada
    if (newMood === this.state.currentMood && this.state.isPlaying) {
      return
    }

    // Evitar cambios durante transición
    if (this.state.isTransitioning) {
      return
    }

    this.state.isTransitioning = true
    this.notifyStateChange()

    // Obtener nuevo track
    const newTrack = getRandomTrackForMood(newMood)
    if (!newTrack) {
      console.warn(`[MusicManager] No tracks available for mood: ${newMood}`)
      this.state.isTransitioning = false
      this.notifyStateChange()
      return
    }

    // Crear nuevo Howl
    this.nextHowl = new Howl({
      src: [newTrack.url],
      loop: newTrack.loop,
      volume: 0, // Empieza en 0 para fade in
      html5: true, // Mejor para streaming
      onload: () => {
        this.performCrossfade(newTrack, newMood)
      },
      onloaderror: (_id, error) => {
        console.error(`[MusicManager] Error loading track: ${newTrack.url}`, error)
        this.state.isTransitioning = false
        this.notifyStateChange()
        // Intentar con el track por defecto
        if (newTrack.id !== 'exploration_2') {
          this.playDefaultTrack()
        }
      },
      onend: () => {
        // Si el track no loopea (ej: victory), volver a exploration
        if (!newTrack.loop) {
          this.changeMood('exploration')
        }
      }
    })
  }

  /**
   * Realiza el crossfade entre tracks
   */
  private performCrossfade(newTrack: MusicTrack, newMood: MusicMood): void {
    const targetVolume = this.state.volume * newTrack.volume

    // Fade out del track actual
    if (this.currentHowl) {
      const oldHowl = this.currentHowl
      oldHowl.fade(oldHowl.volume(), 0, CROSSFADE_DURATION)
      setTimeout(() => {
        oldHowl.stop()
        oldHowl.unload()
      }, CROSSFADE_DURATION)
    }

    // Fade in del nuevo track
    if (this.nextHowl) {
      this.nextHowl.play()
      this.nextHowl.fade(0, targetVolume, CROSSFADE_DURATION)

      this.currentHowl = this.nextHowl
      this.nextHowl = null

      this.state.currentMood = newMood
      this.state.currentTrack = newTrack
      this.state.isPlaying = true

      setTimeout(() => {
        this.state.isTransitioning = false
        this.notifyStateChange()
      }, CROSSFADE_DURATION)
    }

    this.notifyStateChange()
  }

  /**
   * Reproduce el track por defecto (fallback)
   */
  private playDefaultTrack(): void {
    const defaultTrack = getDefaultTrack()
    if (!defaultTrack) return

    this.currentHowl = new Howl({
      src: [defaultTrack.url],
      loop: defaultTrack.loop,
      volume: this.state.volume * defaultTrack.volume,
      html5: true
    })

    this.currentHowl.play()
    this.state.currentTrack = defaultTrack
    this.state.currentMood = defaultTrack.mood
    this.state.isPlaying = true
    this.state.isTransitioning = false
    this.notifyStateChange()
  }

  /**
   * Analiza una narración y cambia el mood automáticamente
   */
  onNarration(narration: string): void {
    const detectedMood = detectMoodFromNarration(narration)

    // Solo cambiar si el mood es diferente al actual
    if (detectedMood !== this.state.currentMood) {
      console.log(`[MusicManager] Mood detected: ${detectedMood} (was: ${this.state.currentMood})`)
      this.changeMood(detectedMood)
    }
  }

  /**
   * Fuerza un mood específico (usado por el sistema o DM)
   */
  setMood(mood: MusicMood): void {
    this.changeMood(mood)
  }
}

// Exportar instancia singleton
export const musicManager = MusicManager.getInstance()

// Export para uso en componentes
export { MusicManager }
