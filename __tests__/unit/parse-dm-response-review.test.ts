// @vitest-environment node
/**
 * Regresiones encontradas por el code review del rediseño del parser
 * (2026-09-10). Cada caso tenía una repro verificada contra el parser anterior.
 */
import { describe, it, expect } from 'vitest'
import { parseDMResponse, findStructuredBlocks, extractEmbeddedJson } from '@/lib/claude/parse-dm-response'

const FENCED_DICE = '```json\n{\n  "dice_request": {"reason": "Climb", "formula": "1d20", "type": "skill", "difficulty": 12, "stat": "exploration"}\n}\n```'

describe('llaves sueltas en la prosa', () => {
  it('una "{" sin cerrar NO borra el resto del turno ni pierde la tirada', () => {
    const raw = `The sign reads {Oldford Inn — est. 402. Three paragraphs of prose follow here.\n\nAnd more prose.\n\n${FENCED_DICE}`
    const r = parseDMResponse<{ dice_request?: { formula: string } }>(raw)
    expect(r.data.narration).toContain('Oldford Inn')
    expect(r.data.narration).toContain('And more prose.')
    expect(r.data.narration).not.toContain('dice_request')
    expect(r.data.dice_request?.formula).toBe('1d20')
  })

  it('"{sigh}" y diálogo con llaves se preservan', () => {
    const r = parseDMResponse('The rune {glows} and the guard says "Halt!" {sigh}\n\n' + FENCED_DICE)
    expect(r.data.narration).toContain('{glows}')
    expect(r.data.narration).toContain('{sigh}')
    expect(r.data.narration).not.toContain('"dice_request"')
  })
})

describe('objeto raíz + bloque aparte', () => {
  it('un root válido seguido de un ```json con más campos los recupera', () => {
    const raw = `{"narration": "You approach the gate.", "suggested_actions": ["a", "b"]}\n${FENCED_DICE}`
    const r = parseDMResponse<{ dice_request?: { formula: string }; suggested_actions?: string[] }>(raw)
    expect(r.fullParse).toBe(true)
    expect(r.data.narration).toBe('You approach the gate.')
    expect(r.data.suggested_actions).toEqual(['a', 'b'])
    expect(r.data.dice_request?.formula).toBe('1d20')
    expect(r.recoveredKeys).toEqual(['dice_request'])
  })

  it('prosa con llaves ANTES de un DMResponse completo en fence: recupera todo', () => {
    const raw = 'She whispers {softly}.\n```json\n{"narration": "You enter the hall.", "dice_request": {"reason": "x", "formula": "1d20", "type": "skill", "difficulty": 10, "stat": "social"}, "suggested_actions": ["a","b","c"]}\n```'
    const r = parseDMResponse<{ dice_request?: { formula: string }; suggested_actions?: string[] }>(raw)
    expect(r.data.narration).toBe('You enter the hall.')
    expect(r.data.dice_request?.formula).toBe('1d20')
    expect(r.data.suggested_actions).toEqual(['a', 'b', 'c'])
  })
})

describe('defaults del template no pisan valores reales', () => {
  it('hp_change 0 en raíz + -5 en bloque embebido → -5', () => {
    const raw = JSON.stringify({
      narration: 'The blade bites.\n```json\n{"hp_change": -5, "hp_reason": "cut"}\n```',
      hp_change: 0,
      hp_reason: null,
      suggested_actions: [],
    }) + '\n```json\n{"suggested_actions": ["Run", "Fight"]}\n```'
    const r = parseDMResponse<{ hp_change?: number; hp_reason?: string; suggested_actions?: string[] }>(raw)
    expect(r.data.hp_change).toBe(-5)
    expect(r.data.hp_reason).toBe('cut')
    expect(r.data.suggested_actions).toEqual(['Run', 'Fight'])
    expect(r.data.narration).toBe('The blade bites.')
  })

  it('un valor real en raíz NO se pisa por uno embebido', () => {
    const raw = JSON.stringify({ narration: 'x {"hp_change": -9}', hp_change: -2 })
    expect(parseDMResponse<{ hp_change?: number }>(raw).data.hp_change).toBe(-2)
  })
})

