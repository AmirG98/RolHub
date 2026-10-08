import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { recentTurnsQuery, toChronological, RECENT_TURNS_WINDOW } from '@/lib/claude/turn-window'

// Simula la semántica de Prisma: ordenar según orderBy y después take.
function prismaFindTurns<T extends { createdAt: number; id: string }>(rows: T[], q: typeof recentTurnsQuery): T[] {
  const dir = q.orderBy[0].createdAt === 'desc' ? -1 : 1
  return [...rows]
    .sort((a, b) => (a.createdAt - b.createdAt || a.id.localeCompare(b.id)) * dir)
    .slice(0, q.take)
}

describe('ventana de turnos del DM (bug 2026-04-09 → 2026-10-08)', () => {
  // Sesión real de Merlin: 171 turnos. Con asc+take el DM veía los turnos 1-40.
  const rows = Array.from({ length: 171 }, (_, i) => ({ id: `t${String(i + 1).padStart(3, '0')}`, createdAt: i + 1, n: i + 1 }))

  it('la consulta pide los turnos del más NUEVO al más viejo', () => {
    expect(recentTurnsQuery.orderBy[0].createdAt).toBe('desc')
    expect(recentTurnsQuery.orderBy[1].id).toBe('desc')
    expect(recentTurnsQuery.take).toBe(RECENT_TURNS_WINDOW)
  })

  it('en una sesión de 171 turnos el DM ve los turnos 132-171, en orden cronológico', () => {
    const window = toChronological(prismaFindTurns(rows, recentTurnsQuery))
    expect(window).toHaveLength(40)
    expect(window[0].n).toBe(132)
    expect(window.at(-1)!.n).toBe(171)
    // lo que consume el route: los 12 más recientes para el historial
    expect(window.slice(-12).map((t) => t.n)).toEqual(Array.from({ length: 12 }, (_, i) => 160 + i))
  })

  it('en una sesión corta trae todo, en orden', () => {
    const short = rows.slice(0, 7)
    expect(toChronological(prismaFindTurns(short, recentTurnsQuery)).map((t) => t.n)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('el turn route usa la consulta compartida y no vuelve a cargar los primeros 40', () => {
    const src = readFileSync(join(process.cwd(), 'app/api/session/turn/route.ts'), 'utf8')
    expect(src).toMatch(/turns:\s*recentTurnsQuery/)
    expect(src).toMatch(/session\.turns\s*=\s*toChronological\(session\.turns\)/)
    // el contador de turnos no puede salir de la ventana capada
    expect(src).not.toMatch(/const totalTurns = allTurns\.length/)
  })
})
