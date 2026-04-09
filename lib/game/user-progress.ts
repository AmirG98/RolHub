// Sistema de progreso meta del usuario (estilo Duolingo).
//
// Gestiona XP de jugador (diferente del XP del personaje), racha diaria,
// achievements desbloqueables y contadores cached (totalTurns, totalSessions,
// completedCampaigns).
//
// El helper se llama desde el endpoint de turn/sesión después de guardar
// el turno del DM. Es fire-and-forget — si falla, no bloquea la respuesta
// al jugador.

import { prisma, withRetry } from '@/lib/db/prisma'

// ─────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────

export type AchievementTier = 'bronze' | 'silver' | 'gold'

export interface AchievementDefinition {
  id: string
  tier: AchievementTier
  xpBonus: number
  /** Predicado: devuelve true cuando las stats actuales cumplen la condición */
  check: (stats: AchievementStats) => boolean
  /** Genera un hint del progreso actual para la UI de locked achievements */
  hint?: (stats: AchievementStats) => string
}

export interface AchievementStats {
  totalTurns: number
  streakDays: number
  longestStreak: number
  campaigns: number
  completedCampaigns: number
  characters: number
  distinctLores: number
  level: number
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string
}

export type ProgressEvent =
  | 'turn'
  | 'session_start'
  | 'campaign_created'
  | 'character_created'
  | 'campaign_complete'

export interface UpdateProgressParams {
  userId: string
  event: ProgressEvent
  /** Si el turno tuvo xp_reward del DM, acá se copia para modular el xp meta */
  characterXpReward?: number
}

export interface ProgressUpdate {
  xpGained: number
  newXp: number
  newLevel: number
  levelUp: boolean
  streakContinued: boolean
  streakReset: boolean
  newStreakDays: number
  newAchievements: Array<{ id: string; tier: AchievementTier; xpBonus: number }>
}

// ─────────────────────────────────────────────────────────────────────────
// Fórmulas
// ─────────────────────────────────────────────────────────────────────────

/** Nivel del jugador a partir de XP acumulada. Lineal: 100 XP por nivel. */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1
}

/** XP total requerida para alcanzar el próximo nivel */
export function xpForNextLevel(level: number): number {
  return level * 100
}

/** XP ganada en el nivel actual (0-99) */
export function xpWithinCurrentLevel(xp: number): number {
  return xp % 100
}

/** Porcentaje de progreso dentro del nivel actual (0-100) */
export function xpProgressPercent(xp: number): number {
  return xpWithinCurrentLevel(xp)
}

// ─────────────────────────────────────────────────────────────────────────
// XP por evento
// ─────────────────────────────────────────────────────────────────────────

