// Helper central para verificar acceso por plan
// Se usa en API routes antes de operaciones costosas

import { type PlanStatus } from './plan-config'

// Turnos gratis que un usuario FREE puede jugar antes del paywall.
// El trial se agota por TURNOS JUGADOS (no por crear una sesión), así el
// visitante del ad juega de verdad y se engancha antes de que le pidamos pagar.
export const FREE_TRIAL_TURNS = 25

interface UserForPlanCheck {
  plan: string
  trialSessionUsed: boolean
  planExpiresAt: Date | null
  stripeSubscriptionId: string | null
  /** turnos totales jugados (User.totalTurns). Opcional para retrocompat. */
  totalTurns?: number
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

  // Plan FREE: el trial se agota SOLO por turnos jugados. OJO: no usar
  // trialSessionUsed acá — el flujo viejo lo marcaba true al crear campaña,
  // así que los users FREE existentes lo tienen envenenado y quedarían
  // bloqueados con 0 turnos jugados. El contador de turnos es la única verdad.
  const turnsPlayed = user.totalTurns ?? 0
  if (turnsPlayed >= FREE_TRIAL_TURNS) {
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
        reason: 'Your free trial turns are used up. Subscribe to continue your adventure.',
        reasonEs: 'Tus turnos de prueba gratis se terminaron. Suscribite para continuar tu aventura.',
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
