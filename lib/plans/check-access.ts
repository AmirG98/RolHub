// Helper central para verificar acceso por plan
// Se usa en API routes antes de operaciones costosas

import { type PlanStatus } from './plan-config'

interface UserForPlanCheck {
  plan: string
  trialSessionUsed: boolean
  planExpiresAt: Date | null
  stripeSubscriptionId: string | null
}

// Determina el estado actual del plan del usuario
export function getPlanStatus(user: UserForPlanCheck): PlanStatus {
  if (user.plan === 'PRO' || user.plan === 'GUILD') {
    // Verificar si la suscripción expiró
    if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
      return 'pro_expired'
    }
    return 'pro'
  }

  // Plan FREE
  if (user.trialSessionUsed) {
    return 'trial_used'
  }
  return 'trial'
}

// Verifica si el usuario puede iniciar/continuar una sesión
export function canStartSession(user: UserForPlanCheck): {
  allowed: boolean
  reason?: string
  reasonEs?: string
  upgradeRequired: boolean
} {
  const status = getPlanStatus(user)

  switch (status) {
    case 'pro':
      return { allowed: true, upgradeRequired: false }

    case 'trial':
      return { allowed: true, upgradeRequired: false }

    case 'trial_used':
      return {
        allowed: false,
        reason: 'Your trial session has ended. Subscribe to continue your adventure.',
        reasonEs: 'Tu sesión de prueba ha terminado. Suscribite para continuar tu aventura.',
        upgradeRequired: true,
      }

    case 'pro_expired':
      return {
        allowed: false,
        reason: 'Your subscription has expired. Renew to continue playing.',
        reasonEs: 'Tu suscripción ha expirado. Renová para seguir jugando.',
        upgradeRequired: true,
      }

    default:
      return { allowed: false, upgradeRequired: true }
  }
}

// Verifica si puede crear una nueva campaña/sesión (no continuar una existente)
export function canCreateNewSession(user: UserForPlanCheck): {
  allowed: boolean
  reason?: string
  reasonEs?: string
  upgradeRequired: boolean
} {
  // Misma lógica que canStartSession por ahora
  return canStartSession(user)
}

// Mensajes temáticos para el paywall (estilo medieval)
export const UPGRADE_NARRATIVES = {
  session_ended: {
    en: 'The ancient tome closes slowly... Your trial chapter has ended, but the story awaits. Subscribe to continue your adventure.',
    es: 'El antiguo tomo se cierra lentamente... Tu capítulo de prueba ha terminado, pero la historia te espera. Suscribite para continuar tu aventura.',
  },
  new_session: {
    en: 'The narrator\'s voice fades into silence... To hear the next tale, you must prove your dedication.',
    es: 'La voz del narrador se desvanece en silencio... Para escuchar el próximo relato, debés demostrar tu dedicación.',
  },
  expired: {
    en: 'The magical contract has faded... Renew your bond to return to the realm.',
    es: 'El contrato mágico se ha desvanecido... Renová tu vínculo para volver al reino.',
  },
} as const
