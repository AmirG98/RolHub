// @vitest-environment node
/**
 * Cierre de capítulo antes del paywall. Motivación: los primeros 4 jugadores
 * que agotaron los 25 turnos gratis fueron cortados en mitad de una escena y
 * ninguno pagó. El DM tiene que cerrar la historia en el último turno.
 */
import { describe, it, expect } from 'vitest'
import { FREE_TRIAL_TURNS, trialTurnsRemainingAfter } from '@/lib/plans/check-access'
import { trialWindDownDirective, WIND_DOWN_TURNS } from '@/lib/claude/trial-winddown'

describe('trialTurnsRemainingAfter', () => {
  it('cuenta los turnos que quedan DESPUÉS del actual', () => {
    expect(trialTurnsRemainingAfter(0)).toBe(FREE_TRIAL_TURNS - 1)
    expect(trialTurnsRemainingAfter(19)).toBe(5) // jugando el turno 20 → quedan 5
    expect(trialTurnsRemainingAfter(24)).toBe(0) // jugando el 25 → es el último
  })

  it('nunca es negativo (users que ya pasaron el límite)', () => {
    expect(trialTurnsRemainingAfter(25)).toBe(0)
    expect(trialTurnsRemainingAfter(999)).toBe(0)
  })
})

describe('trialWindDownDirective', () => {
  it('no inyecta nada cuando no aplica (PRO/guest) ni lejos del final', () => {
    expect(trialWindDownDirective(null, 'en')).toBe('')
    expect(trialWindDownDirective(WIND_DOWN_TURNS + 1, 'en')).toBe('')
    expect(trialWindDownDirective(10, 'es')).toBe('')
  })

  it('en los últimos turnos pide cerrar la escena sin abrir cosas nuevas', () => {
    const en = trialWindDownDirective(3, 'en')
    expect(en).toContain('3 free turn(s) left')
    expect(en).toMatch(/Do NOT start new combat/)
    const es = trialWindDownDirective(1, 'es')
    expect(es).toContain('1 turno(s) gratis')
    expect(es).toMatch(/NO inicies combates/)
  })

  it('en el último turno cierra el capítulo: sin dados, sin combate, sin cliffhanger', () => {
    const en = trialWindDownDirective(0, 'en')
    expect(en).toMatch(/LAST free turn/)
    expect(en).toMatch(/Do NOT request a dice roll/)
    expect(en).toMatch(/Do NOT trigger combat/)
    expect(en).toMatch(/NOT an open cliffhanger/)
    const es = trialWindDownDirective(0, 'es')
    expect(es).toMatch(/ÚLTIMO turno gratis/)
    expect(es).toMatch(/NO pidas tirada/)
  })
})
