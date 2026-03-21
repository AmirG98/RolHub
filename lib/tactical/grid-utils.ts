/**
 * Utilidades de Grilla Táctica
 * Soporte para grillas cuadradas y hexagonales
 * Incluye pathfinding, línea de visión y cálculos de distancia
 */

import {
  GridCoord,
  HexCoord,
  GridType,
  TacticalCell,
  TacticalToken,
  MovementResult,
  LineOfSightResult,
  TERRAIN_EFFECTS,
  TerrainType,
} from './types'

// ============================================
// GRILLA CUADRADA
// ============================================

/**
 * Calcula la distancia entre dos puntos en grilla cuadrada
 * Usa la regla D&D 5e: diagonales cuentan como 5 pies
 */
export function squareDistance(from: GridCoord, to: GridCoord, cellSize: number = 5): number {
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  // D&D 5e simplified: todas las diagonales = 1 celda
  return Math.max(dx, dy) * cellSize
}

/**
 * Calcula distancia usando regla de diagonales alternantes (Pathfinder)
 * Primera diagonal = 5 pies, segunda = 10 pies, alternando
 */
export function squareDistanceAlternating(from: GridCoord, to: GridCoord, cellSize: number = 5): number {
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  const diagonals = Math.min(dx, dy)
  const straights = Math.abs(dx - dy)

  // Cada dos diagonales = 3 celdas de costo
  const diagonalCost = Math.floor(diagonals / 2) * 3 + (diagonals % 2)

  return (diagonalCost + straights) * cellSize
}

/**
 * Obtiene todas las celdas adyacentes (8 direcciones para cuadrada)
 */
export function getSquareNeighbors(coord: GridCoord, includeDiagonals: boolean = true): GridCoord[] {
  const neighbors: GridCoord[] = [
    { x: coord.x - 1, y: coord.y },     // Izquierda
    { x: coord.x + 1, y: coord.y },     // Derecha
    { x: coord.x, y: coord.y - 1 },     // Arriba
    { x: coord.x, y: coord.y + 1 },     // Abajo
  ]

  if (includeDiagonals) {
    neighbors.push(
      { x: coord.x - 1, y: coord.y - 1 }, // Arriba-Izquierda
      { x: coord.x + 1, y: coord.y - 1 }, // Arriba-Derecha
      { x: coord.x - 1, y: coord.y + 1 }, // Abajo-Izquierda
      { x: coord.x + 1, y: coord.y + 1 }, // Abajo-Derecha
    )
  }

  return neighbors
}

/**
 * Obtiene todas las celdas dentro de un rango (cuadrada)
 */
export function getCellsInSquareRange(center: GridCoord, range: number): GridCoord[] {
  const cells: GridCoord[] = []

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= range) {
        cells.push({ x: center.x + dx, y: center.y + dy })
      }
    }
  }

  return cells
}

// ============================================
// GRILLA HEXAGONAL
// ============================================

/**
 * Convierte coordenadas axiales (q, r) a cube (q, r, s)
 */
export function axialToCube(q: number, r: number): HexCoord {
  return { q, r, s: -q - r }
}

/**
 * Redondea coordenadas hexagonales fraccionarias
 */
export function roundHex(hex: { q: number; r: number; s: number }): HexCoord {
  let q = Math.round(hex.q)
  let r = Math.round(hex.r)
  let s = Math.round(hex.s)

  const qDiff = Math.abs(q - hex.q)
  const rDiff = Math.abs(r - hex.r)
  const sDiff = Math.abs(s - hex.s)

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s
  } else if (rDiff > sDiff) {
    r = -q - s
  }
  // Si sDiff es mayor, s ya está correcto

  return { q, r, s: -q - r }
}

/**
 * Calcula la distancia entre dos hexágonos
 */
export function hexDistance(from: HexCoord, to: HexCoord): number {
  return (Math.abs(from.q - to.q) + Math.abs(from.r - to.r) + Math.abs(from.s - to.s)) / 2
}

