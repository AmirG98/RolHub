// Tipos de motores de juego
export type GameEngine = 'STORY_MODE' | 'PBTA' | 'YEAR_ZERO' | 'DND_5E'
export type Locale = 'es' | 'en'
export type Lore = 'LOTR' | 'ZOMBIES' | 'ISEKAI' | 'VIKINGOS' | 'STAR_WARS' | 'CYBERPUNK' | 'LOVECRAFT_HORROR' | 'CUSTOM'

// Contexto que recibe cada motor para generar prompts
export interface EngineContext {
  character: CharacterContext
  worldState: WorldStateContext
  locale: Locale
  lore: Lore
  loreName: string
  loreDescription?: string
  turnHistory?: TurnContext[]
}

export interface CharacterContext {
  name: string
  archetype: string
  archetypeDescription?: string
  level: number
  stats: Record<string, number>
  inventory: string[]
  conditions: string[]
  hp?: number
  maxHp?: number
}

export interface WorldStateContext {
  currentScene?: string
  activeQuests?: string[]
  npcsPresent?: string[]
  weather?: string
  timeOfDay?: string
  [key: string]: unknown
}

export interface TurnContext {
  role: 'user' | 'assistant'
  content: string
}

// Resultado de tirada de dados
export interface DiceRoll {
  formula: string
  results: number[]
  total: number
  modifier?: number
  stat?: string
}

// Interpretación del resultado de dados
export interface DiceInterpretation {
  success: 'critical' | 'success' | 'partial' | 'failure' | 'fumble'
  description: string
  narrativeHint: string
}

// Configuración de un motor de juego
export interface EngineConfig {
  id: GameEngine
  name: {
    es: string
    en: string
  }
  description: {
    es: string
    en: string
  }
  diceType: 'none' | '2d6' | 'pool-d6' | 'd20'
  defaultDice?: string

  // Genera el prompt del sistema para Claude
  buildPrompt: (context: EngineContext) => string

  // Interpreta el resultado de una tirada
  interpretDice: (roll: DiceRoll, locale: Locale) => DiceInterpretation

  // Stats que usa este motor
  statNames: {
    es: string[]
    en: string[]
  }

  // Si el motor requiere dados obligatorios
  requiresDice: boolean
}

// Movimientos PbtA
export interface PbtAMove {
  id: string
  name: {
    es: string
    en: string
  }
  stat: string
  description: {
    es: string
    en: string
  }
  onSuccess: {
    es: string
    en: string
  }
  onPartial: {
    es: string
    en: string
  }
  onFailure: {
    es: string
    en: string
  }
}

// Recursos Year Zero
export interface YearZeroResource {
  id: string
  name: {
    es: string
    en: string
  }
  icon: string
  max: number
  criticalEffect: {
    es: string
    en: string
  }
}

// Estadísticas D&D 5e
export interface DnD5eAbilityScore {
  id: string
  name: {
    es: string
    en: string
  }
  abbr: string
  description: {
    es: string
    en: string
  }
}

// Props comunes para paneles de motor
export interface EnginePanelProps {
  character: CharacterContext
  worldState: WorldStateContext
  locale: Locale
  onDiceRoll: (roll: DiceRoll) => void
  onAction?: (action: string) => void
  disabled?: boolean
}
