import { type NavigationLockReason } from '@/lib/types/map-state'

/**
 * Sistema de UI Mood
 *
 * Los moods controlan la atmósfera visual de la interfaz:
 * - exploration: Exploración calmada, colores dorados suaves
 * - combat: Combate activo, bordes rojos pulsantes
 * - dialogue: Conversación con NPC, colores cálidos
 * - dramatic: Momentos épicos/reveladoras, efectos brillantes
 */

export type UIMood = 'exploration' | 'combat' | 'dialogue' | 'dramatic'

// Mapeo de lockReason a UIMood
const LOCK_REASON_TO_MOOD: Record<NavigationLockReason, UIMood> = {
  combat: 'combat',
  dialogue: 'dialogue',
  cutscene: 'dramatic',
  important_choice: 'dramatic',
  ritual: 'dramatic',
  trap: 'combat',
  none: 'exploration',
}

/**
 * Deriva el mood de la UI basado en el estado del juego
 */
export function getUIMood(
  lockReason: NavigationLockReason = 'none',
  narrativeContext?: string
): UIMood {
  // Primero, chequeamos el lockReason que es más confiable
  const moodFromLock = LOCK_REASON_TO_MOOD[lockReason]
  if (moodFromLock !== 'exploration') {
    return moodFromLock
  }

  // Si no hay lock, analizamos el contexto narrativo
  if (narrativeContext) {
    const mood = detectMoodFromNarrative(narrativeContext)
    if (mood) return mood
  }

  return 'exploration'
}

/**
 * Detecta el mood basado en el texto narrativo
 */
export function detectMoodFromNarrative(text: string): UIMood | null {
  const lowerText = text.toLowerCase()

  // Keywords de combate
  const combatKeywords = [
    'ataca', 'attack', 'golpea', 'hit', 'dispara', 'shoot',
    'esquiva', 'dodge', 'bloquea', 'block', 'daño', 'damage',
    'herida', 'wound', 'sangre', 'blood', 'espada', 'sword',
    'flecha', 'arrow', 'combate', 'combat', 'batalla', 'battle',
    'enemigo', 'enemy', 'monstruo', 'monster', 'criatura', 'creature',
    'iniciativa', 'initiative', 'turno de combate'
  ]

  if (combatKeywords.some(kw => lowerText.includes(kw))) {
    return 'combat'
  }

  // Keywords de diálogo
  const dialogueKeywords = [
    'dice:', 'says:', 'pregunta', 'asks', 'responde', 'replies',
    'susurra', 'whispers', 'grita', 'shouts', 'explica', 'explains',
    'cuenta', 'tells', 'conversa', 'habla con', 'speak with'
  ]

  if (dialogueKeywords.some(kw => lowerText.includes(kw))) {
    return 'dialogue'
  }

  // Keywords dramáticos
  const dramaticKeywords = [
    'muerte', 'death', 'muere', 'dies', 'traición', 'betrayal',
    'revela', 'reveals', 'secreto', 'secret', 'destino', 'fate',
    'profecía', 'prophecy', 'final', 'último', 'last',
    'transformación', 'transformation', 'poder antiguo', 'ancient power',
    'oscuridad', 'darkness', 'luz', 'light', 'elegido', 'chosen'
  ]

  if (dramaticKeywords.some(kw => lowerText.includes(kw))) {
    return 'dramatic'
  }

  return null
}

/**
 * Configuración visual por mood
 */
export interface MoodConfig {
  borderClass: string
  glowClass: string
  bgClass: string
  cssClass: string           // Clase CSS completa a aplicar
  transitionEffect: 'fade' | 'ink-spill' | 'none'
  ambientEffect?: 'vignette' | 'fog' | 'danger' | null
}

export const MOOD_CONFIGS: Record<UIMood, MoodConfig> = {
  exploration: {
    borderClass: 'border-gold-dim',
    glowClass: '',
    bgClass: 'bg-shadow',
    cssClass: 'ui-mood-exploration',
    transitionEffect: 'fade',
    ambientEffect: null,
  },
  combat: {
    borderClass: 'border-blood',
    glowClass: 'shadow-[0_0_30px_rgba(139,26,26,0.5)]',
    bgClass: 'bg-[rgba(30,10,10,0.95)]',
    cssClass: 'ui-mood-combat',
    transitionEffect: 'none',
    ambientEffect: 'danger',
  },
  dialogue: {
    borderClass: 'border-gold',
    glowClass: 'shadow-[0_0_20px_rgba(201,168,76,0.3)]',
    bgClass: 'bg-[rgba(20,15,10,0.95)]',
    cssClass: 'ui-mood-dialogue',
    transitionEffect: 'fade',
    ambientEffect: null,
  },
  dramatic: {
    borderClass: 'border-gold-bright',
    glowClass: 'shadow-[0_0_40px_rgba(245,200,66,0.4)]',
    bgClass: 'bg-[rgba(10,8,5,0.98)]',
    cssClass: 'ui-mood-dramatic',
    transitionEffect: 'ink-spill',
    ambientEffect: 'vignette',
  },
}

/**
 * Hook para obtener la configuración del mood actual
 */
export function getMoodConfig(mood: UIMood): MoodConfig {
  return MOOD_CONFIGS[mood]
}

/**
 * Texto descriptivo del mood (para debugging/UI)
 */
export const MOOD_LABELS: Record<UIMood, { es: string; en: string }> = {
  exploration: { es: 'Explorando', en: 'Exploring' },
  combat: { es: 'En combate', en: 'In combat' },
  dialogue: { es: 'Conversando', en: 'In dialogue' },
  dramatic: { es: 'Momento épico', en: 'Epic moment' },
}

/**
 * Sonidos ambientales sugeridos por mood
 */
export const MOOD_AMBIENT_SOUNDS: Record<UIMood, string> = {
  exploration: 'exploration-medieval',
  combat: 'combat-epic',
  dialogue: 'peaceful-tavern',
  dramatic: 'tension-dark',
}

/**
 * Detecta si debería haber una transición de escena
 */
export function shouldTriggerSceneTransition(
  previousMood: UIMood,
  newMood: UIMood
): boolean {
  // Siempre transición cuando entramos/salimos de dramatic
  if (newMood === 'dramatic' || previousMood === 'dramatic') {
    return true
  }

  // Transición al entrar/salir de combate
  if (newMood === 'combat' || previousMood === 'combat') {
    return true
  }

  return false
}

/**
 * Tipo de transición basado en el cambio de mood
 */
export function getTransitionType(
  previousMood: UIMood,
  newMood: UIMood
): 'fade' | 'ink-spill' | 'none' {
  // Ink spill para momentos dramáticos
  if (newMood === 'dramatic') {
    return 'ink-spill'
  }

  // Fade para el resto
  if (shouldTriggerSceneTransition(previousMood, newMood)) {
    return 'fade'
  }

  return 'none'
}
