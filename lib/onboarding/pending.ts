// Persistencia del wizard de /onboarding cuando el usuario aún no tiene sesión
// Clerk. Se usa para que un no-logueado pueda completar todos los pasos, loguearse
// inline, y que al volver el personaje se cree automáticamente con los datos que
// ya eligió.

const KEY = 'rolhub:onboarding:pending'
const TTL_MS = 60 * 60 * 1000 // 1 hora

export interface PendingOnboarding {
  selectedLore: string | null
  gameMode: string | null
  engine: string | null
  tutorialLevel: string | null
  isMultiplayer: boolean
  archetype: any | null
  characterName: string
  characterDescription: string
  customStats: any | null
  isDnD5eCharacter?: boolean
  dnd5eCharacterData?: any
  savedAt: number
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export function savePending(data: Omit<PendingOnboarding, 'savedAt'>): void {
  if (!isBrowser()) return
  try {
    const payload: PendingOnboarding = { ...data, savedAt: Date.now() }
    window.sessionStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    // sessionStorage puede fallar en modo privado muy viejo — lo toleramos
  }
}

export function loadPending(): PendingOnboarding | null {
  if (!isBrowser()) return null
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingOnboarding
    if (!parsed || typeof parsed.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > TTL_MS) {
      window.sessionStorage.removeItem(KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearPending(): void {
  if (!isBrowser()) return
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    // no-op
  }
}

export function hasPending(): boolean {
  return loadPending() !== null
}
