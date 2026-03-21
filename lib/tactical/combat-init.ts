/**
 * Combat Initialization
 * Funciones para inicializar combate táctico desde un CombatTrigger
 */

import {
  TacticalMapState,
  TacticalToken,
  TacticalCell,
  GridCoord,
  GridType,
  TokenSize,
  TERRAIN_EFFECTS,
} from './types'
import { generateTacticalMap } from './map-generator'

// Map types available in the generator
type MapType = 'dungeon' | 'forest' | 'castle' | 'cavern' | 'arena'
import {
  CombatTrigger,
  CombatState,
  EnemyDefinition,
  InitiativeEntry,
  DEFAULT_COMBAT_STATE,
  CombatTerrain,
} from '@/lib/types/combat-state'
import { CharacterContext } from '@/lib/engines/types'

// Simple unique ID generator
function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

// ============================================================================
// TERRAIN TO MAP TYPE MAPPING
// ============================================================================

const TERRAIN_TO_MAP_TYPE: Record<CombatTerrain, MapType> = {
  dungeon: 'dungeon',
  forest: 'forest',
  castle: 'castle',
  cavern: 'cavern',
  arena: 'arena',
  street: 'dungeon',  // Use dungeon layout for streets
  tavern: 'arena',    // Use arena (open) for tavern
  ship: 'dungeon',    // Use dungeon corridors for ship
  ruins: 'dungeon',
  temple: 'castle',
}

const DIFFICULTY_TO_MAP: Record<string, 'easy' | 'medium' | 'hard'> = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
  deadly: 'hard',
}

// ============================================================================
// TOKEN CREATION
// ============================================================================

/**
 * Crear token de jugador desde CharacterContext
 */
export function createPlayerToken(
  character: CharacterContext,
  position: GridCoord,
  index: number
): TacticalToken {
  const stats = character.stats || {}

  // Calcular HP si no está definido
  const hp = character.hp ?? 20 + (stats.constitution || stats.CON || 10 - 10) * character.level
  const maxHp = character.maxHp ?? hp

  // Calcular AC basado en stats (simplificado)
  const dexMod = Math.floor((stats.dexterity || stats.DEX || 10 - 10) / 2)
  const ac = 10 + dexMod

  // Calcular movimiento basado en raza/clase (default 30 ft)
  const baseMovement = 30

  return {
    id: `player-${index}-${generateId()}`,
    name: character.name,
    type: 'player',
    size: 'medium',
    sizeInCells: 1,
    x: position.x,
    y: position.y,
    elevation: 0,
    hp,
    maxHp,
    tempHp: 0,
    ac,
    speed: baseMovement,
    movementRemaining: baseMovement,
    conditions: character.conditions?.map(c => ({
      name: c,
      icon: getConditionIcon(c),
      duration: -1,
    })) || [],
    initiative: 0, // Se calculará después
    hasMovedThisTurn: false,
    hasTakenAction: false,
    hasTakenBonusAction: false,
    hasReaction: true,
    concentrating: undefined,
    facing: 0,
    // Stats para modificadores
    dexMod,
    imageUrl: undefined,
    tokenColor: getPlayerColor(index),
    borderColor: '#c9a84c',
    // Vision
    visionRange: 60,
    darkvision: 0,
    blindsight: 0,
    truesight: 0,
  }
}

/**
 * Crear tokens de enemigos desde EnemyDefinition
 */