/**
 * Obtiene los 6 vecinos de un hexágono
 */
export function getHexNeighbors(hex: HexCoord): HexCoord[] {
  const directions = [
    { q: 1, r: 0, s: -1 },
    { q: 1, r: -1, s: 0 },
    { q: 0, r: -1, s: 1 },
    { q: -1, r: 0, s: 1 },
    { q: -1, r: 1, s: 0 },
    { q: 0, r: 1, s: -1 },
  ]

  return directions.map(dir => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r,
    s: hex.s + dir.s,
  }))
}

/**
 * Obtiene todos los hexágonos dentro de un rango
 */
export function getHexesInRange(center: HexCoord, range: number): HexCoord[] {
  const hexes: HexCoord[] = []

  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      const s = -q - r
      hexes.push({
        q: center.q + q,
        r: center.r + r,
        s: center.s + s,
      })
    }
  }

  return hexes
}

/**
 * Convierte coordenadas de hexágono a posición 3D (flat-top orientation)
 */
export function hexToWorld(hex: HexCoord, cellSize: number = 1): { x: number; z: number } {
  const x = cellSize * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r)
  const z = cellSize * (3 / 2 * hex.r)
  return { x, z }
}

/**
 * Convierte posición 3D a coordenadas de hexágono
 */
export function worldToHex(x: number, z: number, cellSize: number = 1): HexCoord {
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * z) / cellSize
  const r = (2 / 3 * z) / cellSize
  return roundHex({ q, r, s: -q - r })
}

// ============================================
// LÍNEA DE VISIÓN (Bresenham's Algorithm)
// ============================================

/**
 * Verifica línea de visión entre dos puntos
 * Usa algoritmo de Bresenham para trazar la línea
 */
export function checkLineOfSight(
  from: GridCoord,
  to: GridCoord,
  cells: TacticalCell[][],
  gridWidth: number,
  gridHeight: number
): LineOfSightResult {
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  const sx = from.x < to.x ? 1 : -1
  const sy = from.y < to.y ? 1 : -1
  let err = dx - dy

  let x = from.x
  let y = from.y
  let cover: LineOfSightResult['cover'] = 'none'

  while (true) {
    // Verificar límites
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
      return {
        hasLineOfSight: false,
        distance: squareDistance(from, to),
        cover: 'full',
        blockedBy: { x, y },
      }
    }

    const cell = cells[y]?.[x]
    if (cell) {
      const terrain = TERRAIN_EFFECTS[cell.terrain]

      // Si bloquea visión completamente
      if (terrain.blocksVision && !(x === from.x && y === from.y)) {
        return {
          hasLineOfSight: false,
          distance: squareDistance(from, to),
          cover: 'full',
          blockedBy: { x, y },
        }
      }

      // Acumular cobertura (usa la mejor cobertura encontrada)
      if (terrain.provideCover !== 'none' && !(x === from.x && y === from.y)) {
        if (terrain.provideCover === 'full') cover = 'full'
        else if (terrain.provideCover === 'three_quarters' && cover !== 'full') cover = 'three_quarters'
        else if (terrain.provideCover === 'half' && cover === 'none') cover = 'half'
      }
    }

    // Llegamos al destino
    if (x === to.x && y === to.y) {
      return {
        hasLineOfSight: true,
        distance: squareDistance(from, to),
        cover,
      }
    }

    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }
}

/**
 * Dibuja una línea entre dos puntos (para visualización)
 */
export function getLineCells(from: GridCoord, to: GridCoord): GridCoord[] {
  const cells: GridCoord[] = []
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  const sx = from.x < to.x ? 1 : -1
  const sy = from.y < to.y ? 1 : -1
  let err = dx - dy

  let x = from.x
  let y = from.y

  while (true) {
    cells.push({ x, y })

    if (x === to.x && y === to.y) break

    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }

  return cells
}

