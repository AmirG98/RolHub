// El "jugador" — Claude Haiku decide la próxima acción según el perfil.

import Anthropic from '@anthropic-ai/sdk'
import type { PlayerProfile } from './profiles'

const PLAYER_MODEL = process.env.UTILITY_MODEL || 'claude-haiku-4-5-20251001'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AgentDecision {
  action: string
  actionType: 'do' | 'talk'
}

/**
 * Decide la próxima acción del jugador.
 * - Con probabilidad followSuggestionRate elige una suggested_action del DM
 *   (sin gastar tokens).
 * - Si no, le pide a Haiku una acción según el perfil.
 */
export async function decideAction(
  profile: PlayerProfile,
  narration: string,
  suggestedActions: string[],
  turnIndex: number
): Promise<AgentDecision> {
  // Camino barato: seguir una sugerencia del DM
  if (
    suggestedActions.length > 0 &&
    Math.random() < profile.followSuggestionRate
  ) {
    const pick = suggestedActions[Math.floor(Math.random() * suggestedActions.length)]
    return { action: pick, actionType: 'do' }
  }

  try {
    const response = await anthropic.messages.create({
      model: PLAYER_MODEL,
      max_tokens: 150,
      system: profile.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Turno ${turnIndex}. El DM narró:\n\n${narration.slice(0, 1500)}\n\n${
            suggestedActions.length > 0
              ? `Acciones sugeridas (podés ignorarlas): ${suggestedActions.join(' | ')}\n\n`
              : ''
          }¿Qué hace tu personaje? Respondé solo con la acción.`,
        },
      ],
    })

    const text =
      response.content[0]?.type === 'text' ? response.content[0].text.trim() : ''
    if (!text) {
      return fallbackAction(turnIndex)
    }
    // Heurística talk vs do
    const isTalk = /^["«"]|digo|pregunto|le hablo|say|ask|tell/i.test(text)
    return { action: text.slice(0, 4000), actionType: isTalk ? 'talk' : 'do' }
  } catch (err: any) {
    console.error(`[agent] Haiku falló (${err?.message}), usando fallback`)
    return fallbackAction(turnIndex)
  }
}

function fallbackAction(turnIndex: number): AgentDecision {
  const FALLBACKS = [
    'Miro a mi alrededor con atención',
    'Avanzo con cautela',
    'Examino el objeto más cercano',
    'Busco un lugar seguro para descansar',
    'Sigo el camino',
  ]
  return { action: FALLBACKS[turnIndex % FALLBACKS.length], actionType: 'do' }
}
