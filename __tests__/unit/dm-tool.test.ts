// @vitest-environment node
/**
 * Salida estructurada del DM por tool use: el schema que se manda a la API
 * tiene que ser el MISMO contrato que valida dmResponseSchema, y el route
 * tiene que poder leer el bloque tool_use (o caer al texto si no está).
 */
import { describe, it, expect } from 'vitest'
import { dmTurnTool, DM_TOOL_CHOICE, DM_TOOL_NAME, dmRawFromMessage } from '@/lib/claude/dm-tool'
import { dmResponseSchema } from '@/lib/validation/dm-response.schema'
import { parseDMResponse } from '@/lib/claude/parse-dm-response'
import type Anthropic from '@anthropic-ai/sdk'

const toolBlock = (name: string, input: Record<string, unknown>): Anthropic.ToolUseBlock => ({
  type: 'tool_use', id: 'tu_1', name, input, caller: { type: 'direct' },
})

type Schema = { type?: string; properties?: Record<string, unknown>; required?: string[]; $schema?: string }

describe('dmTurnTool.input_schema', () => {
  const schema = dmTurnTool.input_schema as Schema

  it('es un objeto cuyo único campo obligatorio es narration', () => {
    expect(schema.type).toBe('object')
    expect(schema.required).toEqual(['narration'])
    expect(schema.$schema).toBeUndefined()
  })

  it('expone exactamente las claves de dmResponseSchema (una sola fuente de verdad)', () => {
    expect(Object.keys(schema.properties ?? {}).sort()).toEqual(
      Object.keys(dmResponseSchema.shape).sort()
    )
  })

  it('conserva los enums (el modelo no puede inventar tipos de dado ni de mood)', () => {
    const dice = (schema.properties?.dice_request as { anyOf?: Array<{ properties?: Record<string, { enum?: string[] }> }> })
    const diceObj = dice.anyOf?.find((o) => o.properties)
    expect(diceObj?.properties?.type.enum).toContain('perception')
    const mood = schema.properties?.mood_hint as { enum?: string[] }
    expect(mood.enum).toEqual(['exploration', 'combat', 'dialogue', 'dramatic'])
  })

  it('fuerza el tool y desactiva tool use paralelo', () => {
    expect(DM_TOOL_CHOICE).toEqual({ type: 'tool', name: DM_TOOL_NAME, disable_parallel_tool_use: true })
    expect(dmTurnTool.name).toBe(DM_TOOL_NAME)
  })
})

describe('dmRawFromMessage', () => {
  const input = {
    narration: 'The gate creaks open.',
    hp_change: -2,
    dice_request: { reason: 'Spot the trap', formula: '1d20', type: 'perception' },
    suggested_actions: ['Enter', 'Wait'],
  }

  it('devuelve el input del tool_use serializado y el parser lo lee completo', () => {
    const r = dmRawFromMessage({
      stop_reason: 'tool_use',
      content: [toolBlock(DM_TOOL_NAME, input)],
    })
    expect(r.viaTool).toBe(true)
    const parsed = parseDMResponse(r.raw)
    expect(parsed.fullParse).toBe(true)
    expect(parsed.data).toMatchObject(input)
  })

  it('ignora bloques de texto previos y otros tools; prefiere el del DM', () => {
    const r = dmRawFromMessage({
      stop_reason: 'tool_use',
      content: [
        { type: 'text', text: 'Thinking out loud…', citations: null },
        toolBlock('other_tool', { narration: 'wrong' }),
        toolBlock(DM_TOOL_NAME, input),
      ],
    })
    expect(r.viaTool).toBe(true)
    expect(JSON.parse(r.raw).narration).toBe('The gate creaks open.')
  })

  it('sin tool_use cae al texto (el parser sigue siendo la red)', () => {
    const r = dmRawFromMessage({
      stop_reason: 'max_tokens',
      content: [{ type: 'text', text: 'Prose only ```json {"dice_request":{"reason":"r","formula":"1d20","type":"skill"}}```', citations: null }],
    })
    expect(r.viaTool).toBe(false)
    expect(r.stopReason).toBe('max_tokens')
    const parsed = parseDMResponse(r.raw)
    expect(parsed.data.narration).toBe('Prose only')
    expect(parsed.recoveredKeys).toContain('dice_request')
  })

  it('contenido vacío → raw vacío (el route reintenta / devuelve 502, nunca "...")', () => {
    const r = dmRawFromMessage({ stop_reason: 'end_turn', content: [] })
    expect(r.raw).toBe('')
    expect(r.viaTool).toBe(false)
  })
})
