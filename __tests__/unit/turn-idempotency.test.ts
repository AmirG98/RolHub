import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  acquireTurnLock,
  findCompletedTurn,
  isValidClientTurnId,
  turnLockKey,
  TURN_LOCK_TTL_MS,
  type TurnIdempotencyDb,
} from '@/lib/game/turn-idempotency'

// Base simulada con la semántica de Prisma que importa: create con clave
// única (P2002 si existe) y updateMany condicional.
function fakeDb(dmTurns: Array<{ sessionId: string; content: string; worldStatePatch: Record<string, unknown> }> = []) {
  const locks = new Map<string, Date>()
  const db: TurnIdempotencyDb = {
    rateLimit: {
      async create({ data }) {
        if (locks.has(data.key)) throw Object.assign(new Error('Unique constraint'), { code: 'P2002' })
        locks.set(data.key, data.windowStart)
        return {}
      },
      async updateMany({ where, data }) {
        const at = locks.get(where.key)
        if (at && at < where.windowStart.lt) { locks.set(where.key, data.windowStart); return { count: 1 } }
        return { count: 0 }
      },
    },
    turn: {
      async findFirst({ where }) {
        const hit = [...dmTurns].reverse().find((t) => t.sessionId === where.sessionId && t.worldStatePatch[where.worldStatePatch.path[0]] === where.worldStatePatch.equals)
        return hit ? { content: hit.content, worldStatePatch: hit.worldStatePatch } : null
      },
    },
  }
  return { db, locks }
}

describe('idempotencia del turno (duplicados del 2026-10-09)', () => {
  it('valida el formato del id', () => {
    expect(isValidClientTurnId('3f2b1c9e-8a7d-4e6f-9b0a-1c2d3e4f5a6b')).toBe(true)
    expect(isValidClientTurnId('lq9x3k-ab12cd34ef')).toBe(true)
    expect(isValidClientTurnId('short')).toBe(false)
    expect(isValidClientTurnId('x'.repeat(65))).toBe(false)
    expect(isValidClientTurnId("abc'; drop table--")).toBe(false)
    expect(isValidClientTurnId(undefined)).toBe(false)
  })

  it('el primer pedido toma el candado; el reintento por timeout recibe "en curso"', async () => {
    const { db } = fakeDb()
    const t0 = new Date('2026-10-09T15:50:32Z')
    expect(await acquireTurnLock(db, 'turn-aaaaaaaa', t0)).toBe(true)
    // reintento del cliente 46,5 s después, con el primero todavía en curso
    expect(await acquireTurnLock(db, 'turn-aaaaaaaa', new Date(t0.getTime() + 46_500))).toBe(false)
    // otra acción distinta no se bloquea
    expect(await acquireTurnLock(db, 'turn-bbbbbbbb', t0)).toBe(true)
  })

  it('un candado vencido (la función murió) se puede volver a tomar', async () => {
    const { db, locks } = fakeDb()
    const t0 = new Date('2026-10-09T15:50:32Z')
    await acquireTurnLock(db, 'turn-cccccccc', t0)
    const later = new Date(t0.getTime() + TURN_LOCK_TTL_MS + 1000)
    expect(await acquireTurnLock(db, 'turn-cccccccc', later)).toBe(true)
    expect(locks.get(turnLockKey('turn-cccccccc'))).toEqual(later)
  })

  it('un turno ya guardado se devuelve sin volver a jugarlo', async () => {
    const { db } = fakeDb([
      { sessionId: 's1', content: "You pull up Mika Sohl's contact...", worldStatePatch: { _client_turn_id: 'turn-dddddddd', last_suggested_actions: ['Ask Mika', 'Hang up', 3] } },
    ])
    expect(await findCompletedTurn(db, 's1', 'turn-dddddddd')).toEqual({ narration: "You pull up Mika Sohl's contact...", suggestedActions: ['Ask Mika', 'Hang up'] })
    expect(await findCompletedTurn(db, 's1', 'turn-eeeeeeee')).toBeNull()
    expect(await findCompletedTurn(db, 'otra-sesion', 'turn-dddddddd')).toBeNull()
  })

  it('errores que no son de clave única se propagan', async () => {
    const { db } = fakeDb()
    db.rateLimit.create = async () => { throw new Error('connection reset') }
    await expect(acquireTurnLock(db, 'turn-ffffffff')).rejects.toThrow('connection reset')
  })
})

describe('cliente y route usan la idempotencia', () => {
  const client = readFileSync(join(process.cwd(), 'components/game/GameSession.tsx'), 'utf8')
  const route = readFileSync(join(process.cwd(), 'app/api/session/turn/route.ts'), 'utf8')

  it('el cliente manda el mismo clientTurnId en cada intento y espera ante 409', async () => {
    const { TURN_REQUEST_TIMEOUT_MS } = await import('@/components/game/GameSession')
    expect(TURN_REQUEST_TIMEOUT_MS).toBeGreaterThan(120_000) // > maxDuration del route
    expect(client).toMatch(/const clientTurnId = newClientTurnId\(\)/)
    expect(client).toMatch(/clientTurnId,\s*\n\s*\}\),/)
    expect(client).toMatch(/response\.status === 409/)
    expect(client).toMatch(/data\?\.replayed/)
  })

  it('el route devuelve lo ya hecho antes de tomar el candado y guarda el id en el turno', () => {
    expect(route.indexOf('findCompletedTurn(idemDb')).toBeGreaterThan(0)
    expect(route.indexOf('findCompletedTurn(idemDb')).toBeLessThan(route.indexOf('acquireTurnLock(idemDb'))
    expect(route).toMatch(/_client_turn_id: clientTurnId/)
    expect(route).toMatch(/export const maxDuration = 120/)
  })
})
