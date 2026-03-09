// Exportar todos los tipos
export * from './types'

// Importar configuraciones de motores
import { storyModeConfig } from './story-mode'
import { pbtaConfig, pbtaMoves, getPbtAMove, getLocalizedMoves } from './pbta'
import { yearZeroConfig, yearZeroResources, calculatePushDamage, getLocalizedResources } from './year-zero'
import { dnd5eConfig, dnd5eAbilityScores, calculateModifier, formatModifier, getLocalizedAbilityScores, getProficiencyBonus } from './dnd-5e'

import type { GameEngine, EngineConfig, Locale } from './types'

// Mapa de configuraciones
const engineConfigs: Record<GameEngine, EngineConfig> = {
  STORY_MODE: storyModeConfig,
  PBTA: pbtaConfig,
  YEAR_ZERO: yearZeroConfig,
  DND_5E: dnd5eConfig
}

/**
 * Obtiene la configuración de un motor de juego
 */
export function getEngineConfig(engine: GameEngine): EngineConfig {
  const config = engineConfigs[engine]
  if (!config) {
    console.warn(`Unknown engine: ${engine}, falling back to STORY_MODE`)
    return engineConfigs.STORY_MODE
  }
  return config
}

/**
 * Obtiene el nombre localizado de un motor
 */
export function getEngineName(engine: GameEngine, locale: Locale): string {
  const config = getEngineConfig(engine)
  return config.name[locale]
}

/**
 * Obtiene la descripción localizada de un motor
 */
export function getEngineDescription(engine: GameEngine, locale: Locale): string {
  const config = getEngineConfig(engine)
  return config.description[locale]
}

/**
 * Obtiene todos los motores disponibles con info localizada
 */
export function getAllEngines(locale: Locale): Array<{
  id: GameEngine
  name: string
  description: string
  diceType: string
  requiresDice: boolean
}> {
  return Object.values(engineConfigs).map(config => ({
    id: config.id,
    name: config.name[locale],
    description: config.description[locale],
    diceType: config.diceType,
    requiresDice: config.requiresDice
  }))
}

/**
 * Verifica si un motor requiere dados
 */
export function engineRequiresDice(engine: GameEngine): boolean {
  return getEngineConfig(engine).requiresDice
}

/**
 * Obtiene el tipo de dados de un motor
 */
export function getEngineDiceType(engine: GameEngine): 'none' | '2d6' | 'pool-d6' | 'd20' {
  return getEngineConfig(engine).diceType
}

/**
 * Obtiene la fórmula de dados default de un motor
 */
export function getEngineDefaultDice(engine: GameEngine): string | undefined {
  return getEngineConfig(engine).defaultDice
}

// Re-exportar configuraciones individuales
export {
  storyModeConfig,
  pbtaConfig,
  yearZeroConfig,
  dnd5eConfig
}

// Re-exportar helpers de PbtA
export {
  pbtaMoves,
  getPbtAMove,
  getLocalizedMoves
}

// Re-exportar helpers de Year Zero
export {
  yearZeroResources,
  calculatePushDamage,
  getLocalizedResources
}

// Re-exportar helpers de D&D 5e
export {
  dnd5eAbilityScores,
  calculateModifier,
  formatModifier,
  getLocalizedAbilityScores,
  getProficiencyBonus
}
