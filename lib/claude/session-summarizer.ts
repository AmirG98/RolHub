// Session Summarizer — Genera resúmenes narrativos con Claude Haiku
// Se ejecuta en background después de devolver la respuesta al jugador

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db/prisma'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const HAIKU_MODEL = 'claude-haiku-4-5-20251001'

interface TurnForSummary {
  role: string
  content: string
}

export async function generateSummaryCheckpoint(
  sessionId: string,
  turnsToSummarize: TurnForSummary[],
  turnStartIndex: number,
  worldState: any,
  lore: string,
  locale: 'es' | 'en'
): Promise<void> {
  const isES = locale === 'es'

  // Construir el texto de los turnos
  const turnsText = turnsToSummarize.map((t, i) => {
    const role = t.role === 'USER'
      ? (isES ? 'JUGADOR' : 'PLAYER')
      : 'DM'
    return `[${role}]: ${t.content}`
  }).join('\n\n')

  const prompt = isES
    ? `Sos un archivista narrativo para una sesión de RPG. Tu trabajo es crear un resumen conciso pero narrativamente rico de lo que pasó en este segmento de juego.

CONTEXTO:
- Lore: ${lore}
- Acto actual: ${worldState.act || 1}/5
- Ubicación: ${worldState.current_scene || 'desconocida'}

TURNOS A RESUMIR:
${turnsText}

Escribí un resumen en 150-200 palabras que capture:
1. EVENTOS CLAVE: ¿Qué pasó? ¿Qué decisiones tomó el jugador?
2. MOMENTOS DE PERSONAJE: Diálogos importantes, momentos emocionales
3. CONSECUENCIAS: ¿Qué cambió en el mundo?
4. HILOS NARRATIVOS: Tensiones sin resolver, promesas, foreshadowing
5. TONO: Capturá el arco emocional (tensión creciente, momento de paz, etc.)

Después del resumen narrativo, incluí un bloque JSON con facts estructurados:
\`\`\`json
{
  "npcs_introduced": ["nombre: descripción breve"],
  "npcs_referenced": ["nombre"],
  "decisions_made": ["descripción breve de la elección del jugador"],
  "locations_visited": ["nombre"],
  "quests_progressed": ["quest: qué pasó"],
  "items_gained_lost": ["item: ganado/perdido"],
  "emotional_beat": "descripción de una línea del arco emocional"
}
\`\`\`

Escribí el resumen narrativo en español. Sé conciso pero rico en detalles narrativos.`
    : `You are a narrative archivist for an RPG session. Your job is to create a concise but narratively rich summary of what happened in this segment of play.

CONTEXT:
- Lore: ${lore}
- Current act: ${worldState.act || 1}/5
- Location: ${worldState.current_scene || 'unknown'}

TURNS TO SUMMARIZE:
${turnsText}

Write a summary in 150-200 words that captures:
1. KEY EVENTS: What happened? What decisions did the player make?
2. CHARACTER MOMENTS: Important dialogue, emotional beats
3. CONSEQUENCES: What changed in the world?
4. NARRATIVE THREADS: Unresolved tensions, promises, foreshadowing
5. TONE: Capture the emotional arc (rising tension, moment of peace, etc.)

After the narrative summary, include a JSON block with structured facts:
\`\`\`json
{
  "npcs_introduced": ["name: brief description"],
  "npcs_referenced": ["name"],
  "decisions_made": ["brief description of player choice"],
  "locations_visited": ["name"],
  "quests_progressed": ["quest: what happened"],
  "items_gained_lost": ["item: gained/lost"],
  "emotional_beat": "one-line description of the emotional arc"
}
\`\`\`

Write the narrative summary in English. Be concise but narratively rich.`

  try {
    console.log(`[Summary] Generating checkpoint for session ${sessionId}, turns ${turnStartIndex}-${turnStartIndex + turnsToSummarize.length - 1}`)

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = response.content[0]?.type === 'text'
      ? response.content[0].text
      : ''

    // Separar resumen narrativo del JSON de facts
    let narrativeSummary = responseText
    let keyFacts: any = {}

    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/)
    if (jsonMatch) {
      narrativeSummary = responseText.substring(0, responseText.indexOf('```json')).trim()
      try {
        keyFacts = JSON.parse(jsonMatch[1])
      } catch {
        console.warn('[Summary] Failed to parse keyFacts JSON, storing empty')
      }
    }

    // Guardar en DB
    await prisma.summaryCheckpoint.create({
      data: {
        sessionId,
        turnIndex: turnStartIndex + turnsToSummarize.length,
        turnCount: turnsToSummarize.length,
        summary: narrativeSummary,
        keyFacts,
      },
    })

    console.log(`[Summary] Checkpoint saved for session ${sessionId} at turnIndex ${turnStartIndex + turnsToSummarize.length}`)
  } catch (error) {
    // Nunca bloquear al jugador por un fallo de summarización
    console.error(`[Summary] Failed to generate checkpoint for session ${sessionId}:`, error)
  }
}
