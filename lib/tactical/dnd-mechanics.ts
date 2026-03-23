/**
 * Mecánicas D&D 5e para combate táctico
 * Incluye: ataques de oportunidad, terreno difícil, cobertura, flanqueo
 */

import { TacticalToken, TacticalCell, TerrainType, GridCoord } from './types'

// ============================================================================
// MOVIMIENTO Y TERRENO
// ============================================================================

/**
 * Calcula el costo de movimiento entre dos celdas
 * @returns Costo en pies (5ft normal, 10ft difícil, Infinity imposible)
 */
export function getMovementCost(
  from: GridCoord,
  to: GridCoord,
  cells: TacticalCell[][],
  token: TacticalToken
): number {
  // Verificar que el destino existe
  if (!cells[to.y] || !cells[to.y][to.x]) {
    return Infinity
  }

  const targetCell = cells[to.y][to.x]
  const baseCost = 5 // 5ft por celda

  // Terreno intransitable
  if (isTerrainImpassable(targetCell.terrain)) {
    return Infinity
  }

  // Terreno difícil = doble costo
  if (isTerrainDifficult(targetCell.terrain)) {
    return baseCost * 2 // 10ft
  }

  // Diagonal = 1.5x (usando la regla alternativa de D&D)
  const isDiagonal = from.x !== to.x && from.y !== to.y
  if (isDiagonal) {
    return Math.round(baseCost * 1.5) // 7.5ft -> 8ft
  }

  return baseCost
}

/**
 * Determina si un terreno es intransitable
 */
export function isTerrainImpassable(terrain: TerrainType): boolean {
  return [
    'wall',
    'pit',
    'water_deep',
    'fire',
    'lava',
  ].includes(terrain)
}

/**
 * Determina si un terreno es difícil
 */
export function isTerrainDifficult(terrain: TerrainType): boolean {
  return [
    'difficult',
    'rubble',
    'mud',
    'ice',
    'water_shallow',
    'dense_forest',
    'forest',
  ].includes(terrain)
}

// ============================================================================
// ATAQUES DE OPORTUNIDAD
// ============================================================================

/**
 * Verifica si un movimiento provocará ataques de oportunidad
 * @returns Lista de tokens que pueden hacer AoO
 */
export function checkOpportunityAttacks(
  movingToken: TacticalToken,
  from: GridCoord,
  to: GridCoord,
  allTokens: TacticalToken[]
): TacticalToken[] {
  const attackers: TacticalToken[] = []

  // Obtener enemigos del token que se mueve
  const isMovingPlayerOrAlly = movingToken.type === 'player' || movingToken.type === 'ally'
  const enemies = allTokens.filter(t =>
    t.hp > 0 &&
    t.hasReaction &&
    (isMovingPlayerOrAlly ? t.type === 'enemy' : (t.type === 'player' || t.type === 'ally'))
  )

  for (const enemy of enemies) {
    // Calcular si el token está saliendo del alcance del enemigo
    const distanceFromBefore = getDistanceInFeet(from, { x: enemy.x, y: enemy.y })
    const distanceFromAfter = getDistanceInFeet(to, { x: enemy.x, y: enemy.y })

    // En D&D, AoO ocurre cuando sales del alcance (5ft para la mayoría)
    const enemyReach = getTokenReach(enemy)

    if (distanceFromBefore <= enemyReach && distanceFromAfter > enemyReach) {
      attackers.push(enemy)
    }
  }

  return attackers
}

/**
 * Obtiene el alcance de un token (para determinar amenaza)
 */
export function getTokenReach(token: TacticalToken): number {
  // Por defecto 5ft, pero criaturas grandes o con reach tienen más
  const baseReach = token.size === 'large' ? 10 : 5

  // Si tiene una condición de reach (por arma), añadir 5ft
  // TODO: Implementar detección de armas con reach
  return baseReach
}

/**
 * Calcula la distancia en pies entre dos puntos
 */
export function getDistanceInFeet(a: GridCoord, b: GridCoord): number {
  // Usando la regla estándar de D&D: diagonal = 5ft (simplificado)
  // Alternativa: cada segunda diagonal = 10ft
  const dx = Math.abs(a.x - b.x)
  const dy = Math.abs(a.y - b.y)

  // Regla simplificada: máximo de dx, dy
  return Math.max(dx, dy) * 5
}

// ============================================================================
// FLANQUEO
// ============================================================================

/**
 * Verifica si un atacante tiene flanqueo sobre un objetivo
 * Flanqueo = atacante y aliado en lados opuestos del objetivo
 * @returns true si tiene ventaja por flanqueo
 */
