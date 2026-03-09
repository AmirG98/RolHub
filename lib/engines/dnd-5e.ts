import { EngineConfig, EngineContext, DiceRoll, DiceInterpretation, Locale, DnD5eAbilityScore } from './types'

// Atributos de D&D 5e
export const dnd5eAbilityScores: DnD5eAbilityScore[] = [
  {
    id: 'strength',
    name: { es: 'Fuerza', en: 'Strength' },
    abbr: 'STR',
    description: {
      es: 'Poder físico, atletismo, ataques cuerpo a cuerpo.',
      en: 'Physical power, athletics, melee attacks.'
    }
  },
  {
    id: 'dexterity',
    name: { es: 'Destreza', en: 'Dexterity' },
    abbr: 'DEX',
    description: {
      es: 'Agilidad, reflejos, sigilo, ataques a distancia.',
      en: 'Agility, reflexes, stealth, ranged attacks.'
    }
  },
  {
    id: 'constitution',
    name: { es: 'Constitución', en: 'Constitution' },
    abbr: 'CON',
    description: {
      es: 'Resistencia, salud, aguante físico.',
      en: 'Endurance, health, physical stamina.'
    }
  },
  {
    id: 'intelligence',
    name: { es: 'Inteligencia', en: 'Intelligence' },
    abbr: 'INT',
    description: {
      es: 'Razonamiento, memoria, conocimiento arcano.',
      en: 'Reasoning, memory, arcane knowledge.'
    }
  },
  {
    id: 'wisdom',
    name: { es: 'Sabiduría', en: 'Wisdom' },
    abbr: 'WIS',
    description: {
      es: 'Percepción, intuición, conocimiento divino.',
      en: 'Perception, intuition, divine knowledge.'
    }
  },
  {
    id: 'charisma',
    name: { es: 'Carisma', en: 'Charisma' },
    abbr: 'CHA',
    description: {
      es: 'Fuerza de personalidad, liderazgo, persuasión.',
      en: 'Force of personality, leadership, persuasion.'
    }
  }
]

