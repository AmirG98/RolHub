// Detección de NPCs en narración del DM (patrón "Nombre:" o "Nombre «diálogo»").
//
// Regla de forma de nombre propio: 1-4 palabras, TODAS capitalizadas (se
// permiten partículas de/del/la/los/las/el en el medio). Esto elimina los
// "NPCs fantasma" que el regex viejo registraba desde fragmentos de oración:
// "Pero primero:", "Encontrás tres cosas:", "La Lengua Negra es más que..."
// (bug observado en producción — contaminaba npc_states y el prompt del DM).

// Cada palabra del nombre debe empezar en mayúscula; partículas en minúscula
// solo entre palabras capitalizadas ("Jinete de Vado Viejo" ✓, "Pero primero" ✗).
// Las clases incluyen diacríticos fantasy (Firindë, Eärendil, Völva).
const UC = 'A-ZÁÉÍÓÚÑÄËÏÖÜÂÊÎÔÛ'
const LC = 'a-záéíóúñäëïöüâêîôûàèìòù'
export const NPC_DIALOGUE_REGEX = new RegExp(
  `((?:[${UC}][${LC}]+)(?:\\s+(?:de|del|la|las|los|el)\\s+[${UC}][${LC}]+|\\s+[${UC}][${LC}]+){0,3})\\s*[:«]`,
  'g'
)

// Palabras que nunca son nombres aunque estén capitalizadas (inicios de
// oración discursivos + verbos voseo + etiquetas de sistema).
const FIRST_WORD_BLOCKLIST = new Set([
  // discursivos
  'pero', 'entre', 'solo', 'sólo', 'ahora', 'luego', 'entonces', 'cuando',
  'mientras', 'aunque', 'porque', 'como', 'además', 'también', 'después',
  'antes', 'primero', 'segundo', 'finalmente', 'sin', 'con', 'tras', 'desde',
  'hasta', 'sobre', 'algunas', 'algunos', 'toda', 'todo', 'todas', 'todos',
  'cada', 'esta', 'este', 'esto', 'esa', 'ese', 'eso', 'aquella', 'aquel',
  'nota', 'importante', 'atención', 'cuidado', 'recordá', 'recuerda',
  // verbos en voseo/tuteo (el DM narra en 2ª persona)
  'encontrás', 'encuentras', 'podés', 'puedes', 'tenés', 'tienes', 'sabés',
  'sabes', 'ves', 'mirás', 'miras', 'escuchás', 'escuchas', 'sentís',
  'sientes', 'notás', 'notas', 'llegás', 'llegas', 'entrás', 'entras',
  // inglés
  'but', 'first', 'then', 'now', 'when', 'while', 'although', 'because',
  'also', 'after', 'before', 'finally', 'some', 'each', 'this', 'that',
  'these', 'those', 'you', 'your', 'note', 'important', 'warning', 'remember',
])

// Etiquetas de sistema/lugares comunes que matchean el patrón (lista heredada)
const NAME_BLOCKLIST = new Set(
  [
    'Día', 'Noche', 'Ronda', 'Turno', 'Scene', 'Round', 'Resumen', 'Descripción',
    'Resultado', 'Mensaje', 'Escena', 'Nota', 'Sistema', 'Inventario', 'Ubicación',
    'Estado', 'Combate', 'Acción', 'Respuesta', 'Narración', 'Historia', 'Quest',
    'Misión', 'Objetivo', 'Clima', 'Hora', 'Tiempo', 'Lugar', 'Destino', 'Arma',
    'Item', 'Objeto', 'Equipo', 'Hechizo', 'Spell', 'Attack', 'Defense', 'Location',
    'Warning', 'Error', 'Note', 'Summary', 'Description', 'Result', 'Action',
    'Taverna', 'Castillo', 'Posada', 'Mercado', 'Plaza', 'Templo', 'Bosque',
    'Ejemplo', 'Example', 'Important', 'Importante', 'Critical', 'Crítico',
  ].map((s) => s.toLowerCase())
)

/**
 * ¿Este string tiene forma de nombre propio de NPC válido?
 * Aplica las mismas reglas que el regex + blocklists. Sirve tanto para
 * filtrar detecciones nuevas como para sanear npc_states existentes.
 */
export function isValidNpcName(name: string): boolean {
  if (!name || name.length < 3 || name.length > 40) return false
  const words = name.trim().split(/\s+/)
  if (words.length > 4) return false
  const first = words[0].toLowerCase()
  if (FIRST_WORD_BLOCKLIST.has(first)) return false
  if (NAME_BLOCKLIST.has(name.toLowerCase())) return false
  // Toda palabra debe ser capitalizada o partícula permitida entre palabras
  const PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'el'])
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    const isCapitalized = new RegExp(`^[${UC}]`).test(w)
    const isParticle = i > 0 && i < words.length - 1 && PARTICLES.has(w.toLowerCase())
    if (!isCapitalized && !isParticle) return false
  }
  return true
}

/**
 * Extrae nombres de NPCs válidos de una narración (dedup, en orden).
 */
export function detectNpcNames(narration: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const match of narration.matchAll(NPC_DIALOGUE_REGEX)) {
    const name = match[1].trim()
    if (!seen.has(name) && isValidNpcName(name)) {
      seen.add(name)
      out.push(name)
    }
  }
  return out
}
