// Tipos para el sistema de lores

import type { AbilityTemplate } from './ability'

// String localizable — puede ser un string plano (legacy, solo ES) o un objeto bilingüe.
// Usar getLocalized() de lib/i18n/localize.ts para consumirlos de forma segura.
export type LocalizedString = string | { es: string; en: string }

export interface LoreBible {
  id: string
  name: LocalizedString
  tagline: LocalizedString
  tone: string[]
  world_summary: string
  factions: Faction[]
  locations: Location[]
  archetypes: Archetype[]
  voice_id: string
  npc_voices: Record<string, string>
  music_mood: string
  art_style: string
  roll_tables: {
    encounters: RollTableData
    weather: RollTableData
    loot: RollTableData
    npc_names: RollTableData
    events: RollTableData
  }
  active_effects_pool: ActiveEffect[]
  narrative_skeleton: {
    act_1: NarrativeAct
    act_2: NarrativeAct
    act_3: NarrativeAct
    act_4: NarrativeAct
    act_5: NarrativeAct
  }
  one_shot_hook: string
  initial_missions?: InitialMission[]
  engine_notes: {
    story_mode: string
    pbta: string
    year_zero: string
    dnd_5e: string
  }
  tutorial_notes: string
  glossary: Record<string, string>
}

export interface Faction {
  name: string
  description: string
  alignment: string
  influence: number
}

export interface Location {
  name: LocalizedString
  description: LocalizedString
  type: string
  danger_level: number
}

export interface SubLocation {
  id: string
  name: LocalizedString
  description: LocalizedString
  type: string
}

export interface Archetype {
  id: string
  name: LocalizedString
  description: LocalizedString
  simple_description: LocalizedString
  starting_stats: {
    hp: number
    maxHp: number
    combat: number
    exploration: number
    social: number
    lore: number
  }
  starting_inventory: LocalizedString[]
  special_ability: string
  // Lista opcional de habilidades concretas con tracking de uso.
  // Si no está definida, se autogenera una desde special_ability vía deriveDefaultAbility().
  abilities?: AbilityTemplate[]
}

export interface RollTableData {
  formula: string
  results: RollTableResult[]
}

export interface RollTableResult {
  range: [number, number]
  result: string
}

export interface ActiveEffect {
  id: string
  name: string
  description: string
  type: 'buff' | 'debuff'
  duration: number
  effects: Record<string, number>
}

export interface NarrativeAct {
  name: string
  description: string
  anchors: string[]
  typical_scenes: string[]
  mood: string
}

export interface InitialMission {
  id: string
  title: string
  description: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
}

export type Lore = 'LOTR' | 'ZOMBIES' | 'ISEKAI' | 'VIKINGOS' | 'STAR_WARS' | 'CYBERPUNK' | 'LOVECRAFT_HORROR' | 'DND_CLASSIC' | 'ROMANTASY' | 'COZY_WITCH' | 'NOIR_MYSTERY' | 'PULP_ADVENTURE' | 'CUSTOM'
export type GameEngine = 'STORY_MODE' | 'PBTA' | 'YEAR_ZERO' | 'DND_5E'
export type GameMode = 'ONE_SHOT' | 'CAMPAIGN'
export type TutorialLevel = 'NOVICE' | 'CASUAL' | 'EXPERIENCED' | 'VETERAN'
