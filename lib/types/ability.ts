// Tipos para el sistema de habilidades del personaje (hechizos, trucos, golpes especiales).
// Dos modos de desgaste según el motor:
// - DND_5E → daily_uses (recuperables con descanso largo)
// - Otros engines → cooldown_turns (bloqueo por N turnos del personaje)

import type { LocalizedString } from './lore'

export type AbilityKind = 'spell' | 'trick' | 'special'
export type AbilityResourceType = 'daily_uses' | 'cooldown_turns'
export type AbilityIcon = 'flame' | 'leaf' | 'eye' | 'sword' | 'moon' | 'sparkles' | 'shield' | 'heart' | 'zap'

// Template inmutable — se guarda en data/lores/*.json dentro de cada archetype,
// y se copia a Character.abilities al crear el personaje.
export interface AbilityTemplate {
  id: string                               // único dentro del archetype (ej: 'fireball')
  name: LocalizedString                    // { es, en } o string legacy
  description: LocalizedString             // explicación breve de efecto
  kind: AbilityKind                        // informa el icon/etiqueta visual
  resource: AbilityResourceType            // discriminador del modo de desgaste
  maxUses?: number                         // requerido si resource === 'daily_uses'
  cooldownTurns?: number                   // requerido si resource === 'cooldown_turns'
  icon?: AbilityIcon                       // hint visual opcional (default según kind)
  tags?: string[]                          // 'combat' | 'utility' | 'social' | 'healing' | ...
}

// Runtime — vive en worldState.party[characterName].abilities y muta con el juego.
export interface AbilityRuntime extends AbilityTemplate {
  usedToday: number                        // daily_uses: 0..maxUses
  cooldownRemaining: number                // cooldown_turns: 0 = disponible
  lastUsedAtTurn?: number                  // idempotencia + animación "recién usada"
}
