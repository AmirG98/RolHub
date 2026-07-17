// Integración con Lemon Squeezy (Merchant of Record).
// Reemplaza Paddle — mismo modelo MoR (impuestos/IVA los maneja LS), así que
// la lógica de negocio (User.plan, planExpiresAt) no cambia.
//
// Config vía env:
//   LEMONSQUEEZY_API_KEY        — API key (Settings → API en el dashboard LS)
//   LEMONSQUEEZY_STORE_ID       — id numérico del store
//   LEMONSQUEEZY_WEBHOOK_SECRET — secret del webhook (firma de payloads)
//   LEMONSQUEEZY_VARIANT_MONTHLY / _YEARLY — ids de variante de cada precio

import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

let _configured = false

/** Configura el SDK (idempotente). Lanza si falta la API key. */
export function ensureLemonSqueezy(): void {
  if (_configured) return
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) throw new Error('LEMONSQUEEZY_API_KEY no configurada')
  lemonSqueezySetup({
    apiKey,
    onError: (err) => console.error('[lemonsqueezy] SDK error:', err),
  })
  _configured = true
}

export const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || ''
export const LS_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ''

// Variantes (precios) del producto RolHub Pro. Se obtienen del dashboard LS:
// Products → RolHub Pro → cada variant tiene su id numérico.
export const LS_VARIANTS = {
  PRO_MONTHLY: process.env.LEMONSQUEEZY_VARIANT_MONTHLY || '',
  PRO_YEARLY: process.env.LEMONSQUEEZY_VARIANT_YEARLY || '',
} as const

export function variantForPeriod(period: 'monthly' | 'yearly'): string {
  // Si no hay variante anual configurada, cae a la mensual (soporta el caso
  // de tener solo el plan mensual creado en LS).
  if (period === 'yearly') return LS_VARIANTS.PRO_YEARLY || LS_VARIANTS.PRO_MONTHLY
  return LS_VARIANTS.PRO_MONTHLY
}

/** ¿Hay un plan anual configurado? (para ocultar el toggle en la UI si no) */
export const HAS_YEARLY_PLAN = !!process.env.LEMONSQUEEZY_VARIANT_YEARLY
