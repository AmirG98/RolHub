/**
 * Tests del parseo robusto de la respuesta del DM.
 * Regresión: JSON truncado (max_tokens) filtraba el JSON crudo al jugador.
 */
import { describe, it, expect } from 'vitest'
import { parseDMResponse, extractNarrationField } from '@/lib/claude/parse-dm-response'

describe('parseDMResponse — caso feliz', () => {
  it('parsea JSON completo y marca fullParse=true', () => {
    const raw = JSON.stringify({
      narration: 'La niebla se disipa.',
      character_name: 'Aldric',
      hp_change: 0,
      suggested_actions: ['a', 'b'],
    })
    const r = parseDMResponse(raw)
    expect(r.fullParse).toBe(true)
    expect(r.data.narration).toBe('La niebla se disipa.')
    expect((r.data as any).suggested_actions).toEqual(['a', 'b'])
  })

  it('ignora texto antes/después del JSON', () => {
    const raw = 'Acá va: {"narration":"Hola"} — fin'
    expect(parseDMResponse(raw).data.narration).toBe('Hola')
  })
})

describe('parseDMResponse — JSON truncado (el bug del screenshot)', () => {
  // Réplica del caso real: narración larga con diálogos escapados + corte a la mitad
  const TRUNCATED = `{"narration":"A weathered woman crouches near the cook fire.\\n\\n**Vera:** \\"You're the military one, right? Sit down.\\"\\n\\nShe goes back to stirring, like she's already accepted whatever answer you give.","character_name":"asdsad","hp_change":0,"hp_reason":null,"new_item":null,"remove_item":null,"quest_c`

  it('NO devuelve el JSON crudo como narración', () => {
    const r = parseDMResponse(TRUNCATED)
    expect(r.data.narration).not.toContain('character_name')
    expect(r.data.narration).not.toContain('hp_change')
    expect(r.data.narration).not.toContain('"narration"')
  })

  it('extrae la narración limpia con saltos y comillas desescapadas', () => {
    const r = parseDMResponse(TRUNCATED)
    expect(r.fullParse).toBe(false)
    expect(r.data.narration).toContain('A weathered woman crouches near the cook fire')
    expect(r.data.narration).toContain('You\'re the military one')
    expect(r.data.narration).toContain('\n\n') // saltos reales, no literales \n
    expect(r.data.narration).not.toContain('\\n') // sin \n literales
  })

  it('preserva el diálogo con comillas del NPC', () => {
    const r = parseDMResponse(TRUNCATED)
    expect(r.data.narration).toContain('"You\'re the military one, right? Sit down."')
  })
})

describe('extractNarrationField', () => {
  it('extrae narration con comillas escapadas internas', () => {
    const raw = '{"narration":"Dice \\"hola\\" y se va.","hp_change":0}'
    expect(extractNarrationField(raw)).toBe('Dice "hola" y se va.')
  })

  it('devuelve null si no hay campo narration', () => {
    expect(extractNarrationField('{"hp_change":0}')).toBeNull()
  })

  it('maneja narration como el último campo antes del truncado', () => {
    const raw = '{"narration":"Texto que se corta acá'
    // sin comilla de cierre → no matchea el campo completo → null (cae a stripJsonArtifacts)
    expect(extractNarrationField(raw)).toBeNull()
  })
})

describe('parseDMResponse — degradación total', () => {
  it('sin JSON válido, limpia artefactos y no rompe', () => {
    const r = parseDMResponse('{"narration":"Texto sin cierre de comilla y sin llave')
    expect(r.fullParse).toBe(false)
    expect(r.data.narration).toContain('Texto sin cierre')
    expect(r.data.narration).not.toContain('"narration"')
  })

  it('texto plano sin JSON pasa tal cual', () => {
    const r = parseDMResponse('Solo texto narrativo sin JSON.')
    expect(r.data.narration).toBe('Solo texto narrativo sin JSON.')
  })
})

describe('stripEmbeddedJson — JSON embebido en la narración (bug del screenshot)', () => {
  it('quita un dice_request embebido con fence ```json', async () => {
    const { parseDMResponse } = await import('@/lib/claude/parse-dm-response')
    // Caso real: el DM metió el dice_request dentro de narration con fence
    const raw = JSON.stringify({
      narration: 'Beredin te mira intently. ```json { "dice_request": { "reason": "Social", "formula": "1d20+2", "type": "social" } }``` **¿Qué hacés?**',
      suggested_actions: ['a', 'b'],
    })
    const r = parseDMResponse(raw)
    expect(r.data.narration).not.toContain('dice_request')
    expect(r.data.narration).not.toContain('```')
    expect(r.data.narration).not.toContain('{')
    expect(r.data.narration).toContain('Beredin te mira')
    expect(r.data.narration).toContain('¿Qué hacés?')
  })

  it('quita un objeto JSON estructurado sin fence', async () => {
    const { stripEmbeddedJson } = await import('@/lib/claude/parse-dm-response')
    const narr = 'El mercader habla. {"combat_trigger": {"enemies": []}} Y sigue la escena.'
    const out = stripEmbeddedJson(narr)
    expect(out).not.toContain('combat_trigger')
    expect(out).toContain('El mercader habla')
    expect(out).toContain('Y sigue la escena')
  })

  it('NO toca objetos JSON que no son campos del DMResponse (ej: diálogo con llaves)', async () => {
    const { stripEmbeddedJson } = await import('@/lib/claude/parse-dm-response')
    const narr = 'El sabio dice: "el ritual necesita { luna llena }".'
    // no tiene keys estructuradas → se preserva
    expect(stripEmbeddedJson(narr)).toContain('luna llena')
  })

  it('narración limpia pasa sin cambios', async () => {
    const { stripEmbeddedJson } = await import('@/lib/claude/parse-dm-response')
    const narr = 'El sol despunta sobre Vado Viejo. Beredin te saluda.'
    expect(stripEmbeddedJson(narr)).toBe(narr)
  })
})
