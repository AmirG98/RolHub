'use client'

import { useState, useRef, useLayoutEffect, useCallback } from 'react'
import { SkillNodeCard, type SkillNodeCardData } from './SkillNodeCard'
import { getLocalized } from '@/lib/i18n/localize'

interface Props {
  treeName: unknown
  nodes: SkillNodeCardData[]
  locale: 'es' | 'en'
  teaser?: boolean
  onLearn?: (nodeId: string) => Promise<void>
}

// Agrupa los nodos por tier (1..4) preservando orden
function groupByTier(nodes: SkillNodeCardData[]): SkillNodeCardData[][] {
  const tiers: SkillNodeCardData[][] = [[], [], [], []]
  for (const n of nodes) {
    const t = Math.min(Math.max(n.tier, 1), 4) - 1
    tiers[t].push(n)
  }
  return tiers.filter((t) => t.length > 0)
}

export function SkillTreeView({ treeName, nodes, locale, teaser = false, onLearn }: Props) {
  const [learningId, setLearningId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; learned: boolean }>>([])

  const tiers = groupByTier(nodes)
  const learnedSet = new Set(nodes.filter((n) => n.status === 'learned').map((n) => n.id))

  // Calcula las líneas de conexión entre cada nodo y sus requires,
  // usando las posiciones reales del DOM (robusto a wrapping/resize).
  const recomputeEdges = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const cardEl = (id: string) =>
      container.querySelector<HTMLElement>(`[data-node-id="${id}"]`)

    const next: typeof edges = []
    for (const node of nodes) {
      const childEl = cardEl(node.id)
      if (!childEl) continue
      const c = childEl.getBoundingClientRect()
      for (const reqId of nodeRequires(node.id, nodes)) {
        const parentEl = cardEl(reqId)
        if (!parentEl) continue
        const p = parentEl.getBoundingClientRect()
        next.push({
          x1: p.left + p.width / 2 - rect.left,
          y1: p.bottom - rect.top,
          x2: c.left + c.width / 2 - rect.left,
          y2: c.top - rect.top,
          learned: learnedSet.has(reqId) && learnedSet.has(node.id),
        })
      }
    }
    setEdges(next)
  }, [nodes])

  useLayoutEffect(() => {
    recomputeEdges()
    const ro = new ResizeObserver(recomputeEdges)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', recomputeEdges)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recomputeEdges)
    }
  }, [recomputeEdges])

  const handleLearn = async (nodeId: string) => {
    if (!onLearn || learningId) return
    setLearningId(nodeId)
    try {
      await onLearn(nodeId)
    } finally {
      setLearningId(null)
    }
  }

  return (
    <div>
      <h2 className="font-title text-2xl text-gold text-center mb-6">
        {getLocalized(treeName as any, locale)}
      </h2>

      <div ref={containerRef} className="relative">
        {/* SVG de conexiones — debajo de las cards */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={e.learned ? 'var(--color-gold-bright, #F5C842)' : 'var(--color-gold-dim, #8B6914)'}
              strokeWidth={e.learned ? 2 : 1}
              strokeDasharray={e.learned ? '0' : '4 3'}
              opacity={e.learned ? 0.9 : 0.4}
            />
          ))}
        </svg>

        {/* Tiers como filas */}
        <div className="relative flex flex-col gap-10" style={{ zIndex: 1 }}>
          {tiers.map((tierNodes, ti) => (
            <div key={ti} className="flex flex-wrap justify-center gap-4">
              {tierNodes.map((node) => (
                <SkillNodeCard
                  key={node.id}
                  node={node}
                  locale={locale}
                  learning={learningId === node.id}
                  onLearn={handleLearn}
                  teaser={teaser}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// requires de un nodo por id (busca en la lista completa)
function nodeRequires(nodeId: string, nodes: SkillNodeCardData[]): string[] {
  const node = nodes.find((n) => n.id === nodeId)
  return (node as any)?.requires ?? []
}