export function createEnemyTokens(
  enemies: EnemyDefinition[],
  startPositions: GridCoord[]
): TacticalToken[] {
  const tokens: TacticalToken[] = []
  let posIndex = 0

  enemies.forEach((enemy) => {
    const count = enemy.count || 1

    for (let i = 0; i < count; i++) {
      const position = startPositions[posIndex % startPositions.length]
      posIndex++

      // Calcular stats basados en nivel/tipo
      const level = enemy.level || 1
      const baseHp = enemy.hp || (8 + level * 6)
      const baseAc = enemy.ac || (10 + Math.floor(level / 2))

      const enemySize = getEnemySize(enemy.type)
      const sizeInCells = enemySize === 'tiny' ? 0.5 :
                          enemySize === 'small' || enemySize === 'medium' ? 1 :
                          enemySize === 'large' ? 2 :
                          enemySize === 'huge' ? 3 : 4

      tokens.push({
        id: `enemy-${tokens.length}-${generateId()}`,
        name: count > 1 ? `${enemy.name} ${i + 1}` : enemy.name,
        type: 'enemy',
        size: enemySize,
        sizeInCells,
        x: position.x,
        y: position.y,
        elevation: 0,
        hp: baseHp,
        maxHp: baseHp,
        tempHp: 0,
        ac: baseAc,
        speed: 30,
        movementRemaining: 30,
        conditions: [],
        initiative: 0,
        hasMovedThisTurn: false,
        hasTakenAction: false,
        hasTakenBonusAction: false,
        hasReaction: true,
        concentrating: undefined,
        facing: 180, // Mirando hacia los jugadores
        dexMod: Math.floor(level / 3),
        imageUrl: enemy.imageUrl,
        tokenColor: '#dc2626', // Rojo para enemigos
        borderColor: '#7f1d1d',
        visionRange: 60,
        darkvision: 60,
        blindsight: 0,
        truesight: 0,
      })
    }
  })

  return tokens
}

// ============================================================================
// INITIATIVE
// ============================================================================

/**
 * Roll de iniciativa para un token
 */
function rollInitiative(token: TacticalToken): number {
  const roll = Math.floor(Math.random() * 20) + 1
  return roll + (token.dexMod || 0)
}

/**
 * Calcular orden de iniciativa
 */
export function calculateInitiative(tokens: TacticalToken[]): InitiativeEntry[] {
  const entries: InitiativeEntry[] = tokens.map(token => ({
    tokenId: token.id,
    name: token.name,
    initiative: rollInitiative(token),
    dexModifier: token.dexMod || 0,
    isPlayer: token.type === 'player' || token.type === 'ally',
    hasActedThisRound: false,
    imageUrl: token.imageUrl,
    currentHp: token.hp,
    maxHp: token.maxHp,
  }))

  // Ordenar por iniciativa (mayor primero), desempate por dex modifier
  entries.sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative
    }
    return b.dexModifier - a.dexModifier
  })

  return entries
}

// ============================================================================
// POSITION GENERATION
// ============================================================================

/**
 * Encontrar posiciones válidas para tokens
 */
export function findValidPositions(
  cells: TacticalCell[][],
  side: 'bottom' | 'top',
  count: number
): GridCoord[] {
  const positions: GridCoord[] = []
  const height = cells.length
  const width = cells[0]?.length || 0

  // Buscar en las filas apropiadas según el lado
  const startRow = side === 'bottom' ? height - 3 : 2
  const endRow = side === 'bottom' ? height - 1 : 4

  for (let y = startRow; y <= endRow && positions.length < count; y++) {
    for (let x = 2; x < width - 2 && positions.length < count; x++) {
      const cell = cells[y]?.[x]
      if (cell && !TERRAIN_EFFECTS[cell.terrain].blocksMovement && cell.terrain === 'normal') {
        // Verificar que no esté muy cerca de otras posiciones
        const tooClose = positions.some(p =>
          Math.abs(p.x - x) < 2 && Math.abs(p.y - y) < 2
        )
        if (!tooClose) {
          positions.push({ x, y })
        }
      }
    }
  }

  // Si no encontramos suficientes, buscar en cualquier lugar
  if (positions.length < count) {
    for (let y = 0; y < height && positions.length < count; y++) {
      for (let x = 0; x < width && positions.length < count; x++) {
        const cell = cells[y]?.[x]
        if (cell && !TERRAIN_EFFECTS[cell.terrain].blocksMovement && cell.terrain === 'normal') {
          const alreadyUsed = positions.some(p => p.x === x && p.y === y)
          if (!alreadyUsed) {
            positions.push({ x, y })
          }
        }
      }
    }
  }

  return positions
}

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

