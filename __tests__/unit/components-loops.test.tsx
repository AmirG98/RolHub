// @vitest-environment jsdom
/**
 * Tests de regresión para los loops infinitos de render detectados el
 * 2026-07-05 ("Maximum update depth exceeded" en la sala de juego):
 *
 * 1. InventoryPanel: prevInventoryRef solo se actualizaba cuando NO había
 *    items nuevos → los mismos items se re-detectaban en cada render y
 *    setNewItems entraba en loop infinito.
 * 2. TypewriterText: el efecto de animación dependía de onComplete/onUpdate;
 *    con callbacks inline del padre (identidad nueva por render) el efecto
 *    se reiniciaba constantemente.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import React from 'react'
import { InventoryPanel } from '@/components/game/InventoryPanel'
import { TypewriterText } from '@/components/ui/TypewriterText'

describe('InventoryPanel — detección de items nuevos sin loop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza con inventario inicial sin "Maximum update depth exceeded"', () => {
    // Con el bug, este render solo ya explotaba: el efecto detectaba todos
    // los items como nuevos, setNewItems disparaba re-render, y la ref nunca
    // se actualizaba → loop infinito.
    expect(() => {
      render(<InventoryPanel inventory={['Espada élfica', 'Poción de vida']} />)
    }).not.toThrow()
  })

  it('sobrevive re-renders del padre con arrays de identidad nueva (mismo contenido)', () => {
    const { rerender } = render(<InventoryPanel inventory={['Espada élfica']} />)
    // Simula el patrón real de GameSession: `inventory={... || []}` crea un
    // array nuevo en cada render del padre.
    expect(() => {
      for (let i = 0; i < 20; i++) {
        rerender(<InventoryPanel inventory={['Espada élfica']} />)
      }
    }).not.toThrow()
  })

  it('resalta items nuevos y apaga el highlight a los 3 segundos', () => {
    const { rerender, getByText } = render(<InventoryPanel inventory={['Espada élfica']} />)
    act(() => {
      vi.advanceTimersByTime(4000) // apagar highlight del mount inicial
    })

    rerender(<InventoryPanel inventory={['Espada élfica', 'Escudo de roble']} />)
    const newItem = getByText('Escudo de roble').closest('div')
    expect(newItem?.className).toContain('bg-emerald/20')

    act(() => {
      vi.advanceTimersByTime(3100)
    })
    const afterTimeout = getByText('Escudo de roble').closest('div')
    expect(afterTimeout?.className).not.toContain('bg-emerald/20')
  })

  it('muestra items agrupados con contador', () => {
    const { getByText } = render(
      <InventoryPanel inventory={['Flecha', 'Flecha', 'Flecha']} />
    )
    expect(getByText('Flecha')).toBeTruthy()
    expect(getByText('x3')).toBeTruthy()
  })
})

describe('TypewriterText — animación estable con callbacks inline', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('completa el tipeo aunque el padre re-renderice con callbacks nuevos en cada render', () => {
    const onComplete = vi.fn()
    const text = 'Hola aventurero'

    const { rerender, container } = render(
      <TypewriterText text={text} onComplete={() => onComplete()} onUpdate={() => {}} />
    )

    // Simula un padre que re-renderiza seguido pasando arrows inline
    // (identidad nueva por render) mientras la animación avanza.
    expect(() => {
      for (let i = 0; i < 30; i++) {
        act(() => {
          vi.advanceTimersByTime(50)
        })
        rerender(
          <TypewriterText text={text} onComplete={() => onComplete()} onUpdate={() => {}} />
        )
      }
      // Tiempo de sobra para terminar el texto completo
      act(() => {
        vi.advanceTimersByTime(10000)
      })
    }).not.toThrow()

    expect(container.textContent).toContain(text)
    expect(onComplete).toHaveBeenCalled()
  })

  it('usa la última versión del callback onComplete (refs actualizadas)', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<TypewriterText text="Ok" onComplete={first} />)
    // El padre cambia el callback antes de que termine el tipeo
    rerender(<TypewriterText text="Ok" onComplete={second} />)
    // Dos pasos: el primero dispara startDelay (efecto isStarted necesita un
    // flush de React para agendar la animación), el segundo corre el tipeo.
    act(() => {
      vi.advanceTimersByTime(50)
    })
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(second).toHaveBeenCalled()
    expect(first).not.toHaveBeenCalled()
  })
})