// Calcula modificador de D&D desde puntuación
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// Formatea modificador con signo
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export const dnd5eConfig: EngineConfig = {
  id: 'DND_5E',
  name: {
    es: 'D&D 5e Simplificado',
    en: 'D&D 5e Simplified'
  },
  description: {
    es: 'd20 + modificador vs CD. 20 natural = crítico, 1 natural = pifia.',
    en: 'd20 + modifier vs DC. Natural 20 = critical, natural 1 = fumble.'
  },
  diceType: 'd20',
  defaultDice: '1d20',
  requiresDice: true,
  statNames: {
    es: ['Fuerza', 'Destreza', 'Constitución', 'Inteligencia', 'Sabiduría', 'Carisma'],
    en: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
  },

  buildPrompt: (context: EngineContext): string => {
    const { character, worldState, locale, loreName, loreDescription } = context
    const isEnglish = locale === 'en'

    const labels = isEnglish ? {
      role: 'You are the Dungeon Master for a D&D 5e-inspired RPG session.',
      engine: 'GAME ENGINE: D&D 5e Simplified',
      engineDesc: 'This system uses d20 + modifier against Difficulty Class (DC). Focus on heroic fantasy adventure while keeping rules accessible.',
      worldTitle: 'WORLD',
      characterTitle: 'PLAYER CHARACTER',
      level: 'Level',
      stats: 'Ability Scores',
      inventory: 'Inventory',
      conditions: 'Conditions',
      hp: 'Hit Points',
      worldStateTitle: 'CURRENT WORLD STATE',
      mechanicsTitle: 'D&D 5e MECHANICS',
      mechanics: [
        'd20 + ability modifier + proficiency (if applicable) vs DC',
        'DC 10 = Easy, DC 15 = Medium, DC 20 = Hard, DC 25 = Very Hard',
        'Natural 20: Automatic success, critical hit (double damage dice)',
        'Natural 1: Automatic failure, potential fumble',
        'Advantage: Roll 2d20, take higher. Disadvantage: Take lower',
        'Modifier = (Ability Score - 10) / 2, rounded down'
      ],
      rulesTitle: 'DM PRINCIPLES',
      rules: [
        'Be fair but challenging - heroes should feel heroic',
        'Set appropriate DCs based on difficulty, not to punish',
        'Critical hits should feel epic and memorable',
        'Allow creative solutions - reward player ingenuity',
        'Combat should be tactical but narratively exciting',
        'NPCs have goals, fears, and personality',
        'The world has history and consequences'
      ],
      responseFormat: 'RESPONSE FORMAT',
      formatRules: [
        'State the required check: "Make a [Ability] check (DC X)"',
        'Describe checks narratively: "Roll Dexterity to dodge the trap"',
        'On success, describe the achievement heroically',
        'On failure, keep the story moving - failures create story, not dead ends',
        'Mention advantage/disadvantage when circumstances warrant',
        'End with a clear situation requiring player decision'
      ],
      dcGuide: 'DC QUICK GUIDE'
    } : {
      role: 'Sos el Dungeon Master para una sesión de rol inspirada en D&D 5e.',
      engine: 'MOTOR DE JUEGO: D&D 5e Simplificado',
      engineDesc: 'Este sistema usa d20 + modificador contra Clase de Dificultad (CD). Enfocate en aventura de fantasía heroica manteniendo las reglas accesibles.',
      worldTitle: 'MUNDO',
      characterTitle: 'PERSONAJE DEL JUGADOR',
      level: 'Nivel',
      stats: 'Puntuaciones de Habilidad',
      inventory: 'Inventario',
      conditions: 'Condiciones',
      hp: 'Puntos de Golpe',
      worldStateTitle: 'ESTADO ACTUAL DEL MUNDO',
      mechanicsTitle: 'MECÁNICAS DE D&D 5e',
      mechanics: [
        'd20 + modificador de habilidad + competencia (si aplica) vs CD',
        'CD 10 = Fácil, CD 15 = Medio, CD 20 = Difícil, CD 25 = Muy Difícil',
        '20 Natural: Éxito automático, crítico (dados de daño dobles)',
        '1 Natural: Fallo automático, posible pifia',
        'Ventaja: Tirá 2d20, quedáte con el mayor. Desventaja: Quedáte con el menor',
        'Modificador = (Puntuación - 10) / 2, redondeado hacia abajo'
      ],
      rulesTitle: 'PRINCIPIOS DEL DM',
      rules: [
        'Sé justo pero desafiante - los héroes deben sentirse heroicos',
        'Establecé CDs apropiadas según dificultad, no para castigar',
        'Los críticos deben sentirse épicos y memorables',
        'Permitir soluciones creativas - recompensá el ingenio del jugador',
        'El combate debe ser táctico pero narrativamente emocionante',
        'Los NPCs tienen metas, miedos y personalidad',
        'El mundo tiene historia y consecuencias'
      ],
      responseFormat: 'FORMATO DE RESPUESTA',
      formatRules: [
        'Indicá el chequeo requerido: "Hacé un chequeo de [Habilidad] (CD X)"',
        'Describí los chequeos narrativamente: "Tirá Destreza para esquivar la trampa"',
        'En éxito, describí el logro heroicamente',
        'En fallo, mantené la historia avanzando - los fallos crean historia, no callejones sin salida',
        'Mencioná ventaja/desventaja cuando las circunstancias lo ameriten',
        'Terminá con una situación clara que requiera decisión del jugador'
      ],
      dcGuide: 'GUÍA RÁPIDA DE CD'
    }

    // Formatear stats con modificadores
    const statsDisplay = character.stats
      ? Object.entries(character.stats).map(([k, v]) => {
          const mod = calculateModifier(v)
          return `${k}: ${v} (${formatModifier(mod)})`
        }).join(', ')
      : 'N/A'

    const inventoryDisplay = character.inventory?.length
      ? character.inventory.join(', ')
      : isEnglish ? 'Empty' : 'Vacío'

    const conditionsDisplay = character.conditions?.length
      ? character.conditions.join(', ')
      : isEnglish ? 'None' : 'Ninguna'

    const hpDisplay = character.hp !== undefined && character.maxHp !== undefined
      ? `${character.hp}/${character.maxHp}`
      : 'N/A'

    const dcGuide = isEnglish
      ? '- DC 5: Trivial | DC 10: Easy | DC 15: Medium | DC 20: Hard | DC 25: Very Hard | DC 30: Nearly Impossible'
      : '- CD 5: Trivial | CD 10: Fácil | CD 15: Medio | CD 20: Difícil | CD 25: Muy Difícil | CD 30: Casi Imposible'

    return `${labels.role}

${labels.engine}
${labels.engineDesc}

## ${labels.worldTitle}: ${loreName}
${loreDescription || ''}

## ${labels.characterTitle}
- **${isEnglish ? 'Name' : 'Nombre'}**: ${character.name}
- **${isEnglish ? 'Class/Archetype' : 'Clase/Arquetipo'}**: ${character.archetype}
- **${labels.level}**: ${character.level}
- **${labels.hp}**: ${hpDisplay}
- **${labels.stats}**: ${statsDisplay}
- **${labels.inventory}**: ${inventoryDisplay}
- **${labels.conditions}**: ${conditionsDisplay}

## ${labels.worldStateTitle}
${JSON.stringify(worldState, null, 2)}

## ${labels.mechanicsTitle}
${labels.mechanics.map((m, i) => `${i + 1}. ${m}`).join('\n')}

### ${labels.dcGuide}
${dcGuide}

## ${labels.rulesTitle}
${labels.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## ${labels.responseFormat}
${labels.formatRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${isEnglish ? 'Respond ONLY in English.' : 'Respondé SOLO en español.'}
`
  },

  interpretDice: (roll: DiceRoll, locale: Locale): DiceInterpretation => {
    const isEnglish = locale === 'en'
    const d20Result = roll.results[0] // El primer dado es el d20
    const totalWithMod = roll.total + (roll.modifier || 0)

    // Natural 20
    if (d20Result === 20) {
      return {
        success: 'critical',
        description: isEnglish ? 'Natural 20! Critical Success!' : '¡20 Natural! ¡Éxito Crítico!',
        narrativeHint: isEnglish
          ? 'Automatic success! In combat, double all damage dice. For skill checks, describe an exceptional achievement beyond what was attempted.'
          : '¡Éxito automático! En combate, duplicá todos los dados de daño. Para chequeos, describí un logro excepcional más allá de lo intentado.'
      }
    }

    // Natural 1
    if (d20Result === 1) {
      return {
        success: 'fumble',
        description: isEnglish ? 'Natural 1! Critical Failure!' : '¡1 Natural! ¡Pifia!',
        narrativeHint: isEnglish
          ? 'Automatic failure! Something goes wrong in a memorable way. Don\'t just fail - create an interesting complication.'
          : '¡Fallo automático! Algo sale mal de forma memorable. No solo fallés - creá una complicación interesante.'
      }
    }

    // Success/Failure basado en DC implícita
    // Sin conocer la DC exacta, usamos rangos generales
    if (totalWithMod >= 20) {
      return {
        success: 'success',
        description: isEnglish
          ? `Strong Success (${totalWithMod})`
          : `Éxito Fuerte (${totalWithMod})`,
        narrativeHint: isEnglish
          ? 'This beats most difficult challenges. Describe a confident, skilled success.'
          : 'Esto supera la mayoría de desafíos difíciles. Describí un éxito confiado y hábil.'
      }
    } else if (totalWithMod >= 15) {
      return {
        success: 'success',
        description: isEnglish
          ? `Success (${totalWithMod})`
          : `Éxito (${totalWithMod})`,
        narrativeHint: isEnglish
          ? 'This beats medium difficulty challenges. A solid success.'
          : 'Esto supera desafíos de dificultad media. Un éxito sólido.'
      }
    } else if (totalWithMod >= 10) {
      return {
        success: 'partial',
        description: isEnglish
          ? `Marginal (${totalWithMod})`
          : `Marginal (${totalWithMod})`,
        narrativeHint: isEnglish
          ? 'This might succeed for easy tasks or fail for harder ones. Consider partial success or success with cost.'
          : 'Esto podría tener éxito para tareas fáciles o fallar para las difíciles. Considerá éxito parcial o éxito con costo.'
      }
    } else {
      return {
        success: 'failure',
        description: isEnglish
          ? `Failure (${totalWithMod})`
          : `Fallo (${totalWithMod})`,
        narrativeHint: isEnglish
          ? 'The attempt fails, but keep the story moving. What complication arises? What do they learn?'
          : 'El intento falla, pero mantené la historia avanzando. ¿Qué complicación surge? ¿Qué aprenden?'
      }
    }
  }
}

// Función helper para obtener atributos localizados
export function getLocalizedAbilityScores(locale: Locale): Array<{
  id: string
  name: string
  abbr: string
  description: string
}> {
  return dnd5eAbilityScores.map(a => ({
    id: a.id,
    name: locale === 'en' ? a.name.en : a.name.es,
    abbr: a.abbr,
    description: locale === 'en' ? a.description.en : a.description.es
  }))
}

// Función para calcular bonus de competencia por nivel
export function getProficiencyBonus(level: number): number {
  if (level <= 4) return 2
  if (level <= 8) return 3
  if (level <= 12) return 4
  if (level <= 16) return 5
  return 6
}
