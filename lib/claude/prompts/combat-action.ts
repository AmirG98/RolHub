/**
 * Combat Action Prompt
 * Prompt para que Claude resuelva acciones de combate táctico
 */

import { TacticalToken } from '@/lib/tactical/types'
import { CombatState, CombatActionType } from '@/lib/types/combat-state'

export interface CombatActionContext {
  combatState: CombatState
  currentToken: TacticalToken
  isEnemyTurn: boolean
  playerAction?: {
    type: CombatActionType
    targetTokenId?: string
    description?: string
    weaponInfo?: {
      name: string
      damage: string
      damageType: string
      range: string
      type: 'weapon' | 'spell' | 'ability' | 'unarmed'
    }
  }
  lore?: string
  locale?: string
}

/**
 * Genera el prompt del sistema para resolver acciones de combate
 */
export function buildCombatSystemPrompt(locale: string = 'es'): string {
  if (locale === 'en') {
    return `You are the tactical combat system of a narrative RPG.
Your role is to resolve combat actions dramatically and fairly.

RULES:
1. Attack rolls use d20 + modifiers vs AC
2. Damage depends on weapon/spell (typically 1d6 to 2d10)
3. On hit, describe the impact vividly
4. On miss, describe how the attack fails
5. For enemy turns, choose the most tactically sound action
6. Always maintain dramatic tension
7. Track HP changes accurately
8. Detect when combat ends (all enemies or all players at 0 HP)

RESPONSE FORMAT (JSON only, no markdown):
{
  "narration": "Dramatic description of what happens",
  "attackRoll": 15,
  "targetAC": 14,
  "hit": true,
  "damage": 8,
  "damageType": "slashing",
  "targetId": "token-id",
  "tokenUpdates": [
    { "id": "token-id", "hp": 12 }
  ],
  "movement": { "x": 5, "y": 3 },
  "conditionsApplied": ["prone"],
  "conditionsRemoved": [],
  "combatEnded": false,
  "combatResult": null
}`
  }

  // Spanish (default)
  return `Eres el sistema de combate táctico de un RPG narrativo.
Tu rol es resolver acciones de combate de forma dramática y justa.

REGLAS:
1. Los ataques usan d20 + modificadores vs CA (Clase de Armadura)
2. El daño depende del arma/hechizo (típicamente 1d6 a 2d10)
3. Si impacta, describe el golpe de forma vívida
4. Si falla, describe cómo el ataque es evadido o bloqueado
5. En turnos de enemigos, elige la acción tácticamente más inteligente
6. Mantén siempre la tensión dramática
7. Rastrea los cambios de HP con precisión
8. Detecta cuando el combate termina (todos los enemigos o jugadores a 0 HP)

FORMATO DE RESPUESTA (JSON solamente, sin markdown):
{
  "narration": "Descripción dramática de lo que sucede",
  "attackRoll": 15,
  "targetAC": 14,
  "hit": true,
  "damage": 8,
  "damageType": "slashing",
  "targetId": "token-id",
  "tokenUpdates": [
    { "id": "token-id", "hp": 12 }
  ],
  "movement": { "x": 5, "y": 3 },
  "conditionsApplied": ["prone"],
  "conditionsRemoved": [],
  "combatEnded": false,
  "combatResult": null
}`
}

/**
 * Genera el prompt del usuario para una acción específica
 */
