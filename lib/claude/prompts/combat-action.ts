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
    // Encontrar jugador más cercano
    const nearestPlayer = players.reduce((nearest, p) => {
      const dist = Math.abs(p.x - currentToken.x) + Math.abs(p.y - currentToken.y)
      const nearestDist = nearest ? Math.abs(nearest.x - currentToken.x) + Math.abs(nearest.y - currentToken.y) : Infinity
      return dist < nearestDist ? p : nearest
    }, players[0])

    prompt += `ACCION A RESOLVER:
Es el turno de ${currentToken.name} (enemigo).
Decide la acción del enemigo. Considera:
- Atacar al jugador más cercano (${nearestPlayer?.name} a distancia ${Math.abs(nearestPlayer.x - currentToken.x) + Math.abs(nearestPlayer.y - currentToken.y)})
- Moverse a una mejor posición táctica
- Usar habilidades especiales si tiene
- Los enemigos quieren derrotar a los jugadores

Elige la acción más inteligente y resuélvela.`
  } else {
    const target = playerAction?.targetTokenId
      ? tokens.find(t => t.id === playerAction.targetTokenId)
      : null

    prompt += `ACCION A RESOLVER:
El jugador ${currentToken.name} quiere: ${playerAction?.type || 'acción desconocida'}
${playerAction?.description ? `Descripción: ${playerAction.description}` : ''}
${target ? `Objetivo: ${target.name} (HP: ${target.hp}/${target.maxHp}, CA: ${target.ac})` : ''}

Resuelve esta acción con una tirada de ataque si aplica, calcula el daño, y describe el resultado de forma dramática.`
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
