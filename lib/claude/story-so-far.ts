/**
 * "Historia hasta ahora" con tope.
 *
 * Antes se concatenaban TODOS los SummaryCheckpoints en cada turno. Desde que
 * el summarizer corre de verdad (2026-09-28) eso crece sin límite: una sesión
 * de 739 turnos mandaba 20.303 tokens de resúmenes en CADA llamada (~$0.06
 * por turno solo en eso; $13.57 de los $39.88 diarios de PRO el 2026-10-04).
 *
 * Ahora: los últimos RECENT_FULL_CHECKPOINTS van íntegros (detalle narrativo
 * de los ~60 turnos recientes) y los anteriores se condensan en un LEDGER de
 * hechos, armado con los keyFacts estructurados que Haiku ya genera
 * (personajes, decisiones, lugares, misiones, objetos) más el título de cada
 * capítulo. Se pierde la prosa vieja, no los hechos. El ledger tiene un
 * tope duro de caracteres, así que el costo deja de crecer con la partida.
 *
 * Puro (sin I/O): testeable sin el route.
 */

export interface CheckpointLike {
  turnIndex: number
  turnCount: number
  summary: string
  keyFacts?: unknown
}

export type StoryLocale = 'es' | 'en'

/** Checkpoints recientes que viajan íntegros (~10 turnos cada uno). */
export const RECENT_FULL_CHECKPOINTS = 6
/** Tope duro del ledger de hechos viejos. */
export const LEDGER_MAX_CHARS = 14000

const CAPS = { npcs: 40, decisionsHead: 5, decisionsTail: 25, locations: 30, quests: 15, items: 15, chapters: 80 }

interface Facts {
  npcs_introduced: string[]
  npcs_referenced: string[]
  decisions_made: string[]
  locations_visited: string[]
  quests_progressed: string[]
  items_gained_lost: string[]
  emotional_beat: string
}

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim()) : []
}

function factsOf(c: CheckpointLike): Facts | null {
  const k = c.keyFacts
  if (!k || typeof k !== 'object') return null
  const o = k as Record<string, unknown>
  const f: Facts = {
    npcs_introduced: strings(o.npcs_introduced),
    npcs_referenced: strings(o.npcs_referenced),
    decisions_made: strings(o.decisions_made),
    locations_visited: strings(o.locations_visited),
    quests_progressed: strings(o.quests_progressed),
    items_gained_lost: strings(o.items_gained_lost),
    emotional_beat: typeof o.emotional_beat === 'string' ? o.emotional_beat.trim() : '',
  }
  const empty = !f.emotional_beat && [f.npcs_introduced, f.npcs_referenced, f.decisions_made, f.locations_visited, f.quests_progressed, f.items_gained_lost].every((a) => a.length === 0)
  return empty ? null : f
}

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t
}

function rangeOf(c: CheckpointLike): string {
  return `${Math.max(1, c.turnIndex - c.turnCount + 1)}-${c.turnIndex}`
}

const GENERIC_HEADING = /^(narrative |session |story )?summary\b[:\s-]*|^resumen( narrativo| de sesi[óo]n)?\b[:\s-]*/i

