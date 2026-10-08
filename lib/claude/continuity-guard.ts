/**
 * Guardias de continuidad del DM (puro, sin I/O).
 *
 * Complementan a repetition-guard.ts. Nacieron de las dos quejas de calidad
 * de la semana del 2026-10-06 (Anthony: "low quality"; Merlin: "the ai
 * forgets things and mixes stuff up"). La causa raíz de ambas fue la ventana
 * de turnos congelada (lib/claude/turn-window.ts); estas guardias son la red
 * determinística para que, aunque el modelo se descuide, el error no llegue
 * al jugador:
 *
 *  1. ACCIÓN RANCIA: el borrador cita literal (8+ palabras) una acción VIEJA
 *     del jugador que no es la actual → está resolviendo algo que ya pasó.
 *     Caso real: el interrogatorio del Rifleman ("What does the skull mean?
 *     What's the name of your outfit?") re-narrado 8 veces mientras el
 *     jugador asaltaba otro edificio.
 *  2. SALTO DE HORA: time_update que retrocede o salta 3+ franjas del día sin
 *     que la acción lo pida. Caso real: "Day 2, morning — early" → "Day 2,
 *     evening — sunset" en el turno siguiente, re-armando la cena del día 1.
 *  3. IDENTIDAD DE NPC: un NPC presentado como mujer pasa a "his mustache"
 *     dos turnos después. Se guarda el pronombre al presentarlo y se valida.
 *
 * Además, el LEDGER de NPCs (pronombre, descripción fija y lo que el NPC ya
 * sabe del jugador) se guarda en worldState.npc_states para que la memoria
 * de cada personaje no dependa de la ventana de turnos.
 */

import { normalizeText } from './repetition-guard'