export function checkFlanking(
  attacker: TacticalToken,
  target: TacticalToken,
  allTokens: TacticalToken[]
): boolean {
  // Obtener aliados del atacante
  const isAttackerPlayer = attacker.type === 'player' || attacker.type === 'ally'
  const allies = allTokens.filter(t =>
    t.id !== attacker.id &&
    t.hp > 0 &&
    (isAttackerPlayer
      ? (t.type === 'player' || t.type === 'ally')
      : t.type === 'enemy')
  )

  // Verificar si algún aliado está en el lado opuesto
  for (const ally of allies) {
    // Calcular vectores desde el target hacia attacker y ally
    const toAttacker = {
      x: attacker.x - target.x,
      y: attacker.y - target.y,
    }
    const toAlly = {
      x: ally.x - target.x,
      y: ally.y - target.y,
    }

    // Verificar que ambos están adyacentes al target
    const attackerDist = getDistanceInFeet({ x: attacker.x, y: attacker.y }, { x: target.x, y: target.y })
    const allyDist = getDistanceInFeet({ x: ally.x, y: ally.y }, { x: target.x, y: target.y })

    if (attackerDist > 5 || allyDist > 5) continue

    // Verificar si están en lados opuestos (producto punto negativo)
    const dotProduct = toAttacker.x * toAlly.x + toAttacker.y * toAlly.y

    // Si el producto punto es negativo, están en lados opuestos
    if (dotProduct < 0) {
      return true
    }
  }

  return false
}

// ============================================================================
// COBERTURA
// ============================================================================

export type CoverType = 'none' | 'half' | 'three-quarters' | 'total'

/**
 * Calcula la cobertura entre atacante y objetivo
 * @returns Tipo de cobertura
 */
export function calculateCover(
  attacker: GridCoord,
  target: GridCoord,
  cells: TacticalCell[][],
  allTokens: TacticalToken[]
): CoverType {
  // Calcular línea de visión
  const line = getLineOfSight(attacker, target)

  let coverCount = 0
  let totalBlocked = false

  for (const point of line) {
    // Saltar origen y destino
    if ((point.x === attacker.x && point.y === attacker.y) ||
        (point.x === target.x && point.y === target.y)) {
      continue
    }

    // Verificar si hay obstáculo en la celda
    if (cells[point.y] && cells[point.y][point.x]) {
      const terrain = cells[point.y][point.x].terrain

      // Paredes bloquean totalmente
      if (terrain === 'wall') {
        totalBlocked = true
        break
      }

      // Medias paredes dan media cobertura
      if (terrain === 'half_wall' || terrain === 'window') {
        coverCount++
      }

      // Bosque denso da 3/4 cobertura
      if (terrain === 'dense_forest') {
        coverCount += 2
      }
    }

    // Verificar si hay criaturas en medio (dan media cobertura)
    const creatureInWay = allTokens.find(t =>
      t.x === point.x && t.y === point.y && t.hp > 0
    )
    if (creatureInWay) {
      coverCount++
    }
  }

  if (totalBlocked) return 'total'
  if (coverCount >= 2) return 'three-quarters'
  if (coverCount >= 1) return 'half'
  return 'none'
}

/**
 * Obtiene los puntos en la línea entre dos coordenadas (Bresenham)
 */
function getLineOfSight(from: GridCoord, to: GridCoord): GridCoord[] {
  const points: GridCoord[] = []

  let x0 = from.x
  let y0 = from.y
  const x1 = to.x
  const y1 = to.y

  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  while (true) {
    points.push({ x: x0, y: y0 })

    if (x0 === x1 && y0 === y1) break

    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }

  return points
}

/**
 * Obtiene el bonus de AC por cobertura
 */
export function getCoverACBonus(cover: CoverType): number {
  switch (cover) {
    case 'half': return 2
    case 'three-quarters': return 5
    case 'total': return Infinity // No se puede atacar
    default: return 0
  }
}

// ============================================================================
// CONDICIONES DE COMBATE
// ============================================================================

export interface CombatCondition {
  id: string
  name: string
  nameEs: string
  icon: string
  effects: {
    attackAdvantage?: boolean
    attackDisadvantage?: boolean
    defenseAdvantage?: boolean   // Atacantes tienen desventaja
    defenseDisadvantage?: boolean // Atacantes tienen ventaja
    speedMultiplier?: number     // 0 = no puede moverse
    savingThrowDisadvantage?: string[] // Qué salvaciones tienen desventaja
    autoCrit?: boolean           // Ataques cuerpo a cuerpo son críticos
    cantAct?: boolean
    canMove?: boolean
  }
  duration?: number // Turnos, -1 = hasta que se quite
}

