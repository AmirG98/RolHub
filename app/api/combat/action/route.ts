import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildCombatSystemPrompt,
  buildCombatActionPrompt,
  parseCombatResponse,
  type CombatActionContext,
  type CombatActionResult,
} from '@/lib/claude/prompts/combat-action'
import { CombatState, CombatActionType, CombatLogEntry } from '@/lib/types/combat-state'
import { TacticalToken } from '@/lib/tactical/types'

// Inicializar Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface CombatActionRequestBody {
  sessionId: string
  combatState: CombatState
  isEnemyTurn: boolean
  enemyTokenId?: string
  playerAction?: {
    type: CombatActionType
    targetTokenId?: string
    description?: string
  }
  locale?: 'es' | 'en'
}

export interface CombatActionAPIResponse {
  success: boolean
  narration: string
  result: CombatActionResult
  combatLog: CombatLogEntry
  tokenUpdates: Array<Partial<TacticalToken> & { id: string }>
  combatEnded: boolean
  combatResult?: 'victory' | 'defeat' | null
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<CombatActionAPIResponse>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        narration: '',
        result: { narration: '', tokenUpdates: [], combatEnded: false },
        combatLog: createEmptyLog(),
        tokenUpdates: [],
        combatEnded: false,
        error: 'No autorizado',
      }, { status: 401 })
    }

    const body = await req.json() as CombatActionRequestBody
    const {
      sessionId,
      combatState,
      isEnemyTurn,
      enemyTokenId,
      playerAction,
      locale = 'es',
    } = body

    if (!sessionId || !combatState) {
      return NextResponse.json({
        success: false,
        narration: '',
        result: { narration: '', tokenUpdates: [], combatEnded: false },
        combatLog: createEmptyLog(),
        tokenUpdates: [],
        combatEnded: false,
        error: 'Faltan campos requeridos',
      }, { status: 400 })
    }

    // Encontrar el token actual
    const tokens = combatState.tacticalMap?.tokens || []
    let currentToken: TacticalToken | undefined

    if (isEnemyTurn && enemyTokenId) {
      currentToken = tokens.find(t => t.id === enemyTokenId)
    } else if (!isEnemyTurn && combatState.currentTurnTokenId) {
      currentToken = tokens.find(t => t.id === combatState.currentTurnTokenId)
    }

    if (!currentToken) {
      return NextResponse.json({
        success: false,
        narration: '',
        result: { narration: '', tokenUpdates: [], combatEnded: false },
        combatLog: createEmptyLog(),
        tokenUpdates: [],
        combatEnded: false,
        error: 'Token no encontrado',
      }, { status: 400 })
    }

    // Construir contexto para el prompt
    const context: CombatActionContext = {
      combatState,
      currentToken,
      isEnemyTurn,
      playerAction,
      locale,
    }

    // Llamar a Claude para resolver la acción
    const systemPrompt = buildCombatSystemPrompt(locale)
    const userPrompt = buildCombatActionPrompt(context)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    })

    // Extraer texto de la respuesta
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')

    // Parsear la respuesta
    const result = parseCombatResponse(responseText)

    // Construir las actualizaciones de tokens
    const tokenUpdates: Array<Partial<TacticalToken> & { id: string }> = []

    for (const update of result.tokenUpdates) {
      const existingToken = tokens.find(t => t.id === update.id)
      if (existingToken) {
        tokenUpdates.push({
          id: update.id,
          hp: update.hp ?? existingToken.hp,
          conditions: update.conditions?.map(name => ({
            name,
            icon: getConditionIcon(name),
            duration: -1,
          })) || existingToken.conditions,
        })
      }
    }

    // Si hay movimiento del token actual (para enemigos)
    if (result.movement && isEnemyTurn) {
      const existingUpdate = tokenUpdates.find(u => u.id === currentToken.id)
      if (existingUpdate) {
        existingUpdate.x = result.movement.x
        existingUpdate.y = result.movement.y
      } else {
        tokenUpdates.push({
          id: currentToken.id,
          x: result.movement.x,
          y: result.movement.y,
        })
      }
    }

    // Verificar si el combate terminó
    let combatEnded = result.combatEnded
    let combatResult = result.combatResult

    // Verificar manualmente si todos los enemigos o jugadores están a 0 HP
    const updatedTokens = tokens.map(t => {
      const update = tokenUpdates.find(u => u.id === t.id)
      return update ? { ...t, ...update } : t
    })

    const playersAlive = updatedTokens.filter(t =>
      (t.type === 'player' || t.type === 'ally') && t.hp > 0
    ).length

    const enemiesAlive = updatedTokens.filter(t =>
      t.type === 'enemy' && t.hp > 0
    ).length

    if (playersAlive === 0) {
      combatEnded = true
      combatResult = 'defeat'
    } else if (enemiesAlive === 0) {
      combatEnded = true
      combatResult = 'victory'
    }

    // Crear entrada de log
    const combatLog: CombatLogEntry = {
      id: generateId(),
      timestamp: new Date(),
      round: combatState.roundNumber,
      tokenId: currentToken.id,
      tokenName: currentToken.name,
      actionType: isEnemyTurn ? 'attack' : (playerAction?.type || 'other'),
      targetId: result.targetId,
      targetName: result.targetId ? tokens.find(t => t.id === result.targetId)?.name : undefined,
      description: result.narration,
      diceRoll: result.attackRoll ? {
        formula: 'd20',
        result: result.attackRoll,
        isCritical: result.attackRoll === 20,
        isFumble: result.attackRoll === 1,
      } : undefined,
      damage: result.damage ? {
        amount: result.damage,
        type: result.damageType || 'physical',
      } : undefined,
      success: result.hit ?? true,
      narration: result.narration,
    }

    return NextResponse.json({
      success: true,
      narration: result.narration,
      result,
      combatLog,
      tokenUpdates,
      combatEnded,
      combatResult,
    })

  } catch (error) {
    console.error('Error en combat action:', error)
    return NextResponse.json({
      success: false,
      narration: 'Error al procesar la acción de combate.',
      result: { narration: 'Error al procesar la acción.', tokenUpdates: [], combatEnded: false },
      combatLog: createEmptyLog(),
      tokenUpdates: [],
      combatEnded: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 })
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

function createEmptyLog(): CombatLogEntry {
  return {
    id: generateId(),
    timestamp: new Date(),
    round: 0,
    tokenId: '',
    tokenName: '',
    actionType: 'other',
    description: '',
    success: false,
  }
}

function getConditionIcon(condition: string): string {
  const icons: Record<string, string> = {
    blinded: '👁️',
    charmed: '💕',
    deafened: '🔇',
    frightened: '😨',
    grappled: '🤝',
    incapacitated: '💫',
    invisible: '👻',
    paralyzed: '⚡',
    petrified: '🗿',
    poisoned: '🤢',
    prone: '⬇️',
    restrained: '⛓️',
    stunned: '💥',
    unconscious: '😴',
  }
  return icons[condition.toLowerCase()] || '⚠️'
}
