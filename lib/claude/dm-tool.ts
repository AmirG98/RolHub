/**
 * Salida estructurada del DM vía tool use.
 *
 * Problema: pedirle al modelo "devolvé UN objeto JSON" en el prompt es una
 * instrucción, no un contrato. En prod el 11% de los turnos venía como prosa
 * + bloque ```json aparte, o truncado, o con el JSON dentro de narration.
 * El parser (parse-dm-response.ts) lo salva casi siempre, pero es una red.
 *
 * Con `tools` + `tool_choice: { type: 'tool' }` la API OBLIGA al modelo a
 * responder con un bloque tool_use cuyo `input` es JSON válido contra el
 * schema: no hay fences, no hay prosa fuera del objeto, no hay claves con
 * tipos inventados. El schema se deriva de dmResponseSchema, así que el
 * contrato tiene UNA sola fuente de verdad (Zod → JSON Schema → API).
 *
 * El parser sigue en el camino: `dmRawFromMessage` devuelve el input del
 * tool serializado y el route lo pasa por parseDMResponse igual que antes
 * (limpia fences que el modelo pudiera meter DENTRO de narration y cubre el
 * fallback a texto si algún día la API no devuelve el bloque).
 */
import { z } from 'zod'
import type Anthropic from '@anthropic-ai/sdk'
import { dmResponseSchema } from '@/lib/validation/dm-response.schema'

export const DM_TOOL_NAME = 'dm_turn'

function buildInputSchema(): Anthropic.Tool.InputSchema {
  const json = z.toJSONSchema(dmResponseSchema, {
    unrepresentable: 'any',
    io: 'input',
  }) as Record<string, unknown>
  // La API no necesita el marcador de dialecto y algunos validadores lo rechazan
  delete json.$schema
  return json as Anthropic.Tool.InputSchema
}

export const dmTurnTool: Anthropic.Tool = {
  name: DM_TOOL_NAME,
  description:
    "Deliver the Dungeon Master's response for this turn: the narration the " +
    'player will read (in `narration`, plain prose/markdown, never JSON) plus ' +
    'every mechanical effect of the turn (HP, items, quests, dice request, ' +
    'scene change, suggested actions). Call it exactly once per turn.',
  input_schema: buildInputSchema(),
}

export const DM_TOOL_CHOICE: Anthropic.ToolChoiceTool = {
  type: 'tool',
  name: DM_TOOL_NAME,
  disable_parallel_tool_use: true,
}

export interface DMRawResponse {
  /** JSON del tool_use serializado, o el texto plano si no hubo tool_use */
  raw: string
  viaTool: boolean
  stopReason: string | null
}

/**
 * Extrae la respuesta del DM de un Message de la API. Prefiere el bloque
 * tool_use del DM; si no está (respuesta truncada antes del tool, modelo sin
 * soporte, etc.) cae al texto para que el parser haga lo que pueda.
 */
export function dmRawFromMessage(
  message: Pick<Anthropic.Message, 'content' | 'stop_reason'>
): DMRawResponse {
  const stopReason = message.stop_reason ?? null
  for (const block of message.content) {
    if (block.type === 'tool_use' && block.name === DM_TOOL_NAME) {
      if (block.input && typeof block.input === 'object') {
        return { raw: JSON.stringify(block.input), viaTool: true, stopReason }
      }
    }
  }
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
  return { raw: text, viaTool: false, stopReason }
}
