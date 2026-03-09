/**
 * Sistema de Guest (Invitado)
 * Permite jugar sin registro con advertencia de que no se guarda
 */

/**
 * Datos de sesión del guest almacenados en sessionStorage
 */
export interface GuestSession {
  id: string                    // UUID único para esta sesión
  createdAt: string             // Timestamp de creación
  character?: GuestCharacter    // Personaje temporal
  worldState?: any              // Estado del mundo temporal
  turns: GuestTurn[]            // Historial de turnos
  lore: string                  // Lore seleccionado
  engine: string                // Motor de juego
  mode: 'ONE_SHOT' | 'CAMPAIGN'
}

/**
 * Personaje temporal del guest
 */
export interface GuestCharacter {
  name: string
  archetype: string
  level: number
  stats: Record<string, number>
  inventory: string[]
}

/**
 * Turno temporal del guest
 */
export interface GuestTurn {
  id: string
  role: 'USER' | 'DM' | 'SYSTEM'
  content: string
  createdAt: string
  diceRoll?: { formula: string; result: number; rolls: number[] }
}

/**
 * Estado del contexto de guest
 */
export interface GuestState {
  isGuest: boolean
  session: GuestSession | null
  hasShownWarning: boolean
}

/**
 * Clave para sessionStorage
 */
export const GUEST_SESSION_KEY = 'rpghub_guest_session'
export const GUEST_WARNING_KEY = 'rpghub_guest_warning_shown'

/**
 * Genera un ID único para guest
 */
export function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
