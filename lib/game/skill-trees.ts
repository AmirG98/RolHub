// Registry de árboles de habilidades + cómputo de estados de nodos.
//
// Los árboles viven en data/skill-trees/<lore>/<archetype>.json y se importan
// estáticamente (bundle-safe en Next). Los imports y el array TREES se generan
// con scripts/generate-skill-trees; el test __tests__/unit/skill-trees.test.ts
// valida que todos los JSONs del directorio pasan el schema Zod.

import type { SkillTree, SkillNodeState, MilestoneState } from '@/lib/types/skill-tree'
import { checkUnlockCondition } from '@/lib/game/milestones'
import { resolveArchetypeId } from '@/lib/game/archetype-resolver'

// ── Imports estáticos de árboles (42, uno por arquetipo por lore) ──────────
import cozyWitchBrujaHogar from '@/data/skill-trees/cozy-witch/bruja-hogar.json'
import cozyWitchBrujaMar from '@/data/skill-trees/cozy-witch/bruja-mar.json'
import cozyWitchBrujaVerde from '@/data/skill-trees/cozy-witch/bruja-verde.json'
import cyberpunkFixer from '@/data/skill-trees/cyberpunk/fixer.json'
import cyberpunkNetrunner from '@/data/skill-trees/cyberpunk/netrunner.json'
import cyberpunkSolo from '@/data/skill-trees/cyberpunk/solo.json'
import dndClassicAcademyMage from '@/data/skill-trees/dnd-classic/academy-mage.json'
import dndClassicGuildAdventurer from '@/data/skill-trees/dnd-classic/guild-adventurer.json'
import dndClassicStreetRogue from '@/data/skill-trees/dnd-classic/street-rogue.json'
import isekaiBeastTamer from '@/data/skill-trees/isekai/beast_tamer.json'
import isekaiMagicStudent from '@/data/skill-trees/isekai/magic_student.json'
import isekaiMerchantTraveler from '@/data/skill-trees/isekai/merchant_traveler.json'
import isekaiOpSupport from '@/data/skill-trees/isekai/op_support.json'
import isekaiReincarnatedSage from '@/data/skill-trees/isekai/reincarnated_sage.json'
import isekaiSummonedHero from '@/data/skill-trees/isekai/summoned_hero.json'
import lotrDwarf from '@/data/skill-trees/lotr/dwarf.json'
import lotrElf from '@/data/skill-trees/lotr/elf.json'
import lotrHobbit from '@/data/skill-trees/lotr/hobbit.json'
import lotrRanger from '@/data/skill-trees/lotr/ranger.json'
import lotrScholar from '@/data/skill-trees/lotr/scholar.json'
import lotrWarrior from '@/data/skill-trees/lotr/warrior.json'
import lovecraftDetective from '@/data/skill-trees/lovecraft/detective.json'
import lovecraftOccultist from '@/data/skill-trees/lovecraft/occultist.json'
import lovecraftProfessor from '@/data/skill-trees/lovecraft/professor.json'
import romantasyAltaDama from '@/data/skill-trees/romantasy/alta-dama.json'
import romantasyCortesano from '@/data/skill-trees/romantasy/cortesano.json'
import romantasyGuerreraIllyriana from '@/data/skill-trees/romantasy/guerrera-illyriana.json'
import starwarsBountyHunter from '@/data/skill-trees/starwars/bounty_hunter.json'
import starwarsForceSensitive from '@/data/skill-trees/starwars/force_sensitive.json'
import starwarsSmuggler from '@/data/skill-trees/starwars/smuggler.json'
import vikingosBerserker from '@/data/skill-trees/vikingos/berserker.json'
import vikingosJarlHeir from '@/data/skill-trees/vikingos/jarl_heir.json'
import vikingosShieldmaiden from '@/data/skill-trees/vikingos/shieldmaiden.json'
import vikingosSkald from '@/data/skill-trees/vikingos/skald.json'
import vikingosThrallFreed from '@/data/skill-trees/vikingos/thrall_freed.json'
import vikingosVolva from '@/data/skill-trees/vikingos/volva.json'
import zombiesHunter from '@/data/skill-trees/zombies/hunter.json'
import zombiesLeader from '@/data/skill-trees/zombies/leader.json'
import zombiesMechanic from '@/data/skill-trees/zombies/mechanic.json'
import zombiesMedic from '@/data/skill-trees/zombies/medic.json'
import zombiesScavenger from '@/data/skill-trees/zombies/scavenger.json'
import zombiesSoldier from '@/data/skill-trees/zombies/soldier.json'

const TREES: SkillTree[] = [
  cozyWitchBrujaHogar as SkillTree,
  cozyWitchBrujaMar as SkillTree,
  cozyWitchBrujaVerde as SkillTree,
  cyberpunkFixer as SkillTree,
  cyberpunkNetrunner as SkillTree,
  cyberpunkSolo as SkillTree,
  dndClassicAcademyMage as SkillTree,
  dndClassicGuildAdventurer as SkillTree,
  dndClassicStreetRogue as SkillTree,
  isekaiBeastTamer as SkillTree,
  isekaiMagicStudent as SkillTree,
  isekaiMerchantTraveler as SkillTree,
  isekaiOpSupport as SkillTree,
  isekaiReincarnatedSage as SkillTree,
  isekaiSummonedHero as SkillTree,
  lotrDwarf as SkillTree,
  lotrElf as SkillTree,
  lotrHobbit as SkillTree,
  lotrRanger as SkillTree,
  lotrScholar as SkillTree,
  lotrWarrior as SkillTree,
  lovecraftDetective as SkillTree,
  lovecraftOccultist as SkillTree,
  lovecraftProfessor as SkillTree,
  romantasyAltaDama as SkillTree,
  romantasyCortesano as SkillTree,
  romantasyGuerreraIllyriana as SkillTree,
  starwarsBountyHunter as SkillTree,
  starwarsForceSensitive as SkillTree,
  starwarsSmuggler as SkillTree,
  vikingosBerserker as SkillTree,
  vikingosJarlHeir as SkillTree,
  vikingosShieldmaiden as SkillTree,
  vikingosSkald as SkillTree,
  vikingosThrallFreed as SkillTree,
  vikingosVolva as SkillTree,
  zombiesHunter as SkillTree,
  zombiesLeader as SkillTree,
  zombiesMechanic as SkillTree,
  zombiesMedic as SkillTree,
  zombiesScavenger as SkillTree,
  zombiesSoldier as SkillTree,
]

const byKey = new Map<string, SkillTree>(
  TREES.map((t) => [`${t.loreId}:${t.archetypeId}`, t])
)

/**
 * Árbol para un lore+arquetipo, o null si (todavía) no existe.
 * Acepta tanto el id del arquetipo ("ranger") como el nombre localizado
 * ("Montaraz"/"Ranger") — Character.archetype guarda el nombre, no el id.
 */
export function getSkillTree(loreId: string, archetypeKey: string): SkillTree | null {
  const direct = byKey.get(`${loreId}:${archetypeKey}`)
  if (direct) return direct
  const resolvedId = resolveArchetypeId(loreId, archetypeKey)
  return resolvedId ? byKey.get(`${loreId}:${resolvedId}`) ?? null : null
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
