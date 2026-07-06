/**
 * Gate de CI: TODOS los archetypes de TODOS los lores deben tener abilities
 * explícitas y bilingües ({es,en} no vacíos).
 *
 * Regresión: los lores sin abilities derivaban una desde special_ability
 * (string español-only) → jugadores con locale=en veían "Conocimiento
 * Antiguo" en español en la UI inglesa.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { validateAbilities } from '@/lib/validation/ability.schema'
import { deriveDefaultAbility } from '@/lib/game/abilities'

const LORES_DIR = path.join(process.cwd(), 'data', 'lores')

function loreFiles(): string[] {
  return fs
    .readdirSync(LORES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(LORES_DIR, f))
}

describe('data/lores — abilities bilingües en todos los archetypes', () => {
  for (const file of loreFiles()) {
    const loreName = path.basename(file, '.json')
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const archetypes: any[] = data.archetypes || []

    describe(loreName, () => {
      it.each(archetypes.map((a) => [a.id, a]))(
        '%s tiene abilities válidas y bilingües',
        (_id, archetype) => {
          expect(
            Array.isArray((archetype as any).abilities) && (archetype as any).abilities.length > 0,
            `${loreName}/${(archetype as any).id} no tiene abilities explícitas — derivaría español-only`
          ).toBe(true)
          const result = validateAbilities((archetype as any).abilities)
          expect(result.issues).toEqual([])
        }
      )
    })
  }
})

describe('deriveDefaultAbility — fallback bilingüe', () => {
  it('con special_ability string usa el mismo texto en ambos idiomas (legacy)', () => {
    const ab = deriveDefaultAbility(
      { id: 'x', special_ability: 'Poder: hace algo' } as any,
      'STORY_MODE' as any
    )
    expect((ab.name as any).es).toBe('Poder')
    expect((ab.name as any).en).toBe('Poder')
  })

  it('con special_ability {es,en} localiza cada idioma', () => {
    const ab = deriveDefaultAbility(
      {
        id: 'x',
        special_ability: { es: 'Poder: hace algo', en: 'Power: does something' },
      } as any,
      'STORY_MODE' as any
    )
    expect((ab.name as any).es).toBe('Poder')
    expect((ab.name as any).en).toBe('Power')
    expect((ab.description as any).en).toBe('does something')
  })
})
