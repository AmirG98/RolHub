'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { TacticalToken, TOKEN_SIZES, STANDARD_CONDITIONS, GridType } from '@/lib/tactical/types'

interface TacticalToken3DProps {
  token: TacticalToken
  gridType: GridType
  cellSize: number
  isSelected?: boolean
  isHovered?: boolean
  isCurrentTurn?: boolean
  showHealthBar?: boolean
  showConditions?: boolean
  showAura?: boolean
  onClick?: () => void
  onHover?: (hover: boolean) => void
}

// Colores por tipo de token
const TOKEN_TYPE_COLORS: Record<TacticalToken['type'], string> = {
  player: '#2563eb',     // Azul
  ally: '#16a34a',       // Verde
  enemy: '#dc2626',      // Rojo
  neutral: '#ca8a04',    // Amarillo/Dorado
  object: '#6b7280',     // Gris
  hazard: '#9333ea',     // Púrpura
}

// Convertir coordenadas de grilla a mundo
function gridToWorld(x: number, y: number, gridType: GridType, cellSize: number): [number, number, number] {
  if (gridType === 'square') {
    return [x * cellSize + cellSize / 2, 0, y * cellSize + cellSize / 2]
  } else {
    // Hexagonal
    const offsetX = y % 2 === 0 ? 0 : cellSize / 2
    return [x * cellSize + offsetX + cellSize / 2, 0, y * cellSize * 0.866 + cellSize / 2]
  }
}

/**
 * Componente de token 3D individual
 * Representa un personaje, NPC, enemigo u objeto en el mapa táctico
 */
