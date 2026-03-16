'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Group } from 'react-konva'
import Konva from 'konva'
import { type Submap, type SubmapNode as SubmapNodeType, SUBMAP_THEMES } from '@/lib/maps/submap-types'
import { SubmapNode } from './SubmapNode'
import { SubmapConnections } from './SubmapConnections'
import { PlayerToken } from './PlayerToken'
import { SubmapBackground } from './SubmapBackground'

interface SubmapContainerProps {
  submap: Submap
  onNodeClick?: (node: SubmapNodeType) => void
  onMoveToNode?: (nodeId: string) => void
  className?: string
  showControls?: boolean
}

export function SubmapContainer({
  submap,
  onNodeClick,
  onMoveToNode,
  className = '',
  showControls = true,
}: SubmapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const theme = SUBMAP_THEMES[submap.lore]

  // Ajustar tamaño al contenedor
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Centrar el mapa inicialmente
  useEffect(() => {
    const scaleX = dimensions.width / submap.width
    const scaleY = dimensions.height / submap.height
    const newScale = Math.min(scaleX, scaleY, 1) * 0.9

    setScale(newScale)
    setPosition({
      x: (dimensions.width - submap.width * newScale) / 2,
      y: (dimensions.height - submap.height * newScale) / 2,
    })
  }, [dimensions, submap.width, submap.height])

  // Handlers de zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const oldScale = scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }

    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = Math.max(0.3, Math.min(3, oldScale + direction * 0.1))

    setScale(newScale)
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }, [scale, position])

  // Handler de drag
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    })
  }, [])

  // Handler de click en nodo
  const handleNodeClick = useCallback((node: SubmapNodeType) => {
    setSelectedNodeId(node.id)
    onNodeClick?.(node)
  }, [onNodeClick])

  // Handler para moverse a un nodo
  const handleMoveToNode = useCallback((nodeId: string) => {
    onMoveToNode?.(nodeId)
  }, [onMoveToNode])

  // Controles de zoom
  const zoomIn = () => setScale(s => Math.min(3, s + 0.2))
  const zoomOut = () => setScale(s => Math.max(0.3, s - 0.2))
  const resetView = () => {
    const scaleX = dimensions.width / submap.width
    const scaleY = dimensions.height / submap.height
    const newScale = Math.min(scaleX, scaleY, 1) * 0.9
    setScale(newScale)
    setPosition({
      x: (dimensions.width - submap.width * newScale) / 2,
      y: (dimensions.height - submap.height * newScale) / 2,
    })
  }

  // Encontrar nodo del jugador
  const playerNode = submap.nodes.find(n => n.id === submap.playerNodeId)

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden rounded-lg border-2 border-gold ${className}`}
      style={{ backgroundColor: theme.colors.node + '10' }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        draggable
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          {/* Fondo del submapa */}
          <SubmapBackground
            width={submap.width}
            height={submap.height}
            lore={submap.lore}
            type={submap.type}
          />

          {/* Conexiones entre nodos */}
          <SubmapConnections
            connections={submap.connections}
            nodes={submap.nodes}
            theme={theme}
          />

          {/* Nodos */}
          <Group>
            {submap.nodes.map(node => (
              <SubmapNode
                key={node.id}
                node={node}
                theme={theme}
                isHovered={hoveredNodeId === node.id}
                isSelected={selectedNodeId === node.id}
                isPlayerHere={submap.playerNodeId === node.id}
                onHover={setHoveredNodeId}
                onClick={handleNodeClick}
                onDoubleClick={handleMoveToNode}
              />
            ))}
          </Group>

          {/* Token del jugador */}
          {playerNode && (
            <PlayerToken
              x={playerNode.x + playerNode.width / 2}
              y={playerNode.y + playerNode.height / 2}
              lore={submap.lore}
            />
          )}
        </Layer>
      </Stage>

      {/* Controles */}
      {showControls && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={zoomIn}
            className="w-10 h-10 bg-shadow-mid border border-gold rounded-lg text-gold-bright hover:bg-shadow flex items-center justify-center transition-colors"
            title="Acercar"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 bg-shadow-mid border border-gold rounded-lg text-gold-bright hover:bg-shadow flex items-center justify-center transition-colors"
            title="Alejar"
          >
            -
          </button>
          <button
            onClick={resetView}
            className="w-10 h-10 bg-shadow-mid border border-gold rounded-lg text-gold-bright hover:bg-shadow flex items-center justify-center transition-colors text-xs"
            title="Centrar"
          >
            ⊙
          </button>
        </div>
      )}

      {/* Info del nodo seleccionado - arriba a la izquierda */}
      {selectedNodeId && (
        <SelectedNodeInfo
          node={submap.nodes.find(n => n.id === selectedNodeId)}
          canMove={submap.playerNodeId !== selectedNodeId}
          onMove={() => handleMoveToNode(selectedNodeId)}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  )
}

// Componente de info del nodo seleccionado
function SelectedNodeInfo({
  node,
  canMove,
  onMove,
  onClose,
}: {
  node?: SubmapNodeType
  canMove: boolean
  onMove: () => void
  onClose: () => void
}) {
  if (!node) return null

  return (
    <div className="absolute top-4 left-4 bg-shadow/95 border-2 border-gold rounded-lg p-3 max-w-[220px] shadow-xl">
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="text-gold-bright font-heading text-sm leading-tight">{node.name}</h4>
        <button
          onClick={onClose}
          className="text-parchment/50 hover:text-parchment text-lg leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>
      <p className="text-parchment/80 text-xs mb-2 leading-relaxed">{node.description}</p>
      <div className="flex flex-wrap items-center gap-1 text-xs text-parchment/60 mb-2">
        <span className="capitalize bg-shadow-mid px-1.5 py-0.5 rounded">{node.type.replace('_', ' ')}</span>
        {node.isEntrance && <span className="text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">Entrada</span>}
        {node.isObjective && <span className="text-yellow-400 bg-yellow-900/30 px-1.5 py-0.5 rounded">Objetivo</span>}
      </div>
      {canMove && node.discovered && (
        <button
          onClick={onMove}
          className="w-full py-1.5 bg-gold text-shadow font-heading text-xs rounded hover:bg-gold-bright transition-colors"
        >
          Ir aquí
        </button>
      )}
    </div>
  )
}
