/**
 * Biblioteca de tracks de música por mood
 *
 * NOTA: Por ahora usamos URLs de audio libre de derechos.
 * En producción, se pueden hostear en Supabase Storage o usar un CDN.
 *
 * Fuentes recomendadas para música libre:
 * - Pixabay (pixabay.com/music)
 * - Free Music Archive
 * - Incompetech (Kevin MacLeod)
 */

import { MusicTrack, MusicMood } from './types'

/**
 * Tracks de música organizados por mood
 * Cada mood tiene múltiples tracks para variedad
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  // === EXPLORATION ===
  {
    id: 'exploration_1',
    name: 'Medieval Journey',
    url: '/assets/audio/exploration-medieval.mp3',
    mood: 'exploration',
    loop: true,
    volume: 0.3
  },
  {
    id: 'exploration_2',
    name: 'Epic Medieval',
    url: '/assets/audio/epic-medieval.mp3', // El track que ya tenemos
    mood: 'exploration',
    loop: true,
    volume: 0.25
  },

  // === TENSION ===
  {
    id: 'tension_1',
    name: 'Dark Suspense',
    url: '/assets/audio/tension-dark.mp3',
    mood: 'tension',
    loop: true,
    volume: 0.35
  },
  {
    id: 'tension_2',
    name: 'Lurking Shadows',
    url: '/assets/audio/tension-shadows.mp3',
    mood: 'tension',
    loop: true,
    volume: 0.3
  },

  // === COMBAT ===
  {
    id: 'combat_1',
    name: 'Battle Drums',
    url: '/assets/audio/combat-drums.mp3',
    mood: 'combat',
    loop: true,
    volume: 0.4
  },
  {
    id: 'combat_2',
    name: 'Epic Battle',
    url: '/assets/audio/combat-epic.mp3',
    mood: 'combat',
    loop: true,
    volume: 0.45
  },

  // === DRAMATIC ===
  {
    id: 'dramatic_1',
    name: 'Emotional Revelation',
    url: '/assets/audio/dramatic-revelation.mp3',
    mood: 'dramatic',
    loop: true,
    volume: 0.35
  },

  // === PEACEFUL ===
  {
    id: 'peaceful_1',
    name: 'Tavern Ambience',
    url: '/assets/audio/peaceful-tavern.mp3',
    mood: 'peaceful',
    loop: true,
    volume: 0.25
  },
  {
    id: 'peaceful_2',
    name: 'Rest by the Fire',
    url: '/assets/audio/peaceful-campfire.mp3',
    mood: 'peaceful',
    loop: true,
    volume: 0.2
  },

  // === HORROR ===
  {
    id: 'horror_1',
    name: 'Dread Ambience',
    url: '/assets/audio/horror-dread.mp3',
    mood: 'horror',
    loop: true,
    volume: 0.3
  },
  {
    id: 'horror_2',
    name: 'Nightmare',
    url: '/assets/audio/horror-nightmare.mp3',
    mood: 'horror',
    loop: true,
    volume: 0.35
  },

  // === VICTORY ===
  {
    id: 'victory_1',
    name: 'Triumphant Fanfare',
    url: '/assets/audio/victory-fanfare.mp3',
    mood: 'victory',
    loop: false, // Victoria no loopea, luego vuelve a exploration
    volume: 0.5
  },

  // === AMBIENT (fallback) ===
  {
    id: 'ambient_1',
    name: 'Soft Background',
    url: '/assets/audio/ambient-soft.mp3',
    mood: 'ambient',
    loop: true,
    volume: 0.15
  },
]

/**
 * Obtiene tracks disponibles para un mood específico
 */
export function getTracksForMood(mood: MusicMood): MusicTrack[] {
  return MUSIC_TRACKS.filter(track => track.mood === mood)
}

/**
 * Obtiene un track aleatorio para un mood
 */
export function getRandomTrackForMood(mood: MusicMood): MusicTrack | null {
  const tracks = getTracksForMood(mood)
  if (tracks.length === 0) {
    // Fallback a ambient si no hay tracks para ese mood
    const ambientTracks = getTracksForMood('ambient')
    if (ambientTracks.length === 0) return null
    return ambientTracks[Math.floor(Math.random() * ambientTracks.length)]
  }
  return tracks[Math.floor(Math.random() * tracks.length)]
}

/**
 * Obtiene el track por defecto (el que ya tenemos)
 */
export function getDefaultTrack(): MusicTrack {
  return MUSIC_TRACKS.find(t => t.id === 'exploration_2') || MUSIC_TRACKS[0]
}

/**
 * Verifica si un archivo de audio existe (para evitar errores 404)
 * En producción, todos los tracks deberían existir
 */
export async function checkTrackExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}
