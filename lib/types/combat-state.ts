/**
 * Combat State Types
 * Tipos para el estado de combate y su integración con GameSession
 */

import { TacticalMapState, TacticalToken, GridCoord } from '@/lib/tactical/types'

// ============================================================================
// COMBAT TRIGGER (viene del DM/Claude)
// ============================================================================

export interface EnemyDefinition {
  name: string
  type: string                    // "Orco", "Goblin", "Dragón"
  hp?: number
  maxHp?: number
  ac?: number
  count?: number                  // Para múltiples del mismo tipo
  level?: number
  abilities?: string[]
  imageUrl?: string
}

export type CombatTerrain =
  | 'dungeon'
  | 'forest'
  | 'castle'
  | 'cavern'
  | 'arena'
  | 'street'
  | 'tavern'
  | 'ship'
  | 'ruins'
  | 'temple'

export interface CombatTrigger {
  enemies: EnemyDefinition[]
  terrain?: CombatTerrain
  ambush?: boolean                // Los enemigos sorprenden a los jugadores
  ambushedBy?: 'enemies' | 'players'  // Quién emboscó a quién
  difficulty?: 'easy' | 'medium' | 'hard' | 'deadly'
  environmentalHazards?: string[] // "lava", "traps", "poison_gas"
  lightLevel?: 'bright' | 'dim' | 'darkness'
  description?: string            // Descripción del DM de la escena
}

// ============================================================================
// COMBAT LOG
// ============================================================================

export type CombatActionType =
  | 'attack'
  | 'spell'
  | 'ability'
  | 'move'
  | 'dash'
  | 'dodge'
  | 'disengage'
  | 'help'
  | 'hide'
  | 'ready'
  | 'use_item'
  | 'interact'
  | 'other'

export interface CombatLogEntry {
  id: string
  timestamp: Date
  round: number
  tokenId: string
  tokenName: string
  actionType: CombatActionType
  targetId?: string
  targetName?: string
  description: string
  diceRoll?: {
    formula: string
    result: number
    isCritical?: boolean
    isFumble?: boolean
  }
  damage?: {
    amount: number
    type: string                  // "slashing", "fire", "psychic"
    wasResisted?: boolean
    wasVulnerable?: boolean
  }
  healing?: number
  effectApplied?: string          // "Stunned", "Poisoned"
  effectRemoved?: string
  success?: boolean
  narration?: string              // Narración del DM
}

// ============================================================================
// COMBAT STATE
// ============================================================================

export type CombatResult = 'ongoing' | 'victory' | 'defeat' | 'fled' | 'truce'

export interface CombatState {
  // Estado principal
  inCombat: boolean
  tacticalMap: TacticalMapState | null
  combatLog: CombatLogEntry[]

  // Tracking de turnos
  roundNumber: number
  currentTurnTokenId: string | null
  initiativeOrder: string[]       // IDs de tokens en orden

  // Resultado
  result: CombatResult

  // UI State
  selectedAction?: CombatActionType
  targetingMode?: 'single' | 'area' | 'cone' | 'line'
  pendingAction?: PendingCombatAction

  // Metadata
  startedAt?: Date
  combatTriggerId?: string        // Para tracking

  // Temporal effects
  activeEnvironmentalEffects?: EnvironmentalEffect[]
}

export interface PendingCombatAction {
  tokenId: string
  action: CombatActionType
  targetCells?: GridCoord[]
  targetTokenIds?: string[]
  spellOrAbility?: string
  needsConfirmation: boolean
}

export interface EnvironmentalEffect {
  id: string
  name: string
  description: string
  affectedCells: GridCoord[]
  damagePerTurn?: {
    amount: string                // "2d6"
    type: string
  }
  savingThrow?: {
    ability: string               // "DEX", "CON"
    dc: number
  }
  duration: number                // Turnos restantes
}

// ============================================================================
// COMBAT ACTIONS (para comunicación con DM/Claude)
// ============================================================================

export interface CombatActionRequest {
  sessionId: string
  tokenId: string
  action: CombatActionType
  targetTokenId?: string
  targetCell?: GridCoord
  spellOrAbility?: string
  customDescription?: string
}

export interface CombatActionResponse {
  success: boolean
  narration: string
  combatLog: CombatLogEntry
  worldStateUpdates?: Record<string, unknown>
  mapUpdates?: {
    tokenUpdates?: Partial<TacticalToken>[]
    effectsAdded?: string[]
    effectsRemoved?: string[]
    cellsChanged?: GridCoord[]
  }
  combatEnded?: boolean
  combatResult?: CombatResult
  nextTurnTokenId?: string
}

// ============================================================================
// INITIATIVE
// ============================================================================

export interface InitiativeEntry {
  tokenId: string
  name: string
  initiative: number
  dexModifier: number
  isPlayer: boolean
  hasActedThisRound: boolean
  imageUrl?: string
  currentHp?: number
  maxHp?: number
}

export interface InitiativeState {
  entries: InitiativeEntry[]
  currentIndex: number
  roundNumber: number
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

export const DEFAULT_COMBAT_STATE: CombatState = {
  inCombat: false,
  tacticalMap: null,
  combatLog: [],
  roundNumber: 0,
  currentTurnTokenId: null,
  initiativeOrder: [],
  result: 'ongoing',
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface CombatSummary {
  roundsElapsed: number
  playerDamageDealt: number
  playerDamageTaken: number
  enemiesDefeated: number
  playersDown: number
  criticalHits: number
  criticalMisses: number
  spellsCast: number
}

export function createCombatSummary(log: CombatLogEntry[]): CombatSummary {
  return log.reduce((summary, entry) => {
    if (entry.diceRoll?.isCritical) summary.criticalHits++
    if (entry.diceRoll?.isFumble) summary.criticalMisses++
    if (entry.actionType === 'spell') summary.spellsCast++
    if (entry.damage) {
      // Simplificado - en producción necesitaría más contexto
      summary.playerDamageDealt += entry.damage.amount
    }
    return summary
  }, {
    roundsElapsed: 0,
    playerDamageDealt: 0,
    playerDamageTaken: 0,
    enemiesDefeated: 0,
    playersDown: 0,
    criticalHits: 0,
    criticalMisses: 0,
    spellsCast: 0,
  } as CombatSummary)
}
