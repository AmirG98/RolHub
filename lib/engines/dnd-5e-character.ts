/**
 * D&D 5e Character Creation Engine
 * Handles full character creation with races, classes, and equipment
 */

import classesData from '@/data/dnd5e/classes.json'
import racesData from '@/data/dnd5e/races.json'
import equipmentData from '@/data/dnd5e/equipment.json'
import { calculateModifier, getProficiencyBonus } from './dnd-5e'

// Types
export type AbilityScore = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export interface AbilityScores {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export interface DnD5eClass {
  id: string
  name: string
  nameEn: string
  description: string
  hitDie: string
  primaryAbility: AbilityScore[]
  savingThrows: AbilityScore[]
  armorProficiencies: string[]
  weaponProficiencies: string[]
  skillChoices: {
    count: number
    options: string[] | 'any'
  }
  spellcasting?: {
    ability: AbilityScore
    type: string
    cantripsKnown?: Record<string, number>
    spellsKnown?: Record<string, number>
    startLevel?: number
  }
  startingEquipment: {
    choices?: Array<{
      options: Array<{ items: string[]; requirement?: string }>
    }>
    fixed: string[]
  }
  features: Record<string, Array<{ name: string; nameEn: string; description: string }>>
}

export interface DnD5eRaceTrait {
  name: string
  nameEn: string
  description: string
}

export interface DnD5eSubrace {
  id: string
  name: string
  nameEn: string
  description: string
  abilityScoreIncrease: Partial<Record<AbilityScore, number>>
  traits: DnD5eRaceTrait[]
  speedBonus?: number
}

export interface DnD5eRace {
  id: string
  name: string
  nameEn: string
  description: string
  abilityScoreIncrease: Partial<Record<AbilityScore | 'all' | 'choice', number | { count: number; options: AbilityScore[]; amount: number }>>
  age: { adulthood: number; lifespan: number }
  size: 'Small' | 'Medium'
  speed: number
  languages: string[]
  traits: DnD5eRaceTrait[]
  subraces: DnD5eSubrace[]
  draconicAncestries?: Array<{ dragon: string; damageType: string; breathWeapon: string }>
}

export interface DnD5eCharacter {
  name: string
  race: {
    id: string
    name: string
  }
  subrace?: {
    id: string
    name: string
  }
  class: {
    id: string
    name: string
  }
  level: number
  abilityScores: AbilityScores
  hitPoints: {
    current: number
    max: number
    temp: number
  }
  armorClass: number
  proficiencyBonus: number
  speed: number
  skills: string[]
  equipment: string[]
  features: string[]
  languages: string[]
  traits: string[]
  savingThrows: AbilityScore[]
  spellcasting?: {
    ability: AbilityScore
    spellSaveDC: number
    spellAttackBonus: number
    cantripsKnown: number
    spellsKnown?: number
    spellSlots?: Record<number, number>
  }
  draconicAncestry?: {
    dragon: string
    damageType: string
    breathWeapon: string
  }
}

export interface CharacterCreationOptions {
  name: string
  raceId: string
  subraceId?: string
  classId: string
  level: number
  abilityScores: AbilityScores
  skills: string[]
  equipment: string[]
  draconicAncestry?: string
  abilityChoices?: AbilityScore[] // For half-elf ability score choices
}

// Standard Array for ability score assignment
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

// Point Buy costs
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
}

export const POINT_BUY_TOTAL = 27

// Spell slots by class level (full caster)
export const SPELL_SLOTS_FULL_CASTER: Record<number, Record<number, number>> = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }
}

// Half-caster spell slots
export const SPELL_SLOTS_HALF_CASTER: Record<number, Record<number, number>> = {
  2: { 1: 2 },
  3: { 1: 3 },
  4: { 1: 3 },
  5: { 1: 4, 2: 2 },
  6: { 1: 4, 2: 2 },
  7: { 1: 4, 2: 3 },
  8: { 1: 4, 2: 3 },
  9: { 1: 4, 2: 3, 3: 2 },
  10: { 1: 4, 2: 3, 3: 2 }
}

/**
 * Get all available classes
 */
export function getClasses(): DnD5eClass[] {
  return classesData.classes as unknown as DnD5eClass[]
}

/**
 * Get a specific class by ID
 */
export function getClass(classId: string): DnD5eClass | undefined {
  return classesData.classes.find((c: { id: string }) => c.id === classId) as DnD5eClass | undefined
}

/**
 * Get all available races
 */
