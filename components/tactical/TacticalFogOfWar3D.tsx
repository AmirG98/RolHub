'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GridType, TacticalCell, TacticalToken, LightSource } from '@/lib/tactical/types'

interface TacticalFogOfWar3DProps {
  cells: TacticalCell[][]
  tokens: TacticalToken[]
  lightSources: LightSource[]
  gridType: GridType
  cellSize: number
  playerTokenIds: string[]  // IDs de tokens controlados por el jugador
  globalLight: 'bright' | 'dim' | 'dark' | 'magical_darkness'
  enabled?: boolean
}

// Shader para fog of war con transiciones suaves
const fogVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fogFragmentShader = `
  uniform sampler2D visibilityMap;
  uniform sampler2D exploredMap;
  uniform vec3 fogColor;
  uniform float time;
  uniform float globalLightLevel;

  varying vec2 vUv;
  varying vec3 vPosition;

  // Ruido para efecto de niebla
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
  }

  void main() {
    // Obtener valores de visibilidad
    float visible = texture2D(visibilityMap, vUv).r;
    float explored = texture2D(exploredMap, vUv).r;

    // Efecto de niebla animada
    float fogNoise = noise(vUv * 10.0 + time * 0.5) * 0.3;

    // Calcular opacidad final
    float fogOpacity = 1.0;

    if (visible > 0.5) {
      // Área visible - sin niebla (o muy poca según luz global)
      fogOpacity = (1.0 - globalLightLevel) * 0.3;
    } else if (explored > 0.5) {
      // Área explorada pero no visible - niebla parcial
      fogOpacity = 0.6 + fogNoise;
    } else {
      // Área no explorada - niebla total
      fogOpacity = 0.95 + fogNoise * 0.05;
    }

    gl_FragColor = vec4(fogColor, fogOpacity);
  }
`

/**
 * Componente de Fog of War dinámico
 * Calcula visibilidad basada en posición de tokens y fuentes de luz
 */
