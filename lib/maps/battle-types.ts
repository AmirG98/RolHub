// Tipos para el sistema de batalla táctica

import { type Lore } from './map-config'

export type GridType = 'square' | 'hex'

export interface BattleToken {
  id: string
  name: string
  type: 'player' | 'ally' | 'enemy' | 'neutral' | 'object'
  x: number // Posición en grid
  y: number
  size: number // 1 = medium, 2 = large, 3 = huge
  hp: number
  maxHp: number
  ac?: number // Armor class
  initiative?: number
  conditions: string[]
  imageUrl?: string
  color: string
  isSelected: boolean
  hasMoved: boolean
  hasActed: boolean
}

export interface BattleMap {
  id: string
  name: string
  gridType: GridType
  width: number // En celdas
  height: number // En celdas
  cellSize: number // Píxeles por celda
  tokens: BattleToken[]
  terrain: TerrainCell[]
  effects: AreaEffect[]
  lore: Lore
}

export interface TerrainCell {
  x: number
  y: number
  type: TerrainType
  difficult: boolean // Terreno difícil (cuesta doble movimiento)
  cover: 'none' | 'half' | 'full'
}

export type TerrainType =
  | 'floor'
  | 'wall'
  | 'water'
  | 'lava'
  | 'pit'
  | 'vegetation'
  | 'rubble'
  | 'ice'
  | 'darkness'
  | 'fire'

export interface AreaEffect {
  id: string
  name: string
  shape: 'circle' | 'cone' | 'line' | 'square'
  x: number
  y: number
  radius?: number
  length?: number
  width?: number
  direction?: number // Ángulo en grados
  color: string
  opacity: number
  damage?: number
  damageType?: string
  duration: number // Turnos restantes, -1 = permanente
}

export interface BattleState {
  round: number
  currentTurnIndex: number
  initiativeOrder: string[] // Token IDs ordenados por iniciativa
  isActive: boolean
  turnPhase: 'movement' | 'action' | 'bonus' | 'end'
}

// Colores de tokens por tipo
export const TOKEN_COLORS: Record<BattleToken['type'], string> = {
  player: '#4CAF50',
  ally: '#2196F3',
  enemy: '#F44336',
  neutral: '#9E9E9E',
  object: '#795548',
}

// Colores de terreno
export const TERRAIN_COLORS: Record<TerrainType, string> = {
  floor: '#8B7355',
  wall: '#4A4A4A',
  water: '#4FC3F7',
  lava: '#FF5722',
  pit: '#1A1A1A',
  vegetation: '#4CAF50',
  rubble: '#9E9E9E',
  ice: '#E0F7FA',
  darkness: '#212121',
  fire: '#FF9800',
}

// Iconos de condiciones
export const CONDITION_ICONS: Record<string, string> = {
  poisoned: '☠️',
  stunned: '💫',
  prone: '🛏️',
  grappled: '🤝',
  restrained: '⛓️',
  blinded: '🙈',
  deafened: '🙉',
  frightened: '😨',
  charmed: '💕',
  paralyzed: '🧊',
  petrified: '🗿',
  invisible: '👻',
  unconscious: '😵',
  concentrating: '🧠',
  blessed: '✨',
  cursed: '💀',
}

// Calcular distancia entre dos celdas
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  gridType: GridType,
  cellSize: number = 5 // 5 feet por celda estándar
): number {
  if (gridType === 'square') {
    // Diagonal = 1.5x (regla D&D 5e alternativa)
    const dx = Math.abs(x2 - x1)
    const dy = Math.abs(y2 - y1)
    const diagonals = Math.min(dx, dy)
    const straights = Math.abs(dx - dy)
    return (diagonals * 1.5 + straights) * cellSize
  } else {
    // Hex grid - cada celda adyacente cuenta como 1
    // Usar coordenadas axiales para hex
    const dx = x2 - x1
    const dy = y2 - y1
    return Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dx + dy)) * cellSize
  }
}

// Verificar línea de visión (simplificada)
export function hasLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  terrain: TerrainCell[]
): boolean {
  // Algoritmo de Bresenham simplificado
  const dx = Math.abs(x2 - x1)
  const dy = Math.abs(y2 - y1)
  const sx = x1 < x2 ? 1 : -1
  const sy = y1 < y2 ? 1 : -1
  let err = dx - dy

  let x = x1
  let y = y1

  while (x !== x2 || y !== y2) {
    // Verificar si hay pared en esta celda
    const cell = terrain.find(t => t.x === x && t.y === y)
    if (cell?.type === 'wall' || cell?.cover === 'full') {
      return false
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

  return true
}

// Crear batalla vacía
export function createBattleMap(
  name: string,
  width: number,
  height: number,
  gridType: GridType,
  lore: Lore
): BattleMap {
  // Crear terreno por defecto (todo suelo)
  const terrain: TerrainCell[] = []
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      terrain.push({
        x,
        y,
        type: 'floor',
        difficult: false,
        cover: 'none',
      })
    }
  }

  return {
    id: `battle-${Date.now()}`,
    name,
    gridType,
    width,
    height,
    cellSize: 40,
    tokens: [],
    terrain,
    effects: [],
    lore,
  }
}

// Crear token de personaje
export function createToken(
  name: string,
  type: BattleToken['type'],
  x: number,
  y: number,
  hp: number,
  maxHp: number
): BattleToken {
  return {
    id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    x,
    y,
    size: 1,
    hp,
    maxHp,
    conditions: [],
    color: TOKEN_COLORS[type],
    isSelected: false,
    hasMoved: false,
    hasActed: false,
  }
}
