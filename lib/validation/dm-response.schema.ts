/**
 * Schema Zod del DMResponse — el contrato JSON que el DM (Claude) devuelve
 * en cada turno. Espeja el tipo inline de app/api/session/turn/route.ts
 * (~línea 1647).
 *
 * Usos:
 * - Playtest agents (scripts/playtest/): validar cada respuesta del DM en
 *   busca de violaciones de contrato.
 * - Turn route (adopción gradual): loggear warnings primero, enforcement
 *   después.
 *
 * Filosofía: LENIENTE con lo desconocido (passthrough — el DM a veces
 * agrega campos extra y la ruta los ignora), ESTRICTO con los campos
 * conocidos (tipos y enums exactos).
 */
import { z } from 'zod'

// Enums espejados de lib/types/quest.ts y lib/types/map-state.ts
export const locationKnowledgeLevelSchema = z.enum([
  'unknown',
  'rumored',
  'discovered',
  'visited',
  'explored',
  'mastered',
])

export const navigationLockReasonSchema = z.enum([
  'combat',
  'dialogue',
  'cutscene',
  'important_choice',
  'ritual',
  'trap',
  'none',
])

const otherPartyEffectSchema = z.object({
  character_name: z.string().min(1),
  hp_change: z.number(),
  reason: z.string().optional(),
})

const questCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['main', 'side']),
  targetLocationId: z.string().optional(),
  objectives: z.array(
    z.object({
      description: z.string().min(1),
      locationId: z.string().optional(),
    })
  ),
})

const diceRequestSchema = z.object({
  reason: z.string().min(1),
  formula: z.string().min(1),
  type: z.enum(['attack', 'skill', 'save', 'perception', 'social', 'exploration']),
  difficulty: z.number().optional(),
  stat: z.string().optional(),
  on_success: z.string().optional(),
  on_failure: z.string().optional(),
})

const npcUpdateItemSchema = z.object({
  name: z.string().min(1),
  status: z.string().min(1),
  location: z.string().optional(),
})

const createLocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['city', 'dungeon', 'wilderness', 'landmark', 'danger', 'safe', 'mystery']),
  dangerLevel: z.number(),
  nearLocationId: z.string(),
  direction: z.enum([
    'north',
    'south',
    'east',
    'west',
    'northeast',
    'northwest',
    'southeast',
    'southwest',
  ]),
  distance: z.enum(['close', 'medium', 'far']),
  connectTo: z.array(z.string()),
})

const combatTriggerSchema = z.object({
  enemies: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.string(),
        count: z.number().optional(),
        hp: z.number().optional(),
        ac: z.number().optional(),
        level: z.number().optional(),
      })
    )
    .min(1),
  terrain: z.enum(['dungeon', 'forest', 'castle', 'cavern', 'arena', 'street']).optional(),
  ambush: z.boolean().optional(),
  ambushedBy: z.enum(['enemies', 'players']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'deadly']).optional(),
  description: z.string().optional(),
})

export const dmResponseSchema = z
  .object({
    // El único campo obligatorio: sin narración no hay turno
    narration: z.string().min(1),
    character_name: z.string().optional(),
    hp_change: z.number().optional(),
    hp_reason: z.string().nullable().optional(),
    new_item: z.string().nullable().optional(),
    remove_item: z.string().nullable().optional(),
    quest_completed: z.string().nullable().optional(),
    new_quest: z.string().nullable().optional(),
    scene_change: z.string().nullable().optional(),
    location_id: z.string().nullable().optional(),
    navigation_locked: z.boolean().nullable().optional(),
    lock_reason: navigationLockReasonSchema.nullable().optional(),
    suggested_actions: z.array(z.string().min(1)).optional(),
    other_party_effects: z.array(otherPartyEffectSchema).optional(),
    quest_create: questCreateSchema.optional(),
    quest_complete_objective: z
      .object({ questId: z.string(), objectiveId: z.string() })
      .optional(),
    secret_reveal: z
      .object({ locationId: z.string(), secretId: z.string(), content: z.string() })
      .optional(),
    knowledge_upgrade: z
      .object({ locationId: z.string(), newLevel: locationKnowledgeLevelSchema })
      .optional(),
    discover_locations: z
      .array(
        z.object({
          locationId: z.string(),
          level: z.enum(['rumored', 'discovered']),
          source: z.string(),
        })
      )
      .optional(),
    dice_request: diceRequestSchema.nullable().optional(),
    // npc_update: el DM manda objeto único O array
    npc_update: z
      .union([npcUpdateItemSchema, z.array(npcUpdateItemSchema)])
      .nullable()
      .optional(),
    world_flag: z.object({ flag: z.string(), value: z.boolean() }).nullable().optional(),
    create_location: createLocationSchema.optional(),
    generate_image: z.boolean().optional(),
    image_prompt: z.string().optional(),
    mood_hint: z.enum(['exploration', 'combat', 'dialogue', 'dramatic']).optional(),
    time_update: z.string().nullable().optional(),
    weather_update: z.string().nullable().optional(),
    xp_reward: z.number().min(0).max(100).optional(),
    combat_trigger: combatTriggerSchema.optional(),
    ability_used: z
      .object({ id: z.string().min(1), reason: z.string().optional() })
      .nullable()
      .optional(),
    long_rest: z.boolean().optional(),
  })
  .passthrough()

export type ValidatedDMResponse = z.infer<typeof dmResponseSchema>

export interface DMResponseValidation {
  ok: boolean
  data?: ValidatedDMResponse
  /** Lista plana de issues legibles: "campo.path: mensaje" */
  issues: string[]
}

/**
 * Valida una respuesta cruda del DM. Nunca lanza — devuelve issues legibles
 * para loggear (turn route) o reportar (playtest).
 */
export function validateDMResponse(raw: unknown): DMResponseValidation {
  const result = dmResponseSchema.safeParse(raw)
  if (result.success) {
    return { ok: true, data: result.data, issues: [] }
  }
  const issues = result.error.issues.map(
    (i) => `${i.path.join('.') || '(root)'}: ${i.message}`
  )
  return { ok: false, issues }
}