/** Título del capítulo: heading markdown o primera línea en negrita del resumen. */
export function chapterTitle(c: CheckpointLike): string {
  const lines = c.summary.split('\n').map((l) => l.trim()).filter(Boolean)
  for (const line of lines.slice(0, 4)) {
    const isHeading = /^#{1,4}\s+/.test(line)
    const isBold = /^\*\*[^*]+\*\*$/.test(line)
    if (!isHeading && !isBold) break
    const title = line.replace(/^#{1,4}\s+/, '').replace(/\*\*/g, '').replace(GENERIC_HEADING, '').trim()
    if (title.length >= 3) return clip(title, 60)
  }
  const beat = factsOf(c)?.emotional_beat
  if (beat) return clip(beat, 60)
  const firstSentence = c.summary.replace(/^[#*\s]+/, '').split(/(?<=[.!?])\s+/)[0] ?? ''
  return clip(firstSentence, 60)
}

function npcName(entry: string): string {
  return entry.split(/[:(—–-]/)[0].trim()
}

function uniqueBy<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const it of items) {
    const k = key(it).toLowerCase()
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(it)
  }
  return out
}

interface Ledger {
  chapters: string[]
  npcs: string[]
  decisions: string[]
  locations: string[]
  quests: string[]
  items: string[]
}

/** Condensa los checkpoints viejos en listas acotadas de hechos. */
export function buildLedger(older: CheckpointLike[]): Ledger {
  const chapters = older.slice(-CAPS.chapters).map((c) => `[${rangeOf(c)}] ${chapterTitle(c)}`)

  // NPCs: descripción de la primera presentación; prioridad por cuántos
  // capítulos lo mencionan (los recurrentes importan más que los de paso).
  const desc = new Map<string, string>()
  const mentions = new Map<string, number>()
  const order: string[] = []
  for (const c of older) {
    const f = factsOf(c)
    if (!f) continue
    const seenHere = new Set<string>()
    for (const e of [...f.npcs_introduced, ...f.npcs_referenced]) {
      const name = npcName(e)
      const key = name.toLowerCase()
      if (!key || key.length > 40) continue
      if (!desc.has(key)) { desc.set(key, clip(e, 90)); order.push(key) }
      else if (f.npcs_introduced.includes(e) && !desc.get(key)!.includes(':') && e.includes(':')) desc.set(key, clip(e, 90))
      if (!seenHere.has(key)) { seenHere.add(key); mentions.set(key, (mentions.get(key) ?? 0) + 1) }
    }
  }
  const npcKeys = order.length <= CAPS.npcs
    ? order
    : [...order].sort((a, b) => (mentions.get(b)! - mentions.get(a)!) || (order.indexOf(a) - order.indexOf(b))).slice(0, CAPS.npcs)
  const npcs = npcKeys.map((k) => desc.get(k)!)

  const allDecisions = older.flatMap((c) => factsOf(c)?.decisions_made ?? []).map((d) => clip(d, 110))
  const decisions = allDecisions.length <= CAPS.decisionsHead + CAPS.decisionsTail
    ? allDecisions
    : [...allDecisions.slice(0, CAPS.decisionsHead), ...allDecisions.slice(-CAPS.decisionsTail)]

  const locations = uniqueBy(older.flatMap((c) => factsOf(c)?.locations_visited ?? []), (l) => l).map((l) => clip(l, 60)).slice(-CAPS.locations)
  const quests = older.flatMap((c) => factsOf(c)?.quests_progressed ?? []).map((q) => clip(q, 120)).slice(-CAPS.quests)
  const items = older.flatMap((c) => factsOf(c)?.items_gained_lost ?? []).map((i) => clip(i, 80)).slice(-CAPS.items)

  return { chapters, npcs, decisions, locations, quests, items }
}

function renderLedger(l: Ledger, locale: StoryLocale): string {
  const L = locale === 'en'
    ? { chapters: 'Chapters so far', npcs: 'People met', decisions: 'Key decisions by the player', locations: 'Places visited', quests: 'Quest progress', items: 'Items gained/lost' }
    : { chapters: 'Capítulos hasta ahora', npcs: 'Personajes conocidos', decisions: 'Decisiones clave del jugador', locations: 'Lugares visitados', quests: 'Progreso de misiones', items: 'Objetos ganados/perdidos' }
  const lines: string[] = []
  if (l.chapters.length) lines.push(`${L.chapters}: ${l.chapters.join(' · ')}`)
  if (l.npcs.length) lines.push(`${L.npcs}: ${l.npcs.join('; ')}`)
  if (l.decisions.length) lines.push(`${L.decisions}: ${l.decisions.join('; ')}`)
  if (l.locations.length) lines.push(`${L.locations}: ${l.locations.join('; ')}`)
  if (l.quests.length) lines.push(`${L.quests}: ${l.quests.join('; ')}`)
  if (l.items.length) lines.push(`${L.items}: ${l.items.join('; ')}`)
  return lines.join('\n')
}

/** Recorta el ledger hasta entrar en el tope: primero lo menos importante. */
function fitLedger(l: Ledger, locale: StoryLocale, maxChars: number): string {
  const led: Ledger = { chapters: [...l.chapters], npcs: [...l.npcs], decisions: [...l.decisions], locations: [...l.locations], quests: [...l.quests], items: [...l.items] }
  // orden de sacrificio: objetos, lugares, misiones viejas, decisiones viejas, capítulos viejos, NPCs menos mencionados
  const trimOrder: Array<[keyof Ledger, 'front' | 'back', number]> = [
    ['items', 'front', 4], ['locations', 'front', 8], ['quests', 'front', 5], ['decisions', 'front', 10], ['chapters', 'front', 20], ['npcs', 'back', 12],
  ]
  let out = renderLedger(led, locale)
  let guard = 0
  while (out.length > maxChars && guard++ < 400) {
    const target = trimOrder.find(([k, , min]) => led[k].length > min) ?? trimOrder.find(([k]) => led[k].length > 0)
    if (!target) break
    const [k, side] = target
    if (side === 'front') led[k].shift(); else led[k].pop()
    out = renderLedger(led, locale)
  }
  return out.length > maxChars ? out.slice(0, maxChars) : out
}

/**
 * Arma el bloque "historia hasta ahora" para el prompt del DM.
 * Con pocos checkpoints (≤ RECENT_FULL_CHECKPOINTS) es idéntico al
 * comportamiento anterior: todos íntegros.
 */
export function buildStorySoFar(checkpoints: CheckpointLike[], locale: StoryLocale): string {
  if (checkpoints.length === 0) return ''
  const full = (c: CheckpointLike) => `[Turns ${rangeOf(c)}] ${c.summary}`
  if (checkpoints.length <= RECENT_FULL_CHECKPOINTS) return checkpoints.map(full).join('\n\n')

  const older = checkpoints.slice(0, -RECENT_FULL_CHECKPOINTS)
  const recent = checkpoints.slice(-RECENT_FULL_CHECKPOINTS)
  const ledger = fitLedger(buildLedger(older), locale, LEDGER_MAX_CHARS)
  const lastOld = older[older.length - 1].turnIndex

  const header = locale === 'en'
    ? `EARLIER STORY (turns 1-${lastOld}) — condensed ledger of ESTABLISHED FACTS. Never contradict them; do not re-introduce these people as strangers.`
    : `HISTORIA ANTERIOR (turnos 1-${lastOld}) — registro condensado de HECHOS ESTABLECIDOS. Nunca los contradigas; no vuelvas a presentar a estas personas como desconocidas.`
  const recentHeader = locale === 'en' ? 'RECENT STORY (full detail):' : 'HISTORIA RECIENTE (detalle completo):'
  return `${header}\n${ledger}\n\n${recentHeader}\n${recent.map(full).join('\n\n')}`
}