export function TacticalFogOfWar3D({
  cells,
  tokens,
  lightSources,
  gridType,
  cellSize,
  playerTokenIds,
  globalLight,
  enabled = true,
}: TacticalFogOfWar3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { size } = useThree()

  const width = cells[0]?.length || 0
  const height = cells.length

  // Nivel de luz global
  const globalLightLevel = useMemo(() => {
    switch (globalLight) {
      case 'bright': return 1.0
      case 'dim': return 0.6
      case 'dark': return 0.3
      case 'magical_darkness': return 0.0
      default: return 1.0
    }
  }, [globalLight])

  // Crear texturas de visibilidad
  const { visibilityTexture, exploredTexture, uniforms } = useMemo(() => {
    const visData = new Uint8Array(width * height * 4)
    const expData = new Uint8Array(width * height * 4)

    // Inicializar con datos de celdas
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const cell = cells[y]?.[x]

        // Visible actual
        visData[idx] = cell?.isVisible ? 255 : 0
        visData[idx + 1] = 0
        visData[idx + 2] = 0
        visData[idx + 3] = 255

        // Explorado
        expData[idx] = cell?.isRevealed ? 255 : 0
        expData[idx + 1] = 0
        expData[idx + 2] = 0
        expData[idx + 3] = 255
      }
    }

    const visTex = new THREE.DataTexture(visData, width, height, THREE.RGBAFormat)
    visTex.needsUpdate = true

    const expTex = new THREE.DataTexture(expData, width, height, THREE.RGBAFormat)
    expTex.needsUpdate = true

    return {
      visibilityTexture: visTex,
      exploredTexture: expTex,
      uniforms: {
        visibilityMap: { value: visTex },
        exploredMap: { value: expTex },
        fogColor: { value: new THREE.Color('#0a0a0a') },
        time: { value: 0 },
        globalLightLevel: { value: globalLightLevel },
      }
    }
  }, [width, height, cells, globalLightLevel])

  // Calcular visibilidad basada en tokens del jugador
  const calculateVisibility = useMemo(() => {
    const visible = new Set<string>()
    const explored = new Set<string>()

    // Obtener tokens del jugador
    const playerTokens = tokens.filter(t => playerTokenIds.includes(t.id))

    playerTokens.forEach(token => {
      const visionRange = Math.max(token.visionRange, token.darkvision) / 5 // Convertir a celdas

      // Marcar celdas visibles usando línea de visión simple
      for (let dy = -visionRange; dy <= visionRange; dy++) {
        for (let dx = -visionRange; dx <= visionRange; dx++) {
          const cx = token.x + dx
          const cy = token.y + dy

          if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue

          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > visionRange) continue

          // Verificar línea de visión
          const hasLOS = checkLineOfSight(token.x, token.y, cx, cy, cells)

          if (hasLOS) {
            const key = `${cx},${cy}`
            visible.add(key)
            explored.add(key)
          }
        }
      }
    })

    // Agregar visibilidad desde fuentes de luz
    lightSources.forEach(light => {
      const brightRange = light.brightRadius / 5
      const dimRange = light.dimRadius / 5

      for (let dy = -dimRange; dy <= dimRange; dy++) {
        for (let dx = -dimRange; dx <= dimRange; dx++) {
          const cx = Math.floor(light.x / cellSize + dx)
          const cy = Math.floor(light.y / cellSize + dy)

          if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue

          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance <= dimRange) {
            const key = `${cx},${cy}`
            visible.add(key)
            explored.add(key)
          }
        }
      }
    })

    return { visible, explored }
  }, [tokens, playerTokenIds, lightSources, width, height, cells, cellSize])

  // Actualizar texturas cuando cambia la visibilidad
  useEffect(() => {
    if (!visibilityTexture || !exploredTexture) return

    const visData = visibilityTexture.image.data as Uint8Array
    const expData = exploredTexture.image.data as Uint8Array

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const key = `${x},${y}`
        const cell = cells[y]?.[x]

        // Actualizar visibilidad
        const isVisible = calculateVisibility.visible.has(key)
        visData[idx] = isVisible ? 255 : 0

        // Actualizar explorado (mantener histórico)
        const wasExplored = expData[idx] > 0
        const nowExplored = calculateVisibility.explored.has(key) || cell?.isRevealed
        expData[idx] = (wasExplored || nowExplored) ? 255 : 0
      }
    }

    visibilityTexture.needsUpdate = true
    exploredTexture.needsUpdate = true
  }, [calculateVisibility, cells, height, width, visibilityTexture, exploredTexture])

  // Animación del tiempo para el shader
  useFrame(({ clock }) => {
    if (uniforms.time) {
      uniforms.time.value = clock.elapsedTime
    }
  })

  if (!enabled || width === 0 || height === 0) return null

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[(width * cellSize) / 2, 0.5, (height * cellSize) / 2]}
    >
      <planeGeometry args={[width * cellSize, height * cellSize]} />
      <shaderMaterial
        vertexShader={fogVertexShader}
        fragmentShader={fogFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/**
 * Verificar línea de visión entre dos puntos usando Bresenham
 */
function checkLineOfSight(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cells: TacticalCell[][]
): boolean {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  let x = x0
  let y = y0

  while (x !== x1 || y !== y1) {
    // Verificar si la celda bloquea la visión
    const cell = cells[y]?.[x]
    if (cell) {
      // No bloquear el origen ni el destino
      if ((x !== x0 || y !== y0) && (x !== x1 || y !== y1)) {
        const terrain = cell.terrain
        if (
          terrain === 'wall' ||
          terrain === 'door_closed' ||
          terrain === 'dense_forest' ||
          terrain === 'darkness'
        ) {
          return false
        }
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

  return true
}

/**
 * Componente simplificado de fog of war (sin shaders)
 * Para dispositivos que no soporten custom shaders
 */
export function TacticalFogOfWarSimple({
  cells,
  gridType,
  cellSize,
}: {
  cells: TacticalCell[][]
  gridType: GridType
  cellSize: number
}) {
  const width = cells[0]?.length || 0
  const height = cells.length

  // Crear geometría para celdas no visibles
  const fogCells = useMemo(() => {
    const result: { x: number; y: number; opacity: number }[] = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = cells[y]?.[x]
        if (!cell) continue

        if (!cell.isVisible) {
          result.push({
            x,
            y,
            opacity: cell.isRevealed ? 0.6 : 0.95,
          })
        }
      }
    }

    return result
  }, [cells, width, height])

  return (
    <group>
      {fogCells.map((fog, i) => {
        const posX = gridType === 'square'
          ? fog.x * cellSize + cellSize / 2
          : fog.x * cellSize + (fog.y % 2 === 0 ? 0 : cellSize / 2) + cellSize / 2
        const posZ = gridType === 'square'
          ? fog.y * cellSize + cellSize / 2
          : fog.y * cellSize * 0.866 + cellSize / 2

        return (
          <mesh
            key={i}
            position={[posX, 0.4, posZ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[cellSize, cellSize]} />
            <meshBasicMaterial
              color="#0a0a0a"
              transparent
              opacity={fog.opacity}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default TacticalFogOfWar3D
