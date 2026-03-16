'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'
import {
  type BattleMap,
  type BattleToken,
  type BattleState,
  createBattleMap,
  createToken,
  calculateDistance,
  CONDITION_ICONS,
} from '@/lib/maps/battle-types'

const BattleGrid = dynamic(
  () => import('./BattleGrid').then(mod => mod.BattleGrid),
  { ssr: false, loading: () => <BattleLoading /> }
)

interface BattlePanelProps {
  lore: Lore
  initialTokens?: BattleToken[]
  onBattleEnd?: (result: 'victory' | 'defeat' | 'flee') => void
  className?: string
  defaultCollapsed?: boolean
}

export function BattlePanel({
  lore,
  initialTokens = [],
  onBattleEnd,
  className = '',
  defaultCollapsed = false,
}: BattlePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>()
  const [gridType, setGridType] = useState<'square' | 'hex'>('square')

  // Estado de batalla
  const [battleState, setBattleState] = useState<BattleState>({
    round: 1,
    currentTurnIndex: 0,
    initiativeOrder: [],
    isActive: false,
    turnPhase: 'movement',
  })

  // Crear mapa de batalla
  const [battleMap, setBattleMap] = useState<BattleMap>(() => {
    const map = createBattleMap('Batalla', 15, 12, gridType, lore)
    // Agregar tokens iniciales si los hay
    if (initialTokens.length > 0) {
      map.tokens = initialTokens
    } else {
      // Tokens de ejemplo
      map.tokens = [
        createToken('Héroe', 'player', 2, 5, 25, 30),
        createToken('Aliado', 'ally', 3, 5, 18, 20),
        createToken('Goblin 1', 'enemy', 10, 4, 7, 7),
        createToken('Goblin 2', 'enemy', 11, 5, 7, 7),
        createToken('Ogro', 'enemy', 12, 6, 45, 45),
      ]
    }
    return map
  })

  const config = getMapConfig(lore)

  // Token seleccionado
  const selectedToken = battleMap.tokens.find(t => t.id === selectedTokenId)

  // Manejar movimiento de token
  const handleTokenMove = (tokenId: string, x: number, y: number) => {
    setBattleMap(prev => ({
      ...prev,
      tokens: prev.tokens.map(t =>
        t.id === tokenId ? { ...t, x, y, hasMoved: true } : t
      ),
    }))
  }

  // Manejar selección de token
  const handleTokenSelect = (token: BattleToken | null) => {
    setSelectedTokenId(token?.id)
  }

  // Iniciar combate
  const startCombate = () => {
    // Ordenar por iniciativa (simplificado: aleatorio + modificador por tipo)
    const order = [...battleMap.tokens]
      .map(t => ({
        id: t.id,
        initiative: Math.floor(Math.random() * 20) + 1 + (t.type === 'player' ? 2 : 0),
      }))
      .sort((a, b) => b.initiative - a.initiative)
      .map(t => t.id)

    setBattleState({
      round: 1,
      currentTurnIndex: 0,
      initiativeOrder: order,
      isActive: true,
      turnPhase: 'movement',
    })

    // Actualizar iniciativas en tokens
    setBattleMap(prev => ({
      ...prev,
      tokens: prev.tokens.map(t => {
        const orderEntry = order.indexOf(t.id)
        return {
          ...t,
          initiative: 20 - orderEntry,
          hasMoved: false,
          hasActed: false,
        }
      }),
    }))
  }

  // Pasar turno
  const nextTurn = () => {
    setBattleState(prev => {
      const nextIndex = prev.currentTurnIndex + 1
      if (nextIndex >= prev.initiativeOrder.length) {
        // Nueva ronda
        return {
          ...prev,
          round: prev.round + 1,
          currentTurnIndex: 0,
          turnPhase: 'movement',
        }
      }
      return {
        ...prev,
        currentTurnIndex: nextIndex,
        turnPhase: 'movement',
      }
    })

    // Resetear acciones del siguiente token
    const nextTokenId = battleState.initiativeOrder[
      (battleState.currentTurnIndex + 1) % battleState.initiativeOrder.length
    ]
    setBattleMap(prev => ({
      ...prev,
      tokens: prev.tokens.map(t =>
        t.id === nextTokenId ? { ...t, hasMoved: false, hasActed: false } : t
      ),
    }))
  }

  // Aplicar daño
  const applyDamage = (tokenId: string, damage: number) => {
    setBattleMap(prev => ({
      ...prev,
      tokens: prev.tokens.map(t =>
        t.id === tokenId ? { ...t, hp: Math.max(0, t.hp - damage) } : t
      ),
    }))
  }

  // Curar
  const applyHeal = (tokenId: string, amount: number) => {
    setBattleMap(prev => ({
      ...prev,
      tokens: prev.tokens.map(t =>
        t.id === tokenId ? { ...t, hp: Math.min(t.maxHp, t.hp + amount) } : t
      ),
    }))
  }

  // Token del turno actual
  const currentTurnToken = battleState.isActive
    ? battleMap.tokens.find(t => t.id === battleState.initiativeOrder[battleState.currentTurnIndex])
    : null

  const panelStyle: React.CSSProperties = {
    backgroundColor: config.backgroundColor,
    borderColor: config.primaryColor,
    fontFamily: config.fontFamily,
  }

  const buttonStyle: React.CSSProperties = {
    backgroundColor: config.secondaryColor,
    color: config.textColor,
    border: `1px solid ${config.primaryColor}`,
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 left-4 z-40 px-4 py-2 rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
        style={buttonStyle}
      >
        <span className="text-lg">⚔️</span>
        <span>Abrir Batalla</span>
      </button>
    )
  }

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50'
    : `relative ${className}`

  return (
    <div
      className={`${containerClass} rounded-lg border-2 shadow-xl overflow-hidden`}
      style={panelStyle}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: config.primaryColor }}
      >
        <h3
          className="font-bold text-sm flex items-center gap-2"
          style={{ fontFamily: config.titleFontFamily, color: config.textColor }}
        >
          <span>⚔️</span>
          <span>Campo de Batalla</span>
          {battleState.isActive && (
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
              Ronda {battleState.round}
            </span>
          )}
        </h3>

        <div className="flex items-center gap-1">
          {/* Toggle grid type */}
          <button
            onClick={() => {
              const newType = gridType === 'square' ? 'hex' : 'square'
              setGridType(newType)
              setBattleMap(prev => ({ ...prev, gridType: newType }))
            }}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
            title={`Cambiar a grid ${gridType === 'square' ? 'hexagonal' : 'cuadrado'}`}
          >
            {gridType === 'square' ? '⬡' : '▢'}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
          >
            {isFullscreen ? '⊙' : '⛶'}
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className={`flex ${isFullscreen ? 'h-[calc(100vh-48px)]' : 'h-[500px]'}`}>
        {/* Grid de batalla */}
        <div className="flex-1">
          <BattleGrid
            battleMap={battleMap}
            selectedTokenId={selectedTokenId}
            onTokenMove={handleTokenMove}
            onTokenSelect={handleTokenSelect}
            className="w-full h-full"
          />
        </div>

        {/* Panel lateral */}
        <div
          className="w-64 border-l p-3 overflow-y-auto flex flex-col gap-3"
          style={{ borderColor: config.primaryColor, backgroundColor: config.secondaryColor }}
        >
          {/* Controles de combate */}
          <div className="space-y-2">
            {!battleState.isActive ? (
              <button
                onClick={startCombate}
                className="w-full py-2 rounded font-bold hover:brightness-110 transition-all"
                style={{ backgroundColor: config.dangerColor, color: '#FFFFFF' }}
              >
                ⚔️ Iniciar Combate
              </button>
            ) : (
              <>
                <div
                  className="p-2 rounded text-center"
                  style={{ backgroundColor: config.backgroundColor }}
                >
                  <div className="text-xs opacity-70" style={{ color: config.textColor }}>
                    Turno de:
                  </div>
                  <div className="font-bold" style={{ color: currentTurnToken?.color }}>
                    {currentTurnToken?.name || 'Ninguno'}
                  </div>
                </div>
                <button
                  onClick={nextTurn}
                  className="w-full py-2 rounded font-bold hover:brightness-110 transition-all"
                  style={{ backgroundColor: config.accentColor, color: config.backgroundColor }}
                >
                  ⏭️ Siguiente Turno
                </button>
              </>
            )}
          </div>

          {/* Orden de iniciativa */}
          {battleState.isActive && (
            <div>
              <h4 className="text-xs font-bold mb-2" style={{ color: config.textColor }}>
                Iniciativa
              </h4>
              <div className="space-y-1">
                {battleState.initiativeOrder.map((tokenId, index) => {
                  const token = battleMap.tokens.find(t => t.id === tokenId)
                  if (!token) return null
                  const isCurrent = index === battleState.currentTurnIndex
                  return (
                    <div
                      key={tokenId}
                      className={`flex items-center gap-2 p-1 rounded text-xs`}
                      style={{
                        backgroundColor: config.backgroundColor,
                        color: config.textColor,
                        boxShadow: isCurrent ? `0 0 0 2px ${config.accentColor}` : 'none',
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: token.color }}
                      />
                      <span className={token.hp <= 0 ? 'line-through opacity-50' : ''}>
                        {token.name}
                      </span>
                      <span className="ml-auto opacity-70">
                        {token.hp}/{token.maxHp}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Info del token seleccionado */}
          {selectedToken && (
            <div
              className="p-2 rounded space-y-2"
              style={{ backgroundColor: config.backgroundColor }}
            >
              <h4
                className="font-bold flex items-center gap-2"
                style={{ color: selectedToken.color }}
              >
                {selectedToken.name}
                <span className="text-xs opacity-70 capitalize">
                  ({selectedToken.type})
                </span>
              </h4>

              {/* HP */}
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: config.textColor }}>
                  <span>HP</span>
                  <span>{selectedToken.hp}/{selectedToken.maxHp}</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(selectedToken.hp / selectedToken.maxHp) * 100}%`,
                      backgroundColor: selectedToken.hp > selectedToken.maxHp * 0.5
                        ? '#4CAF50'
                        : selectedToken.hp > selectedToken.maxHp * 0.25
                          ? '#FF9800'
                          : '#F44336',
                    }}
                  />
                </div>
              </div>

              {/* Condiciones */}
              {selectedToken.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedToken.conditions.map(cond => (
                    <span
                      key={cond}
                      className="text-xs px-1 py-0.5 rounded"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {CONDITION_ICONS[cond] || '⚡'} {cond}
                    </span>
                  ))}
                </div>
              )}

              {/* Acciones rápidas */}
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const damage = parseInt(prompt('Daño:') || '0', 10)
                    if (damage > 0) applyDamage(selectedToken.id, damage)
                  }}
                  className="flex-1 py-1 rounded text-xs hover:brightness-110"
                  style={{ backgroundColor: '#F44336', color: '#FFFFFF' }}
                >
                  Daño
                </button>
                <button
                  onClick={() => {
                    const heal = parseInt(prompt('Curación:') || '0', 10)
                    if (heal > 0) applyHeal(selectedToken.id, heal)
                  }}
                  className="flex-1 py-1 rounded text-xs hover:brightness-110"
                  style={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
                >
                  Curar
                </button>
              </div>
            </div>
          )}

          {/* Resumen de combate */}
          <div
            className="mt-auto p-2 rounded text-xs"
            style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
          >
            <div className="grid grid-cols-2 gap-1">
              <span>Aliados:</span>
              <span>
                {battleMap.tokens.filter(t => (t.type === 'player' || t.type === 'ally') && t.hp > 0).length}
                /{battleMap.tokens.filter(t => t.type === 'player' || t.type === 'ally').length}
              </span>
              <span>Enemigos:</span>
              <span>
                {battleMap.tokens.filter(t => t.type === 'enemy' && t.hp > 0).length}
                /{battleMap.tokens.filter(t => t.type === 'enemy').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BattleLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-shadow">
      <div className="text-center text-gold animate-pulse">
        <div className="text-4xl mb-2">⚔️</div>
        <p className="text-sm">Preparando batalla...</p>
      </div>
    </div>
  )
}
