/**
 * Tests del núcleo del skill tree:
 * - Validación Zod de TODOS los JSONs en data/skill-trees/ (gate de CI)
 * - Motor de milestones (record/check/detect)
 * - Cómputo de estados de nodos y validación de learn
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { validateSkillTree } from '@/lib/validation/skill-tree.schema'
import {
  normalizeMilestones,
  recordMilestoneEvent,
  checkUnlockCondition,
  detectNewUnlockables,
  EMPTY_MILESTONES,
} from '@/lib/game/milestones'
import { getSkillTree, computeNodeStatuses, whyCannotLearn, listSkillTrees } from '@/lib/game/skill-trees'
import type { SkillTree } from '@/lib/types/skill-tree'

const TREES_DIR = path.join(process.cwd(), 'data', 'skill-trees')

function allTreeFiles(): string[] {
  const files: string[] = []
  for (const lore of fs.readdirSync(TREES_DIR)) {
    const loreDir = path.join(TREES_DIR, lore)
    if (!fs.statSync(loreDir).isDirectory()) continue
    for (const f of fs.readdirSync(loreDir)) {
      if (f.endsWith('.json')) files.push(path.join(loreDir, f))
    }
  }
  return files
}

describe('data/skill-trees — validación de contenido (gate de CI)', () => {
  const files = allTreeFiles()

  it('hay al menos un árbol', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files.map((f) => [path.relative(TREES_DIR, f), f]))(
    '%s pasa el schema',
    (_rel, fullPath) => {
      const raw = JSON.parse(fs.readFileSync(fullPath as string, 'utf-8'))
      const result = validateSkillTree(raw)
      expect(result.issues).toEqual([])
      expect(result.ok).toBe(true)
    }
  )

  it('todos los árboles registrados en el registry pasan el schema', () => {
    for (const tree of listSkillTrees()) {
      expect(validateSkillTree(tree).ok).toBe(true)
    }
  })
})

describe('milestones — record y check', () => {
  it('normaliza datos corruptos/parciales a un estado válido', () => {
    expect(normalizeMilestones(null)).toEqual(EMPTY_MILESTONES)
    expect(normalizeMilestones({ combats_won: 3, basura: 'x' }).combats_won).toBe(3)
    expect(normalizeMilestones({ combats_won: -5 }).combats_won).toBe(0)
    expect(normalizeMilestones({ anchors: ['a', 42, 'b'] }).anchors).toEqual(['a', 'b'])
  })

  it('acumula eventos sin mutar el estado original', () => {
    const s0 = EMPTY_MILESTONES
    const s1 = recordMilestoneEvent(s0, { type: 'combat_won' })
    const s2 = recordMilestoneEvent(s1, { type: 'combat_won' })
    expect(s0.combats_won).toBe(0)
    expect(s2.combats_won).toBe(2)
  })

  it('act_reached solo sube, nunca baja', () => {
    const s = recordMilestoneEvent(EMPTY_MILESTONES, { type: 'act_reached', act: 3 })
    expect(recordMilestoneEvent(s, { type: 'act_reached', act: 2 }).max_act).toBe(3)
  })

  it('anchors no duplica', () => {
    const s1 = recordMilestoneEvent(EMPTY_MILESTONES, { type: 'narrative_anchor', anchor: 'x' })
    const s2 = recordMilestoneEvent(s1, { type: 'narrative_anchor', anchor: 'x' })
    expect(s2.anchors).toEqual(['x'])
  })

  it('checkUnlockCondition cubre todos los tipos', () => {
    const s = { ...EMPTY_MILESTONES, combats_won: 2, quests_completed: 1, max_act: 2, anchors: ['boss-1'] }
    expect(checkUnlockCondition({ type: 'combats_won', count: 2 }, s, 1)).toBe(true)
    expect(checkUnlockCondition({ type: 'combats_won', count: 3 }, s, 1)).toBe(false)
    expect(checkUnlockCondition({ type: 'level_reached', count: 3 }, s, 3)).toBe(true)
    expect(checkUnlockCondition({ type: 'level_reached', count: 3 }, s, 2)).toBe(false)
    expect(checkUnlockCondition({ type: 'act_reached', count: 2 }, s, 1)).toBe(true)
    expect(checkUnlockCondition({ type: 'narrative_anchor', value: 'boss-1' }, s, 1)).toBe(true)
    expect(checkUnlockCondition({ type: 'narrative_anchor', value: 'boss-2' }, s, 1)).toBe(false)
    // default count = 1
    expect(checkUnlockCondition({ type: 'quests_completed' }, s, 1)).toBe(true)
  })
})

describe('skill-trees — registry y estados', () => {
  const tree = getSkillTree('DND_CLASSIC', 'guild-adventurer')!

  it('el registry resuelve el árbol semilla', () => {
    expect(tree).not.toBeNull()
    expect(tree.archetypeId).toBe('guild-adventurer')
  })

  it('devuelve null para árboles inexistentes', () => {
    expect(getSkillTree('LOTR', 'no-existe')).toBeNull()
  })

  it('resuelve el árbol por NOMBRE localizado, no solo por id', () => {
    // Character.archetype guarda el nombre ("Montaraz"), no el id ("ranger").
    // Regresión: getSkillTree debe resolver ambos.
    expect(getSkillTree('LOTR', 'ranger')).not.toBeNull()
    expect(getSkillTree('LOTR', 'Montaraz')?.archetypeId).toBe('ranger')
    expect(getSkillTree('LOTR', 'Ranger')?.archetypeId).toBe('ranger') // nombre EN
  })

  it('personaje nuevo: todo locked', () => {
    const states = computeNodeStatuses(tree, EMPTY_MILESTONES, [], 1)
    expect(states.every((s) => s.status === 'locked')).toBe(true)
  })

  it('milestone cumplido sin requires → unlockable', () => {
    const m = { ...EMPTY_MILESTONES, combats_won: 1 }
    const states = computeNodeStatuses(tree, m, [], 1)
    const battleCry = states.find((s) => s.node.id === 'battle-cry')!
    expect(battleCry.status).toBe('unlockable')
  })

  it('condición cumplida pero requires sin aprender → locked', () => {
    // shield-wall requiere battle-cry aprendido; con 3 combates la condición se cumple
    const m = { ...EMPTY_MILESTONES, combats_won: 3 }
    const states = computeNodeStatuses(tree, m, [], 1)
    const shieldWall = states.find((s) => s.node.id === 'shield-wall')!
    expect(shieldWall.status).toBe('locked')
    expect(shieldWall.conditionMet).toBe(true)
    expect(shieldWall.missingRequires).toEqual(['battle-cry'])
  })

  it('con requires aprendidos y condición → unlockable; aprendido → learned', () => {
    const m = { ...EMPTY_MILESTONES, combats_won: 3 }
    const states = computeNodeStatuses(tree, m, ['battle-cry'], 1)
    expect(states.find((s) => s.node.id === 'battle-cry')!.status).toBe('learned')
    expect(states.find((s) => s.node.id === 'shield-wall')!.status).toBe('unlockable')
  })

  it('whyCannotLearn cubre todos los rechazos', () => {
    const m = { ...EMPTY_MILESTONES, combats_won: 1 }
    expect(whyCannotLearn(tree, 'no-existe', m, [], 1)).toBe('node_not_found')
    expect(whyCannotLearn(tree, 'battle-cry', m, ['battle-cry'], 1)).toBe('already_learned')
    expect(whyCannotLearn(tree, 'shield-wall', m, [], 1)).toContain('missing_requires')
    expect(whyCannotLearn(tree, 'trap-eye', m, [], 1)).toBe('condition_not_met')
    expect(whyCannotLearn(tree, 'battle-cry', m, [], 1)).toBeNull()
  })
})

describe('detectNewUnlockables — para el toast in-game', () => {
  const tree = getSkillTree('DND_CLASSIC', 'guild-adventurer')!

  it('detecta el nodo que se volvió unlockable con este evento', () => {
    const before = EMPTY_MILESTONES
    const after = recordMilestoneEvent(before, { type: 'combat_won' })
    const nuevos = detectNewUnlockables(tree, before, after, [], 1)
    expect(nuevos.map((n) => n.id)).toEqual(['battle-cry'])
  })

  it('no re-detecta nodos que ya eran unlockable', () => {
    const before = { ...EMPTY_MILESTONES, combats_won: 1 }
    const after = { ...before, turns_played: 1 }
    expect(detectNewUnlockables(tree, before, after, [], 1)).toEqual([])
  })

  it('no detecta nodos con requires pendientes (no accionables)', () => {
    const before = { ...EMPTY_MILESTONES, combats_won: 2 }
    const after = { ...before, combats_won: 3 }
    // shield-wall se cumpliría pero battle-cry no está aprendido
    expect(detectNewUnlockables(tree, before, after, [], 1)).toEqual([])
    // con battle-cry aprendido sí
    expect(detectNewUnlockables(tree, before, after, ['battle-cry'], 1).map((n) => n.id)).toEqual([
      'shield-wall',
    ])
  })

  it('ignora nodos ya aprendidos', () => {
    const before = EMPTY_MILESTONES
    const after = recordMilestoneEvent(before, { type: 'combat_won' })
    expect(detectNewUnlockables(tree, before, after, ['battle-cry'], 1)).toEqual([])
  })
})

describe('skill-tree schema — rechazos estructurales', () => {
  const base: SkillTree = getSkillTree('DND_CLASSIC', 'guild-adventurer')!

  it('rechaza requires a tier igual o mayor', () => {
    const bad = JSON.parse(JSON.stringify(base))
    // battle-cry (tier 1) no puede requerir; forzamos require inverso en tier 2 → tier 3
    const t3 = bad.nodes.find((n: any) => n.tier === 3)
    const t2 = bad.nodes.find((n: any) => n.tier === 2)
    t2.requires = [t3.id]
    const r = validateSkillTree(bad)
    expect(r.ok).toBe(false)
    expect(r.issues.some((i) => i.includes('estrictamente menor'))).toBe(true)
  })

  it('rechaza ids duplicados', () => {
    const bad = JSON.parse(JSON.stringify(base))
    bad.nodes[1].id = bad.nodes[0].id
    expect(validateSkillTree(bad).ok).toBe(false)
  })

  it('rechaza narrative_anchor sin value', () => {
    const bad = JSON.parse(JSON.stringify(base))
    bad.nodes[0].unlock = { type: 'narrative_anchor' }
    expect(validateSkillTree(bad).ok).toBe(false)
  })

  it('rechaza daily_uses sin maxUses', () => {
    const bad = JSON.parse(JSON.stringify(base))
    delete bad.nodes[0].maxUses
    expect(validateSkillTree(bad).ok).toBe(false)
  })

  it('rechaza traducciones vacías', () => {
    const bad = JSON.parse(JSON.stringify(base))
    bad.nodes[0].name = { es: 'Grito', en: '' }
    expect(validateSkillTree(bad).ok).toBe(false)
  })
})