// ============================================
// PATHFINDING (A* Algorithm)
// ============================================

interface PathNode {
  x: number
  y: number
  g: number  // Costo desde el inicio
  h: number  // Heurística al destino
  f: number  // g + h
  parent: PathNode | null
}

/**
 * Encuentra el camino más corto usando A*
 */
export function findPath(
  from: GridCoord,
  to: GridCoord,
  cells: TacticalCell[][],
  gridWidth: number,
  gridHeight: number,
  token: TacticalToken,
  gridType: GridType = 'square'
): MovementResult {
  // Validar destino
  if (to.x < 0 || to.x >= gridWidth || to.y < 0 || to.y >= gridHeight) {
    return { path: [], totalCost: Infinity, canReach: false, blockedBy: 'Fuera del mapa' }
  }

  const destCell = cells[to.y]?.[to.x]
  if (destCell) {
    const terrain = TERRAIN_EFFECTS[destCell.terrain]
    if (terrain.blocksMovement) {
      return { path: [], totalCost: Infinity, canReach: false, blockedBy: `Terreno impassable: ${destCell.terrain}` }
    }
  }

  const openSet: PathNode[] = []
  const closedSet = new Set<string>()

  const startNode: PathNode = {
    x: from.x,
    y: from.y,
    g: 0,
    h: heuristic(from, to),
    f: heuristic(from, to),
    parent: null,
  }

  openSet.push(startNode)

  while (openSet.length > 0) {
    // Encontrar nodo con menor f
    openSet.sort((a, b) => a.f - b.f)
    const current = openSet.shift()!

    // Llegamos al destino
    if (current.x === to.x && current.y === to.y) {
      return reconstructPath(current)
    }

    closedSet.add(`${current.x},${current.y}`)

    // Explorar vecinos
    const neighbors = gridType === 'square'
      ? getSquareNeighbors({ x: current.x, y: current.y }, true)
      : getHexNeighbors(axialToCube(current.x, current.y)).map(h => ({ x: h.q, y: h.r }))

    for (const neighbor of neighbors) {
      // Verificar límites
      if (neighbor.x < 0 || neighbor.x >= gridWidth || neighbor.y < 0 || neighbor.y >= gridHeight) {
        continue
      }

      // Ya procesado
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
        continue
      }

      const cell = cells[neighbor.y]?.[neighbor.x]
      if (!cell) continue

      const terrain = TERRAIN_EFFECTS[cell.terrain]

      // No puede pasar
      if (terrain.blocksMovement) {
        continue
      }

      // Verificar si hay token enemigo bloqueando
      if (cell.contents.length > 0) {
        // Por ahora simplificado - en una implementación completa
        // verificaríamos si el token puede pasar a través de aliados
      }

      // Calcular costo de movimiento
      const movementCost = terrain.movementCost
      const tentativeG = current.g + movementCost

      // Verificar si excede el movimiento del token
      if (tentativeG * 5 > token.movementRemaining) {
        continue
      }

      // Buscar si ya está en openSet
      const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y)

      if (!existingNode || tentativeG < existingNode.g) {
        const newNode: PathNode = {
          x: neighbor.x,
          y: neighbor.y,
          g: tentativeG,
          h: heuristic(neighbor, to),
          f: tentativeG + heuristic(neighbor, to),
          parent: current,
        }

        if (existingNode) {
          existingNode.g = newNode.g
          existingNode.h = newNode.h
          existingNode.f = newNode.f
          existingNode.parent = newNode.parent
        } else {
          openSet.push(newNode)
        }
      }
    }
  }

  // No se encontró camino
  return { path: [], totalCost: Infinity, canReach: false, blockedBy: 'Sin camino disponible' }
}

