// Parseo robusto de la respuesta del DM (Claude).
//
// Claude devuelve un objeto JSON, pero a veces el JSON viene malformado o
// TRUNCADO (max_tokens agotado con narraciones largas). El fallback ingenuo
// —mostrar rawResponse como narración— filtra el JSON crudo al jugador
// (bug visible: se ve {"narration":"...","character_name":"asdsad",...}).
//
// Estrategia en cascada:
// 1. JSON.parse del match de llaves → objeto completo (caso feliz).
// 2. Si falla, extraer SOLO el campo "narration" con regex del JSON parcial
//    y devolver { narration } — el resto de los campos se pierden pero el
//    jugador ve texto limpio.
// 3. Si tampoco hay narration extraíble, limpiar el crudo de artefactos JSON.

/**
 * Extrae el valor de "narration" de un JSON (posiblemente truncado) sin
 * parsearlo entero. Maneja comillas escapadas (\") y saltos (\n).
 */
export function extractNarrationField(raw: string): string | null {
  // Busca "narration":"...." respetando escapes. El grupo captura hasta la
  // comilla de cierre no escapada.
  const m = raw.match(/"narration"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  if (!m) return null
  try {
    // Reusar el parser de JSON para desescapar correctamente (\n, \", \\, \uXXXX)
    return JSON.parse(`"${m[1]}"`)
  } catch {
    // Desescape manual como último recurso
    return m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }
}

/**
 * Quita artefactos de JSON de un string crudo cuando no se pudo extraer
 * narration (p.ej. corta en el primer campo estructurado conocido).
 */
export function stripJsonArtifacts(raw: string): string {
  let text = raw.trim()
  // Si arranca con { y "narration", quitar el prefijo del objeto
  text = text.replace(/^\s*\{\s*"narration"\s*:\s*"/, '')
  // Cortar en el primer campo estructurado que suele seguir a narration
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
  // Desescapar y limpiar comillas/llaves sueltas del final
  text = text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  return text.replace(/["\{\}\s]+$/, '').trim()
}

export interface ParsedDMResult<T = Record<string, unknown>> {
  /** objeto parseado (puede ser parcial: solo { narration } si el JSON falló) */
  data: T & { narration: string }
  /** true si el JSON completo parseó bien; false si hubo que degradar */
  fullParse: boolean
}

/**
 * Limpia la narración de bloques JSON/estructurados que el modelo a veces
 * EMBEBE dentro del texto (bug observado: el DM metía ```json {"dice_request":
 * ...}``` dentro de narration en vez de como campo hermano). Sin esto, el
 * jugador ve el JSON crudo en medio de la historia.
 */
export function stripEmbeddedJson(narration: string): string {
  let text = narration
  // 1. Fences de código con JSON (```json {...} ``` o ``` {...} ```)
  text = text.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, '')
  // 2. Objetos JSON sueltos que contengan campos estructurados conocidos del
  //    DMResponse (dice_request, combat_trigger, etc.) embebidos en el texto.
  const STRUCTURED_KEY = /"(?:dice_request|dice_required|combat_trigger|quest_create|world_state_updates|ability_used|scene_change|hp_change|new_item|npc_update|suggested_actions)"\s*:/
  text = text.replace(/\{[\s\S]*?\}/g, (m) => (STRUCTURED_KEY.test(m) ? '' : m))
  // 3. Backticks sueltos y espacios/saltos colgantes que quedan tras el corte
  text = text.replace(/`{1,3}/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

/**
 * Parsea la respuesta cruda del DM de forma robusta. Nunca devuelve JSON
 * crudo como narración (ni entero ni embebido en el texto).
 */
export function parseDMResponse<T = Record<string, unknown>>(
  rawResponse: string
): ParsedDMResult<T> {
  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed && typeof parsed.narration === 'string') {
        // Sanear la narración de JSON embebido (fences, objetos estructurados)
        parsed.narration = stripEmbeddedJson(parsed.narration)
        return { data: parsed, fullParse: true }
      }
      // parseó pero sin narration válida → intentar extraer
    } catch {
      // JSON malformado/truncado → degradar
    }
  }

  // Degradación 1: extraer solo el campo narration del JSON parcial
  const narration = extractNarrationField(rawResponse)
  if (narration && narration.trim().length > 0) {
    return { data: { narration: stripEmbeddedJson(narration) } as T & { narration: string }, fullParse: false }
  }

  // Degradación 2: limpiar artefactos JSON del crudo
  const cleaned = stripJsonArtifacts(rawResponse)
  return {
    data: { narration: cleaned || rawResponse } as T & { narration: string },
    fullParse: false,
  }
}