export function getRaces(): DnD5eRace[] {
  return racesData.races as unknown as DnD5eRace[]
}

/**
 * Get a specific race by ID
 */
export function getRace(raceId: string): DnD5eRace | undefined {
  return racesData.races.find((r: { id: string }) => r.id === raceId) as DnD5eRace | undefined
}

/**
 * Get starting equipment packages
 */
export function getStartingPackages() {
  return equipmentData.startingPackages
}

/**
 * Get magic items by tier
 */
export function getMagicItems(tier: 'common' | 'uncommon' | 'rare') {
  return equipmentData.magicItems[tier]
}

/**
 * Calculate hit points at a given level
 */
export function calculateHitPoints(
  classId: string,
  level: number,
  constitutionModifier: number
): number {
  const characterClass = getClass(classId)
  if (!characterClass) return 10

  const hitDieValue = parseInt(characterClass.hitDie.replace('d', ''))

  // Level 1: max hit die + CON mod
  let hp = hitDieValue + constitutionModifier

  // Subsequent levels: average (rounded up) + CON mod
  const averageRoll = Math.ceil(hitDieValue / 2) + 1
  hp += (level - 1) * (averageRoll + constitutionModifier)

  return Math.max(hp, 1)
}

/**
 * Calculate armor class (unarmored)
 */
export function calculateArmorClass(
  classId: string,
  dexModifier: number,
  wisModifier?: number,
  conModifier?: number
): number {
  // Monk: 10 + DEX + WIS
  if (classId === 'monk' && wisModifier !== undefined) {
    return 10 + dexModifier + wisModifier
  }

  // Barbarian: 10 + DEX + CON
  if (classId === 'barbarian' && conModifier !== undefined) {
    return 10 + dexModifier + conModifier
  }

  // Default: 10 + DEX
  return 10 + dexModifier
}

/**
 * Apply racial ability score increases
 */
export function applyRacialBonuses(
  baseScores: AbilityScores,
  race: DnD5eRace,
  subrace?: DnD5eSubrace,
  abilityChoices?: AbilityScore[]
): AbilityScores {
  const scores = { ...baseScores }

  // Apply race bonuses
  const raceIncrease = race.abilityScoreIncrease as Record<string, number | { count: number; options: AbilityScore[]; amount: number }>

  for (const [ability, value] of Object.entries(raceIncrease)) {
    if (ability === 'all' && typeof value === 'number') {
      // Human: +1 to all abilities
      (Object.keys(scores) as AbilityScore[]).forEach(ab => {
        scores[ab] += value
      })
    } else if (ability === 'choice' && typeof value === 'object') {
      // Half-elf: choose abilities
      if (abilityChoices) {
        abilityChoices.slice(0, value.count).forEach(ab => {
          scores[ab] += value.amount
        })
      }
    } else if (ability in scores && typeof value === 'number') {
      scores[ability as AbilityScore] += value
    }
  }

  // Apply subrace bonuses
  if (subrace) {
    for (const [ability, value] of Object.entries(subrace.abilityScoreIncrease)) {
      if (ability in scores && typeof value === 'number') {
        scores[ability as AbilityScore] += value
      }
    }
  }

  return scores
}

/**
 * Get features for a class at a given level
 */
export function getClassFeatures(classId: string, level: number): string[] {
  const characterClass = getClass(classId)
  if (!characterClass) return []

  const features: string[] = []

  for (let lvl = 1; lvl <= level; lvl++) {
    const levelFeatures = characterClass.features[lvl.toString()]
    if (levelFeatures) {
      features.push(...levelFeatures.map(f => f.name))
    }
  }

  return features
}

/**
 * Get racial traits
 */
export function getRacialTraits(race: DnD5eRace, subrace?: DnD5eSubrace): string[] {
  const traits = race.traits.map(t => t.name)

  if (subrace) {
    traits.push(...subrace.traits.map(t => t.name))
  }

  return traits
}

/**
 * Get recommended ability scores for a class
 */
