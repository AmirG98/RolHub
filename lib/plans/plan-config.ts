// Configuración de planes de monetización
// Trial: 25 turnos jugados gratis post-registro (FREE_TRIAL_TURNS), después paywall
// PRO: $8.99/mo todo ilimitado

export type PlanTier = 'FREE' | 'PRO' | 'GUILD'
export type PlanStatus = 'trial' | 'trial_used' | 'pro' | 'pro_expired'

export const PLAN_CONFIG = {
  FREE: {
    label: 'Trial',
    labelEs: 'Prueba',
    maxTrialSessions: 1,
    description: '25 turnos de juego gratis',
  },
  PRO: {
    label: 'Adventurer',
    labelEs: 'Aventurero',
    priceMonthly: 8.99,
    priceYearly: 89.90,
    description: 'Todo ilimitado',
  },
  GUILD: {
    label: 'Guild',
    labelEs: 'Gremio',
    priceMonthly: 14.99,
    priceYearly: 149.90,
    description: 'Multiplayer + todo (próximamente)',
  },
} as const

// Features incluidas por plan
export const PLAN_FEATURES = {
  FREE: {
    maxCampaigns: Infinity,
    maxSessionsTotal: 1,
    images: true,
    voice: true,
    allLores: true,
    allEngines: true,
    multiplayer: false,
    customLores: false,
  },
  PRO: {
    maxCampaigns: Infinity,
    maxSessionsTotal: Infinity,
    images: true,
    voice: true,
    allLores: true,
    allEngines: true,
    multiplayer: false,
    customLores: false,
  },
  GUILD: {
    maxCampaigns: Infinity,
    maxSessionsTotal: Infinity,
    images: true,
    voice: true,
    allLores: true,
    allEngines: true,
    multiplayer: true,
    customLores: true,
  },
} as const
