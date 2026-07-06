/**
 * Schema Zod de AbilityTemplate — valida las abilities explícitas de los
 * archetypes en data/lores/*.json.
 *
 * Regla clave: name y description deben ser bilingües ({es,en} no vacíos).
 * Las abilities derivadas de special_ability (español-only) mostraban texto
 * en español a jugadores con locale=en — este schema es el gate para que
 * todo el contenido nuevo sea bilingüe.
 */
import { z } from 'zod'

const localizedStringSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
})

export const abilityTemplateSchema = z
  .object({
    id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'id en kebab-case'),
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
  })
  .superRefine((ab, ctx) => {
    if (ab.resource === 'daily_uses' && ab.maxUses === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `ability "${ab.id}": daily_uses requiere maxUses`,
      })
    }
    if (ab.resource === 'cooldown_turns' && ab.cooldownTurns === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `ability "${ab.id}": cooldown_turns requiere cooldownTurns`,
      })
    }
  })

export const abilityArraySchema = z.array(abilityTemplateSchema).min(1).max(6)

export function validateAbilities(raw: unknown): { ok: boolean; issues: string[] } {
  const result = abilityArraySchema.safeParse(raw)
  if (result.success) return { ok: true, issues: [] }
  return {
    ok: false,
    issues: result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
  }
}
