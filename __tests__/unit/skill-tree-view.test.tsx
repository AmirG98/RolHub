// @vitest-environment jsdom
/**
 * Tests del SkillTreeView completo: monta el árbol semilla real y verifica
 * que dibuja las conexiones SVG entre nodos y sus prerequisitos.
 * jsdom no hace layout, así que mockeamos getBoundingClientRect.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import React from 'react'
import { SkillTreeView } from '@/components/skills/SkillTreeView'
import seedTree from '@/data/skill-trees/dnd-classic/guild-adventurer.json'

// Posiciones falsas: cada nodo en una fila según su tier (jsdom devuelve 0s por defecto)
function mockLayout() {
  let counter = 0
  const positions = new Map<string, number>()
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const nodeId = this.getAttribute?.('data-node-id')
    if (nodeId) {
      if (!positions.has(nodeId)) positions.set(nodeId, counter++)
      const idx = positions.get(nodeId)!
      return { left: idx * 100, top: idx * 80, width: 176, height: 100, right: idx * 100 + 176, bottom: idx * 80 + 100, x: idx * 100, y: idx * 80, toJSON: () => {} } as DOMRect
    }
    // container
    return { left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} } as DOMRect
  }
  // ResizeObserver no existe en jsdom
  ;(global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

function makeNodes() {
  return (seedTree.nodes as any[]).map((n, i) => ({
    ...n,
    status: i === 0 ? 'learned' : i === 3 ? 'learned' : i === 1 ? 'unlockable' : 'locked',
    conditionMet: true,
    missingRequires: [],
  }))
}

describe('SkillTreeView', () => {
  beforeEach(() => {
    mockLayout()
  })

  it('renderiza los 9 nodos del árbol semilla', () => {
    const { container } = render(
      <SkillTreeView treeName={seedTree.name} nodes={makeNodes()} locale="es" onLearn={async () => {}} />
    )
    expect(container.querySelectorAll('[data-node-id]')).toHaveLength(9)
  })

  it('renderiza el título del árbol', () => {
    const { getByText } = render(
      <SkillTreeView treeName={seedTree.name} nodes={makeNodes()} locale="es" onLearn={async () => {}} />
    )
    expect(getByText('Senda del Veterano')).toBeTruthy()
  })

  it('dibuja líneas SVG de conexión entre nodos con requires', () => {
    const { container } = render(
      <SkillTreeView treeName={seedTree.name} nodes={makeNodes()} locale="es" onLearn={async () => {}} />
    )
    // Tras el layout effect, debe haber una línea por cada (nodo, require)
    act(() => {})
    const lines = container.querySelectorAll('svg line')
    // El árbol semilla tiene 8 relaciones de requires (todos los nodos tier>1)
    const expectedEdges = (seedTree.nodes as any[]).reduce((acc, n) => acc + (n.requires?.length || 0), 0)
    expect(lines.length).toBe(expectedEdges)
    expect(expectedEdges).toBeGreaterThan(0)
  })

  it('agrupa los nodos en 4 tiers (filas)', () => {
    const { container } = render(
      <SkillTreeView treeName={seedTree.name} nodes={makeNodes()} locale="es" onLearn={async () => {}} />
    )
    // 4 filas de tiers (el div con flex-wrap por tier)
    const tierRows = container.querySelectorAll('.flex.flex-wrap')
    expect(tierRows.length).toBe(4)
  })

  it('llama onLearn al clickear Aprender en un nodo unlockable', async () => {
    const onLearn = vi.fn().mockResolvedValue(undefined)
    const { getByText } = render(
      <SkillTreeView treeName={seedTree.name} nodes={makeNodes()} locale="es" onLearn={onLearn} />
    )
    await act(async () => {
      getByText('Aprender').click()
    })
    expect(onLearn).toHaveBeenCalled()
  })
})
