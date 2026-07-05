/**
 * Tests de la lógica de findings del playtest: fingerprints estables (dedup),
 * invariantes determinísticas sobre respuestas del turn API.
 */
import { describe, it, expect } from 'vitest'
import { makeFingerprint } from '@/scripts/playtest/findings'
import { checkTurn, type SessionTracker } from '@/scripts/playtest/invariants'

function tracker(): SessionTracker {
  return {
    characterName: 'PLAYTEST_Hero',
    locale: 'es',
    profile: 'normal',
    sessionId: 'sess1',
    completedQuests: new Set(),
    lastHp: null,
  }
}

describe('makeFingerprint', () => {
  it('es estable para el mismo input (dedup entre corridas)', () => {
    expect(makeFingerprint('http_5xx', 'ctx')).toBe(makeFingerprint('http_5xx', 'ctx'))
  })
  it('difiere por check o contexto', () => {
    expect(makeFingerprint('a', 'x')).not.toBe(makeFingerprint('b', 'x'))
    expect(makeFingerprint('a', 'x')).not.toBe(makeFingerprint('a', 'y'))
  })
})

describe('checkTurn — infraestructura', () => {
  it('500 → P0 http_5xx con archivo sospechoso', () => {
    const f = checkTurn(tracker(), 1, { action: 'x' }, { status: 500, latencyMs: 100, body: { error: 'boom' } })
    expect(f).toHaveLength(1)
    expect(f[0].severity).toBe('P0')
    expect(f[0].check).toBe('http_5xx')
    expect(f[0].suspected_files).toContain('app/api/session/turn/route.ts')
  })

  it('status 0 → P0 network_or_timeout', () => {
    const f = checkTurn(tracker(), 1, {}, { status: 0, latencyMs: 60000, body: { _error: 'timeout' } })
    expect(f[0].check).toBe('network_or_timeout')
  })

  it('respuesta no-JSON → P0 non_json_response', () => {
    const f = checkTurn(tracker(), 1, {}, { status: 200, latencyMs: 100, body: { _raw: '<html>' } })
    expect(f[0].check).toBe('non_json_response')
  })

  it('429 → sin findings (rate limit esperado)', () => {
    expect(checkTurn(tracker(), 1, {}, { status: 429, latencyMs: 10, body: {} })).toHaveLength(0)
  })
})

describe('checkTurn — contrato y world state', () => {
  const okBody = (extra: any) => ({
    status: 200,
    latencyMs: 5000,
    body: {
      narration: 'Una narración suficientemente larga para pasar el mínimo de 40 caracteres tranquilamente.',
      suggestedActions: ['ir al norte', 'mirar', 'hablar'],
      ...extra,
    },
  })

  it('respuesta sana → sin findings', () => {
    expect(checkTurn(tracker(), 1, {}, okBody({}))).toHaveLength(0)
  })

  it('narración corta → P1 narration_too_short', () => {
    const f = checkTurn(tracker(), 1, {}, { status: 200, latencyMs: 100, body: { narration: 'ok', suggestedActions: ['a'] } })
    expect(f.some((x) => x.check === 'narration_too_short')).toBe(true)
  })

  it('HP negativo sin muerte → P1 hp_negative autofixable', () => {
    const f = checkTurn(tracker(), 1, {}, okBody({
      worldStateUpdates: { party: { PLAYTEST_Hero: { hp: '-3/20' } } },
    }))
    const hit = f.find((x) => x.check === 'hp_negative')
    expect(hit).toBeTruthy()
    expect(hit!.autofixable).toBe(true)
  })

  it('HP negativo CON muerte → no reporta (es válido)', () => {
    const f = checkTurn(tracker(), 1, {}, okBody({
      worldStateUpdates: { party: { PLAYTEST_Hero: { hp: '-3/20' } } },
      zeroHpEvent: { type: 'death' },
    }))
    expect(f.some((x) => x.check === 'hp_negative')).toBe(false)
  })

  it('HP sobre el máximo → P1 hp_above_max', () => {
    const f = checkTurn(tracker(), 1, {}, okBody({
      worldStateUpdates: { party: { PLAYTEST_Hero: { hp: '30/20' } } },
    }))
    expect(f.some((x) => x.check === 'hp_above_max')).toBe(true)
  })

  it('item no-string en inventory → P1 inventory_item_not_string', () => {
    const f = checkTurn(tracker(), 1, {}, okBody({
      worldStateUpdates: { party: { PLAYTEST_Hero: { inventory: ['espada', { es: 'poción', en: 'potion' }] } } },
    }))
    expect(f.some((x) => x.check === 'inventory_item_not_string')).toBe(true)
  })

  it('quest no-string → P1 quest_not_string (bug #31)', () => {
    const f = checkTurn(tracker(), 1, {}, okBody({
      worldStateUpdates: { active_quests: ['Rescatar al rey', { title: 'quest objeto' }] },
    }))
    expect(f.some((x) => x.check === 'quest_not_string')).toBe(true)
  })

  it('quest completada que resucita → P1 quest_resurrected', () => {
    const tr = tracker()
    tr.completedQuests.add('rescatar al rey')
    const f = checkTurn(tr, 1, {}, okBody({
      worldStateUpdates: { active_quests: ['Rescatar al rey'] },
    }))
    expect(f.some((x) => x.check === 'quest_resurrected')).toBe(true)
  })

  it('narración en inglés con locale=es → P2 wrong_language', () => {
    // La heurística exige enCount > 10 y enCount > esCount*2 sobre >200 chars.
    const f = checkTurn(tracker(), 1, {}, {
      status: 200,
      latencyMs: 100,
      body: {
        narration:
          'The ancient forest of the elves stands before you and the wind whispers through the trees to the north. ' +
          'The sound of the river that flows from the mountains reaches you from the distance and you feel that the ' +
          'path ahead is the one that leads to the tower where the old wizard is said to be waiting for you and your friends.',
        suggestedActions: ['a'],
      },
    })
    expect(f.some((x) => x.check === 'wrong_language')).toBe(true)
  })

  it('latencia excesiva → P2 latency_slow', () => {
    const f = checkTurn(tracker(), 1, {}, {
      status: 200,
      latencyMs: 50000,
      body: { narration: 'Una narración larga y correcta que supera los cuarenta caracteres exigidos.', suggestedActions: ['a'] },
    })
    expect(f.some((x) => x.check === 'latency_slow')).toBe(true)
  })
})