export function buildCombatActionPrompt(context: CombatActionContext): string {
  const { combatState, currentToken, isEnemyTurn, playerAction, locale = 'es' } = context

  const tokens = combatState.tacticalMap?.tokens || []
  const players = tokens.filter(t => t.type === 'player' || t.type === 'ally')
  const enemies = tokens.filter(t => t.type === 'enemy')

  // Formatear estado de tokens
  const formatToken = (t: TacticalToken) => {
    const conditions = t.conditions.map(c => c.name).join(', ') || 'ninguna'
    return `- ${t.name} (${t.type}): HP ${t.hp}/${t.maxHp}, AC ${t.ac}, pos(${t.x},${t.y}), condiciones: ${conditions}`
  }

  const playersStatus = players.map(formatToken).join('\n')
  const enemiesStatus = enemies.map(formatToken).join('\n')

  if (locale === 'en') {
    let prompt = `CURRENT COMBAT STATE:
Round: ${combatState.roundNumber}
Current Turn: ${currentToken.name} (${currentToken.type})

PLAYERS:
${playersStatus}

ENEMIES:
${enemiesStatus}

`

    if (isEnemyTurn) {
      // Find nearest player for enemy targeting
      const nearestPlayer = players.reduce((nearest, p) => {
        const dist = Math.abs(p.x - currentToken.x) + Math.abs(p.y - currentToken.y)
        const nearestDist = nearest ? Math.abs(nearest.x - currentToken.x) + Math.abs(nearest.y - currentToken.y) : Infinity
        return dist < nearestDist ? p : nearest
      }, players[0])

      prompt += `ACTION TO RESOLVE:
It's ${currentToken.name}'s turn (enemy).
Decide the enemy's action. Consider:
- Attack the nearest player (${nearestPlayer?.name} at distance ${Math.abs(nearestPlayer.x - currentToken.x) + Math.abs(nearestPlayer.y - currentToken.y)})
- Move to a better tactical position
- Use special abilities if available
- Enemies want to defeat the players

Choose the most intelligent action and resolve it.`
    } else {
      const target = playerAction?.targetTokenId
        ? tokens.find(t => t.id === playerAction.targetTokenId)
        : null

      prompt += `ACTION TO RESOLVE:
Player ${currentToken.name} wants to: ${playerAction?.type || 'unknown action'}
${playerAction?.description ? `Description: ${playerAction.description}` : ''}
${target ? `Target: ${target.name} (HP: ${target.hp}/${target.maxHp}, AC: ${target.ac})` : ''}

Resolve this action with an attack roll if applicable, calculate damage, and describe the result dramatically.`
    }

    return prompt
  }

  // Spanish (default)
  let prompt = `ESTADO ACTUAL DEL COMBATE:
Ronda: ${combatState.roundNumber}
Turno actual: ${currentToken.name} (${currentToken.type})

JUGADORES:
${playersStatus}

ENEMIGOS:
${enemiesStatus}

`

  if (isEnemyTurn) {
    // Generar opciones tácticas para el enemigo
    const tacticalAnalysis = generateEnemyTacticalAnalysis(currentToken, players, enemies)

    prompt += `ACCION A RESOLVER:
Es el turno de ${currentToken.name} (enemigo).

${tacticalAnalysis}

REGLAS DE COMPORTAMIENTO:
- Si el enemigo tiene menos del 30% de HP, considerar huir o defenderse
- Si hay aliados caídos, puede entrar en furia o intentar negociar
- Los enemigos inteligentes flanquean y atacan al más débil
- Los enemigos brutos simplemente cargan
- Variar acciones entre turnos para evitar patrones predecibles
- Los hechiceros mantienen distancia, los guerreros se acercan

Elige UNA acción tácticamente apropiada y resuélvela de forma dramática.`
  } else {
    const target = playerAction?.targetTokenId
      ? tokens.find(t => t.id === playerAction.targetTokenId)
      : null

    const weaponInfo = playerAction?.weaponInfo
    prompt += `ACCION A RESOLVER:
El jugador ${currentToken.name} quiere: ${playerAction?.type || 'acción desconocida'}
${playerAction?.description ? `Descripción: ${playerAction.description}` : ''}
${target ? `Objetivo: ${target.name} (HP: ${target.hp}/${target.maxHp}, CA: ${target.ac})` : ''}
${weaponInfo ? `
ARMA/HECHIZO: ${weaponInfo.name}
- Daño: ${weaponInfo.damage} ${weaponInfo.damageType}
- Alcance: ${weaponInfo.range}
- Tipo: ${weaponInfo.type === 'spell' ? 'Hechizo' : weaponInfo.type === 'weapon' ? 'Arma' : 'Habilidad'}
` : ''}
Resuelve esta acción con una tirada de ataque si aplica, usa el daño del arma especificada, y describe el resultado de forma dramática.`
  }

  return prompt
}

/**
 * Parsea la respuesta de Claude a un formato estructurado
 */
export interface CombatActionResult {
  narration: string
  attackRoll?: number
  targetAC?: number
  hit?: boolean
  damage?: number
  damageType?: string
  targetId?: string
  tokenUpdates: Array<{
    id: string
    hp?: number
    conditions?: string[]
  }>
  movement?: { x: number; y: number }
  conditionsApplied?: string[]
  conditionsRemoved?: string[]
  combatEnded: boolean
  combatResult?: 'victory' | 'defeat' | null
}

export function parseCombatResponse(responseText: string): CombatActionResult {
  try {
    // Limpiar posibles caracteres extra
    let cleaned = responseText.trim()

    // Remover markdown si existe
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7)
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3)
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
    }
    cleaned = cleaned.trim()

    const result = JSON.parse(cleaned)

    return {
      narration: result.narration || 'La acción se resuelve.',
      attackRoll: result.attackRoll,
      targetAC: result.targetAC,
      hit: result.hit,
      damage: result.damage,
      damageType: result.damageType,
      targetId: result.targetId,
      tokenUpdates: result.tokenUpdates || [],
      movement: result.movement,
      conditionsApplied: result.conditionsApplied || [],
      conditionsRemoved: result.conditionsRemoved || [],
      combatEnded: result.combatEnded || false,
      combatResult: result.combatResult || null,
    }
  } catch (error) {
    console.error('Error parsing combat response:', error, responseText)
    // Fallback: usar la respuesta como narración
    return {
      narration: responseText || 'La acción se resuelve con resultados inciertos.',
      tokenUpdates: [],
      combatEnded: false,
    }
  }
}

