'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { type MapLocation, type Lore } from '@/lib/maps/map-config'
import { type Submap, type SubmapNode, stringToSeed } from '@/lib/maps/submap-types'
import { generateSubmap } from '@/lib/maps/generators'
import { SubmapContainer } from './SubmapContainer'

interface SubmapRouterProps {
  location: MapLocation
  lore: Lore
  isOpen: boolean
  onClose: () => void
  onPlayerMove?: (nodeId: string) => void
  className?: string
}

export function SubmapRouter({
  location,
  lore,
  isOpen,
  onClose,
  onPlayerMove,
  className = '',
}: SubmapRouterProps) {
  const [playerNodeId, setPlayerNodeId] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<SubmapNode | null>(null)

  // Generar el submapa (memorizado para consistencia)
  const submap = useMemo<Submap>(() => {
    const seed = stringToSeed(`${location.id}-${lore}`)
    const generated = generateSubmap(location, { lore, seed })

    // Establecer posición inicial del jugador si no está definida
    if (!playerNodeId) {
      setPlayerNodeId(generated.entrance)
    }

    return {
      ...generated,
      playerNodeId: playerNodeId || generated.entrance,
    }
  }, [location, lore, playerNodeId])

  // Handler para click en nodo
  const handleNodeClick = useCallback((node: SubmapNode) => {
    setSelectedNode(node)
  }, [])

  // Handler para mover al jugador
  const handleMoveToNode = useCallback((nodeId: string) => {
    const targetNode = submap.nodes.find(n => n.id === nodeId)
    if (!targetNode) return

    // Verificar que el nodo esté descubierto y conectado al actual
    const currentNode = submap.nodes.find(n => n.id === submap.playerNodeId)
    if (!currentNode) return

    // Solo permitir movimiento a nodos adyacentes o descubiertos
    const canMove = targetNode.discovered && (
      currentNode.connections.includes(nodeId) ||
      targetNode.connections.includes(currentNode.id)
    )

    if (canMove) {
      setPlayerNodeId(nodeId)
      onPlayerMove?.(nodeId)

      // Marcar nodo como visitado y descubrir adyacentes
      targetNode.visited = true
      targetNode.connections.forEach(connId => {
        const connNode = submap.nodes.find(n => n.id === connId)
        if (connNode) connNode.discovered = true
      })
    }
  }, [submap, onPlayerMove])

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 ${className}`}>
      <div className="relative w-[90vw] max-w-4xl h-[80vh] bg-shadow-mid rounded-xl border-2 border-gold overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-shadow/90 border-b border-gold">
          <div>
            <h2 className="text-gold-bright font-heading text-lg">{location.name}</h2>
            <p className="text-parchment/70 text-sm">{location.description.slice(0, 60)}...</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-parchment hover:text-gold-bright text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Contenido del submapa */}
        <div className="absolute top-16 bottom-0 left-0 right-0">
          <SubmapContainer
            submap={submap}
            onNodeClick={handleNodeClick}
            onMoveToNode={handleMoveToNode}
            showControls={true}
          />
        </div>

        {/* Leyenda compacta - abajo derecha */}
        <div className="absolute bottom-16 right-4 bg-shadow/90 border border-gold/50 rounded-lg p-2">
          <div className="flex items-center gap-3 text-xs text-parchment/70">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span>Entrada</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span>Objetivo</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-bright"></span>
              <span>Tú</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente simplificado para uso inline (sin modal)
interface SubmapInlineProps {
  location: MapLocation
  lore: Lore
  onNodeClick?: (node: SubmapNode) => void
  onPlayerMove?: (nodeId: string) => void
  className?: string
  height?: string
}

export function SubmapInline({
  location,
  lore,
  onNodeClick,
  onPlayerMove,
  className = '',
  height = '400px',
}: SubmapInlineProps) {
  const [playerNodeId, setPlayerNodeId] = useState<string | null>(null)

  // Generar el submapa
  const submap = useMemo<Submap>(() => {
    const seed = stringToSeed(`${location.id}-${lore}`)
    const generated = generateSubmap(location, { lore, seed })

    return {
      ...generated,
      playerNodeId: playerNodeId || generated.entrance,
    }
  }, [location, lore, playerNodeId])

  // Handler para mover al jugador
  const handleMoveToNode = useCallback((nodeId: string) => {
    setPlayerNodeId(nodeId)
    onPlayerMove?.(nodeId)
  }, [onPlayerMove])

  return (
    <div className={`${className}`} style={{ height }}>
      <SubmapContainer
        submap={submap}
        onNodeClick={onNodeClick}
        onMoveToNode={handleMoveToNode}
        showControls={true}
      />
    </div>
  )
}