function heuristic(a: GridCoord, b: GridCoord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function reconstructPath(endNode: PathNode): MovementResult {
  const path: GridCoord[] = []
  let current: PathNode | null = endNode

  while (current) {
    path.unshift({ x: current.x, y: current.y })
    current = current.parent
  }

  return {
    path,
    totalCost: endNode.g * 5, // Convertir a pies
    canReach: true,
  }
}

/**
 * Calcula todas las celdas alcanzables con el movimiento disponible
 */
export function getReachableCells(
  from: GridCoord,
  movementRemaining: number,
  cells: TacticalCell[][],
  gridWidth: number,
  gridHeight: number,
  gridType: GridType = 'square'
): GridCoord[] {
  const reachable: GridCoord[] = []
  const visited = new Set<string>()
  const queue: { coord: GridCoord; costSoFar: number }[] = [{ coord: from, costSoFar: 0 }]

  while (queue.length > 0) {
    const { coord, costSoFar } = queue.shift()!
    const key = `${coord.x},${coord.y}`

    if (visited.has(key)) continue
    visited.add(key)

    reachable.push(coord)

    const neighbors = gridType === 'square'
      ? getSquareNeighbors(coord, true)
      : getHexNeighbors(axialToCube(coord.x, coord.y)).map(h => ({ x: h.q, y: h.r }))

    for (const neighbor of neighbors) {
      if (neighbor.x < 0 || neighbor.x >= gridWidth || neighbor.y < 0 || neighbor.y >= gridHeight) {
        continue
      }

      if (visited.has(`${neighbor.x},${neighbor.y}`)) continue

      const cell = cells[neighbor.y]?.[neighbor.x]
      if (!cell) continue

      const terrain = TERRAIN_EFFECTS[cell.terrain]
      if (terrain.blocksMovement) continue

      const newCost = costSoFar + terrain.movementCost * 5 // En pies

      if (newCost <= movementRemaining) {
        queue.push({ coord: neighbor, costSoFar: newCost })
      }
    }
  }

  return reachable
}

// ============================================
// ÁREAS DE EFECTO
// ============================================

/**
 * Obtiene las celdas afectadas por un círculo/esfera
 */
export function getCircleArea(center: GridCoord, radiusFeet: number, cellSize: number = 5): GridCoord[] {
  const radiusCells = radiusFeet / cellSize
  const cells: GridCoord[] = []

  for (let dx = -Math.ceil(radiusCells); dx <= Math.ceil(radiusCells); dx++) {
    for (let dy = -Math.ceil(radiusCells); dy <= Math.ceil(radiusCells); dy++) {
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance <= radiusCells) {
        cells.push({ x: center.x + dx, y: center.y + dy })
      }
    }
  }

  return cells
}

/**
 * Obtiene las celdas afectadas por un cono
 */
export function getConeArea(
  origin: GridCoord,
  direction: number, // En grados, 0 = derecha, 90 = arriba
  lengthFeet: number,
  cellSize: number = 5
): GridCoord[] {
  const lengthCells = lengthFeet / cellSize
  const halfAngle = 26.5 // Cono de 53 grados aproximadamente (D&D standard)
  const cells: GridCoord[] = []

  const dirRad = (direction * Math.PI) / 180

  for (let dx = -Math.ceil(lengthCells); dx <= Math.ceil(lengthCells); dx++) {
    for (let dy = -Math.ceil(lengthCells); dy <= Math.ceil(lengthCells); dy++) {
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance > lengthCells || distance === 0) continue

      // Calcular ángulo hacia este punto
      const angle = Math.atan2(-dy, dx) // Negativo porque Y crece hacia abajo
      let angleDiff = ((angle - dirRad) * 180) / Math.PI

      // Normalizar a -180 a 180
      while (angleDiff > 180) angleDiff -= 360
      while (angleDiff < -180) angleDiff += 360

      if (Math.abs(angleDiff) <= halfAngle) {
        cells.push({ x: origin.x + dx, y: origin.y + dy })
      }
    }
  }

  return cells
}

/**
 * Obtiene las celdas afectadas por una línea
 */
