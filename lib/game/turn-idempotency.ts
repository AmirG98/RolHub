/**
 * Idempotencia del turno: una acción del jugador se procesa UNA sola vez.
 *
 * Bug real (2026-10-09, 15 acciones duplicadas en un día): el cliente
 * cortaba la espera a los 45 s y reenviaba la misma acción. El servidor no
 * se enteraba del corte, terminaba el primer pedido y lo guardaba; el
 * reintento generaba un SEGUNDO turno con la misma acción. El jugador veía
 * al DM resolver dos veces lo mismo ("The call is already open..."), y se
 * cobraban dos llamadas a Claude y dos turnos del cupo. Pasaba en los turnos
 * lentos: los que necesitan el reintento del guard en partidas largas.
 *
 * Solución: el cliente manda un `clientTurnId` por acción (el mismo en cada
 * reintento). El servidor:
 *   1. Si ya guardó un turno con ese id, lo devuelve (replay) sin llamar a
 *      Claude.
 *   2. Si otro pedido con ese id está en curso, responde 409
 *      `turn_in_progress` y el cliente espera.
 *   3. Si no, toma un candado (fila en RateLimit, compartida entre
 *      instancias) y procesa. El id queda en worldStatePatch._client_turn_id.
 * El candado vence solo (TTL > maxDuration del route) por si la función
 * muere a mitad de camino; el cron de cleanup borra las filas viejas.
 */

/** Más que el maxDuration del turn route (120 s). */
export const TURN_LOCK_TTL_MS = 130_000

const CLIENT_TURN_ID_RE = /^[A-Za-z0-9_-]{8,64}$/

export function isValidClientTurnId(id: unknown): id is string {
  return typeof id === 'string' && CLIENT_TURN_ID_RE.test(id)
}

export function turnLockKey(clientTurnId: string): string {
  return `turn:${clientTurnId}`
}

/** Subconjunto del cliente de Prisma que usa este módulo (inyectable en tests). */
export interface TurnIdempotencyDb {
  rateLimit: {
    create(args: { data: { key: string; count?: number; windowStart: Date } }): Promise<unknown>
    updateMany(args: { where: { key: string; windowStart: { lt: Date } }; data: { windowStart: Date } }): Promise<{ count: number }>
  }
  turn: {
    findFirst(args: {
      where: { sessionId: string; role: 'DM'; worldStatePatch: { path: string[]; equals: string } }
      orderBy: { createdAt: 'desc' }
      select: { content: true; worldStatePatch: true }
    }): Promise<{ content: string; worldStatePatch: unknown } | null>
  }
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 'P2002'
}

/**
 * Toma el candado del turno. true = este pedido procesa; false = hay otro
 * pedido vivo con el mismo id.
 */
export async function acquireTurnLock(db: TurnIdempotencyDb, clientTurnId: string, now = new Date()): Promise<boolean> {
  const key = turnLockKey(clientTurnId)
  try {
    await db.rateLimit.create({ data: { key, count: 1, windowStart: now } })
    return true
  } catch (err) {
    if (!isUniqueViolation(err)) throw err
  }
  // Ya existe: solo se puede tomar si venció (el pedido anterior murió).
  const stale = new Date(now.getTime() - TURN_LOCK_TTL_MS)
  const res = await db.rateLimit.updateMany({ where: { key, windowStart: { lt: stale } }, data: { windowStart: now } })
  return res.count === 1
}

export interface CompletedTurn {
  narration: string
  suggestedActions: string[]
}

/** El turno ya procesado con este id, si existe. */
export async function findCompletedTurn(db: TurnIdempotencyDb, sessionId: string, clientTurnId: string): Promise<CompletedTurn | null> {
  const dm = await db.turn.findFirst({
    where: { sessionId, role: 'DM', worldStatePatch: { path: ['_client_turn_id'], equals: clientTurnId } },
    orderBy: { createdAt: 'desc' },
    select: { content: true, worldStatePatch: true },
  })
  if (!dm) return null
  const patch = (dm.worldStatePatch ?? {}) as { last_suggested_actions?: unknown }
  const suggested = Array.isArray(patch.last_suggested_actions)
    ? patch.last_suggested_actions.filter((s): s is string => typeof s === 'string')
    : []
  return { narration: dm.content, suggestedActions: suggested }
}
