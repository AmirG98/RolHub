// Contenido de ayuda para D&D 5e y Story Mode
// Dos niveles: novice (jugadores nuevos) y experienced (jugadores con experiencia)

export type HelpLevel = 'novice' | 'experienced'

interface HelpEntry {
  novice: string
  experienced: string
}

// ============================================
// ATRIBUTOS D&D 5e
// ============================================

export const ABILITY_HELP: Record<string, HelpEntry> = {
  STR: {
    novice: "Fuerza: Qué tan fuerte eres. Afecta ataques cuerpo a cuerpo y cuánto puedes cargar.",
    experienced: "Fuerza (STR): Modificador para ataques melee y daño, checks de Atletismo, salvaciones de Fuerza, y capacidad de carga (STR × 15 lbs)."
  },
  DEX: {
    novice: "Destreza: Qué tan ágil y rápido eres. Afecta tu puntería, esquivar ataques y sigilo.",
    experienced: "Destreza (DEX): Modificador para ataques a distancia, AC (si no llevas armadura pesada), iniciativa, y habilidades como Sigilo, Acrobacias y Juego de Manos."
  },
  CON: {
    novice: "Constitución: Tu resistencia física. Determina cuántos puntos de vida tienes.",
    experienced: "Constitución (CON): Modificador añadido a HP por nivel, checks de concentración de hechizos, y resistencia a venenos y enfermedades."
  },
  INT: {
    novice: "Inteligencia: Qué tan listo eres. Afecta tu conocimiento y capacidad de investigar.",
    experienced: "Inteligencia (INT): Habilidad de conjuración para Magos. Afecta Arcanos, Historia, Investigación, Naturaleza y Religión."
  },
  WIS: {
    novice: "Sabiduría: Tu intuición y percepción. Te ayuda a notar cosas y resistir manipulación mental.",
    experienced: "Sabiduría (WIS): Habilidad de conjuración para Clérigos, Druidas y Rangers. Afecta Percepción, Perspicacia, Supervivencia, Medicina y Trato con Animales."
  },
  CHA: {
    novice: "Carisma: Tu personalidad y presencia. Afecta cómo convences o intimidas a otros.",
    experienced: "Carisma (CHA): Habilidad de conjuración para Brujos, Hechiceros, Paladines y Bardos. Afecta Persuasión, Engaño, Intimidación y Actuación."
  },
}

// ============================================
// STATS DE COMBATE
// ============================================

export const COMBAT_HELP: Record<string, HelpEntry> = {
  hp: {
    novice: "Puntos de Vida: Tu salud. Cuando llegan a 0, caes inconsciente. Si bajas más, puedes morir.",
    experienced: "Hit Points (HP): Determinados por dado de golpe de clase + CON mod por nivel. A 0 HP, haces tiradas de salvación de muerte. 3 éxitos = estable, 3 fallos = muerte."
  },
  ac: {
    novice: "Clase de Armadura: Qué tan difícil es golpearte. Un número más alto significa mejor protección.",
    experienced: "Armor Class (AC): Los ataques deben igualar o superar este número. Base 10 + DEX mod, modificado por tipo de armadura y escudo (+2). Armadura pesada ignora DEX."
  },
  initiative: {
    novice: "Iniciativa: Determina quién actúa primero en combate. Basada en tu Destreza.",
    experienced: "Iniciativa: d20 + DEX mod al inicio del combate. Determina el orden de turnos. Algunas clases/rasgos dan bonificadores adicionales."
  },
  proficiency: {
    novice: "Bono de Competencia: Un bonus que añades a ciertas tiradas cuando eres experto en algo.",
    experienced: "Proficiency Bonus: +2 a nivel 1, aumenta cada 4 niveles (+3 a Nv.5, +4 a Nv.9, etc.). Se suma a ataques con armas competentes, habilidades competentes, y salvaciones competentes."
  },
  speed: {
    novice: "Velocidad: Cuántos pies puedes moverte en tu turno. La mayoría tiene 30 pies.",
    experienced: "Speed: Distancia de movimiento por turno. Enanos = 25 pies, Humanos/Elfos = 30 pies. Dash = doble movimiento. Terreno difícil = movimiento ×2."
  },
  hitDice: {
    novice: "Dados de Golpe: Los usas para curarte durante descansos cortos. Tienes tantos como tu nivel.",
    experienced: "Hit Dice: Tienes [nivel] dados de golpe del tipo de tu clase (d6-d12). En descanso corto, gasta dados para recuperar HP (dado + CON mod). Se recuperan la mitad en descanso largo."
  },
}

// ============================================
// TIRADAS DE SALVACIÓN
// ============================================

