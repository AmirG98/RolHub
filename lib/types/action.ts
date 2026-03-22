// Tipos para el sistema de acciones del jugador

/**
 * Tipo de acción que el jugador puede realizar
 * - 'do': Acción física (atacar, explorar, moverse, etc.)
 * - 'talk': Diálogo con NPCs o el mundo
 * - 'auto': Detectar automáticamente basado en asteriscos
 */
export type ActionType = 'do' | 'talk' | 'auto'

/**
 * Resultado del procesamiento de una acción
 */
export interface ProcessedAction {
  /** Texto limpio de la acción (sin asteriscos si aplica) */
  cleanText: string
  /** Tipo de acción determinado */
  actionType: 'do' | 'talk'
}

/**
 * Procesa el texto de una acción y determina su tipo
 * - Si está envuelto en *asteriscos*, siempre es 'do'
 * - Si el modo está explícito, usa ese modo
 * - Default: 'talk' (diálogo)
 */
export function processAction(text: string, mode: ActionType = 'auto'): ProcessedAction {
  const trimmed = text.trim()

  // Si el usuario escribe *texto*, siempre es "do"
  if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
    return {
      cleanText: trimmed.slice(1, -1).trim(),
      actionType: 'do'
    }
  }

  // Si el modo está explícito, usarlo
  if (mode === 'do' || mode === 'talk') {
    return { cleanText: trimmed, actionType: mode }
  }

  // Default: talk (diálogo)
  return { cleanText: trimmed, actionType: 'talk' }
}
