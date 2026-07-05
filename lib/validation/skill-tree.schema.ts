/**
 * Schema Zod de los árboles de habilidades (data/skill-trees/<lore>/<archetype>.json).
 *
 * Valida:
 * - ids únicos dentro del árbol
 * - requires solo referencian nodos existentes de tier ESTRICTAMENTE menor
 * - tier 1 sin requires
 * - name/description con es Y en no vacíos
 * - coherencia resource ↔ maxUses/cooldownTurns
 * - narrative_anchor exige value; tipos numéricos exigen count >= 1
 *
 * Corre en CI vía el test que itera todos los JSONs del directorio, y en el
 * generador de contenido (scripts/generate-skill-trees) como gate de salida.
 */
import { z } from 'zod'

const localizedStringSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
})

const milestoneConditionSchema = z
  .object({
    type: z.enum([
      'combats_won',
      'quests_completed',
      'act_reached',
      'level_reached',
      'npc_bond',
      'deaths_survived',
      'abilities_used',
      'turns_played',
      'narrative_anchor',
    ]),
    count: z.number().int().min(1).optional(),
    value: z.string().min(1).optional(),
  })
  .superRefine((cond, ctx) => {
    if (cond.type === 'narrative_anchor' && !cond.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'narrative_anchor requiere "value" con el id del anchor',
      })
    }
    if (cond.type !== 'narrative_anchor' && cond.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"value" solo aplica a narrative_anchor (type actual: ${cond.type})`,
      })
    }
  })

const skillTreeNodeSchema = z
  .object({
    id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'id en kebab-case (a-z, 0-9, -)'),
    name: localizedStringSchema,
    description: localizedStringSchema,
    kind: z.enum(['spell', 'trick', 'special']),
    resource: z.enum(['daily_uses', 'cooldown_turns']),
    maxUses: z.number().int().min(1).max(10).optional(),
    cooldownTurns: z.number().int().min(1).max(20).optional(),
    icon: z
      .enum(['flame', 'leaf', 'eye', 'sword', 'moon', 'sparkles', 'shield', 'heart', 'zap'])
      .optional(),
    tags: z.array(z.string()).optional(),
    tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    requires: z.array(z.string()),
    unlock: milestoneConditionSchema,
  })
  .superRefine((node, ctx) => {
    if (node.resource === 'daily_uses' && node.maxUses === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `nodo "${node.id}": resource daily_uses requiere maxUses`,
      })
    }
    if (node.resource === 'cooldown_turns' && node.cooldownTurns === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `nodo "${node.id}": resource cooldown_turns requiere cooldownTurns`,
      })
    }
    if (node.tier === 1 && node.requires.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `nodo "${node.id}": tier 1 no puede tener requires`,
      })
    }
    if (node.tier > 1 && node.requires.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `nodo "${node.id}": tier ${node.tier} debe requerir al menos un nodo previo`,
      })
    }
  })

export const skillTreeSchema = z
  .object({
    loreId: z.string().min(1),
    archetypeId: z.string().min(1),
    name: localizedStringSchema,
    nodes: z.array(skillTreeNodeSchema).min(6).max(16),
  })
  .superRefine((tree, ctx) => {
    const byId = new Map(tree.nodes.map((n) => [n.id, n]))

    // ids únicos
    if (byId.size !== tree.nodes.length) {
      const seen = new Set<string>()
      for (const n of tree.nodes) {
        if (seen.has(n.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `id duplicado: "${n.id}"`,
          })
        }
        seen.add(n.id)
      }
    }

    // requires: existen y son de tier estrictamente menor
    for (const node of tree.nodes) {
      for (const reqId of node.requires) {
        const req = byId.get(reqId)
        if (!req) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `nodo "${node.id}": require "${reqId}" no existe en el árbol`,
          })
        } else if (req.tier >= node.tier) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `nodo "${node.id}" (tier ${node.tier}): require "${reqId}" es tier ${req.tier} — debe ser estrictamente menor`,
          })
        }
      }
    }

    // al menos un nodo tier 1 (punto de entrada)
    if (!tree.nodes.some((n) => n.tier === 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'el árbol necesita al menos un nodo tier 1',
      })
    }
  })

export type ValidatedSkillTree = z.infer<typeof skillTreeSchema>

export interface SkillTreeValidation {
  ok: boolean
  issues: string[]
}

export function validateSkillTree(raw: unknown): SkillTreeValidation {
  const result = skillTreeSchema.safeParse(raw)
  if (result.success) return { ok: true, issues: [] }
  return {
    ok: false,
    issues: result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
  }
}
