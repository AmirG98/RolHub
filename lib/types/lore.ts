// Tipos para el sistema de lores

export interface LoreBible {
  id: string
  name: string
  tagline: string
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
  name: string
  description: string
  type: string
  danger_level: number
}

export interface Archetype {
  id: string
  name: string
  description: string
  simple_description: string
  starting_stats: {
    hp: number
    maxHp: number
    combat: number
    exploration: number
    social: number
    lore: number
  }
  starting_inventory: string[]
  special_ability: string
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

export type Lore = 'MEDIEVAL_FANTASY' | 'POST_APOCALYPTIC' | 'HARRY_POTTER' | 'SCI_FI' | 'STAR_WARS' | 'CYBERPUNK' | 'HORROR_LOVECRAFT' | 'VIKINGS' | 'ZOMBIE_SURVIVAL' | 'CUSTOM'
export type GameEngine = 'STORY_MODE' | 'PBTA' | 'YEAR_ZERO' | 'DND_5E'
export type GameMode = 'ONE_SHOT' | 'CAMPAIGN'
export type TutorialLevel = 'NOVICE' | 'CASUAL' | 'EXPERIENCED' | 'VETERAN'