/**
 * Genera análisis táctico para que el enemigo tome decisiones inteligentes
 */
function generateEnemyTacticalAnalysis(
  enemy: TacticalToken,
  players: TacticalToken[],
  allies: TacticalToken[]
): string {
  const lines: string[] = []

  // Calcular distancias a cada jugador
  const playersWithDistance = players
    .filter(p => p.hp > 0)
    .map(p => ({
      ...p,
      distance: Math.abs(p.x - enemy.x) + Math.abs(p.y - enemy.y),
    }))
    .sort((a, b) => a.distance - b.distance)

  const nearestPlayer = playersWithDistance[0]
  const weakestPlayer = playersWithDistance.sort((a, b) => a.hp - b.hp)[0]

  // Estado del enemigo
  const enemyHealthPercent = (enemy.hp / enemy.maxHp) * 100
  const isLowHealth = enemyHealthPercent < 30
  const isMediumHealth = enemyHealthPercent < 60

  // Estado de aliados enemigos
  const aliveAllies = allies.filter(a => a.hp > 0 && a.id !== enemy.id)
  const deadAllies = allies.filter(a => a.hp <= 0)

  lines.push(`ANÁLISIS TÁCTICO PARA ${enemy.name}:`)
  lines.push(``)

  // Estado del enemigo
  lines.push(`Estado actual:`)
  lines.push(`- HP: ${enemy.hp}/${enemy.maxHp} (${Math.round(enemyHealthPercent)}%)`)
  if (isLowHealth) {
    lines.push(`- ADVERTENCIA: Salud crítica - considera retirarse o rendirse`)
  } else if (isMediumHealth) {
    lines.push(`- Precaución: Salud media - ser más cauteloso`)
  }
  if (enemy.conditions.length > 0) {
    lines.push(`- Condiciones: ${enemy.conditions.map(c => c.name).join(', ')}`)
  }
  lines.push(``)

  // Información de objetivos
  lines.push(`Objetivos disponibles:`)
  for (const player of playersWithDistance) {
    const healthStatus = player.hp < player.maxHp * 0.3 ? '(HERIDO)' :
                         player.hp < player.maxHp * 0.6 ? '(dañado)' : ''
    const isInMelee = player.distance <= 1
    lines.push(`- ${player.name}: ${player.hp}/${player.maxHp} HP, distancia ${player.distance * 5}ft ${healthStatus}${isInMelee ? ' (cuerpo a cuerpo)' : ''}`)
  }
  lines.push(``)

  // Opciones tácticas
  lines.push(`OPCIONES TÁCTICAS:`)
  let optionNum = 1

  // Opción 1: Atacar al más cercano
  if (nearestPlayer) {
    const inRange = nearestPlayer.distance <= 1
    lines.push(`${optionNum}. ATACAR a ${nearestPlayer.name} (más cercano, ${nearestPlayer.distance * 5}ft)`)
    if (inRange) {
      lines.push(`   - Ya en rango de cuerpo a cuerpo`)
    } else {
      lines.push(`   - Moverse ${nearestPlayer.distance * 5}ft para alcanzar`)
    }
    optionNum++
  }

  // Opción 2: Atacar al más débil (si es diferente)
  if (weakestPlayer && weakestPlayer.id !== nearestPlayer?.id) {
    lines.push(`${optionNum}. ATACAR a ${weakestPlayer.name} (más débil, solo ${weakestPlayer.hp} HP)`)
    lines.push(`   - Distancia: ${weakestPlayer.distance * 5}ft`)
    optionNum++
  }

  // Opción 3: Flanquear si hay aliados
  if (aliveAllies.length > 0 && nearestPlayer) {
    lines.push(`${optionNum}. FLANQUEAR a ${nearestPlayer.name} con aliados`)
    lines.push(`   - ${aliveAllies.length} aliados disponibles para maniobra`)
    optionNum++
  }

  // Opción 4: Retroceder si está herido
  if (isLowHealth || isMediumHealth) {
    lines.push(`${optionNum}. RETROCEDER y adoptar posición defensiva`)
    lines.push(`   - Usar acción de Esquivar para sobrevivir`)
    optionNum++
  }

  // Opción 5: Habilidad especial (si las tiene)
  lines.push(`${optionNum}. HABILIDAD ESPECIAL (si el enemigo tiene alguna)`)
  lines.push(`   - Usar aliento de fuego, magia, veneno, etc.`)
  optionNum++

  // Contexto adicional
  if (deadAllies.length > 0) {
    lines.push(``)
    lines.push(`NOTA: ${deadAllies.length} aliados han caído. El enemigo puede estar furioso o desesperado.`)
  }

  return lines.join('\n')
}
