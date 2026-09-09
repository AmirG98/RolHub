// Parseo robusto de la respuesta del DM (Claude).
//
// El contrato es UN objeto JSON con "narration" + campos estructurados. En
// prod el modelo lo rompe de tres maneras (medido 2026-09-09: 28 de 253 turnos,
// 11%):
//   A. Prosa suelta + bloque ```json { "dice_request": ... } ``` aparte (la
//      forma dominante, 28/28). Sin objeto raíz con narration.
//   B. Objeto raíz TRUNCADO por max_tokens (3/28), a veces con un JSON
//      anidado dentro de narration que al desescapar queda legible.
//   C. Objeto raíz válido pero con JSON/fences embebidos dentro de narration.
//
// El fallback ingenuo —devolver el crudo como narración— le muestra el JSON
// al jugador Y pierde la mecánica (dice_request, suggested_actions...). Acá
// se hace lo contrario: se limpia el texto y se RECUPERAN los campos.

/** Campos del DMResponse que identifican un bloque JSON como "estructurado". */
const STRUCTURED_KEY = /"(?:dice_request|dice_required|combat_trigger|quest_create|quest_completed|quest_complete_objective|world_state_updates|ability_used|scene_change|hp_change|hp_reason|new_item|remove_item|npc_update|suggested_actions|xp_reward|generate_image|image_prompt|location_id|mood_hint|long_rest|new_quest|discover_locations|create_location)"\s*:/

export interface StructuredBlock {
  start: number
  end: number
  /** objeto parseado, o null si estaba truncado/malformado */
  obj: Record<string, unknown> | null
  truncated: boolean
}

/**
 * Encuentra objetos JSON balanceados (respetando strings y escapes) que
 * contengan campos del DMResponse. Un objeto sin cierre (truncado) se
 * extiende hasta el final del texto. Objetos sin campos estructurados
 * (p.ej. diálogo con llaves) se ignoran y se preservan.
 */
export function findStructuredBlocks(text: string): StructuredBlock[] {
  const blocks: StructuredBlock[] = []
  let i = 0
  while (i < text.length) {
    const start = text.indexOf('{', i)
    if (start < 0) break

    let depth = 0
    let inStr = false
    let esc = false
    let end = -1
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
        if (depth === 0) { end = j + 1; break }
      }
    }

    const truncated = end < 0
    const sliceEnd = truncated ? text.length : end
    const slice = text.slice(start, sliceEnd)

    if (STRUCTURED_KEY.test(slice)) {
      let obj: Record<string, unknown> | null = null
      if (!truncated) {
        try {
          const parsed: unknown = JSON.parse(slice)
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) obj = parsed as Record<string, unknown>
        } catch {
          // malformado: se quita del texto igual, sin recuperar campos
        }
      }
      blocks.push({ start, end: sliceEnd, obj, truncated })
      if (truncated) break
      i = sliceEnd
    } else {
      i = start + 1
    }
  }
  return blocks
}

/**
 * Quita del texto los bloques JSON estructurados y los fences de código, y
 * devuelve los campos que se pudieron recuperar de esos bloques.
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

  // Fences que quedaron vacíos tras quitar el JSON (```json\n\n```)
  out = out.replace(/```(?:json|javascript|js)?\s*```/gi, '')
  // Fence json abierto sin cerrar al final (el JSON estaba truncado)
  out = out.replace(/```(?:json)?\s*$/i, '')
  // Fences de texto plano (el DM los usa como "cartel"): desenvolver, conservar el texto
  out = out.replace(/```[^\n`]*\n?([\s\S]*?)```/g, '$1')
  // Backticks sueltos y espacios/saltos colgantes
  out = out.replace(/`{1,3}/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n')
  return { text: out.trim(), recovered }
}

/** Solo el texto limpio (compat con el uso previo). */
export function stripEmbeddedJson(narration: string): string {
  return extractEmbeddedJson(narration).text
}

/**
 * Extrae el valor de "narration" de un JSON (posiblemente truncado) sin
 * parsearlo entero. Maneja comillas escapadas (\") y saltos (\n).
 */
