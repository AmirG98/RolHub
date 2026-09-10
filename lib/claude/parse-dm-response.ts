// Parseo robusto de la respuesta del DM (Claude).
//
// El contrato es UN objeto JSON con "narration" + campos estructurados. En
// prod el modelo lo rompe (medido 2026-09-09: 11% de los turnos) de varias
// formas: prosa suelta + bloque ```json aparte; objeto raíz truncado por
// max_tokens; JSON/fences embebidos dentro de narration; narration como
// array de párrafos; objeto raíz válido seguido de otro bloque.
//
// Garantías de este módulo:
//   1. NUNCA devuelve JSON crudo como narración (si no hay texto, devuelve '').
//   2. Recupera los campos estructurados estén donde estén, pero SOLO si
//      validan contra el schema Zod del DMResponse (un quest_create sin
//      objectives no llega al consumidor y no rompe el turno).
//   3. Un único mecanismo para encontrar objetos JSON: el scanner de llaves
//      balanceadas. Las llaves sueltas de la prosa se preservan.

import { dmResponseSchema } from '@/lib/validation/dm-response.schema'

/** Campos del DMResponse, derivados del schema para que no se desincronicen. */
const DM_KEYS: readonly string[] = Object.keys(dmResponseSchema.shape)
const DM_KEY_RE = new RegExp(`"(?:${DM_KEYS.join('|')})"\\s*:`)
const JSON_TAGS = new Set(['json', 'js', 'javascript'])

export interface StructuredBlock {
  start: number
  end: number
  /** objeto parseado, o null si estaba truncado/malformado */
  obj: Record<string, unknown> | null
  truncated: boolean
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Índice justo después de la llave que cierra la abierta en `start`, o -1. */
function findBalancedEnd(text: string, start: number): number {
  let depth = 0
  let inStr = false
  let esc = false
  for (let j = start; j < text.length; j++) {
    const ch = text[j]
    if (inStr) {
      if (esc) esc = false
      else if (ch === '\\') esc = true
      else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') inStr = true
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return j + 1
    }
  }
  return -1
}

/**
 * Encuentra objetos JSON balanceados que contengan campos del DMResponse.
 * Llaves sueltas de prosa ("{sigh}", "{Oldford Inn — …") se ignoran y se
 * preservan. Un objeto SIN cerrar solo cuenta como truncado si está en la
 * cola del texto (después del último bloque) y empieza como JSON ({ "key":).
 */
export function findStructuredBlocks(text: string): StructuredBlock[] {
  const blocks: StructuredBlock[] = []
  let i = 0
  while (i < text.length) {
    const start = text.indexOf('{', i)
    if (start < 0) break
    const end = findBalancedEnd(text, start)
    if (end < 0) { i = start + 1; continue }
    const slice = text.slice(start, end)
    if (DM_KEY_RE.test(slice)) {
      let obj: Record<string, unknown> | null = null
      try {
        const parsed: unknown = JSON.parse(slice)
        if (isPlainObject(parsed)) obj = parsed
      } catch {
        // malformado: se quita del texto igual, sin recuperar campos
      }
      blocks.push({ start, end, obj, truncated: false })
      i = end
    } else {
      i = start + 1
    }
  }

  // JSON truncado por max_tokens: solo puede estar al final.
  const tailFrom = blocks.length > 0 ? blocks[blocks.length - 1].end : 0
  const tailRe = /\{\s*"[A-Za-z_]+"\s*:/g
  tailRe.lastIndex = 0
  const tail = text.slice(tailFrom)
  let m: RegExpExecArray | null
  while ((m = tailRe.exec(tail)) !== null) {
    const start = tailFrom + m.index
    if (findBalancedEnd(text, start) < 0 && DM_KEY_RE.test(text.slice(start))) {
      blocks.push({ start, end: text.length, obj: null, truncated: true })
      break
    }
  }
  return blocks
}

/**
 * Procesa los fences ``` emparejándolos EN ORDEN (apertura↔cierre).
 * - fence json/js, o cuyo contenido es un objeto JSON → se quita entero
 * - fence de texto plano ("cartel" del DM) → se conserva el texto
 * - fence de una sola línea (```BEWARE THE MARSH```) → conserva el texto
 * - fence sin cerrar → json: cortar hasta el final; texto: quitar el marcador
 */
function unwrapFences(text: string): string {
  const marks: number[] = []
  let idx = text.indexOf('```')
  while (idx >= 0) {
    marks.push(idx)
    idx = text.indexOf('```', idx + 3)
  }
  if (marks.length === 0) return text

  let out = ''
  let cursor = 0
  for (let k = 0; k < marks.length; k += 2) {
    const open = marks[k]
    const close: number | undefined = marks[k + 1]
    out += text.slice(cursor, open)
    // Solo es "tag" si la primera línea tras ``` es una palabra sola, o si
    // es una tag JSON pegada al cierre (```json {...}``` en una línea: al
    // quitar el bloque queda "```json ```" y la palabra no debe filtrarse).
    // Una palabra suelta que NO es tag JSON y cierra en la misma línea es
    // contenido ("```Danger```") y se conserva.
    const head = text.slice(open + 3).match(/^([A-Za-z]*)[ \t]*(\n|(?=```))/)
    const tag = (head?.[1] ?? '').toLowerCase()
    const isJsonTag = JSON_TAGS.has(tag)
    const consumeTag = head !== null && (head[2] === '\n' || isJsonTag)
    const innerStart = open + 3 + (consumeTag ? head[0].length : 0)
    if (close === undefined) {
      cursor = isJsonTag ? text.length : innerStart
      break
    }
    const inner = text.slice(innerStart, close)
    const looksJson = /^\s*\{[\s\S]*\}\s*$/.test(inner)
    if (!isJsonTag && !looksJson && inner.trim().length > 0) out += inner
    cursor = close + 3
  }
  out += text.slice(cursor)
  return out
}

/**
 * Quita del texto los bloques JSON estructurados y los fences, y devuelve
 * los campos que se pudieron recuperar de esos bloques (sin validar).
 */
export function extractEmbeddedJson(text: string): { text: string; recovered: Record<string, unknown> } {
  const blocks = findStructuredBlocks(text)
  const recovered: Record<string, unknown> = {}
  let out = ''
  let cursor = 0
  for (const b of blocks) {
    out += text.slice(cursor, b.start)
    cursor = b.end
    if (b.obj) {
      for (const [k, v] of Object.entries(b.obj)) {
        if (!(k in recovered)) recovered[k] = v
      }
    }
  }
  out += text.slice(cursor)
  out = unwrapFences(out)
  out = out
    .replace(/`/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    // Doble espacio que queda al quitar un bloque en medio de una frase
    .replace(/(\S) {2,}(?=\S)/g, '$1 ')
  return { text: out.trim(), recovered }
}

/** Extrae "narration" de un JSON, cerrado o truncado (sin comilla final). */
export function extractNarrationField(raw: string): string | null {
  const closed = raw.match(/"narration"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  const open = closed ? null : raw.match(/"narration"\s*:\s*"((?:[^"\\]|\\.)*)$/)
  const m = closed ?? open
  if (!m) return null
  try {
    return JSON.parse(`"${m[1]}"`)
  } catch {
    return m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }
}

/** Valor que el template del prompt pone "por defecto": se puede pisar. */
function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || v === 0 || v === false || v === '' || (Array.isArray(v) && v.length === 0)
}

/** Valida un campo recuperado contra el schema. Campos desconocidos se descartan. */
function validField(key: string, value: unknown): boolean {
  const shape = dmResponseSchema.shape as Record<string, { safeParse: (v: unknown) => { success: boolean } }>
  const field = shape[key]
  return !!field && field.safeParse(value).success
}

export interface ParsedDMResult<T = Record<string, unknown>> {
  /** objeto parseado (puede ser parcial si el JSON falló) */
  data: T & { narration: string }
  /** true si hubo un objeto raíz con narration */
  fullParse: boolean
  /** campos que venían fuera del objeto raíz (o dentro de narration) y se recuperaron */
  recoveredKeys: string[]
}

function mergeRecovered(base: Record<string, unknown>, recovered: Record<string, unknown>): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(recovered)) {
    if (k === 'narration' || !isEmptyValue(base[k]) || isEmptyValue(v)) continue
    if (!validField(k, v)) continue
    base[k] = v
    keys.push(k)
  }
  return keys
}

function narrationToString(v: unknown): string | null {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v.every((p) => typeof p === 'string')) return v.join('\n\n')
  return null
}

