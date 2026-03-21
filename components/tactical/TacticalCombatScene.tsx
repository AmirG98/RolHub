'use client'

import { Suspense, useState, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html, Environment } from '@react-three/drei'
import { Loader2, Grid, Hexagon, Eye, EyeOff, Maximize2, Users, Swords, Move } from 'lucide-react'

import { TacticalMapState, GridCoord, TacticalToken, InteractiveElement, AreaEffect } from '@/lib/tactical/types'
import { TacticalGrid3D } from './TacticalGrid3D'
import { TacticalTokensInstanced } from './TacticalToken3D'
import { TacticalEffects3D } from './TacticalEffects3D'
import { TacticalFogOfWar3D, TacticalFogOfWarSimple } from './TacticalFogOfWar3D'
import { TacticalMovement3D, TacticalAttackRange3D } from './TacticalMovement3D'
import { TacticalInteractives3D } from './TacticalInteractives3D'

interface TacticalCombatSceneProps {
  mapState: TacticalMapState
  playerTokenIds: string[]
  isDM?: boolean
  onTokenClick?: (tokenId: string) => void
  onCellClick?: (coord: GridCoord) => void
  onElementInteract?: (elementId: string) => void
  onMoveToken?: (tokenId: string, to: GridCoord) => void
  className?: string
}

/**
 * Componente principal de la escena de combate táctico
 * Integra todos los sistemas: grilla, tokens, efectos, fog of war, etc.
 */
