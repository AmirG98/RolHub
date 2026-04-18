// Helpers para el sistema de habilidades del personaje.
// - DND_5E → daily_uses (X/Y usos, recuperables con descanso largo)
// - Otros engines → cooldown_turns (bloqueo por N turnos del personaje)

import type { AbilityTemplate, AbilityRuntime } from '@/lib/types/ability'
import type { Archetype, GameEngine } from '@/lib/types/lore'

// === Defaults por engine cuando hay que derivar abilities desde special_ability ===

const DEFAULT_DAILY_USES = 1
const DEFAULT_COOLDOWN_TURNS = 4

// ---------------------------------------------------------------------------
// Template → Runtime
// ---------------------------------------------------------------------------

export function toRuntime(ab: AbilityTemplate): AbilityRuntime {
  return { ...ab, usedToday: 0, cooldownRemaining: 0 }
}

// ---------------------------------------------------------------------------
// Derivar una ability default desde special_ability (fallback de lores sin data)
// ---------------------------------------------------------------------------

export function deriveDefaultAbility(archetype: Archetype, engine: GameEngine): AbilityTemplate {
  const isDnD = engine === 'DND_5E'
  const special = archetype.special_ability || ''

  // Intentar separar "Nombre: descripción" — común en los JSON actuales
  const colonIdx = special.indexOf(':')
  const nameRaw = colonIdx > 0 ? special.slice(0, colonIdx).trim() : 'Habilidad Especial'
  const descRaw = colonIdx > 0 ? special.slice(colonIdx + 1).trim() : special

  return {
    id: `${archetype.id}-signature`,
    name: { es: nameRaw, en: nameRaw },
    description: { es: descRaw, en: descRaw },
    kind: 'special',
    resource: isDnD ? 'daily_uses' : 'cooldown_turns',
    maxUses: isDnD ? DEFAULT_DAILY_USES : undefined,
    cooldownTurns: isDnD ? undefined : DEFAULT_COOLDOWN_TURNS,
    icon: 'sparkles',
    tags: [],
  }
}

// ---------------------------------------------------------------------------
// Build de abilities para un archetype (explícitas > derivadas)
// ---------------------------------------------------------------------------

export function buildAbilitiesForArchetype(
  archetype: Archetype,
  engine: GameEngine,
): AbilityTemplate[] {
  // Si el archetype define abilities explícitas Y el shape coincide con el engine, usarlas.
  // Si vienen con el resource "equivocado" (ej: abilities de DnD pero engine simple), igualmente
  // las respetamos porque el autor del lore sabe mejor. Pero si no hay abilities, derivar.
  if (Array.isArray(archetype.abilities) && archetype.abilities.length > 0) {
    return archetype.abilities.map((ab) => sanitizeTemplate(ab, engine))
  }
  return [deriveDefaultAbility(archetype, engine)]
}

// Asegura invariantes: daily_uses → maxUses definido; cooldown_turns → cooldownTurns definido.
function sanitizeTemplate(ab: AbilityTemplate, engine: GameEngine): AbilityTemplate {
  const normalized: AbilityTemplate = { ...ab }
  if (normalized.resource === 'daily_uses' && (!normalized.maxUses || normalized.maxUses < 1)) {
    normalized.maxUses = DEFAULT_DAILY_USES
  }
  if (normalized.resource === 'cooldown_turns' && (!normalized.cooldownTurns || normalized.cooldownTurns < 1)) {
    normalized.cooldownTurns = DEFAULT_COOLDOWN_TURNS
  }
  // Si viene sin resource (malformado), asignar según engine
  if (!normalized.resource) {
    normalized.resource = engine === 'DND_5E' ? 'daily_uses' : 'cooldown_turns'
    if (normalized.resource === 'daily_uses' && !normalized.maxUses) normalized.maxUses = DEFAULT_DAILY_USES
    if (normalized.resource === 'cooldown_turns' && !normalized.cooldownTurns) normalized.cooldownTurns = DEFAULT_COOLDOWN_TURNS
  }
  return normalized
}

// ---------------------------------------------------------------------------
// Estado runtime — disponibilidad
// ---------------------------------------------------------------------------

export function canUseAbility(ab: AbilityRuntime): boolean {
  if (ab.resource === 'daily_uses') {
    return ab.usedToday < (ab.maxUses ?? 0)
  }
  if (ab.resource === 'cooldown_turns') {
    return ab.cooldownRemaining <= 0
  }
  return false
}

export function getAbilityStatus(ab: AbilityRuntime): 'available' | 'exhausted' | 'cooldown' {
  if (ab.resource === 'daily_uses') {
    return ab.usedToday >= (ab.maxUses ?? 0) ? 'exhausted' : 'available'
  }
  return ab.cooldownRemaining > 0 ? 'cooldown' : 'available'
}

// ---------------------------------------------------------------------------
// Aplicar uso
// ---------------------------------------------------------------------------

export function applyAbilityUse(ab: AbilityRuntime, turn?: number): AbilityRuntime {
  if (ab.resource === 'daily_uses') {
    const nextUsed = Math.min((ab.maxUses ?? 0), ab.usedToday + 1)
    return { ...ab, usedToday: nextUsed, lastUsedAtTurn: turn }
  }
  if (ab.resource === 'cooldown_turns') {
    return { ...ab, cooldownRemaining: ab.cooldownTurns ?? DEFAULT_COOLDOWN_TURNS, lastUsedAtTurn: turn }
  }
  return ab
}

// ---------------------------------------------------------------------------
// Tick de cooldowns (cada turno del personaje acting)
// ---------------------------------------------------------------------------

export function tickCooldowns(abs: AbilityRuntime[]): AbilityRuntime[] {
  if (!Array.isArray(abs)) return []
  return abs.map((ab) => {
    if (ab.resource !== 'cooldown_turns') return ab
    if (ab.cooldownRemaining <= 0) return ab
    return { ...ab, cooldownRemaining: Math.max(0, ab.cooldownRemaining - 1) }
  })
}

// ---------------------------------------------------------------------------
// Reset por descanso largo (solo daily_uses)
// ---------------------------------------------------------------------------

export function resetDailyUses(abs: AbilityRuntime[]): AbilityRuntime[] {
  if (!Array.isArray(abs)) return []
  return abs.map((ab) => {
    if (ab.resource !== 'daily_uses') return ab
    return { ...ab, usedToday: 0 }
  })
}

// ---------------------------------------------------------------------------
// Backfill lazy: si un personaje no tiene abilities aún, materializar desde archetype.
// Devuelve la lista runtime — el caller decide si persistir.
// ---------------------------------------------------------------------------

export function ensureAbilities(
  current: AbilityRuntime[] | undefined | null,
  archetype: Archetype | undefined,
  engine: GameEngine,
): AbilityRuntime[] {
  if (Array.isArray(current) && current.length > 0) return current
  if (!archetype) return []
  const template = buildAbilitiesForArchetype(archetype, engine)
  return template.map(toRuntime)
}

// ---------------------------------------------------------------------------
// Buscar una ability por id (matching flexible por id, o por name normalizado)
// ---------------------------------------------------------------------------

export function findAbilityById(abs: AbilityRuntime[], id: string): AbilityRuntime | undefined {
  if (!id || !Array.isArray(abs)) return undefined
  const normalized = id.toLowerCase().trim()
  return abs.find((a) => a.id.toLowerCase() === normalized)
}
