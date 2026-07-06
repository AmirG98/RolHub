'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sword, Scroll, CheckCircle, X, Package, Star, Zap, Trophy, Flame, Sparkles } from 'lucide-react'

export type NotificationType =
  | 'new_item'
  | 'remove_item'
  | 'new_quest'
  | 'quest_completed'
  | 'xp_gain'
  | 'level_up'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'long_rest'
  | 'skill_unlockable'

export interface GameNotificationData {
  id: string
  type: NotificationType
  text: string
  subtitle: string
}

interface Props {
  notifications: GameNotificationData[]
  onDismiss: (id: string) => void
  locale?: 'es' | 'en'
}

const ICON_MAP: Record<NotificationType, typeof Sword> = {
  new_item: Package,
  remove_item: Sword,
  new_quest: Scroll,
  quest_completed: CheckCircle,
  xp_gain: Zap,
  level_up: Star,
  achievement_unlocked: Trophy,
  streak_milestone: Flame,
  long_rest: Sparkles,
  skill_unlockable: Star,
}

const COLOR_MAP: Record<NotificationType, string> = {
  new_item: 'text-gold-bright',
  remove_item: 'text-parchment/60',
  new_quest: 'text-gold',
  quest_completed: 'text-emerald',
  xp_gain: 'text-gold',
  level_up: 'text-gold-bright',
  achievement_unlocked: 'text-gold-bright',
  streak_milestone: 'text-blood',
  long_rest: 'text-emerald',
  skill_unlockable: 'text-gold-bright',
}

const BORDER_MAP: Record<NotificationType, string> = {
  new_item: 'border-gold-bright/50',
  remove_item: 'border-gold-dim/30',
  new_quest: 'border-gold/50',
  quest_completed: 'border-emerald/50',
  xp_gain: 'border-gold/30',
  level_up: 'border-gold-bright/60',
  achievement_unlocked: 'border-gold-bright/60',
  streak_milestone: 'border-blood/60',
  long_rest: 'border-emerald/50',
  skill_unlockable: 'border-gold-bright/60',
}

export function GameNotifications({ notifications, onDismiss, locale = 'es' }: Props) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <NotificationToast
          key={notif.id}
          notification={notif}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

