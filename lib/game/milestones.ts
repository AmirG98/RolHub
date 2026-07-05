// Motor de milestones por personaje.
//
// Los contadores se acumulan en worldState.party[char].milestones durante la
// sesión (sin golpear Prisma cada turno) y se flushean a Character.milestones
// en los mismos puntos donde el turn route ya persiste level-ups.
// Character.milestones es el source of truth (sobrevive campañas).

import type {
  MilestoneState,
  MilestoneEvent,
  MilestoneCondition,
  SkillTree,
  SkillTreeNode,
} from '@/lib/types/skill-tree'
import { EMPTY_MILESTONES } from '@/lib/types/skill-tree'

/** Normaliza un Json de Prisma/worldState a MilestoneState completo. */
export function normalizeMilestones(raw: unknown): MilestoneState {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Partial<MilestoneState>
  return {
    combats_won: numberOr(src.combats_won, 0),
    quests_completed: numberOr(src.quests_completed, 0),
    deaths_survived: numberOr(src.deaths_survived, 0),
    abilities_used: numberOr(src.abilities_used, 0),
    turns_played: numberOr(src.turns_played, 0),
    npc_bonds: numberOr(src.npc_bonds, 0),
    max_act: numberOr(src.max_act, 1),
    anchors: Array.isArray(src.anchors) ? src.anchors.filter((a) => typeof a === 'string') : [],
  }
}

function numberOr(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback
}

/** Aplica un evento de juego al estado. Devuelve un estado NUEVO (inmutable). */
export function recordMilestoneEvent(
  state: MilestoneState,
  event: MilestoneEvent
): MilestoneState {
  switch (event.type) {
    case 'combat_won':
      return { ...state, combats_won: state.combats_won + 1 }
    case 'quest_completed':
      return { ...state, quests_completed: state.quests_completed + 1 }
    case 'death_survived':
      return { ...state, deaths_survived: state.deaths_survived + 1 }
    case 'ability_used':
      return { ...state, abilities_used: state.abilities_used + 1 }
    case 'turn_played':
      return { ...state, turns_played: state.turns_played + 1 }
    case 'npc_bond':
      return { ...state, npc_bonds: state.npc_bonds + 1 }
    case 'act_reached':
      return event.act > state.max_act ? { ...state, max_act: event.act } : state
    case 'narrative_anchor':
      return state.anchors.includes(event.anchor)
        ? state
        : { ...state, anchors: [...state.anchors, event.anchor] }
  }
}

/** ¿Se cumple la condición de unlock de un nodo? */
export function checkUnlockCondition(
  cond: MilestoneCondition,
  state: MilestoneState,
  characterLevel: number
): boolean {
  const threshold = cond.count ?? 1
  switch (cond.type) {
    case 'combats_won':
      return state.combats_won >= threshold
    case 'quests_completed':
      return state.quests_completed >= threshold
    case 'deaths_survived':
      return state.deaths_survived >= threshold
    case 'abilities_used':
      return state.abilities_used >= threshold
    case 'turns_played':
      return state.turns_played >= threshold
    case 'npc_bond':
      return state.npc_bonds >= threshold
    case 'act_reached':
      return state.max_act >= threshold
    case 'level_reached':
      return characterLevel >= threshold
    case 'narrative_anchor':
      return cond.value ? state.anchors.includes(cond.value) : false
  }
}

/**
 * Nodos que pasaron de locked → unlockable entre dos estados de milestones.
 * Se usa en el turn route para emitir skill_unlocks en la respuesta (toast).
 * Solo considera nodos cuya condición NO se cumplía antes y SÍ ahora, con
 * requires ya aprendidos (si faltan requires no es accionable todavía).
 */
export function detectNewUnlockables(
  tree: SkillTree,
  before: MilestoneState,
  after: MilestoneState,
  learnedIds: string[],
  characterLevel: number
): SkillTreeNode[] {
  const learned = new Set(learnedIds)
  return tree.nodes.filter((node) => {
    if (learned.has(node.id)) return false
    if (!node.requires.every((r) => learned.has(r))) return false
    const wasMet = checkUnlockCondition(node.unlock, before, characterLevel)
    const isMet = checkUnlockCondition(node.unlock, after, characterLevel)
    return !wasMet && isMet
  })
}

export { EMPTY_MILESTONES }