/** `\b` de JS no reconoce letras acentuadas ("él", "última"): límites Unicode. */
function w(src: string, flags = 'iu'): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${src})(?![\\p{L}\\p{N}])`, flags)
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Acción rancia
// ─────────────────────────────────────────────────────────────────────────

/**
 * Largo mínimo del fragmento literal. Calibrado con datos de prod: con 8
 * palabras marca 5 de los 7 turnos del bucle de Anthony y 0 falsos
 * positivos en ~2.000 narraciones de las 12 sesiones más largas; con 6
 * marca 7/7 pero con 18 falsos positivos ("the far side of the overpass").
 */
export const STALE_ACTION_NGRAM = 8
/** Cuántas acciones viejas del jugador se miran hacia atrás. */
export const STALE_ACTION_LOOKBACK = 20

export interface StaleActionVerdict {
  stale: boolean
  /** fragmento literal compartido con la acción vieja */
  fragment: string
  /** la acción vieja citada (recortada) */
  oldAction: string
  /** cuántas acciones atrás está (1 = la anterior a la actual) */
  actionsAgo: number
}

/** Quita prefijos de sistema de la acción guardada ("[Roll: 1d20+3 = 18] ..."). */
export function cleanPlayerAction(text: string): string {
  return text.replace(/^\s*(\[[^\]]*\]\s*)+/, '').trim()
}

function wordNgrams(text: string, n: number): Set<string> {
  const words = normalizeText(text).split(' ').filter(Boolean)
  const out = new Set<string>()
  for (let i = 0; i + n <= words.length; i++) out.add(words.slice(i, i + n).join(' '))
  return out
}

/**
 * `previousActions` en orden cronológico, SIN la acción actual.
 */
export function detectStaleActionReplay(
  narration: string,
  currentAction: string,
  previousActions: string[],
  n = STALE_ACTION_NGRAM
): StaleActionVerdict {
  const none: StaleActionVerdict = { stale: false, fragment: '', oldAction: '', actionsAgo: 0 }
  const narrationGrams = wordNgrams(narration, n)
  if (narrationGrams.size === 0) return none
  const currentGrams = wordNgrams(cleanPlayerAction(currentAction), n)
  const current = normalizeText(cleanPlayerAction(currentAction))
  const recent = previousActions.slice(-STALE_ACTION_LOOKBACK)
  for (let i = recent.length - 1; i >= 0; i--) {
    const old = cleanPlayerAction(recent[i])
    // el jugador repitió la misma acción: citarla es resolver la actual
    if (normalizeText(old) === current) continue
    for (const gram of wordNgrams(old, n)) {
      if (!currentGrams.has(gram) && narrationGrams.has(gram)) {
        return {
          stale: true,
          fragment: gram,
          oldAction: old.replace(/\s+/g, ' ').slice(0, 160),
          actionsAgo: recent.length - i,
        }
      }
    }
  }
  return none
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Salto de hora
// ─────────────────────────────────────────────────────────────────────────

/**
 * Franjas del día en orden (0-9). La franja de un texto es la PRIMERA
 * palabra clave que aparece ("Day 2, evening — sunset" → evening): el DM
 * escribe la franja principal primero y la aclara después.
 */
const PHASE_KEYWORDS: Array<[RegExp, number]> = [
  [w('pre[- ]?dawn|small hours|madrugada'), 0],
  [w('dawn|daybreak|sunrise|first light|amanecer|alba'), 1],
  [w('late morning|mid[- ]?morning|media mañana'), 3],
  [w('early morning|morning|mañana'), 2],
  [w('midday|noon|mediodía'), 4],
  [w('late afternoon|última hora de la tarde'), 6],
  [w('early afternoon|mid[- ]?afternoon|afternoon|media tarde|siesta|tarde'), 5],
  [w('sunset|dusk|twilight|evening|nightfall|atardecer|anochecer|crepúsculo'), 7],
  [w('late night|midnight|deep night|dead of night|medianoche|noche cerrada'), 9],
  [w('night|noche'), 8],
]

export interface TimeOfDay {
  day: number | null
  phase: number
  /** minutos desde medianoche si el texto trae hora ("11:59 PM", "04:30") */
  clock: number | null
}

function parseClock(text: string): number | null {
  const m = text.match(/(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?/i)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h > 23 || min > 59) return null
  const ampm = m[3]?.toLowerCase().replace(/\./g, '')
  if (ampm === 'pm' && h < 12) h += 12
  if (ampm === 'am' && h === 12) h = 0
  return h * 60 + min
}

export function parseTimeOfDay(text: string | null | undefined): TimeOfDay | null {
  if (!text || typeof text !== 'string') return null
  const dayMatch = text.match(w('(?:day|día|dia)\\s*(\\d{1,4})'))
  const day = dayMatch ? parseInt(dayMatch[1], 10) : null
  // "Day 2" no debe leerse como franja.
  const body = text.replace(w('(?:day|día|dia)\\s*\\d{1,4}', 'giu'), ' ')
  const clock = parseClock(body)
  let best: { index: number; length: number; phase: number } | null = null
  for (const [re, phase] of PHASE_KEYWORDS) {
    const m = re.exec(body)
    if (!m) continue
    const cand = { index: m.index, length: m[0].length, phase }
    if (!best || cand.index < best.index || (cand.index === best.index && cand.length > best.length)) best = cand
  }
  if (!best) return null
  return { day, phase: best.phase, clock }
}

/** Saltar esta cantidad de franjas en un turno, sin motivo, es un error. */
export const TIME_JUMP_PHASES = 3

/** La acción del jugador hace pasar el tiempo (dormir, esperar, viajar...). */
const TIME_SKIP_CUES = w('sleep|slept|asleep|nap|bed|bunk|first light|(?:went|go|going|came|come|get|got) back|rest|rested|resting|wait|waited|waiting|later|hours?|until|meanwhile|tomorrow|tonight|morning|evening|night|dinner|supper|sunset|dusk|dawn|travel\\w*|journey\\w*|ride|rode|fly|flew|head(?:ing)? (?:back|to|out|home)|walk(?:ing)? (?:back|to|home)|return\\w*|ma(?:k|d)e (?:my|our) way|camp\\w*|days?|dorm\\w*|duerm\\w*|descans\\w*|esper\\w*|más tarde|horas?|hasta que|mañana|noche|cena\\w*|atardecer|viaj\\w*|regres\\w*|volv\\w*|acamp\\w*|días?')

/** La narración misma explica que pasó el tiempo (montaje legítimo del DM). */
const NARRATED_TIME_SKIP = w('hours (?:later|pass)|by the time|by (?:evening|nightfall|dusk|sunset|night|morning|noon)|the (?:rest|remainder) of the (?:day|afternoon|morning|evening)|as the (?:day|afternoon|morning) (?:wears on|passes)|later that (?:day|evening|night|afternoon)|time passes|the next (?:morning|day)|the following (?:morning|day)|horas (?:después|más tarde)|para cuando|al caer la (?:noche|tarde)|el resto del día|pasan las horas|a la mañana siguiente|al día siguiente')

export interface TimeVerdict {
  ok: boolean
  reason: 'backward' | 'jump' | null
  previous: string
  next: string
}

export function assessTimeUpdate(
  previousTime: string | null | undefined,
  nextTime: string | null | undefined,
  ctx: { playerAction: string; narration: string; sceneChange: boolean }
): TimeVerdict {
  const ok: TimeVerdict = { ok: true, reason: null, previous: previousTime || '', next: nextTime || '' }
  if (!nextTime || !previousTime || nextTime.trim() === previousTime.trim()) return ok
  const prev = parseTimeOfDay(previousTime)
  const next = parseTimeOfDay(nextTime)
  if (!prev || !next) return ok

  // Con hora de reloj en ambos y días conocidos: diferencia real en minutos.
  if (prev.clock !== null && next.clock !== null && prev.day !== null && next.day !== null) {
    const minutes = (next.day - prev.day) * 1440 + (next.clock - prev.clock)
    if (minutes <= -90) return { ...ok, ok: false, reason: 'backward' }
    if (minutes < 6 * 60) return ok
  }
  let delta: number
  // La noche sigue con el mismo número de día: "Day 1, late night" →
  // "Day 1, pre-dawn" es avanzar, no retroceder.
  const nextPhase = prev.phase >= 8 && next.phase <= 2 && (next.day === null || next.day === prev.day) ? next.phase + 10 : next.phase
  if (prev.day !== null && next.day !== null) {
    delta = (next.day - prev.day) * 10 + (nextPhase - prev.phase)
  } else {
    // sin día explícito: una franja "anterior" es el día siguiente
    delta = nextPhase >= prev.phase ? nextPhase - prev.phase : nextPhase + 10 - prev.phase
  }
  // Retroceder una o dos franjas es el DM afinando ("early morning" →
  // "pre-dawn"); retroceder medio día es perder el hilo.
  if (delta <= -TIME_JUMP_PHASES) return { ...ok, ok: false, reason: 'backward' }
  if (delta < TIME_JUMP_PHASES) return ok
  if (ctx.sceneChange) return ok
  if (TIME_SKIP_CUES.test(ctx.playerAction)) return ok
  if (NARRATED_TIME_SKIP.test(ctx.narration)) return ok
  return { ...ok, ok: false, reason: 'jump' }
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Ledger de NPCs: pronombre fijo, descripción fija, lo que ya sabe
// ─────────────────────────────────────────────────────────────────────────

export type NpcPronoun = 'she' | 'he' | 'they'

export interface NpcLedgerEntry {
  status?: string
  location?: string
  introduced?: boolean
  /** fijado al presentarlo; nunca se pisa */
  pronouns?: NpcPronoun
  /** quién es, fijado al presentarlo (≤80 chars); nunca se pisa */
  description?: string
  /** hechos que el NPC ya sabe del jugador o presenció (últimos 8) */
  knows?: string[]
  [key: string]: unknown
}

export const NPC_KNOWS_CAP = 8
const KNOW_MAX_CHARS = 140
const DESCRIPTION_MAX_CHARS = 80

export function normalizePronouns(raw: unknown): NpcPronoun | undefined {
  if (typeof raw !== 'string') return undefined
  const s = raw.toLowerCase()
  if (w('they|them|elle|non-?binary').test(s)) return 'they'
  if (w('she|her|female|woman|ella|mujer|femenino').test(s)) return 'she'
  if (w('he|him|his|male|man|él|hombre|masculino').test(s)) return 'he'
  return undefined
}

/**
 * Fusiona una actualización del DM con lo guardado. Antes, cada npc_update
 * REEMPLAZABA la entrada entera ({status, location, introduced}) y se perdía
 * todo lo demás. Pronombre y descripción quedan fijos desde la presentación.
 */
export function mergeNpcLedgerEntry(
  previous: unknown,
  update: { status?: string; location?: string; pronouns?: unknown; description?: unknown; learned?: unknown },
  fallbackLocation = ''
): NpcLedgerEntry {
  const prev: NpcLedgerEntry =
    typeof previous === 'string' ? { status: previous } : previous && typeof previous === 'object' ? { ...(previous as NpcLedgerEntry) } : {}
  const next: NpcLedgerEntry = {
    ...prev,
    status: update.status || prev.status || 'alive',
    location: update.location || prev.location || fallbackLocation,
    introduced: true,
  }
  if (!prev.pronouns) {
    const p = normalizePronouns(update.pronouns)
    if (p) next.pronouns = p
  }
  if (!prev.description && typeof update.description === 'string' && update.description.trim()) {
    next.description = update.description.trim().replace(/\s+/g, ' ').slice(0, DESCRIPTION_MAX_CHARS)
  }
  const learnedList = (Array.isArray(update.learned) ? update.learned : [update.learned])
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 3)
    .map((x) => x.trim().replace(/\s+/g, ' ').slice(0, KNOW_MAX_CHARS))
  if (learnedList.length > 0) {
    const knows = Array.isArray(prev.knows) ? [...prev.knows] : []
    for (const fact of learnedList) {
      const key = normalizeText(fact)
      if (!knows.some((k) => normalizeText(k) === key)) knows.push(fact)
    }
    next.knows = knows.slice(-NPC_KNOWS_CAP)
  }
  return next
}

/** Pronombres de 3ª persona (sin sustantivos: "the woman behind the desk" suele ser otra persona). */
const FEMALE_PRONOUNS = w('she|her|hers|herself|ella', 'giu')
const MALE_PRONOUNS = w('he|him|his|himself|él', 'giu')

/** Saca los diálogos: lo que un NPC DICE suele hablar de otra persona. */
function withoutDialogue(text: string): string {
  return text
    .replace(/\[[^\]\n]*\]/g, ' ') // [Lys: "He's standing down"]
    .replace(/\*\([^)\n]*\)\*/g, ' ') // *(hissed, urgent)*
    .replace(/^\s*>.*$/gm, ' ') // citas/tablas en bloque
    .replace(/"[^"\n]*"/g, ' ')
    .replace(/“[^”\n]*”/g, ' ')
    .replace(/«[^»\n]*»/g, ' ')
}

function sentencesOf(text: string): string[] {
  return text.split(/(?<=[.!?…])\s+|\n+/).map((x) => x.trim()).filter(Boolean)
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Posición del nombre como SUJETO (primeras palabras, no posesivo "Kael's"). */
function subjectAt(sentence: string, name: string): number {
  const m = sentence.match(w(escapeRe(name), 'u'))
  if (!m || m.index === undefined) return -1
  if (/^['’]s\b/.test(sentence.slice(m.index + name.length))) return -1
  const before = sentence.slice(0, m.index).replace(/[*_\[\]—–-]/g, ' ').trim()
  if (before.split(/\s+/).filter(Boolean).length > 2) return -1
  return m.index
}

const PRONOUN_WINDOW_WORDS = 40

/**
 * Pronombres que refieren a `name`: desde la oración donde es sujeto, unas
 * 40 palabras, cortando si aparece otro NPC conocido.
 */
function pronounCounts(name: string, narration: string, otherNames: string[]): { f: number; m: number } {
  let f = 0
  let m = 0
  const sents = sentencesOf(withoutDialogue(narration))
  for (let i = 0; i < sents.length; i++) {
    const at = subjectAt(sents[i], name)
    if (at < 0) continue
    const window = [sents[i].slice(at + name.length)]
    let words = window[0].split(/\s+/).length
    // ~40 palabras: "Once. Twice." no deben agotar la ventana
    for (let j = i + 1; j < sents.length && words < PRONOUN_WINDOW_WORDS; j++) {
      if (otherNames.some((o) => o !== name && sents[j].match(w(escapeRe(o), 'u')))) break
      if (sents[j].match(w(escapeRe(name), 'u'))) break
      window.push(sents[j])
      words += sents[j].split(/\s+/).length
    }
    const text = window.join(' ')
    if (otherNames.some((o) => o !== name && text.match(w(escapeRe(o), 'u')))) continue
    f += (text.match(FEMALE_PRONOUNS) || []).length
    m += (text.match(MALE_PRONOUNS) || []).length
  }
  return { f, m }
}

/**
 * Pronombre de un NPC a partir de la narración donde aparece. Exige un lado
 * claro (≥2 vs 0) para no adivinar.
 */
export function inferNpcPronouns(name: string, narration: string, otherNpcNames: string[] = []): NpcPronoun | undefined {
  const { f, m } = pronounCounts(name, narration, otherNpcNames)
  if (f >= 2 && m === 0) return 'she'
  if (m >= 2 && f === 0) return 'he'
  return undefined
}

/**
 * Pronombres del género contrario necesarios para rechazar el borrador.
 * Calibrado con 5.696 narraciones de prod: con 2 había ~1% de marcas y la
 * mitad eran el NPC hablando de otra persona; el caso real de la sargento
 * ("His mustache... a man recalibrating his... He straightens his posture")
 * suma 4.
 */
export const IDENTITY_FLIP_MIN = 3

export interface NpcIdentityFlip {
  name: string
  expected: NpcPronoun
  snippet: string
}

/**
 * ¿El borrador cambia el género de un NPC con pronombre fijo? Mismo criterio
 * que la inferencia: NPC como sujeto, sin diálogos, 2+ pronombres del género
 * contrario y ninguno del esperado.
 */
export function detectNpcIdentityFlip(
  narration: string,
  ledger: Record<string, NpcLedgerEntry | unknown>
): NpcIdentityFlip | null {
  const names = Object.keys(ledger)
  for (const name of names) {
    const entry = ledger[name] as NpcLedgerEntry | undefined
    const expected = entry && typeof entry === 'object' ? entry.pronouns : undefined
    if (expected !== 'she' && expected !== 'he') continue
    const { f, m } = pronounCounts(name, narration, names)
    const wrong = expected === 'she' ? m : f
    const right = expected === 'she' ? f : m
    if (wrong >= IDENTITY_FLIP_MIN && right === 0) {
      const sent = sentencesOf(withoutDialogue(narration)).find((x) => subjectAt(x, name) >= 0) || ''
      const idx = narration.indexOf(sent.slice(0, 40))
      return { name, expected, snippet: narration.slice(Math.max(0, idx), Math.max(0, idx) + 140).replace(/\s+/g, ' ') }
    }
  }
  return null
}

/** Línea compacta para el prompt: "Mira (she/her; scarred guild master)". */
export function npcIdentityLabel(name: string, entry: NpcLedgerEntry | unknown): string {
  const e = entry && typeof entry === 'object' ? (entry as NpcLedgerEntry) : {}
  const bits: string[] = []
  if (e.pronouns) bits.push(e.pronouns === 'she' ? 'she/her' : e.pronouns === 'he' ? 'he/him' : 'they/them')
  if (e.description) bits.push(e.description)
  return bits.length > 0 ? `${name} [${bits.join('; ')}]` : name
}

/** Bloque "lo que estos NPCs ya saben" para los NPCs presentes en la escena. */
export function npcKnowledgeBlock(
  presentNames: string[],
  ledger: Record<string, unknown>,
  locale: 'es' | 'en'
): string {
  const lines: string[] = []
  for (const name of presentNames) {
    const e = ledger[name] as NpcLedgerEntry | undefined
    const knows = e && typeof e === 'object' && Array.isArray(e.knows) ? e.knows : []
    if (knows.length > 0) lines.push(`- ${npcIdentityLabel(name, e)}: ${knows.join(' · ')}`)
  }
  if (lines.length === 0) return ''
  return locale === 'en'
    ? `WHAT THESE NPCs ALREADY KNOW (they witnessed it or were told — they NEVER ask about it again, they act on it):\n${lines.join('\n')}`
    : `LO QUE ESTOS NPCs YA SABEN (lo presenciaron o se lo contaron — NUNCA vuelven a preguntarlo, actúan en consecuencia):\n${lines.join('\n')}`
}

/**
 * NPCs presentes sin identidad fija → pedir el npc_update ESTE turno con
 * nombres concretos (la regla genérica del prompt sola no alcanzó: en la
 * prueba E2E el DM no completó a Marta ni a Barliman en dos turnos).
 */
export function npcIdentityMissingDirective(
  presentNames: string[],
  ledger: Record<string, unknown>,
  locale: 'es' | 'en',
  max = 4
): string {
  const missing = presentNames
    .filter((n) => {
      const e = ledger[n] as NpcLedgerEntry | undefined
      return !(e && typeof e === 'object' && e.pronouns)
    })
    .slice(0, max)
  if (missing.length === 0) return ''
  return locale === 'en'
    ? `🪪 FIX NPC IDENTITY: ${missing.join(', ')} ${missing.length === 1 ? 'has' : 'have'} no fixed identity yet. THIS turn, send npc_update (array) with "pronouns" and "description" for each, matching how they were already narrated. Whenever an NPC learns something important about the player, add it as "learned".`
    : `🪪 FIJAR IDENTIDAD: ${missing.join(', ')} todavía no ${missing.length === 1 ? 'tiene' : 'tienen'} identidad fija. ESTE turno mandá npc_update (array) con "pronouns" y "description" para cada uno, según como ya se los narró. Cada vez que un NPC se entere de algo importante del jugador, sumalo en "learned".`
}

// ─────────────────────────────────────────────────────────────────────────
// Directiva de reintento combinada
// ─────────────────────────────────────────────────────────────────────────

export interface ContinuityIssues {
  stale?: StaleActionVerdict
  time?: TimeVerdict
  identity?: NpcIdentityFlip
}

export type ContinuityIssueKind = 'stale_action' | 'time_jump' | 'npc_identity'

export function issueKinds(issues: ContinuityIssues): ContinuityIssueKind[] {
  const out: ContinuityIssueKind[] = []
  if (issues.stale?.stale) out.push('stale_action')
  if (issues.time && !issues.time.ok) out.push('time_jump')
  if (issues.identity) out.push('npc_identity')
  return out
}

export function continuityRetryDirective(
  issues: ContinuityIssues,
  playerAction: string,
  locale: 'es' | 'en'
): string {
  const action = `«${cleanPlayerAction(playerAction).replace(/\s+/g, ' ').slice(0, 160)}»`
  const parts: string[] = []
  const en = locale === 'en'
  if (issues.stale?.stale) {
    const s = issues.stale
    parts.push(en
      ? `It re-narrates the player's OLD action «${s.oldAction}» from ${s.actionsAgo} turn(s) ago. That already happened and was resolved. Narrate ONLY the consequence of the CURRENT action ${action}.`
      : `Re-narra la acción VIEJA del jugador «${s.oldAction}» de hace ${s.actionsAgo} turno(s). Eso ya pasó y se resolvió. Narrá SOLO la consecuencia de la acción ACTUAL ${action}.`)
  }
  if (issues.time && !issues.time.ok) {
    const t = issues.time
    parts.push(en
      ? `It moved the clock from "${t.previous}" to "${t.next}", but nothing in the player's action makes that time pass. It is STILL "${t.previous}". Everything narrated earlier today already happened — do not schedule it again for "tonight" or "tomorrow". Keep time_update at "${t.previous}" or advance it only slightly.`
      : `Movió el reloj de "${t.previous}" a "${t.next}", pero nada en la acción del jugador hace pasar ese tiempo. SIGUE siendo "${t.previous}". Todo lo narrado antes hoy ya pasó — no lo vuelvas a agendar para "esta noche" o "mañana". Dejá time_update en "${t.previous}" o avanzalo apenas.`)
  }
  if (issues.identity) {
    const i = issues.identity
    const pron = i.expected === 'she' ? (en ? 'she/her (a woman)' : 'ella (mujer)') : (en ? 'he/him (a man)' : 'él (hombre)')
    parts.push(en
      ? `It changed who ${i.name} is: ${i.name} was established as ${pron}. Keep ${i.name}'s gender, appearance and role exactly as established.`
      : `Cambió quién es ${i.name}: ${i.name} quedó establecido como ${pron}. Mantené su género, aspecto y rol exactamente como se establecieron.`)
  }
  if (parts.length === 0) return ''
  return en
    ? `\n\n⛔ SYSTEM — YOUR PREVIOUS DRAFT WAS REJECTED FOR A CONTINUITY ERROR.\n${parts.map((p) => `- ${p}`).join('\n')}\nWrite the turn again from scratch, consistent with everything already established.`
    : `\n\n⛔ SISTEMA — TU BORRADOR ANTERIOR FUE RECHAZADO POR UN ERROR DE CONTINUIDAD.\n${parts.map((p) => `- ${p}`).join('\n')}\nEscribí el turno de nuevo desde cero, coherente con todo lo ya establecido.`
}
