/**
 * Guardia anti re-narración — calibrada con las narraciones REALES de la
 * partida que generó el pedido de reembolso (2026-10-01, Zombies/PbtA):
 * el DM narró la llegada al portón 4 veces (turnos 51/53/57/61).
 */
import { describe, it, expect } from 'vitest'
import fx from '../fixtures/zombie-loop-turns.json'
import { detectRenarration, condenseNarration, opensWithArrival, renarrationRetryDirective } from '@/lib/claude/repetition-guard'

const t = fx as Record<string, string>
const inScene = { turnsInScene: 2, sceneChangeInDraft: false }

describe('detectRenarration — los 4 turnos del bucle real', () => {
  it('turno 61 repite casi literal al 53 (apertura idéntica)', () => {
    const v = detectRenarration(t.t61, [t.t51, t.t53, t.t55, t.t57, t.t59], inScene)
    expect(v.repetitive).toBe(true)
    expect(['opening', 'body', 'rearrival']).toContain(v.reason)
  })
  it('turno 57 vuelve a narrar la llegada al portón', () => {
    const v = detectRenarration(t.t57, [t.t51, t.t53, t.t55], inScene)
    expect(v.repetitive).toBe(true)
  })
  it('turno 53 re-narra la llegada ya narrada en el 51 (misma escena, sin scene_change)', () => {
    const v = detectRenarration(t.t53, [t.t49, t.t51], { turnsInScene: 1, sceneChangeInDraft: false })
    expect(v.repetitive).toBe(true)
    expect(v.reason).toBe('rearrival')
  })
  it('turno 67 repite la descripción del galpón del 65', () => {
    const v = detectRenarration(t.t67, [t.t63, t.t65], inScene)
    expect(v.repetitive).toBe(true)
  })
})

describe('detectRenarration — narraciones legítimas NO se bloquean', () => {
  it('turno 55 (Marcus reacciona) es nuevo respecto a 51/53', () => {
    const v = detectRenarration(t.t55, [t.t49, t.t51, t.t53], inScene)
    expect(v.repetitive).toBe(false)
  })
  it('turno 59 (abren las cajas) es nuevo', () => {
    const v = detectRenarration(t.t59, [t.t51, t.t53, t.t55, t.t57], inScene)
    expect(v.repetitive).toBe(false)
  })
  it('turno 65 llega al galpón CON scene_change → llegar es legítimo', () => {
    const v = detectRenarration(t.t65, [t.t59, t.t61, t.t63], { turnsInScene: 0, sceneChangeInDraft: true })
    expect(v.repetitive).toBe(false)
  })
  it('turno 51 llega al portón recién (turnsInScene 0, viene de la ruta) → legítimo', () => {
    const v = detectRenarration(t.t51, [t.t49], { turnsInScene: 0, sceneChangeInDraft: false })
    expect(v.repetitive).toBe(false)
  })
  it('sin historial previo nunca es repetitivo (salvo re-llegada)', () => {
    expect(detectRenarration('El bosque susurra. Un cuervo te mira.', [], { turnsInScene: 0, sceneChangeInDraft: false }).repetitive).toBe(false)
  })
})

describe('opensWithArrival', () => {
  it('detecta las aperturas de llegada del bucle', () => {
    expect(opensWithArrival(t.t53)).toBe(true)
    expect(opensWithArrival(t.t57)).toBe(true)
    expect(opensWithArrival(t.t61)).toBe(true)
  })
  it('no marca una reacción de NPC', () => {
    expect(opensWithArrival(t.t55)).toBe(false)
    expect(opensWithArrival(t.t63)).toBe(false)
  })
})

describe('condenseNarration — guarda la resolución, no la ambientación', () => {
  it('no empieza con la oración de llegada', () => {
    const c = condenseNarration(t.t53)
    expect(c.toLowerCase()).not.toContain('rolls through the main gate')
    expect(c.length).toBeGreaterThan(20)
  })
  it('descarta la pregunta final de gancho', () => {
    expect(condenseNarration('Abrís la puerta. Adentro hay un cofre viejo y polvoriento. ¿Qué hacés ahora?')).toBe('Abrís la puerta. Adentro hay un cofre viejo y polvoriento.')
  })
})

describe('renarrationRetryDirective', () => {
  it('cita el borrador y la acción del jugador', () => {
    const v = detectRenarration(t.t61, [t.t53], inScene)
    const d = renarrationRetryDirective(v, 'Open the padlocked crates right now', 'Base Camp — Main Gate', 3, 'en')
    expect(d).toContain('REJECTED')
    expect(d).toContain('Open the padlocked crates')
    expect(d).toContain('cargo truck rolls through')
  })
})