export interface InitCombatOptions {
  trigger: CombatTrigger
  playerCharacters: CharacterContext[]
  gridType?: GridType
  cellSizeInFeet?: number
}

/**
 * Inicializar combate completo desde un trigger
 */
export function initializeCombat(options: InitCombatOptions): CombatState {
  const {
    trigger,
    playerCharacters,
    gridType = 'square',
    cellSizeInFeet = 5,
  } = options

  // 1. Generar mapa base
  const mapType = TERRAIN_TO_MAP_TYPE[trigger.terrain || 'dungeon']
  const difficulty = DIFFICULTY_TO_MAP[trigger.difficulty || 'medium']

  // Calcular tamaño basado en número de combatientes
  const totalCombatants = playerCharacters.length +
    trigger.enemies.reduce((sum, e) => sum + (e.count || 1), 0)
  const mapSize = Math.max(12, Math.min(20, totalCombatants * 3))

  const baseMap = generateTacticalMap({
    type: mapType,
    difficulty,
    width: mapSize,
    height: mapSize,
    gridType,
    cellSizeInFeet,
    includeTokens: false,
    includeEffects: true,
  })

  // 2. Encontrar posiciones para jugadores (parte inferior del mapa)
  const playerPositions = findValidPositions(
    baseMap.cells,
    'bottom',
    playerCharacters.length
  )

  // 3. Crear tokens de jugadores
  const playerTokens = playerCharacters.map((char, i) =>
    createPlayerToken(char, playerPositions[i] || { x: 2 + i * 2, y: mapSize - 2 }, i)
  )

  // 4. Encontrar posiciones para enemigos (parte superior del mapa)
  const enemyCount = trigger.enemies.reduce((sum, e) => sum + (e.count || 1), 0)
  const enemyPositions = findValidPositions(
    baseMap.cells,
    'top',
    enemyCount
  )

  // 5. Crear tokens de enemigos
  const enemyTokens = createEnemyTokens(trigger.enemies, enemyPositions)

  // 6. Combinar todos los tokens
  const allTokens = [...playerTokens, ...enemyTokens]

  // 7. Calcular iniciativa
  const initiativeEntries = calculateInitiative(allTokens)

  // Actualizar tokens con su iniciativa
  allTokens.forEach(token => {
    const entry = initiativeEntries.find(e => e.tokenId === token.id)
    if (entry) {
      token.initiative = entry.initiative
    }
  })

  // 8. Ajustar iniciativa si hay emboscada
  if (trigger.ambush || trigger.ambushedBy) {
    const surprisedSide = trigger.ambushedBy === 'enemies' ? 'player' : 'enemy'
    // Los sorprendidos pierden su primer turno
    allTokens.forEach(token => {
      if ((surprisedSide === 'player' && token.type === 'player') ||
          (surprisedSide === 'enemy' && token.type === 'enemy')) {
        token.hasTakenAction = true
        token.movementRemaining = 0
      }
    })
  }

  // 9. Construir el mapa táctico final
  const tacticalMap: TacticalMapState = {
    ...baseMap,
    tokens: allTokens,
    currentTurnIndex: 0,
    currentRound: 1,
    inCombat: true,
  }

  // 10. Crear el estado de combate
  return {
    inCombat: true,
    tacticalMap,
    combatLog: [],
    roundNumber: 1,
    currentTurnTokenId: initiativeEntries[0]?.tokenId || null,
    initiativeOrder: initiativeEntries.map(e => e.tokenId),
    result: 'ongoing',
    startedAt: new Date(),
  }
}

/**
 * Avanzar al siguiente turno
 */
