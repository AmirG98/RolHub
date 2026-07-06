// Tipos del árbol de habilidades por arquetipo.
// Cada nodo ES un AbilityTemplate (al aprenderlo se vuelve una ability jugable
// que el DM ya reconoce) + metadata de progresión (tier, requisitos, unlock).
//
// Modelo de dos pasos: el milestone hace el nodo DESBLOQUEABLE (unlockable);
// el jugador elige APRENDERLO (learned) desde la UI. Solo usuarios registrados
// pueden aprender — los guests acumulan milestones igual (incentivo de registro).

import type { AbilityTemplate } from './ability'
import type { LocalizedString } from './lore'

// Eventos de juego que alimentan los contadores de milestones.
// Se registran en worldState.party[char].milestones durante la sesión y se
// flushean a Character.milestones (Prisma, source of truth) junto al level-up.
export type MilestoneType =
  | 'combats_won'       // count: combates ganados
  | 'quests_completed'  // count: quests completadas
  | 'act_reached'       // count: acto narrativo alcanzado (1-5)
  | 'level_reached'     // count: nivel del personaje
  | 'npc_bond'          // count: NPCs con relación forjada (npc_update con status positivo)
  | 'deaths_survived'   // count: veces que sobrevivió a la muerte (death saves / rescate)
  | 'abilities_used'    // count: usos totales de abilities
  | 'turns_played'      // count: turnos jugados con este personaje
  | 'narrative_anchor'  // value: id exacto en worldState.narrative_anchors_hit

export interface MilestoneCondition {
  type: MilestoneType
  count?: number   // umbral para tipos numéricos (default 1)
  value?: string   // requerido para narrative_anchor
}

// Contadores acumulados por personaje. Vive en Character.milestones (Json)
// con espejo de sesión en worldState.party[char].milestones.
export interface MilestoneState {
  combats_won: number
  quests_completed: number
  deaths_survived: number
  abilities_used: number
  turns_played: number
  npc_bonds: number
  max_act: number
  anchors: string[]   // narrative anchors alcanzados
}

export const EMPTY_MILESTONES: MilestoneState = {
  combats_won: 0,
  quests_completed: 0,
  deaths_survived: 0,
  abilities_used: 0,
  turns_played: 0,
  npc_bonds: 0,
  max_act: 1,
  anchors: [],
}

// Un nodo del árbol: ability jugable + posición/condiciones en el árbol.
export interface SkillTreeNode extends AbilityTemplate {
  tier: 1 | 2 | 3 | 4
  requires: string[]           // ids de nodos de tier estrictamente menor ([] en tier 1)
  unlock: MilestoneCondition   // condición para pasar de locked → unlockable
}

export interface SkillTree {
  loreId: string        // ej: "DND_CLASSIC" (enum Lore de Prisma)
  archetypeId: string   // ej: "guild-adventurer"
  name: LocalizedString // nombre temático del árbol
  nodes: SkillTreeNode[]
}

export type NodeStatus = 'locked' | 'unlockable' | 'learned'

// Estado computado de un nodo para la UI / API.
export interface SkillNodeState {
  node: SkillTreeNode
  status: NodeStatus
  /** false si la condición de unlock aún no se cumple */
  conditionMet: boolean
  /** ids de requires que faltan aprender */
  missingRequires: string[]
}

// Evento de juego normalizado que alimenta recordMilestoneEvent.
export type MilestoneEvent =
  | { type: 'combat_won' }
  | { type: 'quest_completed' }
  | { type: 'death_survived' }
  | { type: 'ability_used' }
  | { type: 'turn_played' }
  | { type: 'npc_bond' }
  | { type: 'act_reached'; act: number }
  | { type: 'narrative_anchor'; anchor: string }