export function TacticalToken3D({
  token,
  gridType,
  cellSize,
  isSelected = false,
  isHovered = false,
  isCurrentTurn = false,
  showHealthBar = true,
  showConditions = true,
  showAura = true,
  onClick,
  onHover,
}: TacticalToken3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const auraRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const [hoverState, setHoverState] = useState(false)

  // Calcular posición mundial
  const position = useMemo(() => {
    return gridToWorld(token.x, token.y, gridType, cellSize)
  }, [token.x, token.y, gridType, cellSize])

  // Calcular tamaño del token
  const tokenSize = useMemo(() => {
    const sizeData = TOKEN_SIZES[token.size]
    return {
      radius: (sizeData.cells * cellSize) / 2 * 0.85,
      height: 0.3 + sizeData.cells * 0.15,
    }
  }, [token.size, cellSize])

  // Calcular porcentaje de HP
  const hpPercent = useMemo(() => {
    return Math.max(0, Math.min(100, (token.hp / token.maxHp) * 100))
  }, [token.hp, token.maxHp])

  // Color de HP
  const hpColor = useMemo(() => {
    if (hpPercent > 66) return '#22c55e'      // Verde
    if (hpPercent > 33) return '#eab308'      // Amarillo
    if (hpPercent > 0) return '#ef4444'       // Rojo
    return '#1f2937'                          // Gris (muerto)
  }, [hpPercent])

  // Color del token
  const tokenColor = useMemo(() => {
    return token.tokenColor || TOKEN_TYPE_COLORS[token.type]
  }, [token.tokenColor, token.type])

  // Animación
  useFrame(({ clock }) => {
    if (!groupRef.current) return

    // Elevación suave para token seleccionado
    const targetY = isSelected ? 0.3 : 0
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.1
    )

    // Pulso para turno actual
    if (pulseRef.current && isCurrentTurn) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.1
      pulseRef.current.scale.setScalar(scale)
    }

    // Aura animada
    if (auraRef.current && token.aura) {
      auraRef.current.rotation.y = clock.elapsedTime * 0.5
      const opacity = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.1
      ;(auraRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  // Handlers
  const handlePointerOver = () => {
    setHoverState(true)
    onHover?.(true)
  }

  const handlePointerOut = () => {
    setHoverState(false)
    onHover?.(false)
  }

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onClick?.()
  }

  const actualHovered = isHovered || hoverState

  return (
    <group ref={groupRef} position={position}>
      {/* Aura del token */}
      {showAura && token.aura && (
        <mesh
          ref={auraRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <ringGeometry args={[
            tokenSize.radius,
            tokenSize.radius + (token.aura.radius / 5),
            32
          ]} />
          <meshBasicMaterial
            color={token.aura.color}
            transparent
            opacity={token.aura.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Indicador de turno actual */}
      {isCurrentTurn && (
        <mesh
          ref={pulseRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
        >
          <ringGeometry args={[tokenSize.radius * 1.1, tokenSize.radius * 1.3, 32]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Indicador de selección */}
      {isSelected && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.015, 0]}
        >
          <ringGeometry args={[tokenSize.radius * 0.95, tokenSize.radius * 1.05, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Base del token (cilindro) */}
      <mesh
        ref={meshRef}
        position={[0, tokenSize.height / 2, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[tokenSize.radius, tokenSize.radius * 1.1, tokenSize.height, 32]} />
        <meshStandardMaterial
          color={tokenColor}
          metalness={0.3}
          roughness={0.7}
          emissive={actualHovered ? tokenColor : '#000000'}
          emissiveIntensity={actualHovered ? 0.3 : 0}
        />
      </mesh>

      {/* Borde superior del token */}
      <mesh position={[0, tokenSize.height, 0]}>
        <torusGeometry args={[tokenSize.radius, 0.03, 8, 32]} />
        <meshStandardMaterial
          color={token.borderColor || '#c9a84c'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Avatar del token (si tiene imagen) */}
      {token.imageUrl && (
        <Billboard position={[0, tokenSize.height + 0.1, 0]}>
          <mesh>
            <circleGeometry args={[tokenSize.radius * 0.9, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              map={new THREE.TextureLoader().load(token.imageUrl)}
              transparent
            />
          </mesh>
        </Billboard>
      )}

      {/* Nombre del token */}
      <Billboard position={[0, tokenSize.height + tokenSize.radius + 0.3, 0]}>
        <Text
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {token.name}
        </Text>
      </Billboard>

      {/* Barra de HP */}
      {showHealthBar && token.hp > 0 && (
        <group position={[0, tokenSize.height + tokenSize.radius + 0.1, 0]}>
          {/* Fondo de la barra */}
          <mesh>
            <planeGeometry args={[tokenSize.radius * 2, 0.1]} />
            <meshBasicMaterial color="#1f2937" />
          </mesh>
          {/* HP actual */}
          <mesh position={[-(tokenSize.radius * (1 - hpPercent / 100)), 0, 0.001]}>
            <planeGeometry args={[tokenSize.radius * 2 * (hpPercent / 100), 0.08]} />
            <meshBasicMaterial color={hpColor} />
          </mesh>
          {/* Temp HP (si hay) */}
          {token.tempHp > 0 && (
            <mesh position={[0, 0.06, 0.001]}>
              <planeGeometry args={[tokenSize.radius * 2 * Math.min(1, token.tempHp / token.maxHp), 0.04]} />
              <meshBasicMaterial color="#60a5fa" />
            </mesh>
          )}
        </group>
      )}

      {/* Indicadores de condición */}
      {showConditions && token.conditions.length > 0 && (
        <Html
          position={[tokenSize.radius + 0.2, tokenSize.height / 2, 0]}
          center
          distanceFactor={10}
        >
          <div className="flex flex-col gap-0.5 bg-shadow/80 rounded px-1 py-0.5">
            {token.conditions.slice(0, 4).map((condition, i) => {
              const condInfo = STANDARD_CONDITIONS[condition.name.toLowerCase()]
              return (
                <div
                  key={i}
                  className="text-xs text-parchment flex items-center gap-1"
                  title={condInfo?.description || condition.description}
                >
                  <span>{condition.icon || condInfo?.icon || '⚠️'}</span>
                  {condition.duration > 0 && (
                    <span className="text-gold-dim text-[10px]">{condition.duration}</span>
                  )}
                </div>
              )
            })}
            {token.conditions.length > 4 && (
              <div className="text-xs text-gold-dim">+{token.conditions.length - 4}</div>
            )}
          </div>
        </Html>
      )}

      {/* Indicador de concentración */}
      {token.concentrating && (
        <mesh
          position={[0, tokenSize.height + 0.2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[tokenSize.radius * 0.3, tokenSize.radius * 0.4, 6]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Indicador de HP bajo */}
      {hpPercent <= 25 && hpPercent > 0 && (
        <mesh
          position={[0, tokenSize.height + 0.15, 0]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}

      {/* Indicador de muerte (HP = 0) */}
      {token.hp <= 0 && (
        <group>
          <mesh
            rotation={[0, 0, Math.PI / 4]}
            position={[0, tokenSize.height + 0.2, 0]}
          >
            <boxGeometry args={[tokenSize.radius * 1.5, 0.05, 0.05]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
          <mesh
            rotation={[0, 0, -Math.PI / 4]}
            position={[0, tokenSize.height + 0.2, 0]}
          >
            <boxGeometry args={[tokenSize.radius * 1.5, 0.05, 0.05]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
        </group>
      )}

      {/* Indicador de acciones disponibles */}
      {isCurrentTurn && (
        <Html
          position={[-tokenSize.radius - 0.3, tokenSize.height / 2, 0]}
          center
          distanceFactor={10}
        >
          <div className="flex flex-col gap-0.5 text-[10px]">
            {!token.hasTakenAction && (
              <div className="bg-emerald/80 text-white px-1 rounded">⚔️ Acción</div>
            )}
            {!token.hasTakenBonusAction && (
              <div className="bg-gold/80 text-shadow px-1 rounded">⚡ Bonus</div>
            )}
            {token.hasReaction && (
              <div className="bg-blue-500/80 text-white px-1 rounded">🛡️ Reacción</div>
            )}
            {token.movementRemaining > 0 && (
              <div className="bg-parchment/80 text-shadow px-1 rounded">
                🦶 {token.movementRemaining}ft
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Dirección del token (facing) */}
      <mesh
        position={[
          Math.sin(token.facing * Math.PI / 180) * tokenSize.radius * 0.8,
          tokenSize.height,
          Math.cos(token.facing * Math.PI / 180) * tokenSize.radius * 0.8
        ]}
      >
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

/**
 * Componente para renderizar múltiples tokens con instanced meshes
 * Para mejor performance cuando hay muchos tokens
 */
export function TacticalTokensInstanced({
  tokens,
  gridType,
  cellSize,
  selectedTokenId,
  currentTurnTokenId,
  onTokenClick,
  onTokenHover,
}: {
  tokens: TacticalToken[]
  gridType: GridType
  cellSize: number
  selectedTokenId?: string
  currentTurnTokenId?: string
  onTokenClick?: (tokenId: string) => void
  onTokenHover?: (tokenId: string | null) => void
}) {
  return (
    <group>
      {tokens.map(token => (
        <TacticalToken3D
          key={token.id}
          token={token}
          gridType={gridType}
          cellSize={cellSize}
          isSelected={token.id === selectedTokenId}
          isCurrentTurn={token.id === currentTurnTokenId}
          onClick={() => onTokenClick?.(token.id)}
          onHover={(hover) => onTokenHover?.(hover ? token.id : null)}
        />
      ))}
    </group>
  )
}

export default TacticalToken3D
