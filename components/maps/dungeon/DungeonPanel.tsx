'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { type Lore, getMapConfig } from '@/lib/maps/map-config'
import { generateDungeon, type DungeonMap, type DungeonRoom } from '@/lib/maps/dungeon-generator'

const DungeonRenderer = dynamic(
  () => import('./DungeonRenderer').then(mod => mod.DungeonRenderer),
  { ssr: false, loading: () => <DungeonLoading /> }
)

interface DungeonPanelProps {
  lore: Lore
  level?: number
  seed?: number
  onRoomEnter?: (room: DungeonRoom) => void
  className?: string
  defaultCollapsed?: boolean
}

export function DungeonPanel({
  lore,
  level = 1,
  seed,
  onRoomEnter,
  className = '',
  defaultCollapsed = false,
}: DungeonPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentRoomId, setCurrentRoomId] = useState<string | undefined>()
  const [selectedRoom, setSelectedRoom] = useState<DungeonRoom | null>(null)
  const [dungeonSeed, setDungeonSeed] = useState(seed ?? Math.floor(Math.random() * 1000000))

  const config = getMapConfig(lore)

  // Generar dungeon con memo para evitar regeneración
  const dungeon = useMemo(() => {
    const d = generateDungeon(lore, level, dungeonSeed)
    // Marcar entrada como habitación actual inicial
    setCurrentRoomId(d.entrance)
    return d
  }, [lore, level, dungeonSeed])

  const handleRoomClick = (room: DungeonRoom) => {
    setSelectedRoom(room)

    // Si la habitación está conectada a la actual, permitir movimiento
    const currentRoom = dungeon.rooms.find(r => r.id === currentRoomId)
    if (currentRoom?.connections.includes(room.id) || room.id === currentRoomId) {
      setCurrentRoomId(room.id)
      // Marcar como visitada y descubrir habitaciones conectadas
      room.visited = true
      room.discovered = true
      room.connections.forEach(connId => {
        const connRoom = dungeon.rooms.find(r => r.id === connId)
        if (connRoom) connRoom.discovered = true
      })
      onRoomEnter?.(room)
    }
  }

  const handleRegenerate = () => {
    setDungeonSeed(Math.floor(Math.random() * 1000000))
    setSelectedRoom(null)
  }

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
        <span className="text-lg">🏰</span>
        <span>Abrir Dungeon</span>
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
          <span>🏰</span>
          <span>Dungeon Nivel {level}</span>
          <span className="text-xs opacity-60">Seed: {dungeonSeed}</span>
        </h3>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRegenerate}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
            title="Regenerar dungeon"
          >
            🔄
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? '⊙' : '⛶'}
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded text-xs hover:brightness-110 transition-all"
            style={buttonStyle}
            title="Minimizar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className={`flex ${isFullscreen ? 'h-[calc(100vh-48px)]' : 'h-96'}`}>
        {/* Mapa del dungeon */}
        <div className="flex-1">
          <DungeonRenderer
            dungeon={dungeon}
            currentRoomId={currentRoomId}
            onRoomClick={handleRoomClick}
            onRoomHover={setSelectedRoom}
            width={isFullscreen ? window.innerWidth - 300 : undefined}
            height={isFullscreen ? window.innerHeight - 48 : 384}
            className="w-full h-full"
          />
        </div>

        {/* Panel lateral de información */}
        {selectedRoom && (
          <div
            className="w-64 border-l p-3 overflow-y-auto"
            style={{ borderColor: config.primaryColor, backgroundColor: config.secondaryColor }}
          >
            <h4
              className="font-bold mb-2 capitalize"
              style={{ color: config.textColor }}
            >
              {selectedRoom.type}
            </h4>

            <p
              className="text-sm mb-3"
              style={{ color: config.textColor, opacity: 0.8 }}
            >
              {selectedRoom.content.description}
            </p>

            {/* Enemigos */}
            {selectedRoom.content.enemies && selectedRoom.content.enemies.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-bold mb-1" style={{ color: config.dangerColor }}>
                  Enemigos
                </h5>
                {selectedRoom.content.enemies.map(enemy => (
                  <div
                    key={enemy.id}
                    className={`text-xs p-1 rounded mb-1 ${enemy.defeated ? 'opacity-50 line-through' : ''}`}
                    style={{ backgroundColor: config.backgroundColor }}
                  >
                    {enemy.name} (Nv.{enemy.level}) - HP: {enemy.hp}
                  </div>
                ))}
              </div>
            )}

            {/* Tesoros */}
            {selectedRoom.content.treasure && selectedRoom.content.treasure.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-bold mb-1" style={{ color: '#FFD700' }}>
                  Tesoros
                </h5>
                {selectedRoom.content.treasure.map(treasure => (
                  <div
                    key={treasure.id}
                    className={`text-xs p-1 rounded mb-1 ${treasure.collected ? 'opacity-50 line-through' : ''}`}
                    style={{ backgroundColor: config.backgroundColor }}
                  >
                    {treasure.name} ({treasure.value}g)
                  </div>
                ))}
              </div>
            )}

            {/* Trampa */}
            {selectedRoom.content.trap && (
              <div className="mb-3">
                <h5 className="text-xs font-bold mb-1" style={{ color: '#FF4500' }}>
                  Trampa
                </h5>
                <div
                  className={`text-xs p-1 rounded ${selectedRoom.content.trap.disarmed ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: config.backgroundColor }}
                >
                  {selectedRoom.content.trap.type}
                  {!selectedRoom.content.trap.disarmed && ` (Daño: ${selectedRoom.content.trap.damage})`}
                  {selectedRoom.content.trap.disarmed && ' [Desarmada]'}
                </div>
              </div>
            )}

            {/* Puzzle */}
            {selectedRoom.content.puzzle && (
              <div className="mb-3">
                <h5 className="text-xs font-bold mb-1" style={{ color: config.accentColor }}>
                  Puzzle
                </h5>
                <div
                  className={`text-xs p-1 rounded ${selectedRoom.content.puzzle.solved ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: config.backgroundColor }}
                >
                  {selectedRoom.content.puzzle.description}
                  {selectedRoom.content.puzzle.solved && ' [Resuelto]'}
                </div>
              </div>
            )}

            {/* Botón de acción */}
            {selectedRoom.discovered && (
              <button
                onClick={() => handleRoomClick(selectedRoom)}
                className="w-full py-2 rounded text-sm font-bold hover:brightness-110 transition-all"
                style={{ backgroundColor: config.accentColor, color: config.backgroundColor }}
                disabled={currentRoomId === selectedRoom.id}
              >
                {currentRoomId === selectedRoom.id ? 'Estás aquí' : 'Ir a esta habitación'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t text-xs"
        style={{ borderColor: config.primaryColor, color: config.textColor }}
      >
        <span>Habitaciones: {dungeon.rooms.length}</span>
        <span>Descubiertas: {dungeon.rooms.filter(r => r.discovered).length}</span>
        <span>Visitadas: {dungeon.rooms.filter(r => r.visited).length}</span>
        <span>Enemigos restantes: {countRemainingEnemies(dungeon)}</span>
      </div>
    </div>
  )
}

function countRemainingEnemies(dungeon: DungeonMap): number {
  return dungeon.rooms.reduce((total, room) => {
    if (room.content.enemies) {
      return total + room.content.enemies.filter(e => !e.defeated).length
    }
    return total
  }, 0)
}

function DungeonLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-shadow">
      <div className="text-center text-gold animate-pulse">
        <div className="text-4xl mb-2">🏰</div>
        <p className="text-sm">Generando dungeon...</p>
      </div>
    </div>
  )
}