export function getRecommendedAbilityScores(classId: string): AbilityScores {
  const characterClass = getClass(classId)
  if (!characterClass) {
    return { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }
  }

  const primary = characterClass.primaryAbility
  const saves = characterClass.savingThrows

  // Start with standard array sorted by importance
  const scores: AbilityScores = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }
  const available = [...STANDARD_ARRAY]

  // Primary abilities get highest scores
  primary.forEach(ability => {
    const highest = available.shift()!
    scores[ability] = highest
  })

  // CON is always important
  if (!primary.includes('CON') && available.length > 0) {
    scores.CON = available.shift()!
  }

  // Saving throw proficiencies next
  saves.filter(s => !primary.includes(s)).forEach(ability => {
    if (available.length > 0 && scores[ability] === 8) {
      scores[ability] = available.shift()!
    }
  })

  // Fill remaining
  const remaining = (Object.keys(scores) as AbilityScore[])
    .filter(a => scores[a] === 8)

  remaining.forEach(ability => {
    if (available.length > 0) {
      scores[ability] = available.shift()!
    }
  })

  return scores
}

/**
 * Get starting gold based on level
 */
export function getStartingGold(level: number): { min: number; max: number } | { fixed: number } {
  const packages = getStartingPackages()

  if (level <= 1) return packages.level1.gold
  if (level <= 4) return packages.level3.gold
  if (level <= 9) return packages.level5.gold
  return packages.level10.gold
}

/**
 * Get number of magic items based on level
 */
export function getMagicItemsAllowed(level: number): { count: number; maxTier: 'common' | 'uncommon' | 'rare' } {
  if (level <= 2) return { count: 0, maxTier: 'common' }
  if (level <= 4) return { count: 0, maxTier: 'common' }
  if (level <= 9) return { count: 1, maxTier: 'uncommon' }
  return { count: 3, maxTier: 'rare' }
}

/**
 * Create a complete D&D 5e character
 */
export function createDnD5eCharacter(options: CharacterCreationOptions): DnD5eCharacter {
  const race = getRace(options.raceId)
  const characterClass = getClass(options.classId)

  if (!race || !characterClass) {
    throw new Error('Invalid race or class ID')
  }

  const subrace = options.subraceId
    ? race.subraces.find(s => s.id === options.subraceId)
    : undefined

  // Apply racial bonuses to ability scores
  const finalAbilityScores = applyRacialBonuses(
    options.abilityScores,
    race,
    subrace,
    options.abilityChoices
  )

  // Calculate modifiers
  const strMod = calculateModifier(finalAbilityScores.STR)
  const dexMod = calculateModifier(finalAbilityScores.DEX)
  const conMod = calculateModifier(finalAbilityScores.CON)
  const intMod = calculateModifier(finalAbilityScores.INT)
  const wisMod = calculateModifier(finalAbilityScores.WIS)
  const chaMod = calculateModifier(finalAbilityScores.CHA)

  // Calculate hit points
  const maxHp = calculateHitPoints(options.classId, options.level, conMod)

  // Calculate AC
  const ac = calculateArmorClass(options.classId, dexMod, wisMod, conMod)

  // Get speed (with subrace bonus if applicable)
  let speed = race.speed
  if (subrace?.speedBonus) {
    speed += subrace.speedBonus
  }

  // Proficiency bonus
  const proficiencyBonus = getProficiencyBonus(options.level)

  // Features and traits
  const features = getClassFeatures(options.classId, options.level)
  const traits = getRacialTraits(race, subrace)

  // Spellcasting (if applicable)
  let spellcasting: DnD5eCharacter['spellcasting'] | undefined

  if (characterClass.spellcasting) {
    const spellAbility = characterClass.spellcasting.ability
    const spellMod = spellAbility === 'INT' ? intMod
      : spellAbility === 'WIS' ? wisMod
      : chaMod

    const startLevel = characterClass.spellcasting.startLevel || 1

    if (options.level >= startLevel) {
      // Determine spell slots
      let spellSlots: Record<number, number> | undefined

      if (characterClass.spellcasting.type === 'pact_magic') {
        // Warlock uses different system
        const pactSlotLevel = options.level <= 2 ? 1 : options.level <= 4 ? 2 : options.level <= 6 ? 3 : options.level <= 8 ? 4 : 5
        const pactSlotCount = options.level <= 1 ? 1 : options.level <= 10 ? 2 : options.level <= 16 ? 3 : 4
        spellSlots = { [pactSlotLevel]: pactSlotCount }
      } else if (['paladin', 'ranger'].includes(options.classId)) {
        spellSlots = SPELL_SLOTS_HALF_CASTER[options.level]
      } else {
        spellSlots = SPELL_SLOTS_FULL_CASTER[options.level]
      }

      // Cantrips known
      let cantripsKnown = 0
      if (characterClass.spellcasting.cantripsKnown) {
        const cantripsTable = characterClass.spellcasting.cantripsKnown
        for (const [lvl, count] of Object.entries(cantripsTable)) {
          if (options.level >= parseInt(lvl)) {
            cantripsKnown = count
          }
        }
      }

      // Spells known (for known casters)
      let spellsKnown: number | undefined
      if (characterClass.spellcasting.spellsKnown) {
        const spellsTable = characterClass.spellcasting.spellsKnown
        for (const [lvl, count] of Object.entries(spellsTable)) {
          if (options.level >= parseInt(lvl)) {
            spellsKnown = count
          }
        }
      }

      spellcasting = {
        ability: spellAbility,
        spellSaveDC: 8 + proficiencyBonus + spellMod,
        spellAttackBonus: proficiencyBonus + spellMod,
        cantripsKnown,
        spellsKnown,
        spellSlots
      }
    }
  }

  // Dragonborn ancestry
  let draconicAncestry: DnD5eCharacter['draconicAncestry'] | undefined
  if (options.raceId === 'dragonborn' && options.draconicAncestry && race.draconicAncestries) {
    const ancestry = race.draconicAncestries.find(a => a.dragon === options.draconicAncestry)
    if (ancestry) {
      draconicAncestry = ancestry
    }
  }

  return {
    name: options.name,
    race: {
      id: race.id,
      name: race.name
    },
    subrace: subrace ? {
      id: subrace.id,
      name: subrace.name
    } : undefined,
    class: {
      id: characterClass.id,
      name: characterClass.name
    },
    level: options.level,
    abilityScores: finalAbilityScores,
    hitPoints: {
      current: maxHp,
      max: maxHp,
      temp: 0
    },
    armorClass: ac,
    proficiencyBonus,
    speed,
    skills: options.skills,
    equipment: options.equipment,
    features,
    languages: race.languages,
    traits,
    savingThrows: characterClass.savingThrows,
    spellcasting,
    draconicAncestry
  }
}

