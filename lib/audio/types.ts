/**
 * Sistema de Audio Dinámico
 * Maneja música ambiental que cambia según el mood de la escena
 */

/**
 * Moods disponibles para la música
 * El DM determina el mood basándose en la situación narrativa
 */
export type MusicMood =
  | 'exploration'    // Calma, exploración, viajes
  | 'tension'        // Intriga, misterio, peligro inminente
  | 'combat'         // Batalla, acción intensa
  | 'dramatic'       // Momentos emotivos, revelaciones
  | 'peaceful'       // Descanso, taberna, momentos tranquilos
  | 'horror'         // Terror, desesperación
  | 'victory'        // Triunfo, celebración
  | 'ambient'        // Neutral, fondo suave

/**
 * Configuración de un track de música
 */
export interface MusicTrack {
  id: string
  name: string
  url: string
  mood: MusicMood
  lore?: string      // Si es específico de un lore
  loop: boolean
  volume: number     // 0-1, volumen base del track
}

/**
 * Estado del reproductor de música
 */
export interface MusicPlayerState {
  currentMood: MusicMood
  currentTrack: MusicTrack | null
  isPlaying: boolean
  volume: number     // Volumen master (0-1)
  isMuted: boolean
  isTransitioning: boolean
}

/**
 * Configuración del mixer de audio
 */
export interface AudioMixerConfig {
  music: number      // 0-1, default 0.3
  voice: number      // 0-1, default 1.0
  sfx: number        // 0-1, default 0.7
  master: number     // 0-1, default 0.8
}

/**
 * Mapeo de situaciones narrativas a moods
 */
export const NARRATIVE_MOOD_TRIGGERS: Record<string, MusicMood> = {
  // Combate
  'batalla': 'combat',
  'pelea': 'combat',
  'ataque': 'combat',
  'combate': 'combat',
  'enemigo': 'tension',
  'fight': 'combat',
  'battle': 'combat',
  'attack': 'combat',

  // Tensión
  'peligro': 'tension',
  'acecha': 'tension',
  'sombras': 'tension',
  'oscuridad': 'tension',
  'danger': 'tension',
  'lurking': 'tension',
  'shadows': 'tension',

  // Horror
  'terror': 'horror',
  'horror': 'horror',
  'pesadilla': 'horror',
  'monstruo': 'horror',
  'nightmare': 'horror',
  'monster': 'horror',
  'dread': 'horror',

  // Paz
  'taberna': 'peaceful',
  'descanso': 'peaceful',
  'dormir': 'peaceful',
  'seguro': 'peaceful',
  'tavern': 'peaceful',
  'rest': 'peaceful',
  'safe': 'peaceful',
  'inn': 'peaceful',

  // Victoria
  'victoria': 'victory',
  'triunfo': 'victory',
  'logras': 'victory',
  'éxito': 'victory',
  'victory': 'victory',
  'triumph': 'victory',
  'success': 'victory',

  // Dramático
  'revelación': 'dramatic',
  'secreto': 'dramatic',
  'verdad': 'dramatic',
  'muerte': 'dramatic',
  'revelation': 'dramatic',
  'secret': 'dramatic',
  'truth': 'dramatic',
  'death': 'dramatic',
}

/**
 * Analiza el texto de la narración para detectar el mood
 */
export function detectMoodFromNarration(narration: string): MusicMood {
  const lowerText = narration.toLowerCase()

  // Buscar triggers en orden de prioridad
  for (const [trigger, mood] of Object.entries(NARRATIVE_MOOD_TRIGGERS)) {
    if (lowerText.includes(trigger)) {
      return mood
    }
  }

  // Default a exploración si no hay triggers específicos
  return 'exploration'
}

/**
 * Duración del fade entre tracks (ms)
 */
export const CROSSFADE_DURATION = 2000

/**
 * Volumen base para música de fondo (no debe dominar la narración)
 */
export const DEFAULT_MUSIC_VOLUME = 0.25
