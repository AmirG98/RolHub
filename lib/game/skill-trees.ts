// Registry de árboles de habilidades + cómputo de estados de nodos.
//
// Los árboles viven en data/skill-trees/<lore>/<archetype>.json y se importan
// estáticamente (bundle-safe en Next). Para agregar un árbol: crear el JSON
// (validado por lib/validation/skill-tree.schema.ts — el test de CI itera el
// directorio completo) y registrarlo en TREES abajo.

import type { SkillTree, SkillNodeState, MilestoneState } from '@/lib/types/skill-tree'
import { checkUnlockCondition } from '@/lib/game/milestones'

// ── Imports estáticos de árboles ──────────────────────────────────────────
import dndClassicGuildAdventurer from '@/data/skill-trees/dnd-classic/guild-adventurer.json'

const TREES: SkillTree[] = [
  dndClassicGuildAdventurer as SkillTree,
  // Los árboles generados por scripts/generate-skill-trees se registran acá.
]

const byKey = new Map<string, SkillTree>(
  TREES.map((t) => [`${t.loreId}:${t.archetypeId}`, t])
)

/** Árbol para un lore+arquetipo, o null si (todavía) no existe. */
export function getSkillTree(loreId: string, archetypeId: string): SkillTree | null {
  return byKey.get(`${loreId}:${archetypeId}`) ?? null
}

export function listSkillTrees(): SkillTree[] {
  return TREES
}

/**
 * Computa el estado de cada nodo para la UI/API:
 * - learned: el jugador ya lo aprendió
 * - unlockable: condición cumplida Y todos los requires aprendidos
 * - locked: lo demás
 */
export function computeNodeStatuses(
  tree: SkillTree,
  milestones: MilestoneState,
  learnedIds: string[],
  characterLevel: number
): SkillNodeState[] {
  const learned = new Set(learnedIds)
  return tree.nodes.map((node) => {
    const conditionMet = checkUnlockCondition(node.unlock, milestones, characterLevel)
    const missingRequires = node.requires.filter((r) => !learned.has(r))
    let status: SkillNodeState['status'] = 'locked'
    if (learned.has(node.id)) {
      status = 'learned'
    } else if (conditionMet && missingRequires.length === 0) {
      status = 'unlockable'
    }
    return { node, status, conditionMet, missingRequires }
  })
}

/**
 * Valida server-side si un nodo puede aprenderse ahora mismo.
 * Devuelve null si OK, o el motivo del rechazo.
 */
export function whyCannotLearn(
  tree: SkillTree,
  nodeId: string,
  milestones: MilestoneState,
  learnedIds: string[],
  characterLevel: number
): string | null {
  const node = tree.nodes.find((n) => n.id === nodeId)
  if (!node) return 'node_not_found'
  if (learnedIds.includes(nodeId)) return 'already_learned'
  const missing = node.requires.filter((r) => !learnedIds.includes(r))
  if (missing.length > 0) return `missing_requires:${missing.join(',')}`
  if (!checkUnlockCondition(node.unlock, milestones, characterLevel)) {
    return 'condition_not_met'
  }
  return null
}
