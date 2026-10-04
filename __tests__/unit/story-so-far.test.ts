import { describe, it, expect } from 'vitest'
import { buildStorySoFar, buildLedger, chapterTitle, RECENT_FULL_CHECKPOINTS, LEDGER_MAX_CHARS, type CheckpointLike } from '@/lib/claude/story-so-far'

function cp(i: number, extra: Partial<CheckpointLike> & { facts?: Record<string, unknown> } = {}): CheckpointLike {
  return {
    turnIndex: i * 10 + 2,
    turnCount: 10,
    summary: extra.summary ?? `# CHAPTER ${i}\n\n${'The scout crossed the ruined city and found something unexpected. '.repeat(18)}`,
    keyFacts: extra.facts ?? {
      npcs_introduced: [`Npc${i}: a survivor met in chapter ${i}`],
      npcs_referenced: ['Marcus'],
      decisions_made: [`Decision of chapter ${i}`],
      locations_visited: [`Place ${i}`],
      quests_progressed: [`Quest ${i}: advanced`],
      items_gained_lost: [`Item ${i}: gained`],
      emotional_beat: `Beat ${i}`,
    },
  }
}
const many = (n: number) => Array.from({ length: n }, (_, i) => cp(i + 1))

describe('buildStorySoFar — sesiones cortas no cambian', () => {
  it('sin checkpoints → vacío', () => expect(buildStorySoFar([], 'en')).toBe(''))
  it(`hasta ${RECENT_FULL_CHECKPOINTS} checkpoints: todos íntegros, igual que antes`, () => {
    const cps = many(RECENT_FULL_CHECKPOINTS)
    const out = buildStorySoFar(cps, 'en')
    expect(out).toBe(cps.map((c) => `[Turns ${c.turnIndex - 9}-${c.turnIndex}] ${c.summary}`).join('\n\n'))
    expect(out).not.toContain('EARLIER STORY')
  })
})

describe('buildStorySoFar — sesiones largas quedan acotadas', () => {
  it('el tamaño deja de crecer con la partida', () => {
    const a = buildStorySoFar(many(40), 'en').length
    const b = buildStorySoFar(many(80), 'en').length
    const c = buildStorySoFar(many(300), 'en').length
    const recentMax = RECENT_FULL_CHECKPOINTS * (many(1)[0].summary.length + 20)
    for (const n of [a, b, c]) expect(n).toBeLessThanOrEqual(LEDGER_MAX_CHARS + recentMax + 400)
    expect(c).toBeLessThan(a * 1.5)
  })
  it('los últimos checkpoints van íntegros y los viejos no', () => {
    const cps = many(30)
    const out = buildStorySoFar(cps, 'en')
    for (const c of cps.slice(-RECENT_FULL_CHECKPOINTS)) expect(out).toContain(c.summary)
    expect(out).not.toContain(cps[0].summary)
    expect(out).toContain('EARLIER STORY')
    expect(out).toContain('RECENT STORY')
  })
  it('conserva los hechos de los capítulos viejos: NPCs, decisiones, lugares, capítulos', () => {
    const out = buildStorySoFar(many(30), 'en')
    expect(out).toContain('Npc3: a survivor met in chapter 3')
    expect(out).toContain('Marcus')
    expect(out).toContain('Decision of chapter 1')   // las primeras se conservan
    expect(out).toContain('Decision of chapter 24')  // y las últimas
    expect(out).toContain('Place 5')
    expect(out).toContain('[13-22] CHAPTER 2')
  })
  it('español usa etiquetas en español', () => {
    const out = buildStorySoFar(many(12), 'es')
    expect(out).toContain('HISTORIA ANTERIOR')
    expect(out).toContain('Personajes conocidos')
  })
})

describe('buildLedger', () => {
  it('prioriza a los NPCs recurrentes cuando hay más de 40', () => {
    const cps = Array.from({ length: 60 }, (_, i) => cp(i + 1))
    const led = buildLedger(cps)
    expect(led.npcs.length).toBe(40)
    expect(led.npcs.some((n) => n.startsWith('Marcus'))).toBe(true) // mencionado en los 60
  })
  it('no duplica lugares ni NPCs', () => {
    const led = buildLedger([cp(1), cp(1), cp(1)])
    expect(led.locations).toEqual(['Place 1'])
    expect(led.npcs.filter((n) => n.startsWith('Npc1')).length).toBe(1)
  })
  it('checkpoint sin keyFacts no rompe y aporta el capítulo', () => {
    const led = buildLedger([{ turnIndex: 12, turnCount: 10, summary: 'The convoy left at dawn. Nobody spoke.', keyFacts: {} }])
    expect(led.chapters[0]).toContain('The convoy left at dawn')
    expect(led.npcs).toEqual([])
  })
})

describe('chapterTitle', () => {
  it('heading markdown', () => expect(chapterTitle(cp(1, { summary: '# PHARMACY BREACH\n\nText.' }))).toBe('PHARMACY BREACH'))
  it('salta el heading genérico y usa la negrita', () =>
    expect(chapterTitle(cp(1, { summary: '# NARRATIVE SUMMARY\n\n**The Overpass Gambit**\n\nText.' }))).toBe('The Overpass Gambit'))
  it('"# SUMMARY: THE MISSING TRUCK" → título limpio', () =>
    expect(chapterTitle(cp(1, { summary: '# SUMMARY: THE MISSING TRUCK\n\nText.' }))).toBe('THE MISSING TRUCK'))
})