function xpForEvent(event: ProgressEvent, characterXpReward?: number): number {
  switch (event) {
    case 'turn':
      // 5 base + hasta 10 extra si el DM dio xp_reward al personaje
      return 5 + Math.min(Math.max(characterXpReward || 0, 0), 10)
    case 'session_start':
      return 10
    case 'character_created':
      return 15
    case 'campaign_created':
      return 25
    case 'campaign_complete':
      return 100
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Cálculo de racha
// ─────────────────────────────────────────────────────────────────────────

/** Devuelve el string YYYY-MM-DD UTC de una fecha */
function dateKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Días de diferencia entre dos fechas (0 = mismo día UTC, 1 = ayer, etc.) */
function daysBetween(a: Date, b: Date): number {
  const aKey = dateKey(a)
  const bKey = dateKey(b)
  // Convertir a epoch días
  const aDate = new Date(aKey + 'T00:00:00Z')
  const bDate = new Date(bKey + 'T00:00:00Z')
  return Math.round((bDate.getTime() - aDate.getTime()) / (24 * 60 * 60 * 1000))
}

interface StreakResult {
  newStreakDays: number
  newLongestStreak: number
  streakContinued: boolean
  streakReset: boolean
}

function computeStreak(lastActiveAt: Date | null, currentStreak: number, longestStreak: number, now: Date): StreakResult {
  if (!lastActiveAt) {
    // Primera actividad ever
    return {
      newStreakDays: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      streakContinued: false,
      streakReset: false,
    }
  }

  const delta = daysBetween(lastActiveAt, now)

  if (delta === 0) {
    // Mismo día: no tocar racha
    return {
      newStreakDays: currentStreak,
      newLongestStreak: longestStreak,
      streakContinued: false,
      streakReset: false,
    }
  }

  if (delta === 1) {
    // Ayer: continúa la racha
    const newStreak = currentStreak + 1
    return {
      newStreakDays: newStreak,
      newLongestStreak: Math.max(longestStreak, newStreak),
      streakContinued: true,
      streakReset: false,
    }
  }

  // Más de un día: reset
  return {
    newStreakDays: 1,
    newLongestStreak: longestStreak, // no actualiza el mejor
    streakContinued: false,
    streakReset: true,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Achievements
// ─────────────────────────────────────────────────────────────────────────

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_turn',
    tier: 'bronze',
    xpBonus: 10,
    check: (s) => s.totalTurns >= 1,
  },
  {
    id: 'first_campaign',
    tier: 'bronze',
    xpBonus: 20,
    check: (s) => s.campaigns >= 1,
  },
  {
    id: 'turns_10',
    tier: 'bronze',
    xpBonus: 15,
    check: (s) => s.totalTurns >= 10,
    hint: (s) => `${Math.min(s.totalTurns, 10)}/10`,
  },
  {
    id: 'turns_50',
    tier: 'silver',
    xpBonus: 30,
    check: (s) => s.totalTurns >= 50,
    hint: (s) => `${Math.min(s.totalTurns, 50)}/50`,
  },
  {
    id: 'turns_200',
    tier: 'gold',
    xpBonus: 100,
    check: (s) => s.totalTurns >= 200,
    hint: (s) => `${Math.min(s.totalTurns, 200)}/200`,
  },
  {
    id: 'streak_3',
    tier: 'bronze',
    xpBonus: 20,
    check: (s) => s.streakDays >= 3,
    hint: (s) => `${Math.min(s.streakDays, 3)}/3`,
  },
  {
    id: 'streak_7',
    tier: 'silver',
    xpBonus: 50,
    check: (s) => s.streakDays >= 7,
    hint: (s) => `${Math.min(s.streakDays, 7)}/7`,
  },
  {
    id: 'streak_30',
    tier: 'gold',
    xpBonus: 300,
    check: (s) => s.streakDays >= 30,
    hint: (s) => `${Math.min(s.streakDays, 30)}/30`,
  },
  {
    id: 'campaigns_3',
    tier: 'silver',
    xpBonus: 40,
    check: (s) => s.campaigns >= 3,
    hint: (s) => `${Math.min(s.campaigns, 3)}/3`,
  },
  {
    id: 'campaigns_10',
    tier: 'gold',
    xpBonus: 200,
    check: (s) => s.campaigns >= 10,
    hint: (s) => `${Math.min(s.campaigns, 10)}/10`,
  },
  {
    id: 'explorer_3_lores',
    tier: 'silver',
    xpBonus: 50,
    check: (s) => s.distinctLores >= 3,
    hint: (s) => `${Math.min(s.distinctLores, 3)}/3`,
  },
  {
    id: 'completed_campaign',
    tier: 'gold',
    xpBonus: 150,
    check: (s) => s.completedCampaigns >= 1,
  },
  {
    id: 'level_5',
    tier: 'silver',
    xpBonus: 50,
    check: (s) => s.level >= 5,
    hint: (s) => `Lvl ${s.level}/5`,
  },
  {
    id: 'level_10',
    tier: 'gold',
    xpBonus: 150,
    check: (s) => s.level >= 10,
    hint: (s) => `Lvl ${s.level}/10`,
  },
]

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

// ─────────────────────────────────────────────────────────────────────────
// Main helper
// ─────────────────────────────────────────────────────────────────────────

/**
 * Actualiza el progreso meta del usuario después de un evento de juego.
 * Devuelve un resumen de los cambios para que el cliente muestre notificaciones.
 *
 * Nunca debe tirar excepciones que bloqueen al caller — envolvelo en try/catch.
 */
export async function updateUserProgress({ userId, event, characterXpReward }: UpdateProgressParams): Promise<ProgressUpdate> {
  const now = new Date()

  // Leer estado actual del usuario
  const user = await withRetry(() => prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      xp: true,
      level: true,
      streakDays: true,
      longestStreak: true,
      lastActiveAt: true,
      achievements: true,
      totalTurns: true,
      totalSessions: true,
      completedCampaigns: true,
    },
  }))

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // 1. Calcular racha
  const streak = computeStreak(user.lastActiveAt, user.streakDays, user.longestStreak, now)

  // 2. XP del evento
  const baseXpGained = xpForEvent(event, characterXpReward)

  // 3. Actualizar contadores cached según el evento
  let newTotalTurns = user.totalTurns
  let newTotalSessions = user.totalSessions
  let newCompletedCampaigns = user.completedCampaigns
  if (event === 'turn') newTotalTurns++
  if (event === 'session_start') newTotalSessions++
  if (event === 'campaign_complete') newCompletedCampaigns++

  // 4. Contar campañas y characters via queries extra (necesarios para achievements)
  const [campaignsCount, charactersCount] = await Promise.all([
    prisma.campaign.count({ where: { userId } }),
    prisma.character.count({ where: { userId } }),
  ])

  // distinctLores: solo si podría desbloquear explorer_3_lores
  const existing: UnlockedAchievement[] = Array.isArray(user.achievements) ? (user.achievements as any[]) : []
  const unlockedIds = new Set(existing.map((a) => a.id))
  let distinctLores = 0
  if (!unlockedIds.has('explorer_3_lores')) {
    const distinctLoresResult = await prisma.$queryRawUnsafe<{ lore: string }[]>(
      `SELECT DISTINCT lore FROM "Character" WHERE "userId" = $1`,
      userId
    )
    distinctLores = distinctLoresResult.length
  }

  // 5. Calcular nuevo XP (sin bonos de achievements todavía)
  let newXp = user.xp + baseXpGained

  // 6. Evaluar achievements con las stats NUEVAS (después de incrementar counters)
  const newLevel = levelFromXp(newXp)
  const statsForCheck: AchievementStats = {
    totalTurns: newTotalTurns,
    streakDays: streak.newStreakDays,
    longestStreak: streak.newLongestStreak,
    campaigns: campaignsCount,
    completedCampaigns: newCompletedCampaigns,
    characters: charactersCount,
    distinctLores,
    level: newLevel,
  }

  const newAchievements: Array<{ id: string; tier: AchievementTier; xpBonus: number }> = []
  for (const def of ACHIEVEMENTS) {
    if (unlockedIds.has(def.id)) continue
    if (!def.check(statsForCheck)) continue
    newAchievements.push({ id: def.id, tier: def.tier, xpBonus: def.xpBonus })
    existing.push({ id: def.id, unlockedAt: now.toISOString() })
  }

  // 7. Sumar bonos de achievements al XP (y recalcular level si corresponde)
  const bonusXp = newAchievements.reduce((sum, a) => sum + a.xpBonus, 0)
  newXp += bonusXp
  const finalLevel = levelFromXp(newXp)
  const levelUp = finalLevel > user.level

  // 8. Persistir en DB
  await withRetry(() => prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: finalLevel,
      streakDays: streak.newStreakDays,
      longestStreak: streak.newLongestStreak,
      lastActiveAt: now,
      achievements: existing as any,
      totalTurns: newTotalTurns,
      totalSessions: newTotalSessions,
      completedCampaigns: newCompletedCampaigns,
    },
  }))

  return {
    xpGained: baseXpGained + bonusXp,
    newXp,
    newLevel: finalLevel,
    levelUp,
    streakContinued: streak.streakContinued,
    streakReset: streak.streakReset,
    newStreakDays: streak.newStreakDays,
    newAchievements,
  }
}

/**
 * Utilidad standalone para computar el hint de progreso de un achievement
 * locked a partir de un snapshot de stats del usuario (para el dashboard).
 */
export function getAchievementHint(def: AchievementDefinition, stats: AchievementStats): string | null {
  return def.hint ? def.hint(stats) : null
}
