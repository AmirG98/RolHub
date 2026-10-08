import { describe, it, expect } from 'vitest'
import {
  assessTimeUpdate,
  continuityRetryDirective,
  detectNpcIdentityFlip,
  detectStaleActionReplay,
  issueKinds,
  mergeNpcLedgerEntry,
  normalizePronouns,
  npcIdentityLabel,
  npcKnowledgeBlock,
  parseTimeOfDay,
  NPC_KNOWS_CAP,
} from '@/lib/claude/continuity-guard'
import anthony from '../fixtures/stale-action-loop.json'
import merlin from '../fixtures/merlin-continuity.json'

type T = { role: string; content: string; time_in_world?: string }
const A = anthony.turns as Record<string, T>
const M = merlin.turns as Record<string, T>

// ─────────────────────────────────────────────────────────────────────────
// 1. Acción rancia — bucle real de Anthony (Zombies/5e, canceló por "low quality")
// ─────────────────────────────────────────────────────────────────────────
describe('detectStaleActionReplay (bucle del Rifleman)', () => {
  // Acciones del jugador hasta el turno 88 (incluye el interrogatorio del t40)
  const earlyActions = anthony.userActions as string[]
  const skullIdx = earlyActions.findIndex((a) => /skull mean/i.test(a))
  // En prod el bucle venía de la ventana congelada (turn-window.ts): con la
  // ventana bien, la acción vieja está a lo sumo 20 acciones atrás. Se simula
  // el mismo replay dentro de esa ventana.
  const insideWindow = earlyActions.slice(skullIdx, skullIdx + 19)

  it('marca las narraciones que vuelven al interrogatorio mientras el jugador asalta otro edificio', () => {
    const caught: string[] = []
    for (const [dm, user] of [['t99', 't98'], ['t101', 't100'], ['t113', 't112'], ['t117', 't116']] as const) {
      const v = detectStaleActionReplay(A[dm].content, A[user].content, insideWindow)
      if (v.stale) caught.push(dm)
      expect(v.stale, dm).toBe(true)
      expect(v.fragment).toMatch(/what does the skull mean/)
    }
    expect(caught).toHaveLength(4)
  })

  it('mira solo las últimas 20 acciones (lo que entra en la ventana del DM)', () => {
    const farBack = earlyActions.slice(skullIdx, skullIdx + 25)
    expect(detectStaleActionReplay(A.t99.content, A.t98.content, farBack).stale).toBe(false)
  })

  it('no marca la respuesta legítima al interrogatorio (es la acción ACTUAL)', () => {
    const before = earlyActions.slice(0, skullIdx)
    const v = detectStaleActionReplay(A.t41.content, A.t40.content, before)
    expect(v.stale).toBe(false)
  })

  it('ignora el prefijo de tirada y una acción repetida idéntica', () => {
    const old = '[Roll: 1d20+3 = 12] Ask him directly what does the skull mean and who runs your outfit'
    const narration = 'He laughs. "What does the skull mean and who runs your outfit? Brave question."'
    // el jugador repitió exactamente la misma acción → citarla es responder la actual
    expect(detectStaleActionReplay(narration, old.replace(/^\[[^\]]*\]\s*/, ''), [old]).stale).toBe(false)
  })

  it('fragmentos cortos (< 8 palabras) no cuentan: referencias legítimas', () => {
    const v = detectStaleActionReplay(
      'You reach the far side of the overpass and drop into cover.',
      'Keep moving north',
      ['Sprint to the far side of the overpass now']
    )
    expect(v.stale).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 2. Salto de hora — Merlin t51 → t53
// ─────────────────────────────────────────────────────────────────────────
describe('assessTimeUpdate', () => {
  it('parsea las franjas como las escribe el DM', () => {
    expect(parseTimeOfDay('Day 2, evening — sunset')).toMatchObject({ day: 2, phase: 7 })
    expect(parseTimeOfDay('Day 2, morning — early')).toMatchObject({ day: 2, phase: 2 })
    expect(parseTimeOfDay('Día 4, última hora de la tarde')).toMatchObject({ day: 4, phase: 6 })
    expect(parseTimeOfDay('Day 2, night — 11:59 PM')).toMatchObject({ day: 2, phase: 8, clock: 23 * 60 + 59 })
    expect(parseTimeOfDay('Day 12')).toBeNull()
  })

  it('rechaza el salto real: mañana del día 2 → atardecer sin que pase nada (t53)', () => {
    const v = assessTimeUpdate(M.t51.time_in_world, M.t53.time_in_world, {
      playerAction: M.t52.content,
      narration: M.t53.content,
      sceneChange: false,
    })
    expect(v).toMatchObject({ ok: false, reason: 'jump', previous: 'Day 2, morning — early', next: 'Day 2, evening — sunset' })
  })

  it('acepta el amanecer cuando el jugador durmió (t49 → t51)', () => {
    expect(assessTimeUpdate('Day 1, evening — dinner', M.t49.time_in_world, { playerAction: 'The night begins to come to a close and I tell Mira I have nowhere to sleep', narration: M.t49.content, sceneChange: false }).ok).toBe(true)
    expect(assessTimeUpdate(M.t49.time_in_world, M.t51.time_in_world, { playerAction: M.t50.content, narration: M.t51.content, sceneChange: false }).ok).toBe(true)
  })

  // Falsos positivos encontrados al calibrar con 5.575 narraciones de prod
  it.each([
    ['Day 1, late night — nearing dawn', 'Day 1, pre-dawn — first grey light', 'Order Stigr to execute the scouts'],
    ['Day 2, Early Morning — Thornfeld Plateau', 'Day 2, Pre-Dawn — Thornfeld Plateau', 'Sheathe the sword and talk'],
    ['Day 1, early afternoon', 'Day 1, midday', 'Keep one eye on the fuel gauge'],
    ['Day 1, night', 'Day 2, early morning', 'I sigh and go to bed.'],
    ['Day 1, Night', 'Day 2, Morning', 'Study the grimoire at first light'],
    ['Day 2, night — 11:59 PM', 'Day 3, early morning — 12:15 AM', 'Call a full meeting with the sheriff'],
    ['Day 2, night', 'Day 3, dawn', 'We already fixed the truck and went back to the store'],
  ])('no marca: "%s" → "%s"', (prev, next, action) => {
    expect(assessTimeUpdate(prev, next, { playerAction: action, narration: 'You keep going.', sceneChange: false }).ok).toBe(true)
  })

  it('un cambio de escena (viaje) o un montaje narrado justifican el salto', () => {
    const base = { playerAction: 'Talk to the guard', narration: 'He nods.' }
    expect(assessTimeUpdate('Day 1, morning', 'Day 1, evening', { ...base, sceneChange: true }).ok).toBe(true)
    expect(assessTimeUpdate('Day 1, morning', 'Day 1, evening', { ...base, narration: 'Hours pass in the archive.', sceneChange: false }).ok).toBe(true)
  })

  it('retroceder medio día es error; sin dato o sin cambio, no se opina', () => {
    expect(assessTimeUpdate('Day 3, evening', 'Day 3, morning', { playerAction: 'Look around', narration: 'x', sceneChange: false })).toMatchObject({ ok: false, reason: 'backward' })
    expect(assessTimeUpdate('Day 3, evening', 'Day 2, evening', { playerAction: 'Look around', narration: 'x', sceneChange: false })).toMatchObject({ ok: false, reason: 'backward' })
    expect(assessTimeUpdate(undefined, 'Day 1, night', { playerAction: '', narration: '', sceneChange: false }).ok).toBe(true)
    expect(assessTimeUpdate('Day 1, night', null, { playerAction: '', narration: '', sceneChange: false }).ok).toBe(true)
    expect(assessTimeUpdate('Unknown', 'Day 1, night', { playerAction: '', narration: '', sceneChange: false }).ok).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 3. Identidad de NPC — la sargento de la frontera (t145 → t149)
// ─────────────────────────────────────────────────────────────────────────
describe('detectNpcIdentityFlip', () => {
  const ledger = { 'Guard Sergeant': { pronouns: 'she' as const, description: 'broad-shouldered woman, border guard' } }

  it('acepta la presentación (t145) y rechaza el cambio de género (t149)', () => {
    expect(detectNpcIdentityFlip(M.t145.content, ledger)).toBeNull()
    expect(detectNpcIdentityFlip(M.t147.content, ledger)).toBeNull()
    const flip = detectNpcIdentityFlip(M.t149.content, ledger)
    expect(flip).toMatchObject({ name: 'Guard Sergeant', expected: 'she' })
  })

  it('no marca a un NPC que HABLA de otra persona', () => {
    const narration = 'Cael leans in, voice low. Cael: "She\'s been sitting on that ale for an hour. She read the posting this morning — I saw her. She\'s interested."'
    expect(detectNpcIdentityFlip(narration, { Cael: { pronouns: 'he' } })).toBeNull()
  })

  it('no marca posesivos ni párrafos con otro NPC conocido', () => {
    expect(detectNpcIdentityFlip("Kael's superior, the woman behind the desk, studies you. She pulls a document. She frowns at her ledger.", { Kael: { pronouns: 'he' } })).toBeNull()
    expect(detectNpcIdentityFlip('Ray grabs Dara by the arm and hauls her upright before she finishes standing; she gasps.', { Ray: { pronouns: 'he' }, Dara: { pronouns: 'she' } })).toBeNull()
  })

  it('NPCs sin pronombre declarado no se validan (no se adivina)', () => {
    expect(detectNpcIdentityFlip(M.t149.content, { 'Guard Sergeant': { status: 'alive' } })).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// Ledger de NPCs
// ─────────────────────────────────────────────────────────────────────────
describe('mergeNpcLedgerEntry', () => {
  it('antes se pisaba la entrada entera; ahora fija pronombre y descripción y acumula lo que sabe', () => {
    let e = mergeNpcLedgerEntry(undefined, { status: 'alive', location: 'Guild Hall', pronouns: 'she/her', description: 'scarred guild master', learned: 'Soren is a jujutsu sorcerer from Tokyo' })
    expect(e).toMatchObject({ status: 'alive', location: 'Guild Hall', pronouns: 'she', description: 'scarred guild master', knows: ['Soren is a jujutsu sorcerer from Tokyo'] })
    // un update posterior no puede cambiarle el género ni la descripción
    e = mergeNpcLedgerEntry(e, { status: 'ally', pronouns: 'he/him', description: 'a tall man', learned: 'Soren carries Sukuna inside him' })
    expect(e).toMatchObject({ status: 'ally', location: 'Guild Hall', pronouns: 'she', description: 'scarred guild master' })
    expect(e.knows).toEqual(['Soren is a jujutsu sorcerer from Tokyo', 'Soren carries Sukuna inside him'])
    // duplicados no se repiten
    e = mergeNpcLedgerEntry(e, { status: 'ally', learned: 'soren is a Jujutsu sorcerer from Tokyo!' })
    expect(e.knows).toHaveLength(2)
  })

  it('respeta entradas legacy en string y el tope de hechos', () => {
    let e = mergeNpcLedgerEntry('alive — wounded', { status: '', location: '' }, 'Gate')
    expect(e).toMatchObject({ status: 'alive — wounded', location: 'Gate', introduced: true })
    for (let i = 0; i < NPC_KNOWS_CAP + 3; i++) e = mergeNpcLedgerEntry(e, { status: 'alive', learned: `fact number ${i}` })
    expect(e.knows).toHaveLength(NPC_KNOWS_CAP)
    expect(e.knows!.at(-1)).toBe(`fact number ${NPC_KNOWS_CAP + 2}`)
  })

  it('normaliza pronombres en inglés y español; "el guardia" no es un pronombre', () => {
    expect(normalizePronouns('she/her')).toBe('she')
    expect(normalizePronouns('He/Him')).toBe('he')
    expect(normalizePronouns('they/them')).toBe('they')
    expect(normalizePronouns('ella')).toBe('she')
    expect(normalizePronouns('él')).toBe('he')
    expect(normalizePronouns('el guardia')).toBeUndefined()
    expect(normalizePronouns(42)).toBeUndefined()
  })

  it('etiqueta y bloque de conocimiento para el prompt', () => {
    const ledger = { Mira: { pronouns: 'she', description: 'scarred guild master', knows: ['Soren ate a cursed finger', 'Soren tamed the wyvern Tempest'] }, Brom: { status: 'alive' } }
    expect(npcIdentityLabel('Mira', ledger.Mira)).toBe('Mira [she/her; scarred guild master]')
    expect(npcIdentityLabel('Brom', ledger.Brom)).toBe('Brom')
    const block = npcKnowledgeBlock(['Mira', 'Brom'], ledger, 'en')
    expect(block).toContain('NEVER ask about it again')
    expect(block).toContain('Mira [she/her; scarred guild master]: Soren ate a cursed finger · Soren tamed the wyvern Tempest')
    expect(block).not.toContain('Brom')
    expect(npcKnowledgeBlock(['Brom'], ledger, 'es')).toBe('')
  })
})

describe('continuityRetryDirective', () => {
  it('junta los problemas en una sola directiva y cita la acción actual', () => {
    const issues = {
      stale: { stale: true, fragment: 'what does the skull mean what s the name', oldAction: "Ask him directly: 'What does the skull mean?'", actionsAgo: 29 },
      time: { ok: false, reason: 'jump' as const, previous: 'Day 2, morning — early', next: 'Day 2, evening — sunset' },
      identity: { name: 'Guard Sergeant', expected: 'she' as const, snippet: '' },
    }
    expect(issueKinds(issues)).toEqual(['stale_action', 'time_jump', 'npc_identity'])
    const en = continuityRetryDirective(issues, '[Roll: 1d20 = 9] Move on the bay guard now', 'en')
    expect(en).toContain('REJECTED FOR A CONTINUITY ERROR')
    expect(en).toContain('«Move on the bay guard now»')
    expect(en).toContain('It is STILL "Day 2, morning — early"')
    expect(en).toContain('Guard Sergeant was established as she/her')
    expect(continuityRetryDirective(issues, 'x', 'es')).toContain('ERROR DE CONTINUIDAD')
    expect(continuityRetryDirective({}, 'x', 'en')).toBe('')
  })
})

describe('npcIdentityMissingDirective', () => {
  it('nombra a los NPCs presentes sin pronombre y nada si todos lo tienen', async () => {
    const { npcIdentityMissingDirective } = await import('@/lib/claude/continuity-guard')
    const ledger = { Marta: { status: 'alive' }, Barliman: 'alive', Mira: { pronouns: 'she' } }
    const en = npcIdentityMissingDirective(['Marta', 'Barliman', 'Mira'], ledger, 'en')
    expect(en).toContain('Marta, Barliman have no fixed identity')
    expect(en).not.toContain('Mira')
    expect(npcIdentityMissingDirective(['Mira'], ledger, 'es')).toBe('')
    expect(npcIdentityMissingDirective(['Marta'], ledger, 'es')).toContain('Marta todavía no tiene identidad fija')
  })
})