describe('campos recuperados se validan contra el schema', () => {
  it('quest_create sin objectives se descarta (antes rompía el turno con TypeError)', () => {
    const raw = 'Prose.\n```json\n{"quest_create": {"title": "Find the relic"}}\n```'
    const r = parseDMResponse<{ quest_create?: unknown }>(raw)
    expect(r.data.quest_create).toBeUndefined()
    expect(r.recoveredKeys).toEqual([])
    expect(r.data.narration).toBe('Prose.')
  })

  it('campos desconocidos no se mezclan', () => {
    const raw = 'Prose.\n```json\n{"dice_request": {"reason": "x", "formula": "1d20", "type": "skill", "difficulty": 10, "stat": "social"}, "evil_field": 1}\n```'
    const r = parseDMResponse<{ evil_field?: unknown }>(raw)
    expect(r.data.evil_field).toBeUndefined()
  })
})

describe('campos del schema que la lista manual no tenía', () => {
  it('world_flag / time_update en fence sin etiqueta: no se muestran y se recuperan', () => {
    const raw = 'Prose.\n```\n{"world_flag": {"flag": "gate_open", "value": true}, "time_update": "dusk"}\n```\n\nMore prose.'
    const r = parseDMResponse<{ world_flag?: { flag: string }; time_update?: string }>(raw)
    expect(r.data.narration).toBe('Prose.\n\nMore prose.')
    expect(r.data.world_flag?.flag).toBe('gate_open')
    expect(r.data.time_update).toBe('dusk')
  })
})

describe('fences de una línea y narration como array', () => {
  it('```BEWARE THE MARSH``` conserva el texto', () => {
    const r = parseDMResponse('You read the sign.\n```BEWARE THE MARSH```\nThen you move on.')
    expect(r.data.narration).toContain('BEWARE THE MARSH')
    expect(r.data.narration).not.toContain('`')
  })

  it('narration como array de párrafos se une, sin mostrar JSON', () => {
    const raw = JSON.stringify({ narration: ['The wind howls.', 'You step forward.'], suggested_actions: ['a', 'b'] })
    const r = parseDMResponse<{ suggested_actions?: string[] }>(raw)
    expect(r.fullParse).toBe(true)
    expect(r.data.narration).toBe('The wind howls.\n\nYou step forward.')
    expect(r.data.suggested_actions).toEqual(['a', 'b'])
  })
})

describe('nunca JSON crudo', () => {
  it('root truncado con narration después de otro campo: salva el texto, no el JSON', () => {
    const raw = '{"dice_request": {"formula": "1d20"}, "narration": "The door creaks open and'
    const r = parseDMResponse(raw)
    expect(r.data.narration).toBe('The door creaks open and')
  })

  it('solo un bloque ```json sin prosa → narración vacía (el turn route reintenta), no el fence', () => {
    const r = parseDMResponse<{ dice_request?: unknown }>(FENCED_DICE)
    expect(r.data.narration).toBe('')
    expect(r.data.dice_request).toBeDefined()
  })

  it('objeto raíz con narration null y sin nada más → cadena vacía', () => {
    expect(parseDMResponse('{"narration": null, "hp_change": 0}').data.narration).toBe('')
  })
})

describe('findStructuredBlocks: truncado solo al final y solo si empieza como JSON', () => {
  it('detecta el JSON truncado de la cola', () => {
    const b = findStructuredBlocks('prose\n{ "suggested_actions": ["a", "b"')
    expect(b).toHaveLength(1)
    expect(b[0].truncated).toBe(true)
  })
  it('una llave suelta de prosa al final no es un bloque', () => {
    expect(findStructuredBlocks('the sign reads {Oldford Inn')).toHaveLength(0)
  })
  it('extractEmbeddedJson conserva la prosa alrededor', () => {
    expect(extractEmbeddedJson('a {"x": 1} b').text).toBe('a {"x": 1} b')
  })
})
