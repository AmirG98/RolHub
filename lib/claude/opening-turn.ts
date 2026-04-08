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
const OPENING_MODEL = 'claude-haiku-4-5-20251001'

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
- Output PLAIN TEXT only. NO markdown, NO headings (no "#", no "##"), NO titles, NO stage directions, NO meta commentary. Just the narration prose.`
    : `Sos el DM de una partida de rol. Escribí una narración de apertura CORTA — lo primero que el jugador va a leer.

REGLAS ESTRICTAS:
- Escribí en ESPAÑOL rioplatense, segunda persona ("vos").
- Exactamente 2 párrafos cortos. Ni uno más.
- Largo total: 60-100 palabras. Concisa y evocativa.
- Detalle sensorial atmosférico, sin relleno.
- Terminá con una sola pregunta corta sobre qué quiere hacer el jugador.
- Devolvé TEXTO PLANO. NADA de markdown, NADA de títulos ni headings (nada de "#" ni "##"), nada de acotaciones, nada de meta-comentarios. Solo la prosa narrativa.`

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
    let introContent = textBlock && 'text' in textBlock ? textBlock.text.trim() : ''

    // Scrub markdown headings that Claude a veces agrega aunque le pidas que no
    introContent = introContent
      .replace(/^#{1,6}\s+.*$/gm, '')   // líneas enteras que son headings
      .replace(/^\*{1,3}.*\*{1,3}$/gm, '') // énfasis que ocupan una línea entera (títulos)
      .trim()

    if (!introContent) {
      throw new Error('Claude returned empty content')
    }

    // Acciones sugeridas genéricas pero traducidas
    const suggestedActions = locale === 'en'
      ? ['Look around', 'Talk to someone nearby', 'Explore the area']
      : ['Mirar alrededor', 'Hablar con alguien cercano', 'Explorar el lugar']

    return { introContent, suggestedActions }
  } catch (err) {
    console.error('[openingTurn] Claude call failed:', err)
    throw err
  }
}