export const COMBAT_CONDITIONS: Record<string, CombatCondition> = {
  blinded: {
    id: 'blinded',
    name: 'Blinded',
    nameEs: 'Cegado',
    icon: '👁️',
    effects: {
      attackDisadvantage: true,
      defenseDisadvantage: true, // Atacantes tienen ventaja
    },
  },
  charmed: {
    id: 'charmed',
    name: 'Charmed',
    nameEs: 'Encantado',
    icon: '💕',
    effects: {
      // No puede atacar al encantador
    },
  },
  frightened: {
    id: 'frightened',
    name: 'Frightened',
    nameEs: 'Asustado',
    icon: '😨',
    effects: {
      attackDisadvantage: true,
      // No puede acercarse voluntariamente a la fuente del miedo
    },
  },
  grappled: {
    id: 'grappled',
    name: 'Grappled',
    nameEs: 'Agarrado',
    icon: '🤝',
    effects: {
      speedMultiplier: 0,
    },
  },
  incapacitated: {
    id: 'incapacitated',
    name: 'Incapacitated',
    nameEs: 'Incapacitado',
    icon: '💫',
    effects: {
      cantAct: true,
    },
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    nameEs: 'Invisible',
    icon: '👻',
    effects: {
      attackAdvantage: true,
      defenseAdvantage: true,
    },
  },
  paralyzed: {
    id: 'paralyzed',
    name: 'Paralyzed',
    nameEs: 'Paralizado',
    icon: '⚡',
    effects: {
      cantAct: true,
      canMove: false,
      defenseDisadvantage: true,
      autoCrit: true,
      savingThrowDisadvantage: ['STR', 'DEX'],
    },
  },
  petrified: {
    id: 'petrified',
    name: 'Petrified',
    nameEs: 'Petrificado',
    icon: '🗿',
    effects: {
      cantAct: true,
      canMove: false,
      // Resistencia a todo daño, inmune a veneno/enfermedad
    },
  },
  poisoned: {
    id: 'poisoned',
    name: 'Poisoned',
    nameEs: 'Envenenado',
    icon: '🤢',
    effects: {
      attackDisadvantage: true,
      // Desventaja en chequeos de habilidad
    },
  },
  prone: {
    id: 'prone',
    name: 'Prone',
    nameEs: 'Derribado',
    icon: '⬇️',
    effects: {
      attackDisadvantage: true,
      defenseAdvantage: true, // A distancia tienen desventaja
      defenseDisadvantage: true, // Cuerpo a cuerpo tienen ventaja
      // Levantarse cuesta la mitad del movimiento
    },
  },
  restrained: {
    id: 'restrained',
    name: 'Restrained',
    nameEs: 'Apresado',
    icon: '⛓️',
    effects: {
      speedMultiplier: 0,
      attackDisadvantage: true,
      defenseDisadvantage: true,
      savingThrowDisadvantage: ['DEX'],
    },
  },
  stunned: {
    id: 'stunned',
    name: 'Stunned',
    nameEs: 'Aturdido',
    icon: '💥',
    effects: {
      cantAct: true,
      canMove: false,
      defenseDisadvantage: true,
      savingThrowDisadvantage: ['STR', 'DEX'],
    },
  },
  unconscious: {
    id: 'unconscious',
    name: 'Unconscious',
    nameEs: 'Inconsciente',
    icon: '😴',
    effects: {
      cantAct: true,
      canMove: false,
      defenseDisadvantage: true,
      autoCrit: true,
      // Deja caer todo lo que sostiene, cae derribado
    },
  },
}

/**
 * Verifica si un token tiene una condición específica
 */
export function hasCondition(token: TacticalToken, conditionId: string): boolean {
  return token.conditions.some(c => c.name.toLowerCase() === conditionId)
}

/**
 * Calcula ventaja/desventaja en un ataque
 */
export function calculateAttackAdvantage(
  attacker: TacticalToken,
  target: TacticalToken,
  isRanged: boolean
): 'advantage' | 'disadvantage' | 'normal' {
  let advantageCount = 0
  let disadvantageCount = 0

  // Revisar condiciones del atacante
  for (const condition of attacker.conditions) {
    const condData = COMBAT_CONDITIONS[condition.name.toLowerCase()]
    if (condData?.effects.attackAdvantage) advantageCount++
    if (condData?.effects.attackDisadvantage) disadvantageCount++
  }

  // Revisar condiciones del defensor
  for (const condition of target.conditions) {
    const condData = COMBAT_CONDITIONS[condition.name.toLowerCase()]
    if (condData?.effects.defenseAdvantage) {
      // Solo aplica si no es ranged vs prone
      if (!(condition.name.toLowerCase() === 'prone' && isRanged)) {
        disadvantageCount++
      }
    }
    if (condData?.effects.defenseDisadvantage) {
      // Prone a distancia da desventaja al atacante
      if (condition.name.toLowerCase() === 'prone' && isRanged) {
        disadvantageCount++
      } else {
        advantageCount++
      }
    }
  }

  // Ventaja y desventaja se cancelan
  if (advantageCount > 0 && disadvantageCount > 0) {
    return 'normal'
  }
  if (advantageCount > 0) return 'advantage'
  if (disadvantageCount > 0) return 'disadvantage'
  return 'normal'
}
