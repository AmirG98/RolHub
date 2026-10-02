/**
 * Guardia anti re-narración del DM.
 *
 * Caso real (2026-10-01, cliente en trial, Zombies/PbtA, pidió reembolso):
 * el DM narró CUATRO veces la misma llegada al portón del campamento
 * ("the cargo truck rolls through the main gate just as the last light
 * bleeds out of the sky") en los turnos 51/53/57/61 y abrió las mismas
 * cajas dos veces, en vez de resolver la acción nueva del jugador. Dos
 * causas:
 *   1. El historial condensado guardaba las PRIMERAS dos oraciones de cada
 *      turno viejo del DM — justo la ambientación ("el camión entra por el
 *      portón") y descartaba la resolución. El modelo veía una cadena de
 *      aperturas idénticas y seguía el patrón. Se retroalimentaba.
 *   2. No había ninguna verificación server-side de la salida: pedirle al
 *      modelo "no repitas" es una súplica, no una garantía.
 *
 * Este módulo es puro (sin I/O) y se usa en dos lugares: el route del turno
 * (reintento con directiva correctiva) y el playtest nocturno (invariante).
 */

export interface RenarrationVerdict {
  repetitive: boolean
  /** motivo principal: 'opening' | 'body' | 'rearrival' | null */
  reason: 'opening' | 'body' | 'rearrival' | null
  /** índice en `previous` del turno más parecido (o -1) */
  matchIndex: number
  openingScore: number
  bodyScore: number
  /** apertura del borrador, para citarla en la directiva de reintento */
  openingSnippet: string
}

export interface RenarrationContext {
  /** turnos que el jugador lleva en la escena actual (0 = recién llegó) */
  turnsInScene: number
  /** el borrador cambia de escena (scene_change) → llegar a un lugar es legítimo */
  sceneChangeInDraft: boolean
}

/** Apertura con la misma similitud de palabras que esto → re-narración. */
export const OPENING_JACCARD_THRESHOLD = 0.4
/** Solapamiento de 4-gramas de palabras en todo el texto → copia parcial. */
export const BODY_SHINGLE_THRESHOLD = 0.18

const OPENING_CHARS = 180

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\*\*|__|[«»"“”'‘’`]/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ') // tags [NPC: ...]
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function openingOf(text: string): string {
  return normalizeText(text).slice(0, OPENING_CHARS)
}

function wordSet(text: string): Set<string> {
  return new Set(text.split(' ').filter((w) => w.length > 2))
}

function shingles(text: string, n = 4): Set<string> {
  const words = text.split(' ').filter(Boolean)
  const out = new Set<string>()
  for (let i = 0; i + n <= words.length; i++) out.add(words.slice(i, i + n).join(' '))
  return out
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / (a.size + b.size - inter)
}

/**
 * ¿La apertura narra una LLEGADA/ENTRADA a un lugar? Si el jugador ya lleva
 * turnos en la escena y el borrador no cambia de escena, volver a narrar la
 * llegada es exactamente el bug (51→53→57→61).
 */
const ARRIVAL_PATTERNS: RegExp[] = [
  /\b(rolls?|roll|pulls?|pull|drives?|drive|eases?|ease|walks?|walk|steps?|step)\b[^.]{0,40}\b(through|into|up to|past)\b[^.]{0,40}\b(gate|door|doors|entrance|camp|perimeter|checkpoint|threshold|town|village|city|room|hall|cabin|shed|clearing)\b/i,
  /\b(looms? ahead|comes? into view|appears? ahead|is already visible)\b/i,
  /\byou (arrive|reach|enter|approach|pull up|push (the|open)|step (into|inside|through))\b/i,
  /\b(entr[áa]s|llegas|llegás|te acerc[áa]s|cruz[áa]s el (port[óo]n|umbral|puerta))\b/i,
  /\b(se alza|aparece|asoma) (ante|frente a|delante de)\b/i,
]

export function opensWithArrival(text: string): boolean {
  const firstSentences = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
  return ARRIVAL_PATTERNS.some((re) => re.test(firstSentences))
}

/**
 * Compara el borrador contra las narraciones previas del DM.
 * `previous` va en orden cronológico (la última es la más reciente).
 */
export function detectRenarration(
  candidate: string,
  previous: string[],
  ctx: RenarrationContext = { turnsInScene: 0, sceneChangeInDraft: false }
): RenarrationVerdict {
  const candOpening = openingOf(candidate)
  const candOpeningWords = wordSet(candOpening)
  const candShingles = shingles(normalizeText(candidate))

  let best = { idx: -1, opening: 0, body: 0 }
  previous.forEach((prev, idx) => {
    const opening = jaccard(candOpeningWords, wordSet(openingOf(prev)))
    const body = jaccard(candShingles, shingles(normalizeText(prev)))
    if (opening > best.opening || (opening === best.opening && body > best.body)) {
      best = { idx, opening, body }
    } else if (body > best.body && opening >= best.opening * 0.8) {
      best = { idx, opening, body }
    }
  })

  const snippet = candidate.replace(/\s+/g, ' ').trim().slice(0, 140)
  if (best.opening >= OPENING_JACCARD_THRESHOLD) {
    return { repetitive: true, reason: 'opening', matchIndex: best.idx, openingScore: best.opening, bodyScore: best.body, openingSnippet: snippet }
  }
  if (best.body >= BODY_SHINGLE_THRESHOLD) {
    return { repetitive: true, reason: 'body', matchIndex: best.idx, openingScore: best.opening, bodyScore: best.body, openingSnippet: snippet }
  }
  if (ctx.turnsInScene >= 1 && !ctx.sceneChangeInDraft && opensWithArrival(candidate)) {
    return { repetitive: true, reason: 'rearrival', matchIndex: best.idx, openingScore: best.opening, bodyScore: best.body, openingSnippet: snippet }
  }
  return { repetitive: false, reason: null, matchIndex: best.idx, openingScore: best.opening, bodyScore: best.body, openingSnippet: snippet }
}

/**
 * Condensa un turno viejo del DM para el historial: las ÚLTIMAS oraciones
 * sustantivas (la resolución), no las primeras (la ambientación). Antes se
 * guardaban las primeras dos y el modelo veía "el camión entra por el
 * portón" cuatro veces seguidas.
 */
export function condenseNarration(content: string, maxSentences = 2, maxChars = 90): string {
  const sentences = content
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15)
    // preguntas/ganchos finales ("¿Qué hacés?") no aportan estado
    .filter((s) => !/[?¿]\s*$/.test(s))
  const tail = sentences.slice(-maxSentences).map((s) => (s.length > maxChars ? s.slice(0, maxChars).trimEnd() + '…' : s))
  return tail.join(' ')
}