export const SAVING_THROW_HELP: Record<string, HelpEntry> = {
  general: {
    novice: "Tirada de Salvación: Un chequeo para evitar o resistir efectos como hechizos, venenos o trampas.",
    experienced: "Saving Throw: d20 + ability mod + proficiency (si eres competente). Cada clase tiene 2 salvaciones competentes. La CD la establece el efecto o hechizador."
  },
  STR_save: {
    novice: "Salvación de Fuerza: Para resistir ser empujado, agarrado, o efectos físicos que te mueven.",
    experienced: "STR Save: Resiste efectos de empuje, agarre, y algunos efectos de terreno. Raramente usado, pero importante contra enemigos grandes."
  },
  DEX_save: {
    novice: "Salvación de Destreza: Para esquivar explosiones, rayos, y otros efectos que puedes evadir.",
    experienced: "DEX Save: Extremadamente común. Bolas de fuego, alientos de dragón, trampas. Éxito = mitad de daño típicamente. Rogues con Evasion pueden evitar todo daño."
  },
  CON_save: {
    novice: "Salvación de Constitución: Para resistir venenos, enfermedades, y mantener concentración en hechizos.",
    experienced: "CON Save: Venenos, enfermedades, efectos de agotamiento, y concentración de hechizos (CD = 10 o mitad del daño, lo que sea mayor)."
  },
  INT_save: {
    novice: "Salvación de Inteligencia: Para resistir efectos que atacan tu mente y memoria.",
    experienced: "INT Save: Poco común. Usado contra ilusiones, detección de mentiras mágicas, y efectos psíquicos de algunas criaturas."
  },
  WIS_save: {
    novice: "Salvación de Sabiduría: Para resistir control mental, miedo, y efectos que manipulan tu voluntad.",
    experienced: "WIS Save: Muy común. Charm, fear, dominación, y muchos efectos de control mental. Una de las salvaciones más importantes."
  },
  CHA_save: {
    novice: "Salvación de Carisma: Para resistir efectos que intentan desplazarte a otros planos o poseer tu cuerpo.",
    experienced: "CHA Save: Menos común pero crítica. Resistir destierro, posesión, y efectos de transporte planar. Importante contra fiends."
  },
}

// ============================================
// HABILIDADES (SKILLS)
// ============================================

export const SKILLS_HELP: Record<string, HelpEntry> = {
  acrobatics: {
    novice: "Acrobacias (DES): Mantener equilibrio, hacer piruetas, escapar de agarres.",
    experienced: "Acrobatics (DEX): Equilibrio en terreno difícil, piruetas, caídas controladas. Puede usarse para escapar de grapples como alternativa a Atletismo."
  },
  animal_handling: {
    novice: "Trato con Animales (SAB): Calmar animales, entrenarlos, o intuir sus intenciones.",
    experienced: "Animal Handling (WIS): Calmar bestias hostiles, montar criaturas difíciles, entrenar animales. No funciona con bestias mágicas inteligentes."
  },
  arcana: {
    novice: "Arcanos (INT): Conocimiento sobre magia, hechizos, objetos mágicos y criaturas mágicas.",
    experienced: "Arcana (INT): Identificar hechizos siendo lanzados, conocer propiedades de objetos mágicos, recordar información sobre lo arcano. No es lo mismo que Religión."
  },
  athletics: {
    novice: "Atletismo (FUE): Escalar, nadar, saltar, y forcejear con otros.",
    experienced: "Athletics (STR): Escalar superficies, nadar en corrientes, saltos largos/altos, iniciar/mantener grapples, empujar enemigos (shove)."
  },
  deception: {
    novice: "Engaño (CAR): Mentir de forma convincente, disfrazarte, o crear distracciones.",
    experienced: "Deception (CHA): Mentir verbalmente, crear falsas impresiones, gambits en combate social. Contestado por Perspicacia del objetivo."
  },
  history: {
    novice: "Historia (INT): Recordar eventos históricos, leyendas, y conocimiento del pasado.",
    experienced: "History (INT): Conocimiento sobre eventos, personalidades, guerras, reinos. Puede revelar debilidades de enemigos basadas en tradición."
  },
  insight: {
    novice: "Perspicacia (SAB): Detectar mentiras, leer intenciones ocultas, y entender motivaciones.",
    experienced: "Insight (WIS): Contesta Engaño. Detectar mentiras, entender estados emocionales, intuir motivaciones ocultas. Clave en interacciones sociales."
  },
  intimidation: {
    novice: "Intimidación (CAR): Asustar o amenazar a otros para que hagan lo que quieres.",
    experienced: "Intimidation (CHA): Coerción mediante amenazas. Puede usarse en combate para asustar. Algunas mesas permiten usar STR en su lugar para intimidación física."
  },
  investigation: {
    novice: "Investigación (INT): Buscar pistas, deducir información, y resolver puzzles.",
    experienced: "Investigation (INT): Búsqueda activa y deductiva. Encontrar trampas ocultas, pistas en escenas del crimen, información en libros. Diferente de Percepción."
  },
  medicine: {
    novice: "Medicina (SAB): Estabilizar heridos, diagnosticar enfermedades, y cuidado básico.",
    experienced: "Medicine (WIS): Estabilizar aliados a 0 HP (CD 10), diagnosticar enfermedades/venenos, determinar causa de muerte. No cura HP sin magia."
  },
  nature: {
    novice: "Naturaleza (INT): Conocimiento sobre plantas, animales, clima, y el mundo natural.",
    experienced: "Nature (INT): Identificar plantas/animales, conocer ciclos naturales, predecir clima. Diferente de Supervivencia que es práctica."
  },
  perception: {
    novice: "Percepción (SAB): Notar cosas con tus sentidos - ver, oír, oler amenazas u objetos.",
    experienced: "Perception (WIS): Detección pasiva y activa. Percepción Pasiva = 10 + mod, usada por DM para detección automática. Crítica para emboscadas y trampas."
  },
  performance: {
    novice: "Actuación (CAR): Entretener a otros con música, actuación, o narración.",
    experienced: "Performance (CHA): Entretenimiento artístico. Importante para Bardos que quieren ganar dinero o influenciar multitudes. Puede crear distracciones."
  },
  persuasion: {
    novice: "Persuasión (CAR): Convencer a otros con diplomacia, lógica, o encanto.",
    experienced: "Persuasion (CHA): Influencia positiva - hacer amigos, negociar, convencer. Diferente de Engaño (verdad vs mentira) e Intimidación (positivo vs negativo)."
  },
  religion: {
    novice: "Religión (INT): Conocimiento sobre dioses, ritos, oraciones, y organizaciones religiosas.",
    experienced: "Religion (INT): Conocer panteones, ritos, símbolos sagrados, jerarquías eclesiásticas. Puede identificar undead y fiends, y sus debilidades."
  },
  sleight_of_hand: {
    novice: "Juego de Manos (DES): Robar bolsillos, trucos de manos, y esconder objetos en tu persona.",
    experienced: "Sleight of Hand (DEX): Pickpocketing, plantar objetos, trucos de manos. Contestado por Percepción del objetivo. Clave para Rogues."
  },
  stealth: {
    novice: "Sigilo (DES): Moverte sin ser visto ni oído. Esencial para emboscadas.",
    experienced: "Stealth (DEX): Ocultarse, moverse silenciosamente, evitar detección. Contestado por Percepción Pasiva de enemigos. Desventaja con armadura pesada."
  },
  survival: {
    novice: "Supervivencia (SAB): Rastrear criaturas, encontrar comida y agua, navegar en la naturaleza.",
    experienced: "Survival (WIS): Rastreo (CD varía por terreno), forrajeo (1d6+WIS mod lbs/día), navegación, predecir clima, identificar peligros naturales."
  },
}

