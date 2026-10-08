/**
 * Ventana activa de turnos que ve el DM.
 *
 * BUG HISTÓRICO (2026-04-09 → 2026-10-08): el turn route cargaba los turnos
 * con `orderBy: asc` + `take: 40`. En Prisma eso trae los PRIMEROS 40 turnos
 * de la sesión, no los últimos. En toda sesión de más de 40 turnos el DM
 * jugaba con el presente congelado en el turno 40: la "conversación
 * reciente", la "LAST NARRATION (continue from here)", el guard anti
 * re-narración y el contador de turnos salían de esos 40 turnos viejos, y
 * los últimos ~10 turnos reales no estaban en el prompt en ningún lado (los
 * resúmenes van 10 turnos atrás). Medido: 3.436 de 7.325 narraciones del DM
 * desde abril (47%), 105 sesiones, 24 usuarios pagos o en trial.
 * Síntomas que generó y que se trataron por separado como si fueran otra
 * cosa: el bucle de la caja/portón (Darius), el interrogatorio del Rifleman
 * re-narrado 8 veces (Anthony), Mira repitiendo la cena del día 1 y
 * preguntando de nuevo quién era el jugador (Merlin), habilidades que dejan
 * de gastarse pasado el turno 40.
 *
 * Por eso la consulta vive acá, con un test que exige orden DESCENDENTE.
 */

export const RECENT_TURNS_WINDOW = 40

/** `include.turns` del findUnique de la sesión: los ÚLTIMOS N turnos. */
export const recentTurnsQuery = {
  orderBy: [{ createdAt: 'desc' as const }, { id: 'desc' as const }],
  take: RECENT_TURNS_WINDOW,
}

/**
 * La consulta trae los turnos del más nuevo al más viejo; el resto del route
 * los consume en orden cronológico (slice(-12) = los 12 más recientes).
 */
export function toChronological<T>(turnsNewestFirst: T[]): T[] {
  return [...turnsNewestFirst].reverse()
}