/** Directiva correctiva para el reintento cuando el borrador re-narró. */
export function renarrationRetryDirective(
  verdict: RenarrationVerdict,
  playerAction: string,
  currentScene: string,
  turnsInScene: number,
  locale: 'es' | 'en'
): string {
  const quoted = `«${verdict.openingSnippet}»`
  const action = `«${playerAction.replace(/\s+/g, ' ').trim().slice(0, 160)}»`
  if (locale === 'en') {
    const why = verdict.reason === 'rearrival'
      ? `It narrates ARRIVING at "${currentScene}", but the player has been here for ${turnsInScene} turn(s) — the arrival was already narrated.`
      : `It repeats a narration you already gave (${Math.round(Math.max(verdict.openingScore, verdict.bodyScore) * 100)}% overlap).`
    return `\n\n⛔ SYSTEM — YOUR PREVIOUS DRAFT WAS REJECTED. It began: ${quoted}. ${why}
Write it again from scratch. RULES: (1) The player is ALREADY inside the scene; do not describe entering, arriving, pulling up, the gate, the light or the setting again. (2) Your FIRST sentence must be the direct consequence of the player's action ${action}. (3) Anything already narrated in previous turns is DONE — reference it in half a sentence at most; never re-stage it. (4) Advance the situation with something NEW.`
  }
  const why = verdict.reason === 'rearrival'
    ? `Narra la LLEGADA a "${currentScene}", pero el jugador ya lleva ${turnsInScene} turno(s) acá — la llegada ya se narró.`
    : `Repite una narración que ya diste (${Math.round(Math.max(verdict.openingScore, verdict.bodyScore) * 100)}% de solapamiento).`
  return `\n\n⛔ SISTEMA — TU BORRADOR ANTERIOR FUE RECHAZADO. Empezaba: ${quoted}. ${why}
Escribilo de nuevo desde cero. REGLAS: (1) El jugador YA está dentro de la escena; no describas entrar, llegar, estacionar, el portón, la luz ni el escenario otra vez. (2) Tu PRIMERA oración tiene que ser la consecuencia directa de la acción del jugador ${action}. (3) Lo ya narrado en turnos anteriores está HECHO — mencionalo en media oración como mucho; nunca lo vuelvas a montar. (4) Avanzá la situación con algo NUEVO.`
}
