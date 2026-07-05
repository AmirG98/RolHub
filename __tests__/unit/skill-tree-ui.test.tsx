// @vitest-environment jsdom
/**
 * Tests de la UI del árbol de habilidades: render de estados, gating visual,
 * y que el botón "Aprender" solo aparece en nodos unlockable (no en teaser).
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { SkillNodeCard, type SkillNodeCardData } from '@/components/skills/SkillNodeCard'

function makeNode(overrides: Partial<SkillNodeCardData> = {}): SkillNodeCardData {
  return {
    id: 'battle-cry',
    name: { es: 'Grito de Batalla', en: 'Battle Cry' },
    description: { es: 'Intimidás a tus enemigos', en: 'You intimidate your foes' },
    kind: 'trick',
    icon: 'zap',
    tier: 1,
    resource: 'daily_uses',
    maxUses: 2,
    unlock: { type: 'combats_won', count: 1 },
    status: 'unlockable',
    conditionMet: true,
    missingRequires: [],
    ...overrides,
  }
}

describe('SkillNodeCard', () => {
  it('muestra el nombre localizado según el locale', () => {
    const { getByText, rerender } = render(
      <SkillNodeCard node={makeNode()} locale="es" learning={false} onLearn={() => {}} />
    )
    expect(getByText('Grito de Batalla')).toBeTruthy()
    rerender(<SkillNodeCard node={makeNode()} locale="en" learning={false} onLearn={() => {}} />)
    expect(getByText('Battle Cry')).toBeTruthy()
  })

  it('unlockable: muestra botón Aprender y dispara onLearn', () => {
    const onLearn = vi.fn()
    const { getByText } = render(
      <SkillNodeCard node={makeNode({ status: 'unlockable' })} locale="es" learning={false} onLearn={onLearn} />
    )
    const btn = getByText('Aprender')
    btn.click()
    expect(onLearn).toHaveBeenCalledWith('battle-cry')
  })

  it('learned: sin botón Aprender', () => {
    const { queryByText } = render(
      <SkillNodeCard node={makeNode({ status: 'learned' })} locale="es" learning={false} onLearn={() => {}} />
    )
    expect(queryByText('Aprender')).toBeNull()
  })

  it('locked con condición no cumplida: muestra el hint de la condición', () => {
    const { getByText } = render(
      <SkillNodeCard
        node={makeNode({ status: 'locked', conditionMet: false, unlock: { type: 'combats_won', count: 3 } })}
        locale="es"
        learning={false}
        onLearn={() => {}}
      />
    )
    expect(getByText(/Ganá 3 combates/)).toBeTruthy()
  })

  it('locked con condición cumplida pero requires faltantes: muestra "Requiere previa"', () => {
    const { getByText } = render(
      <SkillNodeCard
        node={makeNode({ tier: 2, status: 'locked', conditionMet: true, missingRequires: ['battle-cry'] })}
        locale="es"
        learning={false}
        onLearn={() => {}}
      />
    )
    expect(getByText(/Requiere previa/)).toBeTruthy()
  })

  it('teaser: aunque sea unlockable, no muestra botón Aprender (gating de guest)', () => {
    const { queryByText } = render(
      <SkillNodeCard node={makeNode({ status: 'unlockable' })} locale="es" learning={false} onLearn={() => {}} teaser />
    )
    expect(queryByText('Aprender')).toBeNull()
  })

  it('learning: el botón queda deshabilitado', () => {
    const { getByText } = render(
      <SkillNodeCard node={makeNode({ status: 'unlockable' })} locale="es" learning={true} onLearn={() => {}} />
    )
    expect((getByText('…') as HTMLButtonElement).disabled).toBe(true)
  })
})