export function extractNarrationField(raw: string): string | null {
  const m = raw.match(/"narration"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  if (!m) return null
  try {
    return JSON.parse(`"${m[1]}"`)
  } catch {
    return m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }
}

/**
 * Quita artefactos de JSON de un string crudo cuando no se pudo extraer
 * narration (p.ej. corta en el primer campo estructurado conocido).
 */
export function stripJsonArtifacts(raw: string): string {
  let text = raw.trim()
  text = text.replace(/^\s*\{\s*"narration"\s*:\s*"/, '')
  const cutMarkers = [
    '","character_name"', '","hp_change"', '","hp_reason"', '","new_item"',
    '","suggested_actions"', '","dice_request"', '","ability_used"',
    '","scene_change"', '","combat_trigger"', '","quest_',
  ]
  let cutAt = -1
  for (const marker of cutMarkers) {
    const i = text.indexOf(marker)
    if (i >= 0 && (cutAt === -1 || i < cutAt)) cutAt = i
  }
  if (cutAt >= 0) text = text.slice(0, cutAt)
  text = text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  return text.replace(/["\{\}\s]+$/, '').trim()
}

export interface ParsedDMResult<T = Record<string, unknown>> {
  /** objeto parseado (puede ser parcial si el JSON falló) */
  data: T & { narration: string }
  /** true si el objeto raíz con narration parseó bien */
  fullParse: boolean
  /** campos que venían fuera del objeto raíz y se recuperaron del texto */
  recoveredKeys: string[]
}

function merge<T>(base: Record<string, unknown>, recovered: Record<string, unknown>, narration: string): { data: T & { narration: string }; recoveredKeys: string[] } {
  const recoveredKeys: string[] = []
  for (const [k, v] of Object.entries(recovered)) {
    if (k === 'narration') continue
    if (base[k] === undefined || base[k] === null) {
      base[k] = v
      recoveredKeys.push(k)
    }
  }
  base.narration = narration
  return { data: base as T & { narration: string }, recoveredKeys }
}

/**
 * Parsea la respuesta cruda del DM. Nunca devuelve JSON crudo como narración
 * y recupera los campos estructurados aunque vengan fuera del objeto raíz.
 */
export function parseDMResponse<T = Record<string, unknown>>(
  rawResponse: string
): ParsedDMResult<T> {
  // Caso feliz (y C): objeto raíz con narration.
  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed: unknown = JSON.parse(jsonMatch[0])
      if (parsed && typeof parsed === 'object' && typeof (parsed as { narration?: unknown }).narration === 'string') {
        const obj = parsed as Record<string, unknown>
        const { text, recovered } = extractEmbeddedJson(obj.narration as string)
        const m = merge<T>(obj, recovered, text)
        return { data: m.data, fullParse: true, recoveredKeys: m.recoveredKeys }
      }
    } catch {
      // truncado/malformado → degradar abajo
    }
  }

  // Caso A: prosa + bloques JSON sin objeto raíz con narration.
  if (!/"narration"\s*:/.test(rawResponse)) {
    const { text, recovered } = extractEmbeddedJson(rawResponse)
    if (text.length > 0) {
      const m = merge<T>({}, recovered, text)
      return { data: m.data, fullParse: false, recoveredKeys: m.recoveredKeys }
    }
  }

  // Caso B: objeto raíz truncado → extraer solo narration del JSON parcial.
  const narration = extractNarrationField(rawResponse)
  if (narration && narration.trim().length > 0) {
    const { text, recovered } = extractEmbeddedJson(narration)
    const m = merge<T>({}, recovered, text)
    return { data: m.data, fullParse: false, recoveredKeys: m.recoveredKeys }
  }

  // Último recurso: limpiar artefactos y JSON embebido del crudo.
  const cleaned = extractEmbeddedJson(stripJsonArtifacts(rawResponse)).text
  return {
    data: { narration: cleaned || rawResponse } as T & { narration: string },
    fullParse: false,
    recoveredKeys: [],
  }
}