/**
 * Parsea la respuesta cruda del DM. Nunca devuelve JSON crudo como narración
 * y recupera los campos estructurados aunque vengan fuera del objeto raíz.
 */
export function parseDMResponse<T = Record<string, unknown>>(
  rawResponse: string
): ParsedDMResult<T> {
  const blocks = findStructuredBlocks(rawResponse)
  const rootIdx = blocks.findIndex((b) => b.obj !== null && narrationToString(b.obj.narration) !== null)

  if (rootIdx >= 0) {
    const root = { ...blocks[rootIdx].obj } as Record<string, unknown>
    const rootNarration = narrationToString(root.narration) as string
    // Campos que el modelo metió dentro de narration (fences/objetos embebidos)
    const inner = extractEmbeddedJson(rootNarration)
    const recovered: Record<string, unknown> = { ...inner.recovered }
    // Campos en otros bloques del mismo texto (objeto raíz + bloque json aparte)
    for (const [i, b] of blocks.entries()) {
      if (i === rootIdx || !b.obj) continue
      for (const [k, v] of Object.entries(b.obj)) if (!(k in recovered)) recovered[k] = v
    }
    const recoveredKeys = mergeRecovered(root, recovered)
    root.narration = inner.text
    return { data: root as T & { narration: string }, fullParse: true, recoveredKeys }
  }

  // Sin objeto raíz con narration. Dos casos:
  // (a) objeto raíz TRUNCADO que sí tenía "narration": salvar el texto del campo
  // (b) prosa suelta + bloques JSON aparte: la prosa es la narración
  const fromField = /"narration"\s*:/.test(rawResponse) ? extractNarrationField(rawResponse) : null
  const source = fromField ?? rawResponse
  const { text, recovered } = extractEmbeddedJson(source)
  const data: Record<string, unknown> = {}
  const recoveredKeys = mergeRecovered(data, recovered)
  // Con bloques aparte en el crudo, también recuperarlos aunque la narración saliera del campo
  if (fromField !== null) {
    const outer = extractEmbeddedJson(rawResponse).recovered
    recoveredKeys.push(...mergeRecovered(data, outer))
  }
  data.narration = text
  return { data: data as T & { narration: string }, fullParse: false, recoveredKeys }
}
