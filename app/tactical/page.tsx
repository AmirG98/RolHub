'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { generateTacticalMap, generateDemoMap } from '@/lib/tactical/map-generator'
import { TacticalMapState, GridCoord, GridType } from '@/lib/tactical/types'
import { Swords, Map, Settings, Dice1, RefreshCw, Grid, Hexagon } from 'lucide-react'

// Importar TacticalCombatScene dinámicamente (Three.js requiere cliente)
const DynamicTacticalCombatScene = dynamic(
  () => import('@/components/tactical/TacticalCombatScene').then(mod => mod.TacticalCombatScene),
  {
    ssr: false,
    loading: () => <TacticalLoading />,
  }
)

function TacticalLoading() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-shadow-mid rounded-lg border-2 border-gold">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">⚔️</div>
        <p className="text-gold-bright font-heading text-lg">Cargando combate táctico...</p>
        <p className="text-parchment/70 text-sm mt-1">Preparando el campo de batalla</p>
      </div>
    </div>
  )
}

const MAP_TYPES = [
  { id: 'dungeon', name: 'Mazmorra', icon: '🏰', description: 'Pasillos y habitaciones de piedra' },
  { id: 'forest', name: 'Bosque', icon: '🌲', description: 'Claros y vegetación densa' },
  { id: 'castle', name: 'Castillo', icon: '🏯', description: 'Torres y patios' },
  { id: 'cavern', name: 'Caverna', icon: '🕳️', description: 'Cuevas orgánicas y oscuras' },
  { id: 'arena', name: 'Arena', icon: '🏟️', description: 'Campo de combate circular' },
] as const

const DIFFICULTIES = [
  { id: 'easy', name: 'Fácil', enemies: '2 enemigos' },
  { id: 'medium', name: 'Media', enemies: '4 enemigos' },
  { id: 'hard', name: 'Difícil', enemies: '6 enemigos + jefe' },
] as const