export function advanceToNextTurn(state: CombatState): CombatState {
  if (!state.tacticalMap) return state

  const { initiativeOrder, currentTurnTokenId } = state
  const currentIndex = initiativeOrder.indexOf(currentTurnTokenId || '')

  // Encontrar el siguiente token vivo
  let nextIndex = (currentIndex + 1) % initiativeOrder.length
  let roundIncrement = 0

  // Variable para tokens actualizados (si hay nueva ronda)
  let updatedTokens = state.tacticalMap.tokens

  if (nextIndex <= currentIndex) {
    // Completamos una ronda
    roundIncrement = 1

    // Resetear acciones de todos los tokens (inmutable)
    updatedTokens = state.tacticalMap.tokens.map(token => ({
      ...token,
      hasTakenAction: false,
      hasTakenBonusAction: false,
      hasReaction: true,
      movementRemaining: token.speed,
    }))
  }

  // Buscar el siguiente token vivo
  let attempts = 0
  while (attempts < initiativeOrder.length) {
    const tokenId = initiativeOrder[nextIndex]
    const token = updatedTokens.find(t => t.id === tokenId)

    if (token && token.hp > 0) {
      break
    }

    nextIndex = (nextIndex + 1) % initiativeOrder.length
    if (nextIndex === 0) roundIncrement++
    attempts++
  }

  return {
    ...state,
    currentTurnTokenId: initiativeOrder[nextIndex],
    roundNumber: state.roundNumber + roundIncrement,
    tacticalMap: {
      ...state.tacticalMap,
      tokens: updatedTokens,
      currentTurnIndex: nextIndex,
      currentRound: state.roundNumber + roundIncrement,
    }
  }
}

/**
 * Verificar si el combate terminó
 */
export function checkCombatEnd(state: CombatState): CombatState {
  if (!state.tacticalMap) return state

  const tokens = state.tacticalMap.tokens
  const playersAlive = tokens.filter(t =>
    (t.type === 'player' || t.type === 'ally') && t.hp > 0
  ).length
  const enemiesAlive = tokens.filter(t =>
    t.type === 'enemy' && t.hp > 0
  ).length

  if (playersAlive === 0) {
    return { ...state, result: 'defeat', inCombat: false }
  }

  if (enemiesAlive === 0) {
    return { ...state, result: 'victory', inCombat: false }
  }

  return state
}

/**
 * Terminar combate manualmente (huir, tregua)
 */
export function endCombat(
  state: CombatState,
  result: 'fled' | 'truce' | 'victory' | 'defeat'
): CombatState {
  return {
    ...state,
    result,
    inCombat: false,
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getConditionIcon(condition: string): string {
  const icons: Record<string, string> = {
    blinded: '👁️',
    charmed: '💕',
    deafened: '🔇',
    frightened: '😨',
    grappled: '🤝',
    incapacitated: '💫',
    invisible: '👻',
    paralyzed: '⚡',
    petrified: '🗿',
    poisoned: '🤢',
    prone: '⬇️',
    restrained: '⛓️',
    stunned: '💥',
    unconscious: '😴',
  }
  return icons[condition.toLowerCase()] || '⚠️'
}

function getEnemySize(type: string): TokenSize {
  const largeTypes = ['ogro', 'ogre', 'troll', 'gigante', 'giant', 'dragón', 'dragon']
  const hugeTypes = ['dragón antiguo', 'ancient dragon', 'titán', 'titan']
  const tinyTypes = ['rata', 'rat', 'araña', 'spider', 'murciélago', 'bat']
  const smallTypes = ['goblin', 'kobold', 'gnomo', 'gnome']

  const typeLower = type.toLowerCase()

  if (hugeTypes.some(t => typeLower.includes(t))) return 'huge'
  if (largeTypes.some(t => typeLower.includes(t))) return 'large'
  if (tinyTypes.some(t => typeLower.includes(t))) return 'tiny'
  if (smallTypes.some(t => typeLower.includes(t))) return 'small'

  return 'medium'
}

function getPlayerColor(index: number): string {
  const colors = [
    '#2563eb', // Azul
    '#16a34a', // Verde
    '#d97706', // Naranja
    '#7c3aed', // Púrpura
    '#db2777', // Rosa
    '#0891b2', // Cyan
  ]
  return colors[index % colors.length]
}

export default {
  initializeCombat,
  advanceToNextTurn,
  checkCombatEnd,
  endCombat,
}
