'use client'

import { GameEngine, EnginePanelProps } from '@/lib/engines/types'
import { StoryModePanel } from './StoryModePanel'
import { PbtAPanel } from './PbtAPanel'
import { YearZeroPanel } from './YearZeroPanel'
import { DnD5ePanel } from './DnD5ePanel'

interface EnginePanelSwitcherProps extends EnginePanelProps {
  engine: GameEngine
}

/**
 * Componente principal que renderiza el panel correcto según el motor de juego
 */
export function EnginePanel({ engine, ...props }: EnginePanelSwitcherProps) {
  switch (engine) {
    case 'STORY_MODE':
      return <StoryModePanel {...props} />

    case 'PBTA':
      return <PbtAPanel {...props} />

    case 'YEAR_ZERO':
      return <YearZeroPanel {...props} />

    case 'DND_5E':
      return <DnD5ePanel {...props} />

    default:
      // Fallback a Story Mode si el motor no es reconocido
      console.warn(`Unknown engine: ${engine}, falling back to Story Mode`)
      return <StoryModePanel {...props} />
  }
}

// Re-exportar paneles individuales para uso directo si es necesario
export { StoryModePanel, PbtAPanel, YearZeroPanel, DnD5ePanel }