export default function TacticalPage() {
  const [mapState, setMapState] = useState<TacticalMapState | null>(null)
  const [mounted, setMounted] = useState(false)

  // Configuración del mapa
  const [mapType, setMapType] = useState<'dungeon' | 'forest' | 'castle' | 'cavern' | 'arena'>('dungeon')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [gridType, setGridType] = useState<GridType>('square')
  const [mapWidth, setMapWidth] = useState(20)
  const [mapHeight, setMapHeight] = useState(15)
  const [showSettings, setShowSettings] = useState(false)

  // IDs de tokens del jugador (para fog of war)
  const playerTokenIds = useMemo(() => {
    return mapState?.tokens.filter(t => t.type === 'player').map(t => t.id) || []
  }, [mapState])

  useEffect(() => {
    setMounted(true)
    // Generar mapa inicial
    regenerateMap()
  }, [])

  const regenerateMap = () => {
    const newMap = generateTacticalMap({
      width: mapWidth,
      height: mapHeight,
      gridType,
      type: mapType,
      difficulty,
      includeTokens: true,
      includeFogOfWar: true,
      includeInteractives: true,
      includeEffects: difficulty === 'hard',
    })
    setMapState(newMap)
  }

  // Handlers de interacción
  const handleTokenClick = (tokenId: string) => {
    console.log('Token clicked:', tokenId)
  }

  const handleCellClick = (coord: GridCoord) => {
    console.log('Cell clicked:', coord)
  }

  const handleElementInteract = (elementId: string) => {
    if (!mapState) return

    // Actualizar estado del elemento
    setMapState(prev => {
      if (!prev) return null

      const updatedElements = prev.interactiveElements.map(el => {
        if (el.id !== elementId) return el

        switch (el.type) {
          case 'door':
          case 'secret_door':
            // Toggle puerta
            if (el.state === 'locked') {
              // Intentar abrir (simulación)
              return { ...el, state: 'closed' as const }
            }
            return { ...el, state: el.state === 'open' ? 'closed' as const : 'open' as const }

          case 'chest':
            if (el.state === 'locked') {
              return { ...el, state: 'closed' as const }
            }
            return { ...el, state: 'open' as const }

          case 'lever':
            return { ...el, state: el.state === 'open' ? 'closed' as const : 'open' as const }

          case 'trap':
          case 'pressure_plate':
            if (el.state === 'hidden') {
              return { ...el, state: 'triggered' as const, hidden: false }
            }
            return { ...el, state: 'disarmed' as const }

          case 'portal':
            return { ...el, state: el.state === 'open' ? 'closed' as const : 'open' as const }

          default:
            return el
        }
      })

      return { ...prev, interactiveElements: updatedElements }
    })
  }

  const handleMoveToken = (tokenId: string, to: GridCoord) => {
    if (!mapState) return

    setMapState(prev => {
      if (!prev) return null

      const updatedTokens = prev.tokens.map(token => {
        if (token.id !== tokenId) return token

        // Calcular movimiento restante (simplificado)
        const dx = Math.abs(to.x - token.x)
        const dy = Math.abs(to.y - token.y)
        const distance = Math.max(dx, dy) * 5 // Diagonal = 5ft

        return {
          ...token,
          x: to.x,
          y: to.y,
          movementRemaining: Math.max(0, token.movementRemaining - distance),
          hasMovedThisTurn: true,
        }
      })

      return { ...prev, tokens: updatedTokens }
    })
  }

  return (
    <div className="min-h-screen bg-shadow p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-title text-gold-bright flex items-center gap-3">
              <Swords className="w-8 h-8" />
              Sistema de Combate Táctico
            </h1>
            <p className="text-parchment/70 mt-1">
              Mapas tácticos estilo D&D / Foundry VTT con grillas, tokens y fog of war
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg border transition-colors ${
                showSettings
                  ? 'bg-gold text-shadow border-gold-bright'
                  : 'bg-shadow-mid text-parchment border-gold-dim hover:border-gold'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={regenerateMap}
              className="flex items-center gap-2 px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerar
            </button>
          </div>
        </div>

        {/* Panel de configuración */}
        {showSettings && (
          <div className="mb-6 bg-shadow-mid rounded-lg border border-gold-dim p-4">
            <h3 className="font-heading text-gold mb-4">Configuración del Mapa</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tipo de mapa */}
              <div>
                <label className="text-parchment/70 text-sm mb-2 block">Tipo de Mapa</label>
                <div className="grid grid-cols-2 gap-2">
                  {MAP_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setMapType(type.id)}
                      className={`p-2 rounded border text-left transition-colors ${
                        mapType === type.id
                          ? 'bg-gold/20 border-gold text-gold'
                          : 'bg-shadow border-gold-dim/50 text-parchment/80 hover:border-gold-dim'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-xs block mt-1">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dificultad */}
              <div>
                <label className="text-parchment/70 text-sm mb-2 block">Dificultad</label>
                <div className="space-y-2">
                  {DIFFICULTIES.map(diff => (
                    <button
                      key={diff.id}
                      onClick={() => setDifficulty(diff.id)}
                      className={`w-full p-2 rounded border text-left transition-colors ${
                        difficulty === diff.id
                          ? 'bg-gold/20 border-gold text-gold'
                          : 'bg-shadow border-gold-dim/50 text-parchment/80 hover:border-gold-dim'
                      }`}
                    >
                      <span className="font-heading">{diff.name}</span>
                      <span className="text-xs block text-parchment/50">{diff.enemies}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de grilla */}
              <div>
                <label className="text-parchment/70 text-sm mb-2 block">Tipo de Grilla</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGridType('square')}
                    className={`flex-1 p-3 rounded border flex flex-col items-center gap-1 transition-colors ${
                      gridType === 'square'
                        ? 'bg-gold/20 border-gold text-gold'
                        : 'bg-shadow border-gold-dim/50 text-parchment/80 hover:border-gold-dim'
                    }`}
                  >
                    <Grid className="w-6 h-6" />
                    <span className="text-xs">Cuadrada</span>
                  </button>
                  <button
                    onClick={() => setGridType('hex')}
                    className={`flex-1 p-3 rounded border flex flex-col items-center gap-1 transition-colors ${
                      gridType === 'hex'
                        ? 'bg-gold/20 border-gold text-gold'
                        : 'bg-shadow border-gold-dim/50 text-parchment/80 hover:border-gold-dim'
                    }`}
                  >
                    <Hexagon className="w-6 h-6" />
                    <span className="text-xs">Hexagonal</span>
                  </button>
                </div>
              </div>

              {/* Tamaño */}
              <div>
                <label className="text-parchment/70 text-sm mb-2 block">Tamaño del Mapa</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-parchment/50 text-xs w-12">Ancho:</span>
                    <input
                      type="range"
                      min="10"
                      max="30"
                      value={mapWidth}
                      onChange={(e) => setMapWidth(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-parchment w-8 text-center">{mapWidth}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-parchment/50 text-xs w-12">Alto:</span>
                    <input
                      type="range"
                      min="10"
                      max="25"
                      value={mapHeight}
                      onChange={(e) => setMapHeight(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-parchment w-8 text-center">{mapHeight}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gold-dim/30">
              <button
                onClick={regenerateMap}
                className="w-full py-2 bg-gold text-shadow rounded font-heading hover:bg-gold-bright transition-colors"
              >
                Aplicar y Regenerar Mapa
              </button>
            </div>
          </div>
        )}

        {/* Mapa táctico */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {mounted && mapState ? (
              <DynamicTacticalCombatScene
                mapState={mapState}
                playerTokenIds={playerTokenIds}
                isDM={true}
                onTokenClick={handleTokenClick}
                onCellClick={handleCellClick}
                onElementInteract={handleElementInteract}
                onMoveToken={handleMoveToken}
                className="h-[600px]"
              />
            ) : (
              <TacticalLoading />
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">
            {/* Info del mapa */}
            {mapState && (
              <div className="bg-shadow-mid rounded-lg border border-gold-dim p-4">
                <h3 className="font-heading text-gold mb-3">{mapState.name}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-parchment/70">
                    <span>Tamaño:</span>
                    <span className="text-parchment">{mapState.gridWidth}x{mapState.gridHeight}</span>
                  </div>
                  <div className="flex justify-between text-parchment/70">
                    <span>Grilla:</span>
                    <span className="text-parchment capitalize">{mapState.gridType}</span>
                  </div>
                  <div className="flex justify-between text-parchment/70">
                    <span>Luz global:</span>
                    <span className="text-parchment capitalize">{mapState.globalLight}</span>
                  </div>
                  <div className="flex justify-between text-parchment/70">
                    <span>Tokens:</span>
                    <span className="text-parchment">{mapState.tokens.length}</span>
                  </div>
                  <div className="flex justify-between text-parchment/70">
                    <span>Elementos:</span>
                    <span className="text-parchment">{mapState.interactiveElements.length}</span>
                  </div>
                </div>

                {mapState.inCombat && (
                  <div className="mt-3 pt-3 border-t border-gold-dim/30">
                    <div className="text-xs text-gold mb-2">En Combate - Ronda {mapState.currentRound}</div>
                    <div className="space-y-1">
                      {mapState.initiativeOrder.slice(0, 5).map((tokenId, i) => {
                        const token = mapState.tokens.find(t => t.id === tokenId)
                        if (!token) return null
                        return (
                          <div
                            key={tokenId}
                            className={`text-xs flex items-center justify-between px-2 py-1 rounded ${
                              i === mapState.currentTurnIndex
                                ? 'bg-gold/20 text-gold'
                                : 'text-parchment/70'
                            }`}
                          >
                            <span>{i + 1}. {token.name}</span>
                            <span>{token.initiative}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Leyenda de terrenos */}
            <div className="bg-shadow-mid rounded-lg border border-gold-dim p-4">
              <h3 className="font-heading text-gold mb-3">Leyenda</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#2a2a2a]" />
                  <span className="text-parchment/70">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#5a5a5a]" />
                  <span className="text-parchment/70">Muro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#4a3a2a]" />
                  <span className="text-parchment/70">Difícil</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#1a3a5a]" />
                  <span className="text-parchment/70">Agua</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#1a3a1a]" />
                  <span className="text-parchment/70">Bosque</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#3a3a3a]" />
                  <span className="text-parchment/70">Elevado</span>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="bg-shadow-mid rounded-lg border border-gold-dim p-4">
              <h3 className="font-heading text-gold mb-3">Controles</h3>
              <ul className="text-xs text-parchment/70 space-y-2">
                <li className="flex gap-2">
                  <span>🖱️</span>
                  <span><strong className="text-gold">Click + Arrastrar:</strong> Rotar cámara</span>
                </li>
                <li className="flex gap-2">
                  <span>🔍</span>
                  <span><strong className="text-gold">Scroll:</strong> Zoom</span>
                </li>
                <li className="flex gap-2">
                  <span>👆</span>
                  <span><strong className="text-gold">Click derecho + Arrastrar:</strong> Pan</span>
                </li>
                <li className="flex gap-2">
                  <span>🎯</span>
                  <span><strong className="text-gold">Click en token:</strong> Seleccionar</span>
                </li>
                <li className="flex gap-2">
                  <span>🚪</span>
                  <span><strong className="text-gold">Click en elemento:</strong> Interactuar</span>
                </li>
              </ul>
            </div>

            {/* Características */}
            <div className="bg-shadow-mid rounded-lg border border-gold-dim p-4">
              <h3 className="font-heading text-gold mb-3">Características</h3>
              <ul className="text-xs text-parchment/70 space-y-1">
                <li>✅ Grilla cuadrada y hexagonal</li>
                <li>✅ Tokens con HP, AC, condiciones</li>
                <li>✅ Terrenos con efectos mecánicos</li>
                <li>✅ Fog of War dinámico</li>
                <li>✅ Indicadores de movimiento</li>
                <li>✅ Efectos de área (AoE)</li>
                <li>✅ Elementos interactivos</li>
                <li>✅ Sistema de iniciativa</li>
                <li>✅ Línea de visión</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