export function getLineArea(
  origin: GridCoord,
  direction: number, // En grados
  lengthFeet: number,
  widthFeet: number = 5,
  cellSize: number = 5
): GridCoord[] {
  const lengthCells = lengthFeet / cellSize
  const widthCells = widthFeet / cellSize / 2 // Radio desde el centro

  const dirRad = (direction * Math.PI) / 180
  const endX = origin.x + Math.cos(dirRad) * lengthCells
  const endY = origin.y - Math.sin(dirRad) * lengthCells // Negativo porque Y crece hacia abajo

  const cells: GridCoord[] = []

  // Vector perpendicular para el ancho
  const perpX = Math.sin(dirRad)
  const perpY = Math.cos(dirRad)

  for (let t = 0; t <= 1; t += 0.1) {
    const lineX = origin.x + (endX - origin.x) * t
    const lineY = origin.y + (endY - origin.y) * t

    for (let w = -widthCells; w <= widthCells; w += 0.5) {
      const cellX = Math.round(lineX + perpX * w)
      const cellY = Math.round(lineY + perpY * w)

      // Evitar duplicados
      if (!cells.some(c => c.x === cellX && c.y === cellY)) {
        cells.push({ x: cellX, y: cellY })
      }
    }
  }

  return cells
}

/**
 * Obtiene las celdas afectadas por un cubo
 */
export function getCubeArea(corner: GridCoord, sizeFeet: number, cellSize: number = 5): GridCoord[] {
  const sizeCells = sizeFeet / cellSize
  const cells: GridCoord[] = []

  for (let dx = 0; dx < sizeCells; dx++) {
    for (let dy = 0; dy < sizeCells; dy++) {
      cells.push({ x: corner.x + dx, y: corner.y + dy })
    }
  }

  return cells
}

// ============================================
// UTILIDADES DE VISIÓN
// ============================================

/**
 * Calcula qué celdas son visibles desde una posición
 */
export function getVisibleCells(
  from: GridCoord,
  visionRange: number,
  cells: TacticalCell[][],
  gridWidth: number,
  gridHeight: number
): GridCoord[] {
  const visible: GridCoord[] = []
  const rangeCells = visionRange / 5 // Convertir pies a celdas

  for (let dx = -rangeCells; dx <= rangeCells; dx++) {
    for (let dy = -rangeCells; dy <= rangeCells; dy++) {
      const target = { x: from.x + dx, y: from.y + dy }

      if (target.x < 0 || target.x >= gridWidth || target.y < 0 || target.y >= gridHeight) {
        continue
      }

      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance > rangeCells) continue

      const los = checkLineOfSight(from, target, cells, gridWidth, gridHeight)
      if (los.hasLineOfSight) {
        visible.push(target)
      }
    }
  }

  return visible
}

/**
 * Actualiza el fog of war basado en las posiciones de los tokens
 */
export function updateFogOfWar(
  tokens: TacticalToken[],
  cells: TacticalCell[][],
  exploredCells: boolean[][],
  gridWidth: number,
  gridHeight: number
): { cells: TacticalCell[][]; explored: boolean[][] } {
  // Primero, marcar todas las celdas como no visibles
  const updatedCells = cells.map(row =>
    row.map(cell => ({ ...cell, isVisible: false }))
  )

  // Para cada token del equipo del jugador
  const playerTokens = tokens.filter(t => t.type === 'player' || t.type === 'ally')

  for (const token of playerTokens) {
    const visibleFromToken = getVisibleCells(
      { x: token.x, y: token.y },
      Math.max(token.visionRange, token.darkvision),
      cells,
      gridWidth,
      gridHeight
    )

    for (const coord of visibleFromToken) {
      if (updatedCells[coord.y]?.[coord.x]) {
        updatedCells[coord.y][coord.x].isVisible = true
        updatedCells[coord.y][coord.x].isRevealed = true
        exploredCells[coord.y][coord.x] = true
      }
    }
  }

  return { cells: updatedCells, explored: exploredCells }
}
