/**
 * Tests del schema Zod de DMResponse (lib/validation/dm-response.schema.ts).
 * Los fixtures replican respuestas reales del DM en prod.
 */
import { describe, it, expect } from 'vitest'
import { validateDMResponse, dmResponseSchema } from '@/lib/validation/dm-response.schema'

// Fixture basado en una respuesta real capturada de prod (smoke test 2026-07-05)
const REAL_RESPONSE = {
  narration:
    'El alba tiñe el bosque de oro pálido y plata fría. Los robles centenarios se alzan como columnas de algún templo olvidado. Distinguís marcas en la corteza de un árbol cercano: tres cortes paralelos, recientes.',
  suggested_actions: [
    'Tomar la rama de fresno como arma improvisada',
    'Examinar las huellas para identificar qué criatura pasó por aquí',
    'Seguir el olor a humo hacia el este',
  ],
}

describe('dmResponseSchema — casos válidos', () => {
  it('acepta una respuesta real de prod (narración + acciones)', () => {
    const r = validateDMResponse(REAL_RESPONSE)
    expect(r.ok).toBe(true)
    expect(r.issues).toEqual([])
  })

  it('acepta la respuesta mínima (solo narración)', () => {
    expect(validateDMResponse({ narration: 'El viento sopla.' }).ok).toBe(true)
  })

  it('acepta una respuesta completa con todos los sistemas', () => {
    const full = {
      ...REAL_RESPONSE,
      character_name: 'Tesla',
      hp_change: -3,
      hp_reason: 'La trampa te rozó el brazo',
      new_item: '3 monedas de plata',
      xp_reward: 25,
      ability_used: { id: 'arcane-sense', reason: 'detectó la runa oculta' },
      long_rest: false,
      dice_request: {
        reason: 'Esquivar la trampa',
        formula: '1d20+2',
        type: 'skill',
        difficulty: 12,
      },
      combat_trigger: {
        enemies: [{ name: 'Goblin explorador', type: 'goblin', count: 2, hp: 7 }],
        terrain: 'forest',
        difficulty: 'easy',
      },
      npc_update: { name: 'Olvar', status: 'esperando en la posada', location: 'bree' },
      world_flag: { flag: 'puente_destruido', value: true },
      mood_hint: 'combat',
      time_update: 'Atardecer',
      weather_update: 'Lluvia ligera',
      generate_image: true,
      image_prompt: 'a forest ambush at dusk',
    }
    const r = validateDMResponse(full)
    expect(r.ok).toBe(true)
  })

  it('acepta npc_update como array (el DM manda ambas formas)', () => {
    const r = validateDMResponse({
      narration: 'Ambos guardias se retiran.',
      npc_update: [
        { name: 'Guardia A', status: 'retirado' },
        { name: 'Guardia B', status: 'retirado', location: 'cuartel' },
      ],
    })
    expect(r.ok).toBe(true)
  })

  it('tolera campos extra desconocidos (passthrough — la ruta los ignora)', () => {
    const r = validateDMResponse({
      narration: 'Algo pasa.',
      campo_inventado_por_el_dm: 'valor',
    })
    expect(r.ok).toBe(true)
  })

  it('acepta nulls explícitos en los campos nullable', () => {
    const r = validateDMResponse({
      narration: 'Nada especial.',
      hp_reason: null,
      new_item: null,
      dice_request: null,
      ability_used: null,
      npc_update: null,
    })
    expect(r.ok).toBe(true)
  })
})

describe('dmResponseSchema — violaciones de contrato', () => {
  it('rechaza narración vacía', () => {
    const r = validateDMResponse({ narration: '' })
    expect(r.ok).toBe(false)
    expect(r.issues.some((i) => i.startsWith('narration'))).toBe(true)
  })

  it('rechaza respuesta sin narración', () => {
    expect(validateDMResponse({ suggested_actions: ['a'] }).ok).toBe(false)
  })

  it('rechaza xp_reward fuera de rango', () => {
    expect(validateDMResponse({ narration: 'ok', xp_reward: 500 }).ok).toBe(false)
    expect(validateDMResponse({ narration: 'ok', xp_reward: -5 }).ok).toBe(false)
  })

  it('rechaza hp_change no numérico', () => {
    expect(validateDMResponse({ narration: 'ok', hp_change: '-3' }).ok).toBe(false)
  })

  it('rechaza mood_hint fuera del enum', () => {
    expect(validateDMResponse({ narration: 'ok', mood_hint: 'epic' }).ok).toBe(false)
  })

  it('rechaza ability_used sin id', () => {
    expect(validateDMResponse({ narration: 'ok', ability_used: { reason: 'x' } }).ok).toBe(false)
  })

  it('rechaza combat_trigger sin enemigos', () => {
    expect(
      validateDMResponse({ narration: 'ok', combat_trigger: { enemies: [] } }).ok
    ).toBe(false)
  })

  it('rechaza suggested_actions con strings vacíos', () => {
    expect(
      validateDMResponse({ narration: 'ok', suggested_actions: ['hacer algo', ''] }).ok
    ).toBe(false)
  })

  it('reporta issues legibles con el path del campo', () => {
    const r = validateDMResponse({ narration: 'ok', dice_request: { reason: 'x' } })
    expect(r.ok).toBe(false)
    expect(r.issues.length).toBeGreaterThan(0)
    expect(r.issues.some((i) => i.includes('dice_request'))).toBe(true)
  })

  it('rechaza entradas no-objeto (respuesta no-JSON del DM)', () => {
    expect(validateDMResponse('texto plano del DM').ok).toBe(false)
    expect(validateDMResponse(null).ok).toBe(false)
    expect(validateDMResponse(undefined).ok).toBe(false)
  })
})

describe('dmResponseSchema — tipo exportado', () => {
  it('parse infiere el tipo correctamente', () => {
    const parsed = dmResponseSchema.parse(REAL_RESPONSE)
    expect(parsed.narration).toBe(REAL_RESPONSE.narration)
    expect(parsed.suggested_actions).toHaveLength(3)
  })
})