export function TacticalCombatScene({
  mapState,
  playerTokenIds,
  isDM = false,
  onTokenClick,
  onCellClick,
  onElementInteract,
  onMoveToken,
  className = '',
}: TacticalCombatSceneProps) {
  // Estados locales
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [hoveredCell, setHoveredCell] = useState<GridCoord | null>(null)
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null)
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showFog, setShowFog] = useState(true)
  const [mode, setMode] = useState<'select' | 'move' | 'attack'>('select')
  const [useAdvancedFog, setUseAdvancedFog] = useState(true)

  // Token seleccionado
  const selectedToken = useMemo(() => {
    return mapState.tokens.find(t => t.id === selectedTokenId) || null
  }, [mapState.tokens, selectedTokenId])

  // Token del turno actual
  const currentTurnToken = useMemo(() => {
    if (!mapState.inCombat) return null
    const currentTokenId = mapState.initiativeOrder[mapState.currentTurnIndex]
    return mapState.tokens.find(t => t.id === currentTokenId) || null
  }, [mapState.tokens, mapState.initiativeOrder, mapState.currentTurnIndex, mapState.inCombat])

  // Celdas resaltadas según el modo
  const highlightedCells = useMemo(() => {
    if (!selectedToken || mode === 'select') return []
    // Las celdas se calculan en TacticalMovement3D
    return []
  }, [selectedToken, mode])

  // Handler de click en token
  const handleTokenClick = useCallback((tokenId: string) => {
    setSelectedTokenId(tokenId)
    onTokenClick?.(tokenId)
  }, [onTokenClick])

  // Handler de click en celda
  const handleCellClick = useCallback((coord: GridCoord) => {
    if (mode === 'move' && selectedToken && onMoveToken) {
      // Verificar si el movimiento es válido
      onMoveToken(selectedToken.id, coord)
    } else if (mode === 'select') {
      // Verificar si hay un token en esta celda
      const tokenAtCell = mapState.tokens.find(t => t.x === coord.x && t.y === coord.y)
      if (tokenAtCell) {
        handleTokenClick(tokenAtCell.id)
      } else {
        setSelectedTokenId(null)
      }
    }
    onCellClick?.(coord)
  }, [mode, selectedToken, onMoveToken, mapState.tokens, handleTokenClick, onCellClick])

  // Handler de hover en celda
  const handleCellHover = useCallback((coord: GridCoord | null) => {
    setHoveredCell(coord)
  }, [])

  // Handler de interacción con elemento
  const handleElementClick = useCallback((elementId: string) => {
    onElementInteract?.(elementId)
  }, [onElementInteract])

  // Configuración de la cámara
  const cameraConfig = useMemo(() => {
    const centerX = (mapState.gridWidth * mapState.cellSizeInFeet / 5) / 2
    const centerZ = (mapState.gridHeight * mapState.cellSizeInFeet / 5) / 2
    const distance = Math.max(mapState.gridWidth, mapState.gridHeight) * 1.5

    return {
      position: [centerX, distance, centerZ + distance * 0.5] as [number, number, number],
      target: [centerX, 0, centerZ] as [number, number, number],
    }
  }, [mapState.gridWidth, mapState.gridHeight, mapState.cellSizeInFeet])

  const cellSize = mapState.cellSizeInFeet / 5 // Convertir a unidades de grilla

  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-gold-dim/30 ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      } ${className}`}
      style={{ minHeight: isFullscreen ? undefined : '500px' }}
    >
      {/* Canvas 3D */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <PerspectiveCamera
            makeDefault
            position={cameraConfig.position}
            fov={50}
            near={0.1}
            far={1000}
          />

          {/* Iluminación */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          {/* Grilla táctica */}
          <TacticalGrid3D
            gridType={mapState.gridType}
            width={mapState.gridWidth}
            height={mapState.gridHeight}
            cellSize={cellSize}
            cells={mapState.cells}
            highlightedCells={highlightedCells}
            selectedCell={hoveredCell}
            onCellClick={handleCellClick}
            onCellHover={handleCellHover}
            showGrid={showGrid}
            showTerrain={true}
          />

          {/* Tokens */}
          <TacticalTokensInstanced
            tokens={mapState.tokens}
            gridType={mapState.gridType}
            cellSize={cellSize}
            selectedTokenId={selectedTokenId || undefined}
            currentTurnTokenId={currentTurnToken?.id}
            onTokenClick={handleTokenClick}
            onTokenHover={setHoveredTokenId}
          />

          {/* Indicadores de movimiento */}
          {mode === 'move' && (
            <TacticalMovement3D
              selectedToken={selectedToken}
              cells={mapState.cells}
              tokens={mapState.tokens}
              gridType={mapState.gridType}
              cellSize={cellSize}
              hoveredCell={hoveredCell}
              showDifficultTerrain={true}
              showPathPreview={true}
            />
          )}

          {/* Rango de ataque */}
          {mode === 'attack' && selectedToken && (
            <TacticalAttackRange3D
              selectedToken={selectedToken}
              cells={mapState.cells}
              gridType={mapState.gridType}
              cellSize={cellSize}
              attackRange={selectedToken.speed <= 10 ? 5 : 30} // Melee vs ranged
              attackType="melee"
            />
          )}

          {/* Efectos de área */}
          <TacticalEffects3D
            effects={mapState.activeEffects}
            gridType={mapState.gridType}
            cellSize={cellSize}
            cellSizeInFeet={mapState.cellSizeInFeet}
          />

          {/* Fog of War */}
          {showFog && mapState.fogOfWarEnabled && (
            useAdvancedFog ? (
              <TacticalFogOfWar3D
                cells={mapState.cells}
                tokens={mapState.tokens}
                lightSources={mapState.lightSources}
                gridType={mapState.gridType}
                cellSize={cellSize}
                playerTokenIds={playerTokenIds}
                globalLight={mapState.globalLight}
                enabled={!isDM}
              />
            ) : (
              <TacticalFogOfWarSimple
                cells={mapState.cells}
                gridType={mapState.gridType}
                cellSize={cellSize}
              />
            )
          )}

          {/* Elementos interactivos */}
          <TacticalInteractives3D
            elements={mapState.interactiveElements}
            gridType={mapState.gridType}
            cellSize={cellSize}
            onElementClick={handleElementClick}
            onElementHover={setHoveredElementId}
            showHiddenElements={isDM}
          />

          {/* Controles de cámara */}
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={5}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            panSpeed={0.5}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            target={cameraConfig.target}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay - Controles superiores */}
      <div className="absolute top-2 left-2 flex gap-2">
        {/* Toggle grilla */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg glass-panel-dark transition-colors ${
            showGrid ? 'text-gold bg-gold/10' : 'text-parchment/60 hover:text-gold hover:bg-gold/5'
          }`}
          title={showGrid ? 'Ocultar grilla' : 'Mostrar grilla'}
        >
          {mapState.gridType === 'hex' ? (
            <Hexagon className="w-4 h-4" />
          ) : (
            <Grid className="w-4 h-4" />
          )}
        </button>

        {/* Toggle fog */}
        {mapState.fogOfWarEnabled && (
          <button
            onClick={() => setShowFog(!showFog)}
            className={`p-2 rounded-lg glass-panel-dark transition-colors ${
              showFog ? 'text-gold bg-gold/10' : 'text-parchment/60 hover:text-gold hover:bg-gold/5'
            }`}
            title={showFog ? 'Ocultar niebla' : 'Mostrar niebla'}
          >
            {showFog ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* UI Overlay - Controles de modo */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 glass-panel-dark rounded-lg p-1">
        <button
          onClick={() => setMode('select')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-sm transition-colors ${
            mode === 'select'
              ? 'bg-gold text-shadow font-semibold'
              : 'text-parchment hover:bg-gold/10'
          }`}
        >
          <Users className="w-4 h-4" />
          Seleccionar
        </button>
        <button
          onClick={() => setMode('move')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-sm transition-colors ${
            mode === 'move'
              ? 'bg-emerald text-white font-semibold'
              : 'text-parchment hover:bg-emerald/10'
          }`}
          disabled={!selectedToken}
        >
          <Move className="w-4 h-4" />
          Mover
        </button>
        <button
          onClick={() => setMode('attack')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-sm transition-colors ${
            mode === 'attack'
              ? 'bg-blood text-white font-semibold'
              : 'text-parchment hover:bg-blood/10'
          }`}
          disabled={!selectedToken}
        >
          <Swords className="w-4 h-4" />
          Atacar
        </button>
      </div>

      {/* UI Overlay - Controles derechos */}
      <div className="absolute top-2 right-2 flex gap-2">
        {/* Fullscreen toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-lg glass-panel-dark text-gold hover:bg-gold/10 transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Panel de información del token seleccionado */}
      {selectedToken && (
        <div className="absolute bottom-2 left-2 glass-panel-dark rounded-lg p-3 max-w-[250px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-heading text-gold text-sm">{selectedToken.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded ${
              selectedToken.type === 'player' ? 'bg-blue-500/20 text-blue-400' :
              selectedToken.type === 'ally' ? 'bg-green-500/20 text-green-400' :
              selectedToken.type === 'enemy' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {selectedToken.type}
            </span>
          </div>

          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-parchment/70 mb-1">
              <span>HP</span>
              <span>{selectedToken.hp}/{selectedToken.maxHp}</span>
            </div>
            <div className="h-2 bg-shadow rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  (selectedToken.hp / selectedToken.maxHp) > 0.66 ? 'bg-green-500' :
                  (selectedToken.hp / selectedToken.maxHp) > 0.33 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(selectedToken.hp / selectedToken.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
            <div className="bg-shadow/50 rounded p-1.5 text-center">
              <div className="text-gold">AC</div>
              <div className="text-parchment font-semibold">{selectedToken.ac}</div>
            </div>
            <div className="bg-shadow/50 rounded p-1.5 text-center">
              <div className="text-gold">Velocidad</div>
              <div className="text-parchment font-semibold">{selectedToken.speed}ft</div>
            </div>
            <div className="bg-shadow/50 rounded p-1.5 text-center">
              <div className="text-gold">Init</div>
              <div className="text-parchment font-semibold">{selectedToken.initiative || '-'}</div>
            </div>
          </div>

          {/* Conditions */}
          {selectedToken.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedToken.conditions.map((cond, i) => (
                <span
                  key={i}
                  className="text-xs px-1.5 py-0.5 bg-blood/20 text-blood rounded"
                  title={cond.description}
                >
                  {cond.icon} {cond.name}
                </span>
              ))}
            </div>
          )}

          {/* Movement remaining */}
          {mapState.inCombat && currentTurnToken?.id === selectedToken.id && (
            <div className="mt-2 pt-2 border-t border-gold/20 text-xs text-parchment/70">
              <span className="text-gold">Tu turno</span> - {selectedToken.movementRemaining}ft restantes
            </div>
          )}
        </div>
      )}

      {/* Indicador de combate */}
      {mapState.inCombat && (
        <div className="absolute bottom-2 right-2 glass-panel-dark rounded-lg p-3">
          <div className="text-xs text-gold mb-1">Ronda {mapState.currentRound}</div>
          <div className="text-sm text-parchment">
            Turno de: <span className="font-semibold text-gold">{currentTurnToken?.name || 'N/A'}</span>
          </div>
          <div className="flex gap-1 mt-2">
            {mapState.initiativeOrder.slice(0, 5).map((tokenId, i) => {
              const token = mapState.tokens.find(t => t.id === tokenId)
              if (!token) return null
              return (
                <div
                  key={tokenId}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    i === mapState.currentTurnIndex
                      ? 'bg-gold text-shadow ring-2 ring-white'
                      : 'bg-shadow-mid text-parchment/60'
                  }`}
                  title={token.name}
                >
                  {i + 1}
                </div>
              )
            })}
            {mapState.initiativeOrder.length > 5 && (
              <div className="text-xs text-parchment/50">+{mapState.initiativeOrder.length - 5}</div>
            )}
          </div>
        </div>
      )}

      {/* Botón de cerrar fullscreen */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-3 rounded-full bg-blood/80 text-parchment hover:bg-blood transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}

/**
 * Fallback de carga
 */
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-gold">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="font-ui text-sm">Cargando mapa táctico...</span>
      </div>
    </Html>
  )
}

export default TacticalCombatScene
