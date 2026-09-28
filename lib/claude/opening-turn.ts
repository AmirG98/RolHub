// Opening Turn Generator — Genera el primer turno del DM en el idioma del usuario
//
// Cuando una campaña nueva se inicia en inglés, en lugar de leer el
// `opening_scenes[].description` del JSON (que está en español), pedimos a
// Claude que escriba una narración de apertura en inglés usando el contexto
// del lore y del personaje.
//
// Esto evita tener que traducir opening_scenes de los 10 lores manualmente.

import Anthropic from '@anthropic-ai/sdk'
import { getLocalized } from '@/lib/i18n/localize'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Modelo rápido y barato — esto no tiene que ser Sonnet
const OPENING_MODEL = process.env.UTILITY_MODEL || 'claude-haiku-4-5-20251001'

interface OpeningTurnContext {
  loreData: any
  archetypeName: string
  characterName: string
  characterDescription?: string
  startingLocationName?: string
  locale: 'es' | 'en'
}

interface OpeningTurnResult {
  introContent: string
  suggestedActions: string[]
}

/**
 * Genera el primer turno del DM en el idioma del usuario.
 * Si falla, el caller debería tener fallback al contenido del JSON.
 */
export async function generateOpeningTurnWithClaude(
  ctx: OpeningTurnContext
): Promise<OpeningTurnResult> {
  const { loreData, archetypeName, characterName, characterDescription, startingLocationName, locale } = ctx

  const loreName = getLocalized(loreData.name, locale)
  const worldSummary = loreData.world_summary || ''

  const systemPrompt = locale === 'en'
    ? `You are the DM of a tabletop RPG. Write a SHORT opening narration — the very first thing the player will read.

STRICT RULES:
- Write in ENGLISH, second person ("you").
- Exactly 2 short paragraphs. No more.
- Total length: 60-100 words. Be concise and evocative.
- Atmospheric sensory detail, but no filler.
- End with a single short question asking what the player wants to do.
- The narration is PLAIN TEXT prose: NO markdown, NO headings, NO titles, NO stage directions, NO meta commentary.
- Also give exactly 3 suggested actions, SPECIFIC to this scene (name the actual things, places or people you just described — never generic like "look around" or "explore"). First person, 4-9 words each. One social, one exploratory, one bold or risky.
- Respond ONLY with a JSON object: {"narration": "...", "actions": ["...", "...", "..."]}
- The world summary and location name below may contain Spanish words or proper names. Translate EVERY place name, proper noun, and word into natural English (e.g. "Vado Viejo" → "Oldford", "medianos" → "halflings", "umbríos" → "shadowkin"). Never leave a Spanish word in the narration.`
    : `Sos el DM de una partida de rol. Escribí una narración de apertura CORTA — lo primero que el jugador va a leer.

REGLAS ESTRICTAS:
- Escribí en ESPAÑOL rioplatense, segunda persona ("vos").
- Exactamente 2 párrafos cortos. Ni uno más.
- Largo total: 60-100 palabras. Concisa y evocativa.
- Detalle sensorial atmosférico, sin relleno.
- Terminá con una sola pregunta corta sobre qué quiere hacer el jugador.
- La narración es prosa en TEXTO PLANO: nada de markdown, títulos, acotaciones ni meta-comentarios.
- Además, dá exactamente 3 acciones sugeridas ESPECÍFICAS de esta escena (nombrá las cosas, lugares o personas que acabás de describir — nunca genéricas tipo "mirar alrededor" o "explorar"). Primera persona, 4-9 palabras cada una. Una social, una de exploración, una audaz o arriesgada.
- Respondé SOLO con un objeto JSON: {"narration": "...", "actions": ["...", "...", "..."]}`

  const userMessage = locale === 'en'
    ? `Lore: ${loreName}
World summary: ${worldSummary}

Character:
  - Name: ${characterName}
  - Archetype: ${archetypeName}
${characterDescription ? `  - Description: ${characterDescription}\n` : ''}${startingLocationName ? `  - Starting location: ${startingLocationName}\n` : ''}
Write the opening narration now.`
    : `Lore: ${loreName}
Resumen del mundo: ${worldSummary}

Personaje:
  - Nombre: ${characterName}
  - Arquetipo: ${archetypeName}
${characterDescription ? `  - Descripción: ${characterDescription}\n` : ''}${startingLocationName ? `  - Ubicación inicial: ${startingLocationName}\n` : ''}
Escribí la narración de apertura ahora.`

  try {
    const response = await anthropic.messages.create({
      model: OPENING_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const rawText = textBlock && 'text' in textBlock ? textBlock.text.trim() : ''

    const parsed = parseOpeningJson(rawText)
    let introContent = (parsed?.narration ?? rawText).trim()

    // Scrub markdown headings que Claude a veces agrega aunque le pidas que no
    introContent = introContent
      .replace(/^#{1,6}\s+.*$/gm, '')   // líneas enteras que son headings
      .replace(/^\*{1,3}.*\*{1,3}$/gm, '') // énfasis que ocupan una línea entera (títulos)
      .trim()

    if (!introContent) {
      throw new Error('Claude returned empty content')
    }

    // Acciones específicas de la escena. Dato de prod: el 50% de las primeras
    // acciones eran los botones genéricos y el 79% de los guests no pasaba de
    // 2 acciones — una sugerencia concreta ("Pregunto al tabernero por la
    // caravana") mete al jugador en la ficción; "Mirar alrededor" no.
    const suggestedActions = parsed?.actions?.length === 3
      ? parsed.actions
      : genericActions(locale)

    return { introContent, suggestedActions }
  } catch (err) {
    console.error('[openingTurn] Claude call failed:', err)
    throw err
  }
}

function genericActions(locale: 'es' | 'en'): string[] {
  return locale === 'en'
    ? ['Look around', 'Talk to someone nearby', 'Explore the area']
    : ['Mirar alrededor', 'Hablar con alguien cercano', 'Explorar el lugar']
}

/**
 * Extrae {narration, actions} del texto del modelo. Tolera texto alrededor del
 * JSON y fences. Devuelve null si no hay JSON usable (el caller usa el texto
 * crudo como narración y acciones genéricas).
 */
export function parseOpeningJson(raw: string): { narration: string; actions: string[] } | null {
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    const obj = JSON.parse(m[0])
    const narration = typeof obj.narration === 'string' ? obj.narration : ''
    const actions = Array.isArray(obj.actions)
      ? obj.actions
          .filter((a: unknown): a is string => typeof a === 'string' && a.trim().length > 0)
          .map((a: string) => a.trim().slice(0, 80))
      : []
    if (!narration.trim()) return null
    return { narration, actions: actions.slice(0, 3) }
  } catch {
    return null
  }
}