/**
 * Convert D&D 5e character to game-compatible stats format
 */
export function convertToGameStats(character: DnD5eCharacter): Record<string, number | string> {
  return {
    hp: character.hitPoints.current,
    maxHp: character.hitPoints.max,
    ac: character.armorClass,
    level: character.level,
    proficiencyBonus: character.proficiencyBonus,
    speed: character.speed,
    STR: character.abilityScores.STR,
    DEX: character.abilityScores.DEX,
    CON: character.abilityScores.CON,
    INT: character.abilityScores.INT,
    WIS: character.abilityScores.WIS,
    CHA: character.abilityScores.CHA,
    strMod: calculateModifier(character.abilityScores.STR),
    dexMod: calculateModifier(character.abilityScores.DEX),
    conMod: calculateModifier(character.abilityScores.CON),
    intMod: calculateModifier(character.abilityScores.INT),
    wisMod: calculateModifier(character.abilityScores.WIS),
    chaMod: calculateModifier(character.abilityScores.CHA),
    className: character.class.name,
    raceName: character.race.name,
    subraceName: character.subrace?.name || ''
  }
}

/**
 * Get all skills with their associated ability
 */
export function getAllSkills(): Array<{ id: string; name: string; ability: AbilityScore }> {
  return [
    { id: 'acrobatics', name: 'Acrobacias', ability: 'DEX' },
    { id: 'animal_handling', name: 'Trato con Animales', ability: 'WIS' },
    { id: 'arcana', name: 'Arcano', ability: 'INT' },
    { id: 'athletics', name: 'Atletismo', ability: 'STR' },
    { id: 'deception', name: 'Engaño', ability: 'CHA' },
    { id: 'history', name: 'Historia', ability: 'INT' },
    { id: 'insight', name: 'Perspicacia', ability: 'WIS' },
    { id: 'intimidation', name: 'Intimidación', ability: 'CHA' },
    { id: 'investigation', name: 'Investigación', ability: 'INT' },
    { id: 'medicine', name: 'Medicina', ability: 'WIS' },
    { id: 'nature', name: 'Naturaleza', ability: 'INT' },
    { id: 'perception', name: 'Percepción', ability: 'WIS' },
    { id: 'performance', name: 'Actuación', ability: 'CHA' },
    { id: 'persuasion', name: 'Persuasión', ability: 'CHA' },
    { id: 'religion', name: 'Religión', ability: 'INT' },
    { id: 'sleight_of_hand', name: 'Juego de Manos', ability: 'DEX' },
    { id: 'stealth', name: 'Sigilo', ability: 'DEX' },
    { id: 'survival', name: 'Supervivencia', ability: 'WIS' }
  ]
}