function NotificationToast({
  notification,
  onDismiss,
}: {
  notification: GameNotificationData
  onDismiss: (id: string) => void
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const dismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onDismiss(notification.id), 300)
  }, [notification.id, onDismiss])

  useEffect(() => {
    // Entrada
    requestAnimationFrame(() => setIsVisible(true))

    // Auto-dismiss
    const timer = setTimeout(dismiss, 5000)
    return () => clearTimeout(timer)
  }, [dismiss])

  const Icon = ICON_MAP[notification.type]
  const iconColor = COLOR_MAP[notification.type]
  const borderColor = BORDER_MAP[notification.type]

  return (
    <div
      className={`
        pointer-events-auto
        glass-panel-dark rounded-lg border ${borderColor}
        p-3 pr-8
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <button
        onClick={dismiss}
        className="absolute top-1 right-1 p-1.5 text-parchment/40 hover:text-parchment/70 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColor}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-sm text-parchment leading-tight">
            {notification.text}
          </p>
          <p className="font-ui text-xs text-parchment/50 mt-1 leading-snug">
            {notification.subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper para crear notificaciones desde la respuesta del DM
let notifCounter = 0

export function createItemNotification(itemName: string, locale: 'es' | 'en' = 'es'): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'new_item',
    text: locale === 'en' ? `Received: ${itemName}` : `Has recibido: ${itemName}`,
    subtitle: locale === 'en'
      ? 'You can see all your items in the Inventory section'
      : 'Puedes ver todos tus items en la sección de Inventario',
  }
}

export function createRemoveItemNotification(itemName: string, locale: 'es' | 'en' = 'es'): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'remove_item',
    text: locale === 'en' ? `Lost: ${itemName}` : `Has perdido: ${itemName}`,
    subtitle: locale === 'en'
      ? 'This item has been removed from your inventory'
      : 'Este item fue removido de tu inventario',
  }
}

export function createQuestNotification(questName: string, locale: 'es' | 'en' = 'es'): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'new_quest',
    text: locale === 'en' ? `New quest: ${questName}` : `Nueva misión: ${questName}`,
    subtitle: locale === 'en'
      ? 'It will appear in the Quests section as active until you complete it'
      : 'Aparecerá en la sección "Misiones" como activa hasta que la completes',
  }
}

export function createQuestCompletedNotification(questName: string, locale: 'es' | 'en' = 'es'): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'quest_completed',
    text: locale === 'en' ? `Quest completed: ${questName}` : `Misión completada: ${questName}`,
    subtitle: locale === 'en'
      ? 'Check your completed quests in the Quests section'
      : 'Puedes ver tus misiones completadas en la sección "Misiones"',
  }
}

export function createXPNotification(xp: number, locale: 'es' | 'en' = 'es'): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'xp_gain',
    text: locale === 'en' ? `+${xp} XP` : `+${xp} XP`,
    subtitle: locale === 'en'
      ? 'Experience points gained for your actions'
      : 'Puntos de experiencia ganados por tus acciones',
  }
}

export function createLevelUpNotification(newLevel: number, statChanges: Record<string, number>, locale: 'es' | 'en' = 'es'): GameNotificationData {
  const changesText = Object.entries(statChanges)
    .map(([stat, val]) => `+${val} ${stat}`)
    .join(', ')
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'level_up',
    text: locale === 'en' ? `Level Up! Now level ${newLevel}` : `¡Subiste de nivel! Ahora nivel ${newLevel}`,
    subtitle: changesText || (locale === 'en' ? 'Your character has grown stronger' : 'Tu personaje se ha vuelto más fuerte'),
  }
}

/**
 * Notificación cuando el usuario desbloquea un achievement meta (player progress).
 * `name` y `desc` ya vienen localizados.
 */
export function createAchievementNotification(
  name: string,
  desc: string,
  xpBonus: number,
  locale: 'es' | 'en' = 'es'
): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'achievement_unlocked',
    text: locale === 'en' ? `🏆 Achievement unlocked: ${name}` : `🏆 ¡Logro desbloqueado: ${name}!`,
    subtitle: `${desc} · +${xpBonus} XP`,
  }
}

/**
 * Notificación cuando un nodo del árbol de habilidades se vuelve desbloqueable.
 */
export function createSkillUnlockNotification(
  skillName: string,
  locale: 'es' | 'en' = 'es'
): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'skill_unlockable',
    text: locale === 'en' ? `🌟 New skill available: ${skillName}` : `🌟 Nueva habilidad disponible: ${skillName}`,
    subtitle: locale === 'en'
      ? 'Open your skill tree to learn it'
      : 'Abrí tu árbol de habilidades para aprenderla',
  }
}

/**
 * Notificación cuando la racha del usuario cruza un milestone (3, 7, 14, 30, 60, 100 días).
 */
export function createStreakNotification(days: number, locale: 'es' | 'en' = 'es'): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'streak_milestone',
    text: locale === 'en' ? `🔥 ${days}-day streak!` : `🔥 ¡Racha de ${days} días!`,
    subtitle: locale === 'en'
      ? 'Keep playing every day to keep your streak alive'
      : 'Seguí jugando todos los días para mantener tu racha',
  }
}

/**
 * Notificación cuando el personaje completa un descanso largo (DnD 5e) —
 * todas las habilidades con usos diarios se restauran.
 */
export function createLongRestNotification(locale: 'es' | 'en' = 'es'): GameNotificationData {
  return {
    id: `notif_${Date.now()}_${notifCounter++}`,
    type: 'long_rest',
    text: locale === 'en' ? 'Long rest completed' : 'Descanso largo completado',
    subtitle: locale === 'en'
      ? 'All daily abilities have been restored'
      : 'Todas las habilidades diarias se restauraron',
  }
}
