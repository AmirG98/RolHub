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
    ? `You are the DM of a tabletop RPG game session. Your job right now is to write the opening narration of a new game — the very first thing the player will read.

Write in ENGLISH. Write in second person ("you"). Use atmospheric, sensory prose in the style of a skilled tabletop Game Master. 3 to 5 short paragraphs. Describe the setting around the character, the mood, the sounds and smells, who else might be nearby, and a subtle hint of something interesting about to happen. End with a single question asking the player what they want to do.

Do NOT add meta commentary. Do NOT include stage directions. Do NOT break the fourth wall. Output ONLY the narration text.`
    : `Sos el DM de una partida de rol. Tu trabajo ahora es escribir la narración de apertura de una nueva partida — lo primero que el jugador va a leer.

Escribí en ESPAÑOL rioplatense. Escribí en segunda persona ("vos"). Usá prosa atmosférica y sensorial en el estilo de un buen Game Master. 3 a 5 párrafos cortos. Describí el entorno del personaje, el clima de la escena, los sonidos y olores, quién más puede estar cerca, y una pista sutil de algo interesante por venir. Terminá con una sola pregunta al jugador sobre qué hacer.

NO agregues meta-comentarios. NO incluyas acotaciones. NO rompas la cuarta pared. Devolvé SOLO el texto de la narración.`

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
    const introContent = textBlock && 'text' in textBlock ? textBlock.text.trim() : ''

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
