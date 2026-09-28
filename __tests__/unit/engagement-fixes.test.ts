/**
 * Regresiones de los fixes de engagement (2026-09-28):
 * - el summarizer no corría nunca (total de turnos siempre impar)
 * - la apertura devuelve acciones específicas de la escena en JSON
 */
import { describe, it, expect } from 'vitest'
import { shouldTriggerSummary } from '@/lib/claude/session-summarizer'
import { parseOpeningJson } from '@/lib/claude/opening-turn'

describe('shouldTriggerSummary — total de turnos siempre impar', () => {
  it('con la política vieja (% 10) nunca disparaba: verificamos que ahora sí', () => {
    // apertura (1) + N pares → totales 21, 23, ..., 41
    const totals = Array.from({ length: 30 }, (_, i) => 21 + i * 2)
    const fired = totals.filter(shouldTriggerSummary)
    expect(fired).toEqual([21, 31, 41, 51, 61, 71]) // una vez por decena, nunca dos
  })
  it('dispara exactamente una vez por decena a partir de 20', () => {
    expect(shouldTriggerSummary(19)).toBe(false)
    expect(shouldTriggerSummary(21)).toBe(true) // 19 → 21 cruza el 20
    expect(shouldTriggerSummary(23)).toBe(false)
    expect(shouldTriggerSummary(29)).toBe(false)
    expect(shouldTriggerSummary(31)).toBe(true)
    expect(shouldTriggerSummary(30)).toBe(true) // por si algún día el total es par
    expect(shouldTriggerSummary(32)).toBe(false)
  })
})

describe('parseOpeningJson — apertura con acciones específicas', () => {
  it('parsea narración + 3 acciones', () => {
    const r = parseOpeningJson('{"narration":"The tavern reeks of ale.","actions":["Ask the barkeep about the caravan","Check the notice board","Confront the hooded stranger"]}')
    expect(r?.narration).toBe('The tavern reeks of ale.')
    expect(r?.actions).toHaveLength(3)
  })
  it('tolera fences y texto alrededor', () => {
    const r = parseOpeningJson('Here you go:\n```json\n{"narration":"Rain.","actions":["a","b","c"]}\n```')
    expect(r?.narration).toBe('Rain.')
    expect(r?.actions).toEqual(['a', 'b', 'c'])
  })
  it('devuelve null sin JSON (el caller usa el texto crudo + genéricas)', () => {
    expect(parseOpeningJson('Just prose, no json.')).toBeNull()
  })
  it('descarta acciones no-string y recorta a 3', () => {
    const r = parseOpeningJson('{"narration":"x","actions":["a",2,"b","c","d"]}')
    expect(r?.actions).toEqual(['a', 'b', 'c'])
  })
})