// ============================================
// STATS STORY MODE
// ============================================

export const STORY_MODE_HELP: Record<string, HelpEntry> = {
  combat: {
    novice: "Combate: Tu habilidad para pelear. Afecta ataques, defensa, y tácticas de batalla.",
    experienced: "Combate: Determina éxito en conflictos físicos. El DM considera este valor junto con la narración para resolver enfrentamientos."
  },
  exploration: {
    novice: "Exploración: Tu capacidad para encontrar cosas, navegar, y sobrevivir en ambientes hostiles.",
    experienced: "Exploración: Afecta búsqueda de objetos, navegación, supervivencia, y descubrimiento de secretos en el entorno."
  },
  social: {
    novice: "Social: Tu habilidad para hablar con otros, convencer, y hacer aliados.",
    experienced: "Social: Determina éxito en interacciones con NPCs, negociaciones, y situaciones donde la diplomacia es clave."
  },
  knowledge: {
    novice: "Saber: Tu conocimiento del mundo, historia, y habilidad para recordar información útil.",
    experienced: "Saber: Afecta reconocimiento de criaturas, objetos, lugares, y la capacidad de recordar información relevante del lore."
  },
}

// ============================================
// HELPER FUNCTION
// ============================================

export function getHelpContent(
  category: 'ability' | 'combat' | 'saving_throw' | 'skill' | 'story_mode',
  term: string,
  level: HelpLevel = 'novice'
): string {
  let helpMap: Record<string, HelpEntry>

  switch (category) {
    case 'ability':
      helpMap = ABILITY_HELP
      break
    case 'combat':
      helpMap = COMBAT_HELP
      break
    case 'saving_throw':
      helpMap = SAVING_THROW_HELP
      break
    case 'skill':
      helpMap = SKILLS_HELP
      break
    case 'story_mode':
      helpMap = STORY_MODE_HELP
      break
    default:
      return 'Información no disponible.'
  }

  const entry = helpMap[term]
  if (!entry) {
    return 'Información no disponible para este término.'
  }

  return entry[level]
}

// ============================================
// ALL SKILLS LIST (for iteration)
// ============================================

export const ALL_SKILLS = [
  { id: 'acrobatics', name: 'Acrobacias', ability: 'DEX' },
  { id: 'animal_handling', name: 'Trato con Animales', ability: 'WIS' },
  { id: 'arcana', name: 'Arcanos', ability: 'INT' },
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
  { id: 'survival', name: 'Supervivencia', ability: 'WIS' },
] as const

export type SkillId = typeof ALL_SKILLS[number]['id']
export type AbilityId = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
