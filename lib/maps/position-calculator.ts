// Funciones de posicionamiento y normalización de coordenadas para el mapa
// Sistema lógico 0-1000 que escala al tamaño del canvas

// Direcciones cardinales como vectores unitarios
const DIRECTION_VECTORS: Record<string, { dx: number; dy: number }> = {
  north:     { dx: 0, dy: -1 },
  south:     { dx: 0, dy: 1 },
  east:      { dx: 1, dy: 0 },
  west:      { dx: -1, dy: 0 },
  northeast: { dx: 0.707, dy: -0.707 },
  northwest: { dx: -0.707, dy: -0.707 },
  southeast: { dx: 0.707, dy: 0.707 },
  southwest: { dx: -0.707, dy: 0.707 },
}

// Rangos de distancia en unidades lógicas (0-1000)
const DISTANCE_RANGES: Record<string, { min: number; max: number; jitter: number }> = {
  close:  { min: 60, max: 100, jitter: 15 },
  medium: { min: 120, max: 180, jitter: 20 },
  far:    { min: 200, max: 300, jitter: 25 },
}

// Rango original de coordenadas hardcodeadas
const LEGACY_MIN = 50
const LEGACY_MAX = 750

// Margen en el sistema normalizado para no pegar a los bordes
const NORMALIZED_MARGIN = 50
const NORMALIZED_MAX = 1000 - NORMALIZED_MARGIN

/**
 * Convierte coordenadas lógicas (0-1000) a píxeles del canvas
 */
export function toCanvasCoords(
  logicalX: number,
  logicalY: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: (logicalX / 1000) * canvasWidth,
    y: (logicalY / 1000) * canvasHeight,
  }
}

/**
 * Convierte coordenadas del canvas a lógicas (0-1000)
 */
export function toLogicalCoords(
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: (canvasX / canvasWidth) * 1000,
    y: (canvasY / canvasHeight) * 1000,
  }
}

/**
 * Calcula posición de una ubicación dinámica relativa a un ancla
 */
export function calculateRelativePosition(
  anchorCoords: { x: number; y: number },
  direction: string,
  distance: 'close' | 'medium' | 'far'
): { x: number; y: number } {
  const vector = DIRECTION_VECTORS[direction] || DIRECTION_VECTORS.north
  const range = DISTANCE_RANGES[distance] || DISTANCE_RANGES.medium

  // Distancia base + variación aleatoria
  const dist = range.min + Math.random() * (range.max - range.min)
  const jitterX = (Math.random() - 0.5) * 2 * range.jitter
  const jitterY = (Math.random() - 0.5) * 2 * range.jitter

  let x = anchorCoords.x + vector.dx * dist + jitterX
  let y = anchorCoords.y + vector.dy * dist + jitterY

  // Clamp al rango válido
  x = Math.max(NORMALIZED_MARGIN, Math.min(NORMALIZED_MAX, x))
  y = Math.max(NORMALIZED_MARGIN, Math.min(NORMALIZED_MAX, y))

  return { x: Math.round(x), y: Math.round(y) }
}

/**
 * Detecta y resuelve solapamientos entre marcadores
 * Modifica las coordenadas in-place
 */
export function resolveOverlaps(
  locations: { coordinates: { x: number; y: number } }[],
  minDistance: number = 50
): void {
  const maxIterations = 10

  for (let iter = 0; iter < maxIterations; iter++) {
    let hadOverlap = false

    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const a = locations[i].coordinates
        const b = locations[j].coordinates
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < minDistance && dist > 0) {
          hadOverlap = true
          const overlap = (minDistance - dist) / 2
          const nx = dx / dist
          const ny = dy / dist

          a.x = Math.max(NORMALIZED_MARGIN, Math.min(NORMALIZED_MAX, a.x - nx * overlap))
          a.y = Math.max(NORMALIZED_MARGIN, Math.min(NORMALIZED_MAX, a.y - ny * overlap))
          b.x = Math.max(NORMALIZED_MARGIN, Math.min(NORMALIZED_MAX, b.x + nx * overlap))
          b.y = Math.max(NORMALIZED_MARGIN, Math.min(NORMALIZED_MAX, b.y + ny * overlap))
        }
      }
    }

    if (!hadOverlap) break
  }
}

/**
 * Escala coordenadas legacy (100-700) al sistema normalizado (0-1000)
 * Detecta automáticamente si las coordenadas ya están normalizadas
 */
export function normalizeLegacyCoordinates<T extends { coordinates: { x: number; y: number } }>(
  locations: T[]
): T[] {
  if (locations.length === 0) return locations

  // Detectar rango actual
  let maxX = 0
  let maxY = 0
  for (const loc of locations) {
    if (loc.coordinates.x > maxX) maxX = loc.coordinates.x
    if (loc.coordinates.y > maxY) maxY = loc.coordinates.y
  }

  // Si ya está en rango >800, asumir que ya está normalizado
  if (maxX > 800 || maxY > 800) return locations

  // Escalar de rango legacy a 0-1000 con márgenes
  const scaleX = (NORMALIZED_MAX - NORMALIZED_MARGIN) / (LEGACY_MAX - LEGACY_MIN)
  const scaleY = (NORMALIZED_MAX - NORMALIZED_MARGIN) / (LEGACY_MAX - LEGACY_MIN)

  return locations.map(loc => ({
    ...loc,
    coordinates: {
      x: Math.round(NORMALIZED_MARGIN + (loc.coordinates.x - LEGACY_MIN) * scaleX),
      y: Math.round(NORMALIZED_MARGIN + (loc.coordinates.y - LEGACY_MIN) * scaleY),
    },
  }))
}
